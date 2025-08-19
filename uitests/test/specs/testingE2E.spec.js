const dashboardPage = require("../pages/dashboard.page.js");
const langTranslationPage = require("../pages/langTranslation.page.js");
const creatPromptPage = require("../pages/createPrompt.page.js");
const utility = require("../utils/utility.js");
const managePage = require("../pages/manage.page.js");
const { init, analyse } = require("../../dist/wcagchecker.js");
const { assert } = require("chai");

describe("Launch Page Accessibility Automation", () => {
  before(async () => {
    await init();
    await utility.openBrowser();
    await utility.login("Admin", "I99thing");
  });

  beforeEach(async () => {
    await browser.refresh();
  });

  it("Dashboard Page -- Accessibility Testing", async () => {
    await analyse(browser, "--> Dashboard Page");

    // Page Assertion
    const placeholderText = await dashboardPage.placeholderText.getAttribute("placeholder");
    assert.strictEqual(placeholderText, "Search templates...", "The placeholder text does not match");
  });

  it("Language Translation Page -- Accessibility Testing", async () => {
    await dashboardPage.languageTranslationCard.click();

    // Choosing a random source programming language from the dropdown
    let dropdown = await langTranslationPage.sourceProgrammingLanguage;
    let value = await utility.randomOptionFromDropdown(dropdown);
    await dropdown.selectByAttribute("value", value);

    // Choosing a random target programming language from the dropdown
    dropdown = await langTranslationPage.targetProgrammingLanguage;
    value = await utility.randomOptionFromDropdown(dropdown);
    await dropdown.selectByAttribute("value", value);

    // Page Assertion
    const headerText = await langTranslationPage.headerText.getText();
    assert.strictEqual(headerText, "Language Translation", "The header text does not match");

    await analyse(browser, "--> Language Translation Page");
  });

  it("Create Prompt Page -- Accessibility Testing", async () => {
    await dashboardPage.createPromptCard.click();

    // Choosing a random role from the dropdown
    let dropdown = await creatPromptPage.role;
    let value = await utility.randomOptionFromDropdown(dropdown);
    await dropdown.selectByAttribute("value", value);

    // Choosing a random expertise option from the dropdown
    dropdown = await creatPromptPage.expertiseSelect;
    value = await utility.randomOptionFromDropdown(dropdown);

    if (value === "Code Quality") {
      await dropdown.selectByAttribute("value", value);
    } else {
      await dropdown.selectByAttribute("value", value);

      // Choosing a random Template from the dropdown
      dropdown = await creatPromptPage.template;
      value = await utility.randomOptionFromDropdown(dropdown);
      await dropdown.selectByAttribute("value", value);
    }

    // Page Assertion
    const headerText = await creatPromptPage.headerText.getText();
    assert.strictEqual(headerText, "Create Prompt", "The header text does not match");

    await analyse(browser, "--> Create Prompt Page");
  });

  it("Manage Templates Page -- Accessibility Testing", async () => {
    await dashboardPage.manageTemplatesCard.click();

    // Page Assertion
    const templatesHeaderText = await managePage.templatesHeaderText.getAttribute("placeholder");
    assert.strictEqual(templatesHeaderText, "Search templates...", "The header text does not match");

    await analyse(browser, "--> Manage Templates Page");
  });

  it("Manage Roles Page -- Accessibility Testing", async () => {
    await dashboardPage.manageTemplatesCard.click();
    await managePage.manageRolesCard.click();

    // Page Assertion
    const rolesHeaderText = await managePage.rolesHeaderText.getAttribute("placeholder");
    assert.strictEqual(rolesHeaderText, "Search roles...", "The header text does not match");

    await analyse(browser, "--> Manage Roles Page");
  });

  after(() => {
    utility.generateReport("endToEndTest");
  });
});
