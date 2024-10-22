describe("As a user, I want to create an account", () => {
  beforeEach(() => {
    cy.visit("/signup");
  });

  // Trigger validation errors by interacting with the form fields
  it("Should show validation errors when form fields are empty", () => {
    cy.get('input[placeholder="First name"]').click().blur();
    cy.get('input[placeholder="Last name"]').click().blur();
    cy.get('input[placeholder="Email"]').click().blur();
    cy.get('input[placeholder="Password"]').click().blur();
    cy.get('input[placeholder="Confirm Password"]').click().blur();

    cy.get('button[type="submit"]').click();

    cy.contains("Please provide your first name.");
    cy.contains("Please provide your last name.");
    cy.contains("Please provide a valid email.");
    cy.contains("Please provide a password.");
  });

  // Check for successful account creation
  it("Should allow successful account creation", () => {
    cy.get('input[placeholder="First name"]').type("John");
    cy.get('input[placeholder="Last name"]').type("Doe");
    cy.get('input[placeholder="Email"]').type("itthickof@example.com");
    cy.get('input[placeholder="Password"]').type("password123");
    cy.get('input[placeholder="Confirm Password"]').type("password123");

    cy.get('button[type="submit"]').click();

    cy.contains("Success!").should("be.visible");

    cy.contains("You have successfully created an account!").should(
      "be.visible"
    );
  });

  // Check if the user cannot create an account with an existing email
  it("Should prevent account creation with an existing email", () => {
    cy.get('input[placeholder="First name"]').type("John");
    cy.get('input[placeholder="Last name"]').type("Doe");
    cy.get('input[placeholder="Email"]').type("spite@gmail.com");
    cy.get('input[placeholder="Password"]').type("password123");
    cy.get('input[placeholder="Confirm Password"]').type("password123");

    cy.get('button[type="submit"]').click();

    cy.contains("This email is already in use").should("be.visible");
  });

  // Check if the password meets security requirements
  it("Should ensure password meets security requirements", () => {
    cy.get('input[placeholder="First name"]').type("John");
    cy.get('input[placeholder="Last name"]').type("Doe");
    cy.get('input[placeholder="Email"]').type("newuser2@example.com");

    // Try a password less than 6 characters
    cy.get('input[placeholder="Password"]').type("12345");
    cy.get('input[placeholder="Confirm Password"]').type("12345");
    cy.get('button[type="submit"]').click();

    // Verify the message for weak password
    cy.contains("Please enter more than 6 characters").should("be.visible");

    // Now try a valid password of more than 6 characters
    cy.get('input[placeholder="Password"]').clear().type("password123");
    cy.get('input[placeholder="Confirm Password"]').clear().type("password123");
    cy.get('button[type="submit"]').click();

    // Ensure no validation message is shown when password is valid
    cy.contains("Please enter more than 6 characters").should("not.exist");
  });
});
