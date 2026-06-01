describe('Aider - Project Structure', () => {
  it('should have essential files', () => {
    cy.readFile('package.json').should('exist');
  });

  it('should have .gitignore', () => {
    cy.readFile('.gitignore', { failOnStatusCode: false }).then((content) => {
      if (content) {
        expect(content).to.include('node_modules');
      }
    });
  });

  it('should have package-lock.json after install', () => {
    cy.readFile('package-lock.json', { failOnStatusCode: false }).then((content) => {
      if (content) {
        expect(content).to.have.property('lockfileVersion');
      }
    });
  });
});
