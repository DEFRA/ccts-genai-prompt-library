#!/bin/bash
# Local pipeline test script for the test report conversion process

# Colors for better output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Running Local Pipeline Test ===${NC}"

# Step 1: Clean previous test results
echo -e "${YELLOW}Cleaning previous test results...${NC}"
rm -f junit-report.xml
rm -rf coverage

# Step 2: Install dependencies
echo -e "${YELLOW}Installing dependencies...${NC}"
npm install

# Step 3: Run tests with coverage and JUnit reporter
echo -e "${YELLOW}Running tests...${NC}"
npm run test:ci

# Step 4: Check test report files
echo -e "${YELLOW}Checking test report files...${NC}"
if [ -f "junit-report.xml" ]; then
  echo -e "${GREEN}✓ JUnit report exists${NC}"
else
  echo -e "${RED}✗ JUnit report is missing${NC}"
  exit 1
fi

if [ -f "coverage/test-report.xml" ]; then
  echo -e "${GREEN}✓ SonarQube test report exists${NC}"
else
  echo -e "${RED}✗ SonarQube test report is missing${NC}"
  exit 1
fi

# Step 5: Validate test report format
echo -e "${YELLOW}Validating SonarQube test report format...${NC}"
if grep -q "<testExecutions" coverage/test-report.xml; then
  echo -e "${GREEN}✓ SonarQube test report format is valid${NC}"
else
  echo -e "${RED}✗ SonarQube test report format is invalid${NC}"
  exit 1
fi

# Step 6: Run SonarQube Scanner (if configured locally)
if command -v sonar-scanner &> /dev/null; then
  echo -e "${YELLOW}Running SonarQube scanner locally...${NC}"
  npm run sonar:local
else
  echo -e "${YELLOW}SonarQube scanner not found locally. Skipping this step.${NC}"
  echo -e "${YELLOW}To install SonarQube scanner:${NC}"
  echo -e "  1. Download from https://docs.sonarqube.org/latest/analysis/scan/sonarscanner/"
  echo -e "  2. Add it to your PATH"
  echo -e "  3. Run 'npm run sonar:local' to scan your code"
fi

echo -e "${GREEN}=== Local Pipeline Test Completed ===${NC}"
