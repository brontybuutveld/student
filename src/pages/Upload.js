import Header from "../components/Header.js";
import { useState, useEffect, useRef } from "react";
import {
  ref,
  uploadBytes,
  listAll,
  getDownloadURL,
  deleteObject,
  getMetadata,
  uploadString,
} from "firebase/storage";
import { auth, storage } from "../firebase";
import { db, useAuth, uploadProfile } from "../firebase.js";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import "firebase/auth";
import firebase from "firebase/app";
import { doc, getDoc } from "firebase/firestore";

export default function Upload() {
  const { currentUser, userData } = useAuth();

  const [image, setImage] = useState(null);
  const [URL, setURL] = useState([]);
  const [UID, setUID] = useState(null);
  const [filename, setFilename] = useState([]);
  const [workingDir, setWorkingDir] = useState(null);
  const [size, setSize] = useState(null);
  // dirName is kind of confusing - change to createDirName?
  const [dirName, setDirName] = useState("");
  const [uploadFileName, setUploadFileName] = useState("");
  
  const [subDirs, setSubDirs] = useState(null);
  const [rootDir, setRootDir] = useState(null);
  const [subDirFoo, setSubDirFoo] = useState(null);
  const [user, setUser] = useState(null);
  const [uidFetched, setUidFetched] = useState(false); // To ensure it runs only once

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user && !uidFetched) {
        // Check if user exists and uid hasn't been fetched
        setUser(user.uid);
        setWorkingDir(`users/${user.uid}`);
        setRootDir(`users/${user.uid}`);
        setUidFetched(true); // Mark uid as fetched
        console.log(user.uid);
      }
    });

    return () => unsub(); // Clean up listener on unmount
  }, [uidFetched]); // Run effect only when uidFetched changes (prevents reruns)

  useEffect(() => {
    workingDir &&
      listAll(ref(storage, workingDir)).then((response) => {
        const urlsPromises = [];
        const files = [];
        const refs = [];
        const sizes = [];
        const subdir = [];
        const subdirfoo = [];

        response.items.forEach((folderRef) => {
          files.push(folderRef.name);
          refs.push(folderRef);

          getMetadata(folderRef).then((md) => {
            if (md.size < 1024) sizes.push(md.size + " b");
            else if (md.size >= 1024 && md.size < 1024 * 1024)
              sizes.push((md.size / 1024).toFixed(1) + " kb");
            else if (md.size >= 1024 * 1024 && md.size < 1024 * 1024 * 1024)
              sizes.push((md.size / (1024 * 1024)).toFixed(1) + " mb");
            else if (
              md.size >= 1024 * 1024 * 1024 &&
              md.size < 1024 * 1024 * 1024 * 1024
            )
              sizes.push((md.size / (1024 * 1024 * 1024)).toFixed(1) + " gb");
            else if (
              md.size >= 1024 * 1024 * 1024 * 1024 &&
              md.size < 1024 * 1024 * 1024 * 1024 * 1024
            )
              sizes.push(
                (md.size / (1024 * 1024 * 1024 * 1024)).toFixed(1) + " tb"
              );
          });
        });
        response.prefixes.forEach((prefixe) => {
          subdir.push(prefixe.name);

        });

        setSubDirs(subdir);
        setFilename(files);
        setSize(sizes);

        // Get all URLs asynchronously
        response.items.forEach((item) => {
          urlsPromises.push(getDownloadURL(item)); // Store promises for URLs
        });

        // Once all URLs are resolved, set URL state and map to filenames
        Promise.all(urlsPromises).then((urls) => {
          setURL(urls);
        });
      });
  }, [workingDir]); // Trigger when workingDir is updated

  const uploadFile = () => {
    if (image == null) return;
    if (currentUser == null) return;
    const imageRef = workingDir && ref(storage, `${workingDir}/${image.name}`);
    //console.log(`users/${UID + "/" + image.name}`);
    uploadBytes(imageRef, image).then((snapshot) => {
      getDownloadURL(snapshot.ref).then((url) => {
        setURL((prev) => [...prev, url]);
        setFilename((prev) => [...prev, snapshot.ref.name]);
        getMetadata(snapshot.ref).then((md) => {
          if (md.size < 1024) setSize((prev) => [...prev, md.size + " b"]);
          else if (md.size >= 1024 && md.size < 1024 * 1024)
            setSize((prev) => [...prev, (md.size / 1024).toFixed(1) + " kb"]);
          else if (md.size >= 1024 * 1024 && md.size < 1024 * 1024 * 1024)
            setSize((prev) => [
              ...prev,
              (md.size / (1024 * 1024)).toFixed(1) + " mb",
            ]);
          else if (
            md.size >= 1024 * 1024 * 1024 &&
            md.size < 1024 * 1024 * 1024 * 1024
          )
            setSize((prev) => [
              ...prev,
              (md.size / (1024 * 1024 * 1024)).toFixed(1) + " gb",
            ]);
          else if (
            md.size >= 1024 * 1024 * 1024 * 1024 &&
            md.size < 1024 * 1024 * 1024 * 1024 * 1024
          )
            setSize((prev) => [
              ...prev,
              (md.size / (1024 * 1024 * 1024 * 1024)).toFixed(1) + " tb",
            ]);
        });
      });
      alert("Uploaded successfully.");
    });
  };

  useEffect(() => {
    //console.log(user);
    //console.log(workingDir)
    //console.log(workingDir)
    workingDir &&
      listAll(ref(storage, workingDir)).then((response) => {
        const urlsPromises = [];
        const files = [];
        const refs = [];
        const sizes = [];
        const subdir = [];
        const subdirfoo = [];

        response.items.forEach((folderRef) => {
          files.push(folderRef.name);
          refs.push(folderRef);

          getMetadata(folderRef).then((md) => {
            if (md.size < 1024) sizes.push(md.size + " b");
            else if (md.size >= 1024 && md.size < 1024 * 1024)
              sizes.push((md.size / 1024).toFixed(1) + " kb");
            else if (md.size >= 1024 * 1024 && md.size < 1024 * 1024 * 1024)
              sizes.push((md.size / (1024 * 1024)).toFixed(1) + " mb");
            else if (
              md.size >= 1024 * 1024 * 1024 &&
              md.size < 1024 * 1024 * 1024 * 1024
            )
              sizes.push((md.size / (1024 * 1024 * 1024)).toFixed(1) + " gb");
            else if (
              md.size >= 1024 * 1024 * 1024 * 1024 &&
              md.size < 1024 * 1024 * 1024 * 1024 * 1024
            )
              sizes.push(
                (md.size / (1024 * 1024 * 1024 * 1024)).toFixed(1) + " tb"
              );
          });
        });
        response.prefixes.forEach((prefixe) => {
          subdir.push(prefixe.name);
        });

        setSubDirs(subdir);
        setFilename(files);
        setSize(sizes);

        // Get all URLs asynchronously
        response.items.forEach((item) => {
          urlsPromises.push(getDownloadURL(item)); // Store promises for URLs
        });

        // Once all URLs are resolved, set URL state and map to filenames
        Promise.all(urlsPromises).then((urls) => {
          setURL(urls);
        });
      });
  }, []);

  const deleteFile = (refe) => {
    deleteObject(ref(storage, `${workingDir}/${refe}`))
      .then(() => {
        listAll(ref(storage, workingDir)).then((response) => {
          const urlsPromises = [];
          const files = [];
          const sizes = [];
          //console.log("test");

          response.items.forEach((folderRef) => {
            files.push(folderRef.name);

            getMetadata(folderRef).then((md) => {
              if (md.size < 1024) sizes.push(md.size + " b");
              else if (md.size >= 1024 && md.size < 1024 * 1024)
                sizes.push((md.size / 1024).toFixed(1) + " kb");
              else if (md.size >= 1024 * 1024 && md.size < 1024 * 1024 * 1024)
                sizes.push((md.size / (1024 * 1024)).toFixed(1) + " mb");
              else if (
                md.size >= 1024 * 1024 * 1024 &&
                md.size < 1024 * 1024 * 1024 * 1024
              )
                sizes.push((md.size / (1024 * 1024 * 1024)).toFixed(1) + " gb");
              else if (
                md.size >= 1024 * 1024 * 1024 * 1024 &&
                md.size < 1024 * 1024 * 1024 * 1024 * 1024
              )
                sizes.push(
                  (md.size / (1024 * 1024 * 1024 * 1024)).toFixed(1) + " tb"
                );
            });
          });

          setFilename(files);
          setSize(sizes);

          // Get all URLs asynchronously
          response.items.forEach((item) => {
            urlsPromises.push(getDownloadURL(item)); // Store promises for URLs
          });

          // Once all URLs are resolved, set URL state and map to filenames
          Promise.all(urlsPromises).then((urls) => {
            setURL(urls);
          });
        });
      })
      .catch((error) => {});
  };

  function newDir() {
    const dir = ref(
      storage,
      `${workingDir}/${dirName}/.unfortunatelyEmptyDirectoriesAreDeleted`
    );
    uploadString(dir, "")
      .then(() => {
        setSubDirs((prev) => [...prev, dirName]);
      })
      .catch((error) => {});
  }

  function deleteDir(filenameElement) {
    const dir = ref(storage, `${workingDir}/${filenameElement}/`);
    const dir2 = ref(storage, `${workingDir}`);

    listAll(dir)
      .then((response) => {
        response.items.forEach((folderRef) => {
          deleteObject(folderRef);
        });
        //300ms delay since firebase storage is wack af
      })
      .then(() =>
        new Promise((resolve) => setTimeout(resolve, 300)).then(() => {
          listAll(dir2).then((response) => {
            const urls = response.prefixes.map((folderRef) => folderRef.name);
            setSubDirs(urls);
          });
        })
      );
  }

  function changeWorkingDir(subDir) {
    setWorkingDir(subDir);
  }

  return (
    <>
      <Header />

      <div className="upload-page">
        <div className="upload-title">
          <h2>My Files</h2>
        </div>

        {/* File/directory input section */}
        <div className="upload-bar">
          <div className="upload-bar-section">
            {/* Hidden file input */}
            <input
              type="file"
              id="hidden-file-input"
              onChange={(event) => {
                const selectedFile = event.target.files[0];
                setImage(selectedFile); // Set the selected file
                setUploadFileName(selectedFile ? selectedFile.name : ""); // Set the filename
              }}
              style={{ display: "none" }} // hide default button
            />
            <label>Upload File</label>
            <button
              onClick={
                () => document.getElementById("hidden-file-input").click()
                // clicks hidden button
              }
              className="btn btn-primary"
            >
              Choose File
            </button>

            <span>{uploadFileName}</span>

            {/* Upload button */}
            <button
              disabled={image === null}
              onClick={uploadFile}
              className="btn btn-primary"
            >
              Upload
            </button>
          </div>

          {/* Input field to create a new directory */}
          <div className="upload-bar-section">
            <label>Create a New Folder</label>
            <input
              value={dirName}
              onChange={(e) => setDirName(e.target.value)}
              placeholder="Enter Folder Name"
            />

            {/* Button to create the new directory */}
            <button onClick={newDir} className="btn btn-primary">
              Create Folder
            </button>
          </div>
        </div>

        <div className="file-list">
          <div className="file-list-top">
            <div style={{margin:"auto 0"}}>
              <span><h5>{workingDir}</h5></span>
            </div>
            {/* Back button to navigate to the parent directory */}
            <div
              className="btn btn-primary file-back-btn"
              key="back"
              onClick={() =>
                changeWorkingDir(workingDir.replace(/^(.+\/)[^\/]+\/?$/, "$1"))
              }
            >
              <span>back</span>
            </div>
          </div>

          {/* File List Section */}
          {/* Header row (replacing <thead>) */}
          <div className="file-list-header">
            <span>Filename</span>
            <span>Share</span>
            <span>Size</span>
            <span>Delete</span>
          </div>

          {/* Mapping through subdirectories */}
          {subDirs &&
            subDirs.map((subDir, index) => (
              <div className="file-item" key={index}>
                {/* Clicking the directory name changes the working directory */}
                <span
                  onClick={() => changeWorkingDir(`${workingDir}/${subDir}`)}
                >
                  {subDir} (subdirectory)
                </span>
                <span></span>
                <span></span>
                <span>
                  {/* Delete button for the directory */}
                  <button
                    onClick={() => deleteDir(subDir)}
                    className="btn btn-danger"
                  >
                    X
                  </button>
                </span>
              </div>
            ))}

          {/* Mapping through URLs (files) */}
          {URL &&
            URL.map((url, index) => (
              <div className="file-item" key={index}>
                {/* Filename with link to download/view the file */}
                <span>
                  <a href={url}>{filename[index]}</a>
                </span>

                {/* Copy button to copy the URL to clipboard */}
                <span>
                  <button
                    onClick={() => navigator.clipboard.writeText(url)}
                    className="btn btn-primary"
                  >
                    Copy link
                  </button>
                </span>

                {/* Display size of the file */}
                <span>{size[index]}</span>

                {/* Delete button for the file */}
                <span>
                  <button
                    onClick={() => deleteFile(filename[index])}
                    className="btn btn-danger"
                  >
                    X
                  </button>
                </span>
              </div>
            ))}
        </div>
      </div>
    </>
  );
}
