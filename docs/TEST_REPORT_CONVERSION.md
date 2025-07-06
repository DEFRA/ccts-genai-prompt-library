# Test Report Conversion for SonarQube

This document explains the process of converting Vitest test reports to the SonarQube test execution report format in the Prompt Library project.

## Overview

Vitest generates test reports in JUnit XML format, but SonarQube requires a different XML format for test execution reports. To bridge this gap, we've implemented a conversion script.

## Flow

1. Vitest runs tests with the JUnit reporter: `vitest run --coverage --reporter=verbose --reporter=junit`
2. This generates a `junit-report.xml` file in the root directory
3. The conversion script (`scripts/convert-test-report.js`) transforms this file into SonarQube's format
4. The converted file is saved as `coverage/test-report.xml`
5. SonarQube analyzes this file during the scan

## Scripts

- `npm run test:ci`: Runs tests with coverage, generates JUnit report, converts it to SonarQube format, and validates the result
- `npm run convert:test-report`: Only runs the conversion script (useful for debugging)
- `npm run validate:test-report`: Validates that test reports exist and are in the correct format
- `npm run test:local-pipeline`: Runs a local simulation of the CI pipeline to test the entire flow

## Implementation Details

The conversion script (`scripts/convert-test-report.js`) performs the following steps:

1. Reads the JUnit XML file (`junit-report.xml`)
2. Parses the XML structure
3. Transforms it to SonarQube's expected format:

   ```xml
   <testExecutions version="1">
     <file path="path/to/source/file">
       <testCase name="test name" duration="123" status="OK"></testCase>
       <testCase name="failing test" duration="456" status="FAILURE">
         <failure message="Error message"><![CDATA[Stack trace]]></failure>
       </testCase>
     </file>
   </testExecutions>
   ```

4. Saves the converted XML to `coverage/test-report.xml`

## Troubleshooting

If SonarQube doesn't recognize your test results:

1. Check that `junit-report.xml` is being generated

   ```bash
   # Check if the file exists
   ls -la junit-report.xml
   
   # View the file contents
   head -20 junit-report.xml
   ```

2. Verify the conversion script is running correctly

   ```bash
   # Run the conversion script manually
   npm run convert:test-report
   
   # Validate the test report
   npm run validate:test-report
   ```

3. Examine `coverage/test-report.xml` to ensure it has the correct format

   ```bash
   # Check if the file exists
   ls -la coverage/test-report.xml
   
   # View the file contents
   head -20 coverage/test-report.xml
   
   # Check for the required root element
   grep -q "<testExecutions" coverage/test-report.xml && echo "VALID" || echo "INVALID"
   ```

4. Confirm that `sonar.testExecutionReportPaths` is set to `coverage/test-report.xml` in both the pipeline and `sonar-project.properties`

5. Common issues:
   - XML format is invalid: Check that the conversion script is properly transforming the JUnit format
   - File paths in test report are incorrect: Check the `normalizeFilePath` function in the conversion script
   - SonarQube can't find the file: Check the `sonar.testExecutionReportPaths` property in your configuration

## CI/CD Integration

The pipeline runs these steps automatically:

1. Run tests with JUnit reporter
2. Convert the test report
3. Validate the XML format
4. Configure SonarQube to use the converted report
5. Run the SonarQube analysis
