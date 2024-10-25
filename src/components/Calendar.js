import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import iCalendarPlugin from '@fullcalendar/icalendar';
import {useEffect, useRef, useState} from "react";
import {storage, auth} from "../firebase.js";
import {getDownloadURL, ref, uploadString, deleteObject} from "firebase/storage";
import $ from "jquery";

export default function Calendar({ uidProp }) { // Use uid from props
    const [JSONURL, setJSONURL] = useState(null);
    const [JSONREF, setJSONREF] = useState(null);
    const [colour, setColour] = useState("blue");
    const [uid, setUID] = useState(uidProp);
    const calendarRef = useRef(null);

    let eventGuid = 0;
    function createEventId() {
        return String(eventGuid++)
    }

    // Fetch calendar data based on uid (passed as prop)
    useEffect(() => {
        const unsub = auth.onAuthStateChanged((user) => {
            unsub();
            setJSONREF(ref(storage, `users/${user.uid}/user.json`));
            if (uid !== user.uid) {
                console.log(user.uid);
                setUID(user.uid);
                setColour("red");
            }
        });

        const fetchName = async () => {
            if (!uid) return; // Ensure uid is provided

            const icsRef = ref(storage, `users/${uid}/user.ics`);
            const jsonRef = ref(storage, `users/${uid}/user.json`);
            const calendarApi = calendarRef.current.getApi();

            // Fetch ICS file
            getDownloadURL(icsRef).then((downloadURL) => {
                calendarApi.addEventSource({ url: downloadURL, format: 'ics', color: colour });
            }).catch(console.error);

            // Fetch JSON file
            getDownloadURL(jsonRef).then((downloadURL) => {
                calendarApi.addEventSource({ url: downloadURL, color: colour });
                setJSONURL(downloadURL);
            }).catch(console.error);
        }
        fetchName();
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
                uploadString(JSONREF, JSON.stringify(updatedData))
                    .then(() => console.log('Event added'))
                    .catch(console.error);
            });
        } else {
            uploadString(JSONREF, JSON.stringify([newEvent]))
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
                if (updatedData.length > 0) {
                    uploadString(JSONREF, JSON.stringify(updatedData))
                        .then(() => console.log('Event removed'))
                        .catch(console.error);
                } else {
                    deleteObject(JSONREF)
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

                        select={handleDateSelect}
                        eventClick={handleEventClick}

                        eventAdd={addEvent}
                        eventRemove={removeEvent}
                    />
                </div>
            </div>
        </>
    );
}
