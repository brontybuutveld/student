import Header from "./Header.js";
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import iCalendarPlugin from '@fullcalendar/icalendar';
import {useEffect, useRef, useState} from "react";
import {onAuthStateChanged} from "firebase/auth";
import {auth, storage} from "../firebase.js";
import {getDownloadURL, ref, getMetadata, uploadString, deleteObject} from "firebase/storage";
import $ from "jquery";

export default function Calendar({ uid }) { // Use uid from props
    const [calURL, setCalURL] = useState(null);
    const [JSONURL, setJSONURL] = useState(null);
    const calendarRef = useRef()

    let eventGuid = 0;
    function createEventId() {
        return String(eventGuid++)
    }

    // Fetch calendar data based on uid (passed as prop)
    useEffect(() => {
        if (!uid) return; // Ensure uid is provided

        const fetchCalendarData = async () => {
            try {
                const icsRef = ref(storage, `users/${uid}/user.ics`);
                const jsonRef = ref(storage, `users/${uid}/user.json`);

                // Fetch ICS file
                try {
                    await getMetadata(icsRef);
                    const downloadURL = await getDownloadURL(icsRef);
                    setCalURL(downloadURL);
                } catch (error) {
                    if (error.code !== 'storage/object-not-found') {
                        console.error("Error fetching ICS:", error);
                    }
                }

                // Fetch JSON file
                try {
                    await getMetadata(jsonRef);
                    const downloadURL = await getDownloadURL(jsonRef);
                    setJSONURL(downloadURL);
                } catch (error) {
                    if (error.code !== 'storage/object-not-found') {
                        console.error("Error fetching JSON:", error);
                    }
                }
            } catch (err) {
                console.error("Error fetching calendar data:", err);
            }
        };

        fetchCalendarData();
    }, [uid]); // Fetch data when uid changes

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
        const newEvent = {
            title: addInfo.event.title,
            start: addInfo.event.startStr,
            end: addInfo.event.endStr,
        };

        if (JSONURL) {
            $.getJSON(JSONURL, (data) => {
                const updatedData = [...data, newEvent];
                uploadString(ref(storage, `users/${uid}/user.json`), JSON.stringify(updatedData))
                    .then(() => console.log('Event added'))
                    .catch(console.error);
            });
        } else {
            uploadString(ref(storage, `users/${uid}/user.json`), JSON.stringify([newEvent]))
                .then(() => console.log('Event added'))
                .catch(console.error);
        }
    }

    function removeEvent(removeInfo) {
        const eventToRemove = {
            title: removeInfo.event.title,
            start: removeInfo.event.startStr,
            end: removeInfo.event.endStr,
        };

        if (JSONURL) {
            $.getJSON(JSONURL, (data) => {
                const updatedData = data.filter(
                    (event) => JSON.stringify(event) !== JSON.stringify(eventToRemove)
                );

                const refPath = `users/${uid}/user.json`;
                if (updatedData.length > 0) {
                    uploadString(ref(storage, refPath), JSON.stringify(updatedData))
                        .then(() => console.log('Event removed'))
                        .catch(console.error);
                } else {
                    deleteObject(ref(storage, refPath))
                        .then(() => console.log('No events remaining'))
                        .catch(console.error);
                }
            });
        }
    }

    return (
        <>
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
    );
}
