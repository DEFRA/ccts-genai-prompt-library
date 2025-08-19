const fs = require("fs");
const { getHtmlReportByGuideLine, getJsonReport } = require("../../dist/wcagchecker.js");
const launchPage = require("../pages/launch.page.js");
const dashboardPage = require("../pages/dashboard.page.js");

class Utility {
  async openBrowser() {
    await browser.url("https://sareportingpoc.blob.core.windows.net/cpintegration/PromptLaibrary/index.html");
    await browser.maximizeWindow();
  }

  async login(username, password) {
    try {
      // Set username
      await launchPage.username.setValue(username);

      // Set password
      await launchPage.password.setValue(password);

      // Click login button
      await launchPage.loginButton.click();

      // Wait for dashboard to load as confirmation of successful login
      await dashboardPage.codeCompletionCard.waitForExist({ timeout: 5000 });

      console.log(`Successfully logged in with username: ${username}`);
      return true;
    } catch (error) {
      console.error(`Login failed for username: ${username}`, error);
      throw new Error(`Login failed: ${error.message}`);
    }
  }

  async randomOptionFromDropdown(dropdown) {
    let options = await dropdown.$$("option");
    let randomIndex = Math.floor(Math.random() * options.length);

    // if randomIndex is 0 then make it 1 to avoid selecting the first option
    if (randomIndex === 0 && options.length > 1) {
      randomIndex = 1;
    }

    let value = await options[randomIndex].getAttribute("value");

    return value;
  }

  generateReport(testPage) {
    // Get the HTML report by guideline
    fs.writeFileSync(`./reports/${testPage}_accessibility_json_report_latest.json`, getJsonReport());

    // Get the HTML report by guideline
    fs.writeFileSync(`./reports/${testPage}_accessibility_guideline_latest.html`, getHtmlReportByGuideLine());
  }
}

module.exports = new Utility();
