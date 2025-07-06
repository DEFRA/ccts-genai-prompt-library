import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the coverage file
const coverageFilePath = path.join(__dirname, '..', 'coverage', 'coverage-final.json');

console.log(`Processing coverage file: ${coverageFilePath}`);

// Check if the file exists
if (!fs.existsSync(coverageFilePath)) {
  console.error(`Error: Coverage file not found at ${coverageFilePath}`);
  process.exit(1);
}

try {
  // Read the coverage file
  const coverageData = JSON.parse(fs.readFileSync(coverageFilePath, 'utf8'));
  
  // New coverage object with transformed paths
  const normalizedCoverage = {};
  
  // Get the project root directory
  const projectRoot = path.resolve(__dirname, '..');
  
  // Process each file in the coverage report
  Object.entries(coverageData).forEach(([absolutePath, fileData]) => {
    // Convert absolute path to relative path
    let relativePath;
    
    try {
      relativePath = path.relative(projectRoot, absolutePath);
      
      // Convert Windows backslashes to forward slashes for consistent paths across platforms
      relativePath = relativePath.replace(/\\/g, '/');
      
      // Create a copy of the file data with updated path field
      const updatedFileData = { ...fileData };
      if (updatedFileData.path) {
        updatedFileData.path = relativePath;
      }
      
      // Store the data with the new relative path
      normalizedCoverage[relativePath] = updatedFileData;
    } catch (pathError) {
      console.warn(`Warning: Could not process path for ${absolutePath}: ${pathError.message}`);
      // Keep the original path in this case
      normalizedCoverage[absolutePath] = fileData;
    }
  });
  
  // Also process lcov.info file if it exists to ensure consistency across all coverage formats
  const lcovPath = path.join(__dirname, '..', 'coverage', 'lcov.info');
  if (fs.existsSync(lcovPath)) {
    try {
      console.log('Processing lcov.info file to normalize paths...');
      let lcovContent = fs.readFileSync(lcovPath, 'utf8');
      
      // Replace absolute paths with relative paths
      const absolutePathPattern = new RegExp(projectRoot.replace(/\\/g, '\\\\'), 'g');
      lcovContent = lcovContent.replace(absolutePathPattern, '');
      
      // Remove leading slash or backslash if present
      lcovContent = lcovContent.replace(/SF:[\/\\]/g, 'SF:');
      
      // Write the updated lcov content back to the file
      fs.writeFileSync(lcovPath, lcovContent);
      console.log('Successfully normalized paths in lcov.info');
    } catch (lcovError) {
      console.warn(`Warning: Could not process lcov.info file: ${lcovError.message}`);
    }
  }
  
  // Write the updated coverage data back to the file
  fs.writeFileSync(coverageFilePath, JSON.stringify(normalizedCoverage, null, 2));
  
  console.log('Successfully normalized paths in coverage-final.json');
  console.log(`Total files processed: ${Object.keys(normalizedCoverage).length}`);
} catch (error) {
  console.error('Error processing coverage file:', error);
  process.exit(1);
}
