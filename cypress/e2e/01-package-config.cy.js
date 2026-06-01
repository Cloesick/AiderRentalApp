describe('Aider - Package Configuration', () => {
  it('should have a valid package.json', () => {
    cy.readFile('package.json').then((pkg) => {
      expect(pkg).to.have.property('name');
      expect(pkg).to.have.property('version');
      expect(pkg.name).to.be.a('string');
      expect(pkg.version).to.match(/^\d+\.\d+\.\d+/);
    });
  });

  it('should have required scripts', () => {
    cy.readFile('package.json').then((pkg) => {
      expect(pkg).to.have.property('scripts');
      expect(pkg.scripts).to.be.an('object');
    });
  });

  it('should have dependencies defined', () => {
    cy.readFile('package.json').then((pkg) => {
      const hasDeps = pkg.dependencies || pkg.devDependencies;
      expect(hasDeps).to.exist;
    });
  });
});
