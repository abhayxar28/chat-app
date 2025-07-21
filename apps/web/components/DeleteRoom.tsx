"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useRoomIdStore } from "@/store/roomIdStore";
import { useRoomsStore } from "@/store/useRoomStore";
import axios from "axios";
import { Trash2 } from "lucide-react"
import { useState } from "react";
import { toast } from "sonner";

export default function DeleteRoom(){
    const {fetchRooms} = useRoomsStore();
    const {activeRoomId} = useRoomIdStore();
    const [loading, setLoading] = useState(false);

    const handleDelete = async()=>{
        setLoading(true);
        try{
            const res = await axios.delete(`http://localhost:3001/rooms/${activeRoomId}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });

            await fetchRooms(); 
            toast.success("Chat room deleted");
        }catch(err: any){
            const errorMessage =
            err.response?.data?.error || "Error creating room";

            toast.error(errorMessage);
        } finally {
        setLoading(false);
    }

    }

    return(
        <AlertDialog>
            <AlertDialogTrigger className="cursor-pointer">
                <Trash2 size={16}/>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your room
                    and remove your data from our servers.
                </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={()=>handleDelete()}>{loading ? "Deleting...": "Delete"}</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}