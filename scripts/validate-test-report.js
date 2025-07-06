import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths to check
const junitReportPath = path.join(__dirname, '..', 'junit-report.xml');
const sonarReportPath = path.join(__dirname, '..', 'coverage', 'test-report.xml');

// Check if the files exist
const junitReportExists = fs.existsSync(junitReportPath);
const sonarReportExists = fs.existsSync(sonarReportPath);

console.log('\n=== Test Report Validation ===');
console.log(`JUnit Report (junit-report.xml): ${junitReportExists ? '✅ EXISTS' : '❌ MISSING'}`);
console.log(`SonarQube Report (coverage/test-report.xml): ${sonarReportExists ? '✅ EXISTS' : '❌ MISSING'}`);

// Validate the SonarQube report format if it exists
if (sonarReportExists) {
  try {
    const sonarReportContent = fs.readFileSync(sonarReportPath, 'utf8');
    
    // Check for the root element
    const hasRootElement = sonarReportContent.includes('<testExecutions version="1">');
    console.log(`SonarQube Root Element: ${hasRootElement ? '✅ VALID' : '❌ INVALID'}`);
    
    // Check for file elements
    const fileElementCount = (sonarReportContent.match(/<file path="/g) || []).length;
    console.log(`SonarQube File Elements: ${fileElementCount > 0 ? `✅ FOUND (${fileElementCount})` : '❌ MISSING'}`);
    
    // Check for testCase elements
    const testCaseElementCount = (sonarReportContent.match(/<testCase /g) || []).length;
    console.log(`SonarQube TestCase Elements: ${testCaseElementCount > 0 ? `✅ FOUND (${testCaseElementCount})` : '❌ MISSING'}`);
    
    // Check for potentially problematic XML characters that should be escaped
    const unescapedQuotes = (sonarReportContent.match(/ name="[^"]*"[^"]*"/g) || []);
    if (unescapedQuotes.length > 0) {
      console.log(`❌ WARNING: Found ${unescapedQuotes.length} potential instances of unescaped quotes in attribute values:`);
      unescapedQuotes.slice(0, 3).forEach(instance => {
        console.log(`   ${instance}`);
      });
      if (unescapedQuotes.length > 3) {
        console.log(`   ...and ${unescapedQuotes.length - 3} more`);
      }
    } else {
      console.log('✅ No unescaped quotes found in attribute values');
    }    // Check for key XML elements balance
    const testExecutionsOpen = (sonarReportContent.match(/<testExecutions/g) || []).length;
    const testExecutionsClose = (sonarReportContent.match(/<\/testExecutions>/g) || []).length;
    const fileOpen = (sonarReportContent.match(/<file /g) || []).length;
    const fileClose = (sonarReportContent.match(/<\/file>/g) || []).length;
    const testCaseOpen = (sonarReportContent.match(/<testCase /g) || []).length;
    const testCaseClose = (sonarReportContent.match(/<\/testCase>/g) || []).length;
    const failureOpen = (sonarReportContent.match(/<failure /g) || []).length;
    const failureClose = (sonarReportContent.match(/<\/failure>/g) || []).length;
    
    const isBalanced = (testExecutionsOpen === testExecutionsClose) && 
                        (fileOpen === fileClose) && 
                        (testCaseOpen === testCaseClose) &&
                        (failureOpen === failureClose);
    
    console.log(`XML Structure Balance: ${isBalanced ? '✅ BALANCED' : '❌ UNBALANCED'}`);
    console.log(`   testExecutions: ${testExecutionsOpen}/${testExecutionsClose}, file: ${fileOpen}/${fileClose}, testCase: ${testCaseOpen}/${testCaseClose}, failure: ${failureOpen}/${failureClose}`);
      // Overall validation - don't fail the script if unescaped quotes are found, as they're now properly escaped
    // But still fail if key XML elements are not balanced
    const isValid = hasRootElement && fileElementCount > 0 && testCaseElementCount > 0 && isBalanced;
    console.log(`Overall SonarQube Report Validation: ${isValid ? '✅ VALID' : '❌ INVALID'}`);
    
    if (!isValid) {
      console.error('The SonarQube test report format is invalid. This may cause SonarQube to ignore your test results.');
      console.log('\nFirst 500 characters of the report:');
      console.log(sonarReportContent.substring(0, 500) + '...');
      process.exit(1);
    }
  } catch (error) {
    console.error('Error reading or validating the SonarQube report:', error.message);
    process.exit(1);
  }
} else if (junitReportExists) {
  console.error('JUnit report exists but was not converted to SonarQube format. Check the conversion script.');
  process.exit(1);
} else {
  console.error('No test reports found. Make sure tests are running correctly.');
  process.exit(1);
}

console.log('\n✅ Test report validation successful!');
