import React, { useState } from "react";
import Bronze from './images/bronze.png';
import Silver from './images/silver.png';
import Gold from './images/gold.png';
import Platinum from './images/platinum.png';

export default function Level() {
  // Define the levels based on star ratings
  const levelImages = {
    1: Bronze,
    2: Silver,
    3: Silver,
    4: Gold,
    5: Platinum,
  };

  // State for selected rating
  const [selectedRating, setSelectedRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [ratingMessage, setRatingMessage] = useState("");
  
  // Submit rating handler
  const submitRating = () => {
    if (selectedRating > 0) {
      setRatingMessage(`Thank you for rating ${selectedRating} star(s)!`);
    } else {
      setRatingMessage("Please select a star rating!");
    }
  };

  // Handle star click
  const handleStarClick = (value) => {
    setSelectedRating(value);
  };

  // Handle hover effect
  const handleMouseOver = (value) => {
    setHoverRating(value);
  };

  // Handle mouse out
  const handleMouseOut = () => {
    setHoverRating(0);
  };

  // Render stars
  const renderStars = () => {
    return [1, 2, 3, 4, 5].map((value) => (
      <span
        key={value}
        className={`star ${value <= (hoverRating || selectedRating) ? 'filled' : ''}`}
        data-value={value}
        onClick={() => handleStarClick(value)}
        onMouseOver={() => handleMouseOver(value)}
        onMouseOut={handleMouseOut}
        style={{ cursor: "pointer" }}
      >
        &#9733;
      </span>
    ));
  };
  

  return (
    <>
      <header>
        <h1>Rate the Student Profile</h1>
      </header>

      <section className="star-rating-section">
        <div className="star-rating">
          {renderStars()}
        </div>
        <button type="button" onClick={submitRating}>
          Submit Rating
        </button>
        <p id="rating-message">{ratingMessage}</p>
      </section>

      <section className="level-section">
        <h3>Student Level Based on Rating:</h3>
        <div id="level-display">
          {selectedRating > 0 && (
            <img
              src={levelImages[selectedRating]}
              alt={`Level ${selectedRating} Image`}
            />
          )}
        </div>
      </section>
    </>
  );
}
