import ListParticipant from "../sidebar/list-participant";

function MeetingSidebar() {
  return (
    <div className="w-full h-full p-2">
      <div className="w-full h-full bg-black rounded-md overflow-hidden">
        <ListParticipant />
      </div>
    </div>
  );
}

export default MeetingSidebar;
