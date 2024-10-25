import Header from "../components/Header.js";
import Calendar from "../components/Calendar.js";
import { useAuth } from "../firebase.js";
import { useEffect, useState } from "react";

export default function CalendarPage() {
    const { currentUser } = useAuth();
    const [loading, setLoading] = useState(true); // loading state

    useEffect(() => {
        if (currentUser !== undefined) {
            // Set loading to false once authentication state is determined
            setLoading(false);
        }
    }, [currentUser]);

    if (loading) {
        return <div>Loading</div>; 
    }
    if (!currentUser) {
        return null;
    }

    return (
        <>
            <Header />
            <div className="calendar-page">
            <Calendar uidProp={currentUser.uid} />
        </div>
        </>
    );
}
