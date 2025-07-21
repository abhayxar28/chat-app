"use client";

import ChatComponents from "@/components/ChatComponents";
import RoomsComponent from "@/components/RoomsComponent";

export default function Rooms() {
  return (
    <div className="flex h-screen">
        <div className="w-[400px] border-r overflow-y-auto">
            <RoomsComponent />
        </div>
        <div className="flex-1">
            <ChatComponents /> 
        </div>
    </div>
  );
}
