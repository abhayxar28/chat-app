"use client";

import Link from "next/link";
import { Button } from "./ui/button";
import DarkVeil from "./ui/landing";
import { useEffect, useState } from "react";
import { Aperture } from "lucide-react";

export default function LandingComponent() {
    const [user, setUser] = useState<string | null>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem("userId");
        setUser(storedUser);
    }, []);

    return (
        <div className="relative h-screen w-full overflow-hidden bg-black text-white">
            <DarkVeil />

            <div className="absolute z-20 top-6 left-1/2 -translate-x-1/2 w-[90%] max-w-5xl flex justify-between items-center px-6 py-4 rounded-full border border-white/10 backdrop-blur-md bg-white/5">
                <div className="font-semibold text-lg flex items-center gap-2">
                    <span className="text-white flex gap-2 justify-center items-center">
                        <span> <Aperture /></span>
                        <span>SocketTalk</span>
                    </span>
                </div>
                <div className="flex gap-6 font-medium text-sm text-white/90 justify-center items-center">
                    <Link href="/rooms" className="hover:text-white transition">Room</Link>
                    {!user && 
                        (
                            <Link href="/signup" className="hover:text-white transition">Signup</Link>
                        )
                    }
                </div>
            </div>

            <div className="h-full flex items-center justify-center px-4 z-20 absolute top-0 left-1/2 -translate-x-1/2" >
                <div className="p-6 md:p-10 max-w-3xl w-full text-center space-y-6">
                <span className="text-sm px-4 py-1 border border-white/20 bg-white/10 text-white rounded-full inline-block tracking-wide shadow-[0_0_12px_rgba(255,255,255,0.3)]">
                    ⚡ Powered by WebSockets
                </span>


                <h1 className="text-3xl sm:text-3xl md:text-5xl font-bold leading-tight text-white">
                    Built for connection. <br className="hidden sm:block" /> Made for you.
                </h1>

                <div className="flex flex-col sm:flex-row gap-4 justify-center mt-4">
                    {user ? (
                        <Link href={'/rooms'}>
                            <Button
                                size="lg"
                                className="cursor-pointer text-black bg-white hover:bg-gray-100 rounded-full px-8 shadow-[0_0_12px_rgba(255,255,255,0.4)]"
                            >
                                Get Started
                            </Button>
                        </Link>
                        ) : (
                            <Link href={'/signin'}>
                                <Button
                                    size="lg"
                                    className="cursor-pointer text-black bg-white hover:bg-gray-100 rounded-full px-8 shadow-[0_0_12px_rgba(255,255,255,0.4)]"
                                >
                                    Get Started
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}