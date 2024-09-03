import Header from "../components/Header.js";
import Calendar from "react-calendar";
import 'react-calendar/dist/Calendar.css';
import { useState } from "react";

export default function CalendarPage() {
    /** if not logged in should redirect to signup/login */
    
    const [value, setValue] = useState(new Date());

    function onChange(nextValue) {
      setValue(nextValue);
    }

    return (
        <>
            <Header />
            <h2>Calendar</h2>
            <Calendar className="calendar" onChange={onChange} value={value} onClickDay={(value) => alert('Clicked day: ', value)}/>
            
        </>
    )
};