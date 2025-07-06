import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { XMLParser, XMLBuilder } from 'fast-xml-parser';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create directory if it doesn't exist
const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// Helper function to normalize file paths for SonarQube
const normalizeFilePath = (filePath) => {
  if (!filePath) return 'unknown_file';
  return filePath.replace(/\\/g, '/').replace(/^.*?src\//, 'src/');
};

// Helper function to escape XML special characters
const escapeXml = (str) => {
  if (!str) return '';
  return str.toString()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
};

try {
  // Read the junit.xml file
  const inputFile = path.join(__dirname, '..', 'junit-report.xml');
  const outputFile = path.join(__dirname, '..', 'coverage', 'test-report.xml');
  
  ensureDirectoryExists(path.dirname(outputFile));
  
  if (!fs.existsSync(inputFile)) {
    console.error(`Error: File ${inputFile} does not exist`);
    process.exit(1);
  }

  const xmlData = fs.readFileSync(inputFile, 'utf8');

  // Parse the XML
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_'
  });
  
  const junitReport = parser.parse(xmlData);
  // Transform to SonarQube format
  const sonarReport = {
    testExecutions: {
      '@_version': '1',
      file: []
    }
  };  
  
  // Process each test suite
  if (junitReport.testsuites && junitReport.testsuites.testsuite) {
    const testsuites = Array.isArray(junitReport.testsuites.testsuite) 
      ? junitReport.testsuites.testsuite 
      : [junitReport.testsuites.testsuite];

    // Group test cases by file path for SonarQube format
    const fileGroups = {};

    for (const suite of testsuites) {
      // Process each test case in the suite
      const testcases = Array.isArray(suite.testcase) ? suite.testcase : suite.testcase ? [suite.testcase] : [];
      
      for (const testcase of testcases) {
        if (!testcase) continue;
        
        // Determine file path from classname, file attribute, or testsuite name
        let filePath = testcase['@_classname'] || suite['@_file'];
        if (!filePath && suite['@_name'] && suite['@_name'].includes('/')) {
          filePath = suite['@_name'];
        }
        
        // Default to a sanitized name if we can't determine the file path
        const normalizedPath = normalizeFilePath(filePath || (testcase['@_classname'] ? testcase['@_classname'] : suite['@_name'].replace(/\s/g, '_')));
        
        if (!fileGroups[normalizedPath]) {
          fileGroups[normalizedPath] = [];
        }

        const testEntry = {
          '@_name': testcase['@_name'],
          '@_duration': Math.round(parseFloat(testcase['@_time'] || '0') * 1000)
        };
        
        if (testcase.failure) {
          testEntry.failure = {
            '@_message': testcase.failure['@_message'] || 'Test failed',
            '#text': typeof testcase.failure === 'string' ? testcase.failure : 
                    (testcase.failure['#text'] || JSON.stringify(testcase.failure))
          };
        } else if (testcase.skipped) {
          testEntry['@_status'] = 'SKIPPED';
        } else {
          testEntry['@_status'] = 'OK';
        }
        
        fileGroups[normalizedPath].push(testEntry);
      }
    }
    
    // Create file entries for SonarQube report from the grouped test cases
    Object.entries(fileGroups).forEach(([filePath, testCases]) => {
      if (testCases.length > 0) {
        sonarReport.testExecutions.file.push({
          '@_path': filePath,
          testCase: testCases
        });
      }
    });
  }  // Convert back to XML
  const builder = new XMLBuilder({
    attributeNamePrefix: '@_',
    format: true,
    ignoreAttributes: false,
    processEntities: false,
    indentBy: '  '
  });
  
  // First build the XML without the root
  let sonarXml = '';
  
  // Create the proper format SonarQube expects
  sonarXml = `<testExecutions version="1">\n`;
  
  // Add each file node
  for (const fileEntry of sonarReport.testExecutions.file) {
    sonarXml += `  <file path="${escapeXml(fileEntry['@_path'])}">\n`;
      // Add each test case
    for (const testCase of fileEntry.testCase) {      const duration = testCase['@_duration'] || '0';
      const status = testCase['@_status'] || 'OK';
      
      if (testCase.failure) {
        // If there's a failure message, use full opening/closing tag format
        sonarXml += `    <testCase name="${escapeXml(testCase['@_name'])}" duration="${duration}" status="${status}">\n`;
        sonarXml += `      <failure message="${escapeXml(testCase.failure['@_message'] || '')}"><![CDATA[${
          testCase.failure['#text'] || ''
        }]]></failure>\n    </testCase>\n`;
      } else {
        // For consistency with SonarQube's expected format, use full tags not self-closing
        sonarXml += `    <testCase name="${escapeXml(testCase['@_name'])}" duration="${duration}" status="${status}"></testCase>\n`;
      }
    }
    
    sonarXml += `  </file>\n`;
  }
  
  sonarXml += `</testExecutions>`;

  // Add the XML declaration which is required by SonarQube
  const xmlWithDeclaration = '<?xml version="1.0" encoding="UTF-8"?>\n' + sonarXml;  // Validate the XML structure before writing
  try {
    // Basic validation - ensure the XML has the correct root element
    if (!xmlWithDeclaration.includes('<testExecutions version="1">')) {
      throw new Error('Generated XML does not contain the correctly formatted testExecutions element');
    }
    
    // Check for potentially problematic unescaped characters
    const problematicChars = ['"', "'", '<', '>', '&'].filter(char => 
      xmlWithDeclaration.includes(` name=${char}`) || 
      xmlWithDeclaration.includes(` path=${char}`) || 
      xmlWithDeclaration.includes(` message=${char}`)
    );
    
    if (problematicChars.length > 0) {
      console.warn(`WARNING: Potentially unescaped special characters found in XML: ${problematicChars.join(', ')}`);
      console.warn('These characters should be properly escaped to ensure valid XML format.');
    }
    
    // Write the output file
    fs.writeFileSync(outputFile, xmlWithDeclaration);
    console.log(`Successfully converted JUnit report to SonarQube format: ${outputFile}`);
    
    // Display some debug information
    console.log(`XML Output Sample: ${xmlWithDeclaration.substring(0, 300)}...`);
    console.log(`Number of test files processed: ${sonarReport.testExecutions.file.length}`);
    console.log(`Total test cases: ${sonarReport.testExecutions.file.reduce((sum, file) => sum + file.testCase.length, 0)}`);
      // Special validation for SonarQube format
    console.log('Verifying the generated XML structure...');
    
    // Check that all paths are normalized
    const filePathCount = (xmlWithDeclaration.match(/<file path="/g) || []).length;
    console.log(`Verified ${filePathCount} file path entries`);
    
    // Check testCase elements
    const testCaseCount = (xmlWithDeclaration.match(/<testCase name="/g) || []).length;
    console.log(`Verified ${testCaseCount} testCase entries`);
    
    if (filePathCount === 0 || testCaseCount === 0) {
      console.warn('WARNING: The generated XML might be empty or missing key elements!');
    }
    
    // Additional check for potential XML syntax issues
    try {
      // This is a simple check for balanced XML tags
      const tagCount = (xmlWithDeclaration.match(/<[^/][^>]*>/g) || []).length;
      const closingTagCount = (xmlWithDeclaration.match(/<\/[^>]*>/g) || []).length;
      const selfClosingTagCount = (xmlWithDeclaration.match(/<[^>]*\/>/g) || []).length;
      
      if (tagCount !== (closingTagCount + selfClosingTagCount)) {
        console.warn('WARNING: XML tags may not be properly balanced!');
        console.warn(`Opening tags: ${tagCount}, Closing tags: ${closingTagCount}, Self-closing: ${selfClosingTagCount}`);
      } else {
        console.log('XML tag structure appears valid');
      }
      
      // Check for test case names or file paths with quotes that might not be escaped properly
      if (xmlWithDeclaration.includes('name="') && xmlWithDeclaration.includes('" ')) {
        const suspiciousNameRegex = /name="([^"]*"[^"]*")"/g;
        const suspiciousMatches = xmlWithDeclaration.match(suspiciousNameRegex);
        if (suspiciousMatches) {
          console.warn('WARNING: Found potentially problematic test case names with unescaped quotes:');
          suspiciousMatches.forEach(match => console.warn(`  - ${match}`));
        }
      }
    } catch (validationWarning) {
      console.warn('Additional validation warning:', validationWarning.message);
    }
  } catch (validationError) {
    console.error('Error validating generated XML:', validationError);
    process.exit(1);
  }
} catch (error) {
  console.error('Error converting test report:', error);
  process.exit(1);
}
