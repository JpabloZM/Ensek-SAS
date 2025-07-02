import Calendar from "../components/Calendar/Calendar";
import { useOutletContext } from "react-router-dom";

const Schedule = () => {
  const { darkMode } = useOutletContext() || { darkMode: false };

  return (
    <div className="schedule-page">
      <div className="schedule-content">
        <Calendar darkMode={darkMode} />
      </div>
    </div>
  );
};

export default Schedule;
