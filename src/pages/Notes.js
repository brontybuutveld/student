import Header from "../components/Header.js";
export default function Notes() {
    const navigate = useNavigate();

    // Prevent signed out users from accessing
    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (!user) {
          // Redirect to home
          navigate("/home");
        }
      });
  
      // Cleanup listener
      return () => unsubscribe();
    }, [navigate]);

    return (
        <>
            <Header />
            <h2>Notes</h2>
        </>
    )
};