import { WebSocket, WebSocketServer } from "ws";
import {JWT_SECRET} from '@repo/backend-common/jwt';
import jwt, { JwtPayload } from 'jsonwebtoken'
import {prisma} from '@repo/db/prisma';

const wss = new WebSocketServer({port: 8080});

interface User {
    userId: string;
    rooms: string[];
    ws: WebSocket,
}

const users: User[] = [];

    function checkUser(token: string): string | null {
        try {
            const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

            if (typeof decoded === 'string' || !decoded.userId) {
                return null;
            }

            return decoded.userId;
        } catch (err) {
            console.error("❌ Token error:", err);
            return null;
        }
    }


wss.on('connection', (ws, request)=>{
    const url = request.url;
    if(!url) return;

    const queryParams = new URLSearchParams(url.split("?")[1]);
    const token = queryParams.get("token");
    const userId = checkUser(token as string);

    if(!userId){
        ws.close();
        return;
    }

    users.push({userId, ws, rooms: []});

    ws.on('message', async(message)=>{
        const parsedData = JSON.parse(message.toString());

        if(parsedData.type === 'join_room'){
            const user = users.find((u)=> u.ws === ws);
            user?.rooms.push(parsedData.roomId);
        }

        if(parsedData.type === 'leave_room'){
            const user = users.find((u)=> u.ws === ws);
            if(!user)return;
            user.rooms = user.rooms.filter((r)=> r !== parsedData.roomId)
        }

        if(parsedData.type === 'like'){
            const {roomId, userId, messageId, like} = parsedData;

            users.forEach((user)=>{
                if(user.rooms.includes(roomId)){
                    user.ws.send(JSON.stringify({
                        type: "like",
                        messageId,
                        userId,
                        roomId,
                        like
                    }))
                }
            })
            try {
                await prisma.chat.update({
                    where: {
                        id: messageId
                    }, data:{
                        like
                    }
                });
            } catch (error) {
                console.error("Failed to update like:", error);
            }
        }


        if(parsedData.type === 'unlike'){
            const {roomId, userId, messageId, like} = parsedData;

            users.forEach((user)=>{
                if(user.rooms.includes(roomId)){
                    user.ws.send(JSON.stringify({
                        type: "unlike",
                        messageId,
                        userId,
                        roomId,
                        like
                    }))
                }
            })

            try {
                await prisma.chat.update({
                    where: {
                        id: messageId
                    }, data:{
                        like
                    }
                });
            } catch (error) {
                console.error("Failed to update like:", error);
            }
        }

        if(parsedData.type === 'chat'){
            const {roomId, message, userId} = parsedData
            
            try {
                await prisma.chat.create({
                data: {
                    userId,
                    roomId,
                    message
                }
                });
            } catch (error) {
                console.error("Failed to save message:", error);
            }

            users.forEach((user)=>{
                if(user.rooms.includes(roomId)){
                    user.ws.send(
                        JSON.stringify({
                            type: "chat",
                            roomId,
                            userId,
                            message,
                        })
                    )
                }
            })

        }
    })
})