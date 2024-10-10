import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import React, { useState } from "react";
import { db } from "../firebase.js";
import Header from "../components/Header.js";

const SearchProfile = () => {
  const [searchName, setSearchName] = useState("");
  const [results, setResults] = useState([]);
  const [isEmptySearch, setIsEmptySearch] = useState(false);

  const SearchForUser = async (searchName) => {
    if (!searchName.trim()) {
      console.log("Empty search, returning.");
      return [];
    }

    searchName = searchName.trim();

    // Get users reference
    const usersRef = collection(db, "users");

    // Use prefix matching with >= and <=
    const startName = searchName;
    const endName = searchName + '\uf8ff'; // highest unicode character

    // Queries for firstName and lastName
    const firstNameQuery = query(
      usersRef,
      where("firstName", ">=", startName),
      where("firstName", "<=", endName)
    );
    const lastNameQuery = query(
      usersRef,
      where("lastName", ">=", startName),
      where("lastName", "<=", endName)
    );

    const results = [];

    // Use multiple queries for fetching based on first name, last name, id
    try {
      // firstName query
      const firstNameSnapshot = await getDocs(firstNameQuery);
      firstNameSnapshot.forEach((doc) => {
        results.push({ id: doc.id, ...doc.data() });
      });

      // lastName query
      const lastNameSnapshot = await getDocs(lastNameQuery);
      lastNameSnapshot.forEach((doc) => {
        // Check for duplicates
        if (!results.some((user) => user.id === doc.id)) {
          results.push({ id: doc.id, ...doc.data() });
        }
      });

      // Fetch user by ID (document name)
      const userByIdRef = doc(db, "users", searchName);
      const userByIdSnapshot = await getDoc(userByIdRef);
      if (userByIdSnapshot.exists()) {
        // Check for duplicates
        if (!results.some((user) => user.id === userByIdSnapshot.id)) {
          results.push({ id: userByIdSnapshot.id, ...userByIdSnapshot.data() });
        }
      }

      console.log("Results:", results);

      // Check if results is empty
      if (results.length === 0) {
        setIsEmptySearch(true);
      } else {
        setIsEmptySearch(false);
      }

      return results;
    } catch (error) {
      console.error("Error searching for user:", error);
      setIsEmptySearch(true);
      return [];
    }
  };

  const handleSearch = async () => {
    const users = await SearchForUser(searchName);
    setResults(users);
  };

  return (
    <>
      <Header />
      <div className="search-main-box">
        {/** Search bar section */}
        <div>
          <h2>Search For a User</h2>
          <p>Search by name or enter User ID. Case-sensitive.</p>

          <div className="search-bar">
            <input
              className="search-user"
              type="text"
              placeholder="Search for profile"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
            />
            <button onClick={handleSearch} className="btn btn-primary">
              Search
            </button>
          </div>

          {/** Search results */}
          <div>
            <ul>
              {/** If no results found */}
              {isEmptySearch && (
                <p>No users found. Try checking for spelling errors.</p>
              )}

              {results.map((user) => (
                // link to user profile
                <li key={user.id}>
                  <a href={`/profile/${user.id}`}>
                    {user.firstName} {user.lastName}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default SearchProfile;
