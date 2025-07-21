import { useEffect, useState } from "react";

export function useSocket(){
    const [isLoading, setIsLoading] = useState(true);
    const [socket, setSocket] = useState<WebSocket>();

    useEffect(()=>{
        const token = localStorage.getItem('token')
        const ws = new WebSocket(`ws://localhost:8080?token=${token}`);
        ws.onopen = ()=>{
            setSocket(ws);
            setIsLoading(false)
        }
    },[])

    return {socket, isLoading}
}