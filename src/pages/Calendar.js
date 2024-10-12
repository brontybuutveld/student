import Header from "../components/Header.js";
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import iCalendarPlugin from '@fullcalendar/icalendar';
import {useEffect, useRef, useState} from "react";
import {onAuthStateChanged} from "firebase/auth";
import {auth, storage} from "../firebase";
import {getDownloadURL, ref, getMetadata, uploadString, deleteObject} from "firebase/storage";
import $ from "jquery";

export default function CalendarPage() {
    let eventGuid = 0;
    const [calURL, setCalURL] = useState(null);
    const [JSONURL, setJSONURL] = useState(null);
    const [uid, setUid] = useState(null); // To ensure it runs only once
    const calendarRef = useRef()

    function createEventId() {
        return String(eventGuid++)
    }

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (user) => {
            if (user && !uid) { // Check if user exists and uid hasn't been fetched
                getMetadata(ref(storage, `users/${user.uid}/user.ics`))
                    .then((metadata) => {
                        // File exists
                        console.log("File exists:", metadata);
                        getDownloadURL(ref(storage, `users/${user.uid}/user.ics`)).then((downloadURL) => {
                            setCalURL(downloadURL)
                        })
                        setUid(user.uid); // Mark uid as fetched
                    })
                    .catch((error) => {
                        if (error.code === 'storage/object-not-found') {
                            // File does not exist
                            console.log("File does not exist");
                        } else {
                            // Some other error occurred
                            console.error("Error:", error);
                        }
                    });
                getMetadata(ref(storage, `users/${user.uid}/user.json`))
                    .then((metadata) => {
                        // File exists
                        console.log("File exists:", metadata);
                        getDownloadURL(ref(storage, `users/${user.uid}/user.json`)).then((downloadURL) => {
                            setJSONURL(downloadURL)
                        })
                        setUid(user.uid); // Mark uid as fetched
                    })
                    .catch((error) => {
                        if (error.code === 'storage/object-not-found') {
                            // File does not exist
                            console.log("File does not exist");
                        } else {
                            // Some other error occurred
                            console.error("Error:", error);
                        }
                    });
                console.log(user.uid);
            }
        });
        return () => unsub(); // Clean up listener on unmount
    }, [uid]); // Run effect only when uidFetched changes (prevents reruns)

    function handleDateSelect(selectInfo) {
        let title = prompt('Please enter a new title for your event')
        let calendarApi = selectInfo.view.calendar

        calendarApi.unselect() // clear date selection

        if (title) {
            calendarApi.addEvent({
                id: createEventId(),
                title,
                start: selectInfo.startStr,
                end: selectInfo.endStr,
                allDay: selectInfo.allDay
            })
        }
    }

    function handleEventClick(clickInfo) {
        // eslint-disable-next-line no-restricted-globals
        if (confirm(`Are you sure you want to delete the event '${clickInfo.event.title}'`)) {
            clickInfo.event.remove()
        }
    }

    function addEvent(addInfo) {
        if (uid) {
            let obj = {
                title: addInfo.event.title,
                start: addInfo.event.startStr,
                end: addInfo.event.endStr,
            }
            if (JSONURL) {
                $.getJSON(JSONURL, function (data) {
                    data.push(obj);
                    uploadString(ref(storage, `users/${uid}/user.json`), JSON.stringify(data)).then((snapshot) => {
                        console.log('Uploaded a raw string!');
                    }).catch((error) => {
                        console.log(error);
                    });
                })
            } else {
                uploadString(ref(storage, `users/${uid}/user.json`), JSON.stringify([obj])).then((snapshot) => {
                    console.log('Uploaded a raw string!');
                }).catch((error) => {
                    console.log(error);
                }).then(() => {
                    window.location.reload();
                })
            }
        }
    }

    function removeEvent(addInfo) {
        if (uid) {
            let obj = {
                title: addInfo.event.title,
                start: addInfo.event.startStr,
                end: addInfo.event.endStr,
            }
            if (JSONURL) {
                $.getJSON(JSONURL, function (data) {
                    data = data.filter((event) => JSON.stringify(event) !== JSON.stringify(obj));
                    if (data.length > 0) {
                        uploadString(ref(storage, `users/${uid}/user.json`), JSON.stringify(data)).then((snapshot) => {
                            console.log('Uploaded a raw string!');
                        }).catch((error) => {
                            console.log(error);
                        })
                    } else {
                        deleteObject(ref(storage, `users/${uid}/user.json`)).then((snapshot) => {
                            console.log('Uploaded a raw string!');
                        }).catch((error) => {
                            console.log(error);
                        }).then(() => {
                            window.location.reload();
                        })
                    }
                })
            }
        }
    }

    return (
        <>
            <Header/>
            <p>Import an ICS calendar by uploading it in your root directory as user.ics</p>
            <div className='demo-app'>
                <div className='demo-app-main'>
                    <FullCalendar
                        ref={calendarRef}
                        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, iCalendarPlugin]}
                        headerToolbar={{
                            left: 'prev,next today',
                            center: 'title',
                            right: 'dayGridMonth,timeGridWeek,timeGridDay'
                        }}
                        initialView='dayGridMonth'
                        editable={true}
                        selectable={true}
                        selectMirror={true}
                        dayMaxEvents={true}

                        eventSources={
                            (calURL && JSONURL) ?
                            [
                                { url: calURL, format: 'ics' },
                                { url: JSONURL }
                            ] :
                            calURL ?
                            [{ url: calURL, format: 'ics' }] :
                            JSONURL ?
                            [{ url: JSONURL }] :
                            []
                        }

                        select={handleDateSelect}
                        eventClick={handleEventClick}

                        eventAdd={addEvent}
                        //eventChange={function(){}}
                        eventRemove={removeEvent}

                    />
                </div>
            </div>
        </>
    )
}