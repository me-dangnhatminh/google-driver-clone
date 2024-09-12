import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar";
import {
  LiveKitRoom,
  ReceivedChatMessage,
  useChat,
} from "@livekit/components-react";
import { Room } from "livekit-client";
import { SendIcon } from "lucide-react";

const ChatBox = () => {
  const chat = useChat();
  const messages = chat.chatMessages;

  const handleSend = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const input = e.currentTarget["send-message"];
    input.value = input.value.trim();
    if (!input.value || input.value === "") return;
    const text = input.value;
    chat.send(text);
    input.value = "";
  };

  return (
    <div className="w-full h-full flex flex-col">
      <form
        noValidate
        onSubmit={handleSend}
        className="flex items-center gap-2 p-2 sticky top-0 z-10 border-b"
      >
        <input
          name="send-message"
          className="w-full p-2 text-sm rounded-lg border bg-transparent"
          placeholder="Type a message"
        />
        <button
          type="submit"
          className="flex items-center justify-center w-10 h-10"
          children={<SendIcon className="w-5 h-5" />}
        />
      </form>
      <div className="flex-1 flex flex-col h-full gap-4 px-4 py-2 overflow-auto">
        {messages.reverse().map((msg) => (
          <ChatMessage recieved={msg} key={msg.id} />
        ))}
      </div>
    </div>
  );
};

interface ChatMessageProps {
  recieved: ReceivedChatMessage;
}

const ChatMessage = (props: ChatMessageProps) => {
  const received = props.recieved;
  const message = received.message;
  const from = received.from;

  const meta = received.from?.metadata;
  const metaObj = meta ? JSON.parse(meta) : {};
  const fromHost = metaObj?.role === "host";

  const position = from?.isLocal ? "right" : "left";
  const sendAt = new Date(received.timestamp);

  const user = {
    id: "1",
    fullName: "John Doe",
    avatarURI: undefined,
  };

  const imgElem = (
    <Avatar className="w-8 h-8 rounded-full">
      <AvatarImage src={user.avatarURI} />
      <AvatarFallback children={user.fullName[0]} />
    </Avatar>
  );

  const bgColor = "bg-gray-100 dark:bg-gray-700";
  const textColor = "text-gray-900 dark:text-white";
  const textSize = "text-sm";

  return (
    <div
      className={cn(
        "flex items-start gap-2",
        position === "right" && "justify-end",
        position === "left" && "justify-start"
      )}
    >
      {position === "left" && imgElem}

      <div
        className={cn(
          `${bgColor} ${textColor} ${textSize}`,
          "flex flex-col max-w-[300px] px-4 py-2 overflow-x-hidden",
          position === "right" && "rounded-xl rounded-tr-none",
          position === "left" && "rounded-xl rounded-tl-none"
        )}
      >
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <span className="font-semibold truncate">
            {fromHost && "(Host)"} {user.fullName}
          </span>
          <span
            className="font-normal opacity-70"
            children={timeFormatter.format(sendAt)}
          />
        </div>
        <p className="whitespace-pre-wrap break-words">{message}</p>
        <div className="flex items-center space-x-2 font-normal opacity-70">
          <span className="font-normal opacity-70">Seen</span>
        </div>
      </div>
      {position === "right" && imgElem}
    </div>
  );
};
const timeFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "numeric",
});

export function MeetingChat(props: { room: Room }) {
  return (
    <LiveKitRoom room={props.room} serverUrl={undefined} token={undefined}>
      <ChatBox />
    </LiveKitRoom>
  );
}

export default MeetingChat;
