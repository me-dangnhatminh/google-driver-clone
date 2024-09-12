/* eslint-disable @typescript-eslint/no-namespace */
import React from "react";
import Fuse, { FuseResult } from "fuse.js";
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar";
import {
  useLocalParticipant,
  useRemoteParticipants,
} from "@livekit/components-react";
import { FixedSizeList as VirtualizedList } from "react-window";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@components/ui/popover";
import { MoreVertical } from "lucide-react";
import { parseParts, parsePart } from "@utils/livekit.helper";
import { Participant } from "@api";

namespace ListParticipant {
  export type LocalPart = Participant;
  export type RemotePart = Participant;
  export type PartProps = LocalPart | RemotePart;
}

const MangeParticipant = () => {
  const btn = `w-full flex items-center space-x-2 py-1 px-2 hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer text-muted-foreground`;
  return (
    <>
      <button className={btn}>Kick</button>
      <button className={btn}>Ban</button>
    </>
  );
};

export const ParticipantAction = () => {
  return (
    <div className="flex flex-col rounded-sm overflow-hidden">
      <MangeParticipant />
    </div>
  );
};

const ActionPopover = () => {
  return (
    <Popover>
      <PopoverTrigger>
        <button className="p-2">
          <MoreVertical size={16} />
        </button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-44">
        <ParticipantAction />
      </PopoverContent>
    </Popover>
  );
};

const ParticipantItem = (props: ListParticipant.PartProps) => {
  const livekitLocal = useLocalParticipant();
  const localPart = parsePart(livekitLocal.localParticipant);
  const localCanManage = localPart.permissions?.manageParticipant;
  const isLocal = props.id === localPart.id;

  return (
    <div className="w-full flex items-center justify-between space-x-1 text-sm">
      <Avatar className="text-black dark:text-white">
        <AvatarImage
          src={props.avatarURI ?? undefined}
          alt={props.displayName}
        />
        <AvatarFallback children={props.displayName[0]} />
      </Avatar>
      <div className="w-full overflow-hidden">
        <p className="overflow-hidden truncate">{props.displayName}</p>
        <p className="overflow-hidden truncate text-gray-500">
          {props.subject}
        </p>
      </div>
      {isLocal ? "(You)" : localCanManage ? <ActionPopover {...props} /> : null}
    </div>
  );
};

function ListParticipant() {
  const [listHeight, setListHeight] = React.useState(0);
  const listContainerRef = React.useRef(null);
  const [search, setSearch] = React.useState("");

  const localPart = useLocalParticipant().localParticipant;
  const remotePart = useRemoteParticipants();

  const participants = React.useMemo(() => {
    return parseParts([localPart, ...remotePart]);
  }, [localPart, remotePart]);

  const searchEng = React.useMemo(
    () => new Fuse(participants, { keys: ["displayName", "email", "subject"] }),
    [participants]
  );

  const searched = React.useMemo(() => {
    if (search === "") return participants;
    const results = searchEng.search(search);
    return results.map((r: FuseResult<ListParticipant.PartProps>) => r.item);
  }, [search, participants, searchEng]);

  React.useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      entries.forEach((entry) => setListHeight(entry.contentRect.height));
    });
    const container = listContainerRef.current;
    if (container) resizeObserver.observe(container);
    return () => {
      if (container) resizeObserver.unobserve(container);
    };
  }, []);

  const partSize = participants.length;

  return (
    <div className="w-full h-full flex flex-col space-y-4 p-4 bg-neutral-800 dark:bg-transparent">
      <div>
        <div className="text-lg font-semibold">Participants</div>
        <div className="text-sm text-gray-500">{partSize} in room</div>
      </div>
      <div className="w-full">
        <input
          type="text"
          placeholder="Search"
          className="w-full p-2 text-black dark:text-white bg-white dark:bg-black rounded-md"
          value={search}
          onChange={(e) => setSearch(e.target.value.trim())}
        />
      </div>
      <div ref={listContainerRef} className="w-full h-full overflow-hidden">
        <VirtualizedList
          itemCount={searched.length}
          itemSize={50}
          width={"100%"}
          height={listHeight}
        >
          {({ index, style }) => {
            const part = searched[index];
            return (
              <div style={style} children={<ParticipantItem {...part} />} />
            );
          }}
        </VirtualizedList>
      </div>
    </div>
  );
}

export default ListParticipant;
