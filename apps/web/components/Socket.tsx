"use client";
import { useSocket } from "@/hooks/useSocket";
import { useEffect, useState, useRef, useCallback } from "react";
import { MessageType } from "./ChatComponents";
import { useRoomIdStore } from "@/store/roomIdStore";
import { useAuthStore } from "@/store/useAuthStore";
import { SendHorizontal, Trash2 } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

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

  useEffect(() => {
    setChats(messages);
  }, [activeRoomId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chats]);

  useEffect(() => {
    if (!socket || isLoading || !activeRoomId) return;

    function handleMessage(e: MessageEvent) {
      const parsedData = JSON.parse(e.data);
      console.log("Received data:", parsedData);

      if (parsedData.type === "like" || parsedData.type === "unlike") {
        setChats(prevChats =>
          prevChats.map(msg =>
            msg.id === parsedData.messageId
              ? { ...msg, like: parsedData.like }
              : msg
          )
        );
        return;
      }

      if (parsedData.type === "chat") {
        setChats(prevChats => [
          ...prevChats,
          {
            ...parsedData,
            id:
              parsedData.id ||
              Math.random().toString(36).slice(2) +
                Date.now().toString(),
          },
        ]);
      }
    }

    socket.addEventListener("message", handleMessage);

    if (socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: "join_room", roomId: activeRoomId }));
    }

    return () => {
      socket.removeEventListener("message", handleMessage);
    };
  }, [socket, isLoading, activeRoomId]);

  const sendWhenOpen = useCallback(
    (data: any) => {
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(data));
      }
    },
    [socket]
  );

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!currentMessage.trim() || !socket || !activeRoomId) return;
    if (socket.readyState !== WebSocket.OPEN) {
      toast.error("Connection lost. Please try again.");
      return;
    }
    socket.send(
      JSON.stringify({
        type: "chat",
        roomId: activeRoomId,
        userId,
        message: currentMessage,
      })
    );
    setCurrentMessage("");
  };

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/message/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setChats(chats => chats.filter(msg => msg.id !== id));
      toast.success("Message deleted successfully");
    } catch (err) {
      toast.error("Failed to delete");
      console.log(err);
    }
  };

  if (!activeRoomId) return null;

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {chats.length === 0 ? (
          <div className="flex justify-center items-center text-gray-500">
            No messages yet
          </div>
        ) : (
          chats.map(msg => {
            const isSelf = msg.userId === userId;
            const isLiked = msg.like === 1;
            return (
              <div
                key={msg.id}
                className={`flex ${isSelf ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`group relative p-2 pr-6 rounded max-w-xs break-words cursor-default ${
                    isSelf ? "bg-blue-500 text-white" : "bg-gray-200 text-black"
                  }`}
                  onClick={() => {
                    sendWhenOpen({
                      type: isLiked ? "unlike" : "like",
                      roomId: activeRoomId,
                      userId,
                      messageId: msg.id,
                      like: isLiked ? 0 : 1,
                    });
                  }}
                >
                  {msg.message}
                  <div className="absolute top-1 right-1 transform translate-x-3 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                    <span
                      onClick={() => handleDelete(msg.id)}
                      className={`cursor-pointer text-black ${isSelf && "text-white"}`}
                    >
                      <Trash2 size={16} />
                    </span>
                  </div>
                  {msg.like === 1 && (
                    <span className="absolute right-1 top-6 select-none text-xl pointer-events-none">
                      ❤️
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="border-t px-4 py-2 flex gap-2 shrink-0">
        <div className="relative w-full">
          <input
            type="text"
            value={currentMessage}
            onChange={e => setCurrentMessage(e.target.value)}
            className="w-full border rounded px-3 py-2 pr-10"
            placeholder="Type a message..."
            autoFocus
          />
          {currentMessage.trim() !== "" && (
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer text-white dark:text-black bg-blue-500 rounded-full p-2 hover:bg-blue-600"
              disabled={isLoading}
            >
              <SendHorizontal className="w-5 h-5" />
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
