const launchPage = require("../pages/launch.page.js");
const utility = require("../utils/utility.js");
const { init, analyse } = require("../../dist/wcagchecker.js");
const { assert } = require("chai");

describe("Landing Page Accessibility Testing", () => {
  before(async () => {
    await init();
    await utility.openBrowser();
  });

  it("Accessibility Testing of Landing Page", async () => {
    await analyse(browser, "--> Landing Page");

    // Page Assertion
    const headerText = await launchPage.headerText.getText();
    assert.include(headerText, "Login to Prompt", "The Text does not contain the expected text");
  });

  after(() => {
    utility.generateReport("landingPageNoLogin");
  });
});
