import Header from "../components/Header.js";
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import iCalendarPlugin from '@fullcalendar/icalendar';
import {useEffect, useState} from "react";
import {onAuthStateChanged} from "firebase/auth";
import {auth, storage} from "../firebase";
import {getDownloadURL, ref, getMetadata} from "firebase/storage"; // Import the iCalendar plugin

export default function CalendarPage() {
    let eventGuid = 0;
    const [calURL, setCalURL] = useState(null);
    const [uidFetched, setUidFetched] = useState(false); // To ensure it runs only once

    function createEventId() {
        return String(eventGuid++)
    }

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (user) => {
            if (user && !uidFetched) { // Check if user exists and uid hasn't been fetched
                getMetadata(ref(storage, `users/${user.uid}/user.ics`))
                    .then((metadata) => {
                        // File exists
                        console.log("File exists:", metadata);
                        getDownloadURL(ref(storage, `users/${user.uid}/user.ics`)).then((downloadURL) => {
                            setCalURL(downloadURL)
                        }).set('Access-Control-Allow-Origin', '*');

                        setUidFetched(true); // Mark uid as fetched
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
    }, [uidFetched]); // Run effect only when uidFetched changes (prevents reruns)

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

    return (
        <>
            <Header/>
            <p>Upload user.ics to your root directory</p>
            {calURL && <div className='demo-app'>
                <div className='demo-app-main'>
                    {calURL && <FullCalendar
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
                        events={{
                            url: `${calURL}`,
                            format: 'ics'
                        }}
                        select={handleDateSelect}
                        eventClick={handleEventClick}
                        /* you can update a remote database when these fire:
                        eventAdd={function(){}}
                        eventChange={function(){}}
                        eventRemove={function(){}}
                        */
                    />}
                </div>
            </div>}
        </>
    )
}