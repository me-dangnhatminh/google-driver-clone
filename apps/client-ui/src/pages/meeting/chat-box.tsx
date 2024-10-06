import React from "react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar";
import { SendIcon } from "lucide-react";

const messages = [
  { id: 1, text: "Hello, how can I help you today?" },
  { id: 2, text: "I'm looking for a new laptop, any suggestions?" },
  { id: 3, text: "Sure, what's your budget?" },
  { id: 4, text: "I'm looking for something under $1000" },
  { id: 5, text: "Great! Let me find the best option for you." },
];

interface ChatBoxProps {
  loading?: boolean;
  onSend?: (message: string) => void;
  onTyping?: (message: string) => void;
}

function ChatBox(_props: ChatBoxProps) {
  const handleSend = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const input = e.currentTarget["send-message"];
    input.value = input.value.trim();
    if (!input.value) return;

    input.value = "";
  };
  return (
    <div className="w-full h-full overflow-auto">
      <form
        noValidate
        onSubmit={handleSend}
        className="
          sticky top-0 z-10
          flex items-center gap-2 p-2
          bg-white border-b dark:bg-gray-800
        "
      >
        <input
          name="send-message"
          className="
            w-full p-2 text-sm rounded-lg border
            border-gray-200 focus:ring-4 focus:outline-none
            dark:border-gray-600 dark:focus:ring-gray-600
          "
          placeholder="Type a message"
        />
        <button
          type="submit"
          className="flex items-center justify-center w-10 h-10"
          children={<SendIcon className="w-5 h-5" />}
        />
      </form>

      <div className="flex flex-col h-full gap-4 px-4 py-2">
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            position={message.id % 2 === 0 ? "right" : "left"}
            message={message}
            sendAt={new Date(Math.random() * 1000000000000)}
            userInfo={{
              id: "1",
              fullName: "John Doe",
            }}
          />
        ))}
      </div>
    </div>
  );
}

const timeFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "numeric",
});

interface ChatMessageProps {
  position?: "left" | "right";
  message: { id: number; text: string };
  sendAt: Date;
  userInfo: { id: string; avatarURI?: string; fullName: string };
}

const ChatMessage = (props: ChatMessageProps) => {
  const imgElem = (
    <Avatar className="w-8 h-8 rounded-full">
      <AvatarImage src={props.userInfo.avatarURI} />
      <AvatarFallback children={props.userInfo.fullName[0]} />
    </Avatar>
  );

  const bgColor = "bg-gray-100 dark:bg-gray-700";
  const textColor = "text-gray-900 dark:text-white";
  const textSize = "text-sm";

  return (
    <div
      id={props.userInfo.id}
      className={cn(
        "flex items-start gap-2",
        props.position === "right" && "justify-end",
        props.position === "left" && "justify-start"
      )}
    >
      {props.position === "left" && imgElem}

      <div
        className={cn(
          `${bgColor} ${textColor} ${textSize}`,
          "flex flex-col max-w-[300px] px-4 py-2 overflow-hidden",
          props.position === "right" && "rounded-xl rounded-tr-none",
          props.position === "left" && "rounded-xl rounded-tl-none"
        )}
      >
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <span
            className="font-semibold truncate"
            children={props.userInfo.fullName}
          />
          <span
            className="font-normal opacity-70"
            children={timeFormatter.format(props.sendAt)}
          />
        </div>
        <p className="font-normal py-2 ">{props.message.text}</p>
        <span className="font-normal opacity-70">Seen</span>
      </div>

      {props.position === "right" && imgElem}
    </div>
  );
};

export default ChatBox;
