import React from 'react';
import StickyNote from '../components/Theme_StickyNote/StickyNote';
import "../App.css";

describe('<StickyNote />', () => {
  beforeEach(() => {
    cy.mount(<StickyNote />);
  });

  it('renders correctly', () => {
    // Test if elements are rendered
    cy.get('input').should('exist');
    cy.get('textarea').should('exist');
    cy.get('button').contains('Create Note').should('exist');
  });

  it('creates note correctly', () => {
    cy.get('input').type('test title');
    cy.get('textarea').type('test content');
    cy.get('button').click();

    cy.contains('test title').should('exist');
    cy.contains('test content').should('exist');

    cy.get('button').contains('Edit').should('exist');
    cy.get('button').contains('Delete').should('exist');

    cy.get('button').contains('Delete').click();

    cy.contains('test title').should('not.exist');
  })

});