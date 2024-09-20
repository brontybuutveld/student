// Define the levels based on star ratings
const levelImages = {
    1: "images/bronze.png",
    2: "images/silver.png",
    3: "images/silver.png",
    4: "images/gold.png",
    5: "images/platinum.png"
};

// Initialize the selected star rating
let selectedRating = 0;

// Handle star selection and highlight
document.querySelectorAll('.star').forEach(star => {
    star.addEventListener('click', function() {
        // Get the selected value
        selectedRating = this.getAttribute('data-value');

        // Clear previous selections and fill only the selected ones
        document.querySelectorAll('.star').forEach(s => {
            s.innerHTML = "&#9734;"; // Reset to empty star
        });

        // Fill the selected star and all previous stars
        this.innerHTML = "&#9733;"; // Filled star
        let prevSibling = this.previousElementSibling;
        while (prevSibling) {
            prevSibling.innerHTML = "&#9733;"; // Filled star
            prevSibling = prevSibling.previousElementSibling;
        }
    });

    // Handle hover effect to preview star fill
    star.addEventListener('mouseover', function() {
        // Clear the fill for all stars before hovering
        document.querySelectorAll('.star').forEach(s => {
            s.innerHTML = "&#9734;"; // Empty star
        });

        // Fill the hovered star and all previous ones
        this.innerHTML = "&#9733;"; // Filled star
        let prevSibling = this.previousElementSibling;
        while (prevSibling) {
            prevSibling.innerHTML = "&#9733;"; // Filled star
            prevSibling = prevSibling.previousElementSibling;
        }
    });

    // Reset to the selected stars on mouse out
    star.addEventListener('mouseout', function() {
        // Clear all stars
        document.querySelectorAll('.star').forEach(s => {
            s.innerHTML = "&#9734;"; // Empty star
        });

        // Refill based on the selected rating
        if (selectedRating > 0) {
            document.querySelector(`.star[data-value="${selectedRating}"]`).innerHTML = "&#9733;"; // Filled star
            let prevSibling = document.querySelector(`.star[data-value="${selectedRating}"]`).previousElementSibling;
            while (prevSibling) {
                prevSibling.innerHTML = "&#9733;"; // Filled star
                prevSibling = prevSibling.previousElementSibling;
            }
        }
    });
});

// Submit the rating and display the corresponding level
function submitRating() {
    if (selectedRating > 0) {
        document.getElementById('rating-message').innerText = `Thank you for rating ${selectedRating} star(s)!`;

        // Update the level display based on the rating
        const levelImage = levelImages[selectedRating];
        document.getElementById('level-display').innerHTML = `<img src="${levelImage}" alt="Level Image">`;
    } else {
        document.getElementById('rating-message').innerText = "Please select a star rating!";
    }
}
