class DashboardPage {
  get placeholderText() {
    return $("input[placeholder$='Search templates...']");
  }

  get codeCompletionCard() {
    return $("//div/h3[contains(text(),'Code Completion')]");
  }

  get languageTranslationCard() {
    return $("//div/h3[contains(text(),'Language Translation')]");
  }

  get createPromptCard() {
    return $("div.space-y-0\\.5 button:nth-child(1) svg");
  }

  get manageTemplatesCard() {
    return $("div.space-y-0\\.5 button:nth-child(2) svg");
  }
}

module.exports = new DashboardPage();
