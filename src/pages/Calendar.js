import Header from "../components/Header.js";
import Calendar from "react-calendar";
import 'react-calendar/dist/Calendar.css';

export default function CalendarPage() {
    /** if not logged in should redirect to signup/login */
    return (
        <>
            <Header />
            <h2>Calendar</h2>
            <Calendar />
        </>
    )
};