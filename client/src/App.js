import { useState, useEffect } from "react";
import HebCalendarRBC from "./components/HebCalendarRBC/HebCalendarRBC";
import HebCalendarFC from "./components/HebCalendarFC/HebCalendarFC";
import "./App.css";

function App() {
  const [toraLessonsArr, setToraLessonsArr] = useState([]);

  const getAllToraLessonsFromServer = () => {
    fetch("/api/shiureToraHalutza")
      .then((response) => response.json())
      .then((toraLessonsFromDB) => {
        setToraLessonsArr(toraLessonsFromDB);
      })
      .catch((error) => {
        console.log("fetch error", error);
      });
  };

  useEffect(() => {
    getAllToraLessonsFromServer();
  }, []);

  return (
    <div className="myBody">
      <HebCalendarRBC lessonEvents={toraLessonsArr} />
      <br />
      <HebCalendarFC lessonEvents={toraLessonsArr} />
    </div>
  );
}

export default App;
