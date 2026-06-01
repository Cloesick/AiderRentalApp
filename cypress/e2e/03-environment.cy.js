describe('Aider - Environment & Config', () => {
  it('should have Cypress configured', () => {
    cy.readFile('cypress.config.js').then((config) => {
      expect(config).to.exist;
    });
  });

  it('should have test scripts in package.json', () => {
    cy.readFile('package.json').then((pkg) => {
      const hasTestScript = pkg.scripts && (
        pkg.scripts['test'] || 
        pkg.scripts['test:learn'] || 
        pkg.scripts['test:cypress']
      );
      expect(hasTestScript).to.exist;
    });
  });

  it('should have Cypress installed', () => {
    cy.readFile('package.json').then((pkg) => {
      const hasCypress = 
        (pkg.dependencies && pkg.dependencies.cypress) ||
        (pkg.devDependencies && pkg.devDependencies.cypress);
      expect(hasCypress).to.exist;
    });
  });
});
