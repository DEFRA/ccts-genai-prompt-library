class CreatePromptPage {
  get headerText() {
    return $("//h3[text()='Create Prompt']");
  }

  get role() {
    return $("#role");
  }

  get expertiseSelect() {
    return $("#expertise-select");
  }

  get template() {
    return $("label[for='template-select'] + div select");
  }
}

module.exports = new CreatePromptPage();
