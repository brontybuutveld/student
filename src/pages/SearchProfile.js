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

// added for testing
export const firebaseFunctions = {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
};

const SearchProfile = () => {
  const [searchName, setSearchName] = useState("");
  const [results, setResults] = useState([]);
  const [isEmptySearch, setIsEmptySearch] = useState(false);
  const [userLoading, setUserLoading] = useState(false);

  const SearchForUser = async (searchName) => {
    if (!searchName.trim()) {
      console.log("Empty search, returning.");
      setUserLoading(false); // Ensure loading is set to false
      setIsEmptySearch(true);
      return [];
    }

    setUserLoading(true);
    setIsEmptySearch(false); // Reset this at the start of search

    try {
      searchName = searchName.trim();
      const usersRef = firebaseFunctions.collection(db, "users");

      const startName = searchName;
      const endName = searchName + "\uf8ff";

      const firstNameQuery = firebaseFunctions.query(
        usersRef,
        firebaseFunctions.where("firstName", ">=", startName),
        firebaseFunctions.where("firstName", "<=", endName)
      );

      const lastNameQuery = firebaseFunctions.query(
        usersRef,
        firebaseFunctions.where("lastName", ">=", startName),
        firebaseFunctions.where("lastName", "<=", endName)
      );

      const results = [];

      const firstNameSnapshot = await firebaseFunctions.getDocs(firstNameQuery);
      console.log("First name query results:", firstNameSnapshot.size);

      firstNameSnapshot.forEach((doc) => {
        console.log("Found doc:", doc.id, doc.data());
        results.push({ id: doc.id, ...doc.data() });
      });

      const lastNameSnapshot = await firebaseFunctions.getDocs(lastNameQuery);
      lastNameSnapshot.forEach((doc) => {
        if (!results.some((user) => user.id === doc.id)) {
          results.push({ id: doc.id, ...doc.data() });
        }
      });

      const userByIdRef = firebaseFunctions.doc(db, "users", searchName);
      const userByIdSnapshot = await firebaseFunctions.getDoc(userByIdRef);
      if (
        userByIdSnapshot.exists() &&
        !results.some((user) => user.id === userByIdSnapshot.id)
      ) {
        results.push({ id: userByIdSnapshot.id, ...userByIdSnapshot.data() });
      }

      setUserLoading(false);

      if (results.length === 0) {
        setIsEmptySearch(true);
      } else {
        setIsEmptySearch(false);
        setResults(results);
      }

      return results;
    } catch (error) {
      console.error("Error searching for user:", error);
      setUserLoading(false);
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
              {userLoading && <p>Loading...</p>}
              {!userLoading && isEmptySearch && (
                <p>No users found. Try checking for spelling errors.</p>
              )}
              {!userLoading &&
                results.map((user) => (
                  <li key={user.id}>
                    <a
                      className="btn search-result"
                      href={`/profile/${user.id}`}
                    >
                      {/* Display mini avatar */}
                      <img
                        src={
                          user.avatar ||
                          "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"
                        }
                        alt={`${user.firstName} ${user.lastName}'s avatar`}
                        className="mini-avatar"
                        onError={(e) => {
                          e.target.src =
                            "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png";
                        }}
                      />
                      <p>
                        {user.firstName} {user.lastName}
                      </p>
                      <p>Level {user.level}</p>
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
