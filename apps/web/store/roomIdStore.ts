import {create} from 'zustand'

interface RoomIdState{
    activeRoomId: number | null;
    setActiveRoomId: (id: number)=>void
}

export const useRoomIdStore = create<RoomIdState>((set)=>({
    activeRoomId: null,
    setActiveRoomId: (id: number) => set({activeRoomId: id})
}))