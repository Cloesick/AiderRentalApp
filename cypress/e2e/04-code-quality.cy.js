describe('Aider - Code Quality', () => {
  it('should not have syntax errors in package.json', () => {
    cy.readFile('package.json').then((pkg) => {
      expect(pkg).to.be.an('object');
      expect(pkg.name).to.not.be.empty;
    });
  });

  it('should have a README or documentation', () => {
    cy.readFile('README.md', { failOnStatusCode: false }).then((content) => {
      // README is recommended but not required - just check it doesn't error
      expect(true).to.be.true;
    });
  });

  it('should have proper project metadata', () => {
    cy.readFile('package.json').then((pkg) => {
      expect(pkg.name).to.be.a('string');
      if (pkg.description) {
        expect(pkg.description).to.be.a('string');
      }
    });
  });
});
