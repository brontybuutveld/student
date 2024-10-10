import React, { useState } from "react";
import { doc, updateDoc, getDoc, FieldValue } from "firebase/firestore";
import { db, useAuth } from "../firebase";
import Bronze from './images/bronze.png';
import Silver from './images/silver.png';
import Gold from './images/gold.png';
import Platinum from './images/platinum.png';

export default function Level({ userId }) { // userId as a prop to identify the user
  const { currentUser } = useAuth();

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
  const submitRating = async () => {
    if (selectedRating > 0 && currentUser) {
      try {
        const userRef = doc(db, "users", userId); 

        const userDoc = await getDoc(userRef);
        const userData = userDoc.data();
        
        await updateDoc(userRef, {
          level: FieldValue.increment(selectedRating) // increment the rating
        });

        setRatingMessage(`Thank you for rating ${selectedRating} star(s)!`);
      } catch (error) {
        console.error("Error saving rating:", error);
        setRatingMessage("Error saving your rating. Please try again.");
      }
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
      <div className="level-body">
        <header className="level-header">
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
      </div>
    </>
  );
}
