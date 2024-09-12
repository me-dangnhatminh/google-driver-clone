import sidebarUtil from "@utils/side-bar.util";
import { MenuIcon } from "lucide-react";
import React from "react";

const LIVEKIT_CONTROL = "lk-control-bar";

function RoomHeader() {
  const mybarRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const controlBar = document.getElementsByClassName(LIVEKIT_CONTROL)[0];
    if (!controlBar) console.error("LiveKit control bar not found");
    if (!controlBar || !mybarRef.current) return;
    controlBar.insertBefore(mybarRef.current, controlBar.firstChild);
  }, [mybarRef]);

  return (
    <div ref={mybarRef}>
      <MenuIcon
        role="button"
        className="bg-black rounded-full p-1 w-8 h-8 lg:hidden"
        onClick={sidebarUtil.toggle}
      />
    </div>
  );
}

export default RoomHeader;
