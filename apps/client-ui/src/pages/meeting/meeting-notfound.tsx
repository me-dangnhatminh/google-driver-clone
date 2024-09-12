import { RoutesPath } from "@constants";
import { useNavigate } from "react-router-dom";

function MeetingNotFound() {
  const navigate = useNavigate();
  const toMettings = () => navigate(RoutesPath.MEETING);

  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center">
      <div className="text-3xl">Meeting not found</div>
      <div className="text-lg">
        The meeting you are looking for does not exist
      </div>
      <div className="text-lg">
        <button className="hover:underline" onClick={toMettings}>
          Back to meetings
        </button>
      </div>
    </div>
  );
}

export default MeetingNotFound;
