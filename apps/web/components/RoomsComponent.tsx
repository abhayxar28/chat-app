"use client";

import { useRoomIdStore } from "@/store/roomIdStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useEffect, useState } from "react";
import { AddRoomsComponent } from "@/components/AddRooms";
import { useRoomsStore } from "@/store/useRoomStore";
import { useRouter } from "next/navigation";
import DeleteRoom from "./DeleteRoom";
import { ModeToggle } from "@/components/ModeToggle";

export default function RoomsComponent() {
  const { rooms, fetchRooms, loading } = useRoomsStore();
  const [search, setSearch] = useState("");
  const { setActiveRoomId, activeRoomId } = useRoomIdStore();
  const { userId } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      router.push("/signin");
    }
    fetchRooms();
  }, []);

  const filteredRooms = rooms.filter((room) => {
    const otherUser = room.participants.find((p) => p.user.id !== userId)?.user;
    return otherUser?.name.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="max-w-md mx-auto px-4 py-6 space-y-4">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">SocketTalk</h1>
        </div>
        <div className="flex gap-2 justify-center items-center">
          <ModeToggle />
          <AddRoomsComponent />
        </div>
      </div>

      <div className="mb-2">
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
        </div>
      ) : filteredRooms.length === 0 ? (
        <div className="text-center text-gray-500">No rooms found.</div>
      ) : (
        <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
          {filteredRooms.map((room) => {
            const otherUser = room.participants.find((p) => p.user.id !== userId)?.user;
            const isActive = room.id === activeRoomId;

            return (
              <div
                key={room.id}
                onClick={() => setActiveRoomId(room.id)}
                className={`group relative flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all border ${
                  isActive ? "bg-[#f5f4f2] dark:bg-[#2d2e2e]" : "hover:bg-[#f5f4f2] dark:hover:bg-[#2d2e2e]"
                }`}
              >
                <img
                  src={
                    otherUser?.photo ||
                    "https://ui-avatars.com/api/?name=" + otherUser?.name
                  }
                  alt={otherUser?.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate text-black dark:text-white">
                    {otherUser?.name || "Unknown"}
                  </div>
                  <div className="text-sm text-gray-800 dark:text-white truncate">
                    {room.chats.length > 0
                      ? room.chats[room.chats.length - 1].message
                      : "No messages yet"}
                  </div>
                </div>
                <div className="absolute right-4 transform translate-x-3 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                  <DeleteRoom />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
