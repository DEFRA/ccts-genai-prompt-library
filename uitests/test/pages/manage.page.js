class ManagePage {
  get templatesHeaderText() {
    return $("input[placeholder$='Search templates...']");
  }

  get manageRolesCard() {
    return $("//button[contains(., 'Roles')]");
  }

  get rolesHeaderText() {
    return $("input[placeholder$='Search roles...']");
  }
}

module.exports = new ManagePage();
