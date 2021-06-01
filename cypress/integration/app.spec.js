describe('App', () => {
  it('front page can be opened', () => {
    cy.visit('http://localhost:3000');
    cy.contains('Safebike');
  });
});
describe('Drawer', () => {
  it('drawer is visible', () => {
    cy.get('#drawer').should('have.css', 'display', 'block');
  });
  it('drawer close button can be clicked', () => {
    cy.get('#drawerCloseButton').click();
  });
  it('drawer is not visible', () => {
    cy.get('#drawer').should('have.css', 'display', 'none');
  });
  it('drawer open button can be clicked', () => {
    cy.get('#drawerOpenButton').click();
  });
  it('drawer is visible', () => {
    cy.get('#drawer').should('have.css', 'display', 'block');
  });
});
describe('Header', () => {
  it('point tab can be clicked', () => {
    cy.get('#pointTab').click();
  });
  it('point tab content is visible', () => {
    cy.get('#pointTabContent').should('have.css', 'display', 'flex');
  });
  it('map tab can be clicked', () => {
    cy.get('#mapTab').click();
  });
  it('map tab content is visible', () => {
    cy.get('#mapTabContent').should('have.css', 'display', 'block');
  });
});
