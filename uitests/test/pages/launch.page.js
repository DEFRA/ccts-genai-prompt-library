class LaunchPage {
  get headerText() {
    return $("//h1[contains(text(), 'Login to Prompt')]");
  }

  get username() {
    return $("#username");
  }
  get password() {
    return $("#password");
  }
  get loginButton() {
    return $("button[type='submit']");
  }
}

module.exports = new LaunchPage();
