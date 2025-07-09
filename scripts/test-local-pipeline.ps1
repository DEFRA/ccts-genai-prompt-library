# Local pipeline test script for the test report conversion process (PowerShell version)

Write-Host "=== Running Local Pipeline Test ===" -ForegroundColor Green

# Step 1: Clean previous test results
Write-Host "Cleaning previous test results..." -ForegroundColor Yellow
if (Test-Path "junit-report.xml") {
    Remove-Item "junit-report.xml" -Force
}
if (Test-Path "coverage") {
    Remove-Item "coverage" -Recurse -Force
}

# Step 2: Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Yellow
npm install

# Step 3: Run tests with coverage and JUnit reporter
Write-Host "Running tests..." -ForegroundColor Yellow
npm run test:ci

# Step 4: Check test report files
Write-Host "Checking test report files..." -ForegroundColor Yellow
if (Test-Path "junit-report.xml") {
    Write-Host "✓ JUnit report exists" -ForegroundColor Green
} else {
    Write-Host "✗ JUnit report is missing" -ForegroundColor Red
    Exit 1
}

if (Test-Path "coverage/test-report.xml") {
    Write-Host "✓ SonarQube test report exists" -ForegroundColor Green
} else {
    Write-Host "✗ SonarQube test report is missing" -ForegroundColor Red
    Exit 1
}

# Step 5: Validate test report format
Write-Host "Validating SonarQube test report format..." -ForegroundColor Yellow
$testReportContent = Get-Content "coverage/test-report.xml" -Raw
if ($testReportContent -match "<testExecutions") {
    Write-Host "✓ SonarQube test report format is valid" -ForegroundColor Green
} else {
    Write-Host "✗ SonarQube test report format is invalid" -ForegroundColor Red
    Exit 1
}

# Step 6: Run SonarQube Scanner (if configured locally)
$sonarScanner = Get-Command "sonar-scanner" -ErrorAction SilentlyContinue
if ($sonarScanner) {
    Write-Host "Running SonarQube scanner locally..." -ForegroundColor Yellow
    npm run sonar:local
} else {
    Write-Host "SonarQube scanner not found locally. Skipping this step." -ForegroundColor Yellow
    Write-Host "To install SonarQube scanner:" -ForegroundColor Yellow
    Write-Host "  1. Download from https://docs.sonarqube.org/latest/analysis/scan/sonarscanner/" -ForegroundColor Gray
    Write-Host "  2. Add it to your PATH" -ForegroundColor Gray
    Write-Host "  3. Run 'npm run sonar:local' to scan your code" -ForegroundColor Gray
}

Write-Host "=== Local Pipeline Test Completed ===" -ForegroundColor Green
