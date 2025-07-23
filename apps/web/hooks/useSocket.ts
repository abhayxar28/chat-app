import { useEffect, useState } from "react";

export function useSocket(){
    const [isLoading, setIsLoading] = useState(true);
    const [socket, setSocket] = useState<WebSocket>();

    useEffect(()=>{
        const token = localStorage.getItem('token')
        const ws = new WebSocket(`${process.env.NEXT_PUBLIC_WEBSOCKET_URL_WITH_TOKEN}${token}`);
        ws.onopen = ()=>{
            setSocket(ws);
            setIsLoading(false)
        }
    },[])

    return {socket, isLoading}
}