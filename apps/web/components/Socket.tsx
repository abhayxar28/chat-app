"use client";
import { useSocket } from "@/hooks/useSocket";
import { useEffect, useState, useRef } from "react";
import { MessageType } from "./ChatComponents";
import { useRoomIdStore } from "@/store/roomIdStore";
import { useAuthStore } from "@/store/useAuthStore";
import { SendHorizontal } from "lucide-react";
import { useDeleteChat } from "@/hooks/useDeleteChar";

interface SocketProps {
  messages: MessageType[];
}

export default function Socket({ messages }: SocketProps) {
  const { userId } = useAuthStore();
  const { activeRoomId } = useRoomIdStore();
  const [chats, setChats] = useState<MessageType[]>(messages);
  const [currentMessage, setCurrentMessage] = useState("");
  const { socket, isLoading } = useSocket();
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const {deleteChat} = useDeleteChat({id: chatId});

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    setChats(messages);
  }, [messages]);

  useEffect(() => {
    if (!socket || isLoading || !activeRoomId) return;

    if (socket.readyState === WebSocket.OPEN) {
      socket.send(
        JSON.stringify({
          type: "join_room",
          roomId: activeRoomId,
        })
      );

      socket.onmessage = (e) => {
        const parsedData = JSON.parse(e.data);
        if (parsedData.type === "chat") {
          setChats((prevChats) => {
            const exists = prevChats.some(
              (msg) =>
                msg.id === parsedData.id ||
                (msg.message === parsedData.message &&
                  msg.userId === parsedData.userId &&
                  msg.roomId === parsedData.roomId)
            );
            return exists ? prevChats : [...prevChats, parsedData];
          });
        }
      };
    }
  }, [socket, isLoading, activeRoomId]);

  useEffect(() => {
    scrollToBottom();
  }, [chats]);

  const handleSubmit = () => {
    if (!currentMessage.trim()) return;

    socket?.send(
      JSON.stringify({
        type: "chat",
        roomId: activeRoomId,
        userId,
        message: currentMessage,
      })
    );

    setCurrentMessage("");
  };

  if (!activeRoomId) return null;

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {chats.length === 0 ? (
          <div className="flex justify-center items-center h-100vh mt-50 text-gray-500 text-center">
            No messages yet
          </div>
        ) : (
          chats.map((msg, index) => {
            const isSelf = msg.userId === userId;
            return (
              <div
                key={msg.id ?? `${msg.userId}-${index}`}
                className={`flex ${isSelf ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`p-2 rounded max-w-xs break-words ${
                    isSelf ? "bg-blue-500 text-white" : "bg-gray-200 text-black"
                  }`}
                >
                  {msg.message}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>


      <div className="border-t px-4 py-2 flex gap-2 shrink-0">
        <div className="relative w-full">
          <input
            type="text"
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            className="w-full border rounded px-3 py-2 pr-10"
            placeholder="Type a message..."
          />
          {currentMessage.trim() !== "" && (
            <button
              onClick={handleSubmit}
              className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer text-white dark:text-black bg-blue-500 rounded-[50%] p-2 text-center hover:bg-blue-600 "
            >
              <SendHorizontal className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
