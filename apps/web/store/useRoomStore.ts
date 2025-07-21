// store/useRoomStore.ts
import { create } from "zustand";
import axios from "axios";

interface RoomsType {
  id: number;
  adminId: string;
  chats: { id: number; message: string; userId: string }[];
  participants: { user: { id: string; email: string; name: string; photo?: string } }[];
}

interface RoomsStore {
  rooms: RoomsType[];
  loading: boolean;
  fetchRooms: () => Promise<void>;
  addRoom: (room: RoomsType) => void;
  setLoading: (value: boolean) => void;
}

export const useRoomsStore = create<RoomsStore>((set) => ({
  rooms: [],
  loading: false,
  setLoading: (value) => set({ loading: value }),
  fetchRooms: async () => {
    set({ loading: true });
    try {
      const res = await axios.get("http://localhost:3001/rooms", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      set({ rooms: res.data.rooms });
    } catch (err) {
      console.error("Failed to fetch rooms:", err);
    } finally {
      set({ loading: false });
    }
  },
  addRoom: (room) => set((state) => ({ rooms: [room, ...state.rooms] })),
}));
