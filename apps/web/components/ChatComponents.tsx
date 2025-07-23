"use client";

import { useRoomIdStore } from "@/store/roomIdStore";
import axios from "axios";
import { useEffect, useState } from "react";
import Socket from "./Socket";

export interface MessageType {
  id: number;
  message: string;
  userId: string;
  roomId: number;
  userName: string;
  like: number;
}

export default function ChatComponents() {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [loading, setLoading] = useState(false);
  const { activeRoomId } = useRoomIdStore();

  const fetchMessages = async () => {
    if (!activeRoomId) return;
    setLoading(true);
    try {
      const res = await axios.get(
        `http://localhost:3001/messages/${activeRoomId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setMessages(res.data.message);
    } catch (err) {
      console.error("Failed to fetch messages", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [activeRoomId]);

  return (
    <div className="p-4">
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
        </div>
      ) : (
        <div className="h-[calc(100vh-40px)]">
            <Socket messages={messages} />
        </div>
      )}
    </div>
  );
}
