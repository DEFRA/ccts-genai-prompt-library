class LangTranslationPage {
  get headerText() {
    return $("//h3[text()='Language Translation']");
  }

  get sourceProgrammingLanguage() {
    return $("#source-lang");
  }

  get targetProgrammingLanguage() {
    return $("#target-lang");
  }
}

module.exports = new LangTranslationPage();
