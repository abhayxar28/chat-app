"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRoomsStore } from "@/store/useRoomStore";
import axios from "axios";
import { MessageSquarePlus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function AddRoomsComponent() {
    const [email, setEmail] = useState("");
    const [isLoading, setisLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const { fetchRooms } = useRoomsStore();

    const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setisLoading(true);

    try {
        await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/rooms`,
        { email },
        {
            headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        }
        );

        await fetchRooms(); 

        toast.success("Chat room created");
        setEmail("");
        setOpen(false);
    } catch (err: any) {
        const errorMessage =
        err.response?.data?.error;

        toast.error(errorMessage);
    } finally {
        setisLoading(false);
    }
    };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <MessageSquarePlus className="cursor-pointer" />
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleAdd}>
          <DialogHeader>
            <DialogTitle>Create Room</DialogTitle>
            <DialogDescription>
              Add user email to create a room.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-3">
              <Label htmlFor="email-1">Email</Label>
              <Input
                id="email-1"
                name="email"
                placeholder="example@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" className="cursor-pointer">{isLoading ? 'Adding..' : 'Add'  }</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
