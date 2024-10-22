import React from 'react';
//import SearchProfile from '../pages/SearchProfile';
import "../App.css";

describe('<SearchProfile />', () => {
  beforeEach(() => {
    cy.mount(<SearchProfile />);
  });

  it('renders correctly', () => {
    // Test if elements are rendered
    cy.get('h2').contains('Search For a User');
    cy.get('.search-user').should('exist');
    cy.get('.btn').contains('Search').should('exist');
  });

  it('displays loading state when searching', () => {
    // Test if loading message properly appears and disappears when search is done
    cy.contains('Loading').should('not.exist');
    cy.get('.search-user').type('test');
    cy.get('.btn').contains('Search').click();
    // Loading should exist
    cy.contains('Loading').should('exist');
    cy.wait(1000);
    // Loading should not exist
    cy.contains('Loading').should('not.exist');
  });

  it('displays no users found message for an empty search', () => {
    // Test if correct no users message is shown
    cy.get('.search-user').type('Unknown User');
    cy.get('.btn').contains('Search').click();
    cy.wait(1000);
    cy.contains('No users found').should('exist');
  });

  it('displays search results for a valid search', () => {
    // Query Firebase Firestore for the user "test hello"
    cy.get('.search-user').type('test');
    cy.get('.btn').contains('Search').click();
    // Wait for loading to finish
    cy.contains('Loading').should('exist');
    cy.wait(1000);
    cy.contains('Loading').should('not.exist');
    // Check if correct profile name exists
    cy.contains('test hello').should('exist');
  });
});
