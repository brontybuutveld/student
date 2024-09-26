import Header from "../components/Header.js";
import { useState, useEffect, useRef } from "react";
import { ref, uploadBytes, listAll, getDownloadURL, deleteObject, getMetadata, uploadString } from "firebase/storage";
import { auth, storage } from "../firebase";
import { db, useAuth, uploadProfile } from '../firebase.js';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import "firebase/auth";
import firebase from "firebase/app";
import {doc, getDoc} from "firebase/firestore";

export default function Upload() {

    const { currentUser, userData } = useAuth();

    const [image, setImage] = useState(null);
    const [URL, setURL] = useState([]);
    const [UID, setUID] = useState(null);
    const [filename, setFilename] = useState([]);
    const [workingDir, setWorkingDir] = useState(null);
    const [size, setSize] = useState(null);
    const [dirName, setDirName] = useState('');
    const [subDirs, setSubDirs] = useState(null);
    const [rootDir, setRootDir] = useState(null);
    const [subDirFoo, setSubDirFoo] = useState(null);
    const [user, setUser] = useState(null);
    const [uidFetched, setUidFetched] = useState(false); // To ensure it runs only once

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (user) => {
            if (user && !uidFetched) { // Check if user exists and uid hasn't been fetched
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
        workingDir && listAll(ref(storage, workingDir)).then((response) => {
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
                    if (md.size < 1024)
                        sizes.push(md.size + " b");
                    else if (md.size >= 1024 && md.size < 1024 * 1024)
                        sizes.push((md.size / 1024).toFixed(1) + " kb");
                    else if (md.size >= 1024 * 1024 && md.size < 1024 * 1024 * 1024)
                        sizes.push((md.size / (1024 * 1024)).toFixed(1) + " mb");
                    else if (md.size >= 1024 * 1024 * 1024 && md.size < 1024 * 1024 * 1024 * 1024)
                        sizes.push((md.size / (1024 * 1024 * 1024)).toFixed(1) + " gb");
                    else if (md.size >= 1024 * 1024 * 1024 * 1024 && md.size < 1024 * 1024 * 1024 * 1024 * 1024)
                        sizes.push((md.size / (1024 * 1024 * 1024 * 1024)).toFixed(1) + " tb");
                });
            })
            response.prefixes.forEach((prefixe) => {
                subdir.push(prefixe.name);
            })

            setSubDirs(subdir);
            setFilename(files);
            setSize(sizes);

            // Get all URLs asynchronously
            response.items.forEach((item) => {
                urlsPromises.push(getDownloadURL(item));  // Store promises for URLs
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
                    if (md.size < 1024)
                        setSize((prev) => [...prev, md.size + " b"]);
                    else if (md.size >= 1024 && md.size < 1024 * 1024)
                        setSize((prev) => [...prev, (md.size / 1024).toFixed(1) + " kb"]);
                    else if (md.size >= 1024 * 1024 && md.size < 1024 * 1024 * 1024)
                        setSize((prev) => [...prev, (md.size / (1024 * 1024)).toFixed(1) + " mb"]);
                    else if (md.size >= 1024 * 1024 * 1024 && md.size < 1024 * 1024 * 1024 * 1024)
                        setSize((prev) => [...prev, (md.size / (1024 * 1024 * 1024)).toFixed(1) + " gb"]);
                    else if (md.size >= 1024 * 1024 * 1024 * 1024 && md.size < 1024 * 1024 * 1024 * 1024 * 1024)
                        setSize((prev) => [...prev, (md.size / (1024 * 1024 * 1024 * 1024)).toFixed(1) + " tb"]);
                });
            });
            alert("Uploaded successfully.");
        });
    }

    useEffect(() => {
        //console.log(user);
        //console.log(workingDir)
        //console.log(workingDir)
        workingDir && listAll(ref(storage, workingDir)).then((response) => {
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
                    if (md.size < 1024)
                        sizes.push(md.size + " b");
                    else if (md.size >= 1024 && md.size < 1024 * 1024)
                        sizes.push((md.size / 1024).toFixed(1) + " kb");
                    else if (md.size >= 1024 * 1024 && md.size < 1024 * 1024 * 1024)
                        sizes.push((md.size / (1024 * 1024)).toFixed(1) + " mb");
                    else if (md.size >= 1024 * 1024 * 1024 && md.size < 1024 * 1024 * 1024 * 1024)
                        sizes.push((md.size / (1024 * 1024 * 1024)).toFixed(1) + " gb");
                    else if (md.size >= 1024 * 1024 * 1024 * 1024 && md.size < 1024 * 1024 * 1024 * 1024 * 1024)
                        sizes.push((md.size / (1024 * 1024 * 1024 * 1024)).toFixed(1) + " tb");
                });
            })
            response.prefixes.forEach((prefixe) => {
                subdir.push(prefixe.name);
            })

            setSubDirs(subdir);
            setFilename(files);
            setSize(sizes);

            // Get all URLs asynchronously
            response.items.forEach((item) => {
                urlsPromises.push(getDownloadURL(item));  // Store promises for URLs
            });

            // Once all URLs are resolved, set URL state and map to filenames
            Promise.all(urlsPromises).then((urls) => {
                setURL(urls);
            });
        });
    }, []);

    const deleteFile = (refe) => {
        deleteObject(ref(storage, `${workingDir}/${refe}`)).then(() => {
            listAll(ref(storage, workingDir)).then((response) => {
                const urlsPromises = [];
                const files = [];
                const sizes = [];
                //console.log("test");

                response.items.forEach((folderRef) => {
                    files.push(folderRef.name);

                    getMetadata(folderRef).then((md) => {
                        if (md.size < 1024)
                            sizes.push(md.size + " b");
                        else if (md.size >= 1024 && md.size < 1024 * 1024)
                            sizes.push((md.size / 1024).toFixed(1) + " kb");
                        else if (md.size >= 1024 * 1024 && md.size < 1024 * 1024 * 1024)
                            sizes.push((md.size / (1024 * 1024)).toFixed(1) + " mb");
                        else if (md.size >= 1024 * 1024 * 1024 && md.size < 1024 * 1024 * 1024 * 1024)
                            sizes.push((md.size / (1024 * 1024 * 1024)).toFixed(1) + " gb");
                        else if (md.size >= 1024 * 1024 * 1024 * 1024 && md.size < 1024 * 1024 * 1024 * 1024 * 1024)
                            sizes.push((md.size / (1024 * 1024 * 1024 * 1024)).toFixed(1) + " tb");
                    });
                })

                setFilename(files);
                setSize(sizes);

                // Get all URLs asynchronously
                response.items.forEach((item) => {
                    urlsPromises.push(getDownloadURL(item));  // Store promises for URLs
                });

                // Once all URLs are resolved, set URL state and map to filenames
                Promise.all(urlsPromises).then((urls) => {
                    setURL(urls);
                });
            });
        }).catch((error) => {

        });
    }

    function newDir() {
        const dir = ref(storage, `${workingDir}/${dirName}/.unfortunatelyEmptyDirectoriesAreDeleted`);
        uploadString(dir, "").then(() => {
            setSubDirs((prev) => [...prev, dirName]);
        }).catch((error) => {

        });
    }

    function deleteDir(filenameElement) {
        const dir = ref(storage,`${workingDir}/${filenameElement}/`);
        const dir2 = ref(storage,`${workingDir}`);

        listAll(dir).then((response) => {
            response.items.forEach((folderRef) => {
                deleteObject(folderRef)
            })
            //300ms delay since firebase storage is wack af
        }).then(() => new Promise(resolve => setTimeout(resolve, 300)).then(() => {
            listAll(dir2).then((response) => {
                const urls = response.prefixes.map((folderRef) => folderRef.name);
                setSubDirs(urls);
            })
        }));
    }

    function changeWorkingDir(subDir) {
        setWorkingDir(subDir)
    }

    return (
        <>
            <Header />
            <h2>Upload</h2>
            <input type="file" onChange={(event) => {setImage(event.target.files[0])}} />
            <button onClick={uploadFile}>Upload</button>
            <label>
                New directory name
                <input value={dirName} onChange={e => setDirName(e.target.value)}/>
            </label>
            <button onClick={newDir}>mkdir</button>

            <br/>
            <table>
                <thead>
                    <tr>
                        <th>Filename</th>
                        <th>Share</th>
                        <th>Size</th>
                        <th>Delete</th>
                    </tr>
                </thead>
                <tbody>
                {
                    <tr key="back">
                        <td onClick={() => changeWorkingDir(workingDir.replace(/^(.+\/)[^\/]+\/?$/, '$1'))}>back
                            (subdirectory)
                        </td>
                        <td></td>
                        <td>null</td>
                        <td></td>
                    </tr>
                }

                {subDirs && subDirs.map((subDir, index) => {
                    return (
                        <tr key={index}>
                            <td onClick={() => changeWorkingDir(`${workingDir}/${subDir}`)}>{subDir} (subdirectory)</td>
                            <td></td>
                            <td>null</td>
                            <td style={{color: "red", textAlign: "center"}}>
                            <button onClick={() => deleteDir(subDir)}>[X]</button>
                                </td>
                            </tr>
                        );
                    })}

                    {URL && URL.map((url, index) => {
                        return (
                            <tr key={index}>
                                <td><a href={url}>{filename[index]}</a></td>
                                <td>
                                    <button onClick={() => {
                                        navigator.clipboard.writeText(url)
                                    }}>copy
                                    </button>
                                </td>
                                <td style={{textAlign: "right"}}>{size[index]}</td>
                                <td style={{color: "red", textAlign: "center"}}>
                                    <button onClick={() => deleteFile(filename[index])}>[X]</button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </>
    )
};