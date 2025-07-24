
import ChatComponents from "@/components/ChatComponents";
import RoomsComponent from "@/components/RoomsComponent";

export default function Rooms() {
  return (
    <div className="flex h-screen">
        <div className="lg:w-[400px] md:w-[300px] min-w-[300px] border-r overflow-y-auto">
            <RoomsComponent />
        </div>
        <div className="flex-1">
            <ChatComponents /> 
        </div>
    </div>
  );
}
