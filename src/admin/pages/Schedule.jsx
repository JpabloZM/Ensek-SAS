import Calendar from '../components/Calendar/Calendar';
import './Schedule.css';

const Schedule = () => {
  return (
    <div className="schedule-page">
      <div className="schedule-content">
        <Calendar />
      </div>
    </div>
  );
};

export default Schedule;
