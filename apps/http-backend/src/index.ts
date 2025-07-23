import express, { Response } from 'express'
import {prisma} from '@repo/db/prisma';
import { AuthenticatedRequest } from './types';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '@repo/backend-common/jwt';
import { authenticateJWT } from './middleware';
import cors from 'cors';

const app = express();

app.use(express.json());
app.use(cors());

app.post('/api/signup', async(req: AuthenticatedRequest, res: Response)=>{
    const {email, password, name} = req.body;

    await prisma.user.create({
        data:{
            email,
            password,
            name
        }
    })
    return res.json({
        message: "User created successfully"
    })
})

app.post('/api/signin', async(req: AuthenticatedRequest, res: Response)=>{
    const {email, password} = req.body;

    const user = await prisma.user.findUnique({
        where: {
            email,
            password
        }
    })
    const token = jwt.sign({userId: user?.id}, JWT_SECRET, {expiresIn: "7d"})
    return res.json({
        message: "User Signed in",
        token,
        userId: user?.id
    })
})


app.post('/api/rooms', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { email } = req.body;
    const adminId = req.userId as string;

    const participant = await prisma.user.findUnique({
      where: { email },
      select: { id: true }
    });

    if (!participant) {
      return res.status(404).json({ error: "User not found" });
    }

    const participantId = participant.id;

    const existingRoom = await prisma.room.findFirst({
      where: {
        participants: {
          some: { userId: adminId },
        },
        AND: {
          participants: {
            some: { userId: participantId },
          },
        },
      },
      include: {
        participants: true,
      },
    });

    if (
      existingRoom &&
      existingRoom.participants.length === 2 &&
      existingRoom.participants.some(p => p.userId === adminId) &&
      existingRoom.participants.some(p => p.userId === participantId)
    ) {
      return res.status(400).json({ error: "Room already exists" });
    }

    const newRoom = await prisma.room.create({
      data: {
        adminId,
        participants: {
          create: [
            { userId: adminId },
            { userId: participantId }
          ]
        }
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
                photo: true,
                chats: true
              }
            }
          }
        }
      }
    });

    return res.json({
      message: "Room created successfully",
      room: newRoom
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});


app.get('/api/rooms', authenticateJWT, async(req: AuthenticatedRequest, res: Response)=>{
    const rooms = await prisma.room.findMany({
        select: {
            id: true,
            adminId: true,
            chats: {
                select: {
                    id: true,
                    message: true,
                    userId: true,
                    like: true
                }
            },
            participants: {
                select: {
                    user: {
                        select: {
                            id: true,
                            email: true,
                            name: true,
                            photo: true
                        }
                    }
                }
            }
        }
    })
    return res.json({rooms})
})


app.get('/api/messages/:roomId', authenticateJWT, async(req: AuthenticatedRequest, res: Response)=>{
    const roomId = req.params.roomId;

    const message = await prisma.chat.findMany({
        where: {
            roomId: Number(roomId)
        },
        select: {
            id: true,
            message: true,
            userId: true,
            roomId: true ,
            like: true     
        }
    })
    return res.json({message});
})

app.delete('/api/rooms/:roomId', authenticateJWT, async(req: AuthenticatedRequest, res: Response)=>{
  const roomId = Number(req.params.roomId);

  try{

    await prisma.chat.deleteMany({
      where: {
        roomId
      }
    });

    await prisma.roomParticipants.deleteMany({
      where:{
        roomId
      }
    })

    await prisma.room.delete({
      where: {
        id: roomId
      }
    })

    return res.json({
      message: "Room deleted successfully"
    });

  }catch(err){
    return res.status(500).json({
      message: "Internal server error"
    })
  }
})

app.delete('/api/message/:chatId', authenticateJWT, async(req: AuthenticatedRequest, res: Response)=>{
  const chatId = Number(req.params.chatId);

  try{

    await prisma.chat.delete({
      where:{
        id: chatId
      }
    });


    return res.json({
      message: "chat deleted successfully"
    });

  }catch(err){
    return res.status(500).json({
      message: "Internal server error"
    })
  }
})


app.listen(3001, ()=>{
    console.log('server running on port 3001')
})