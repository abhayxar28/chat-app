import { Response, Router } from "express";
import { prisma } from "@repo/db/prisma";
import { AuthenticatedRequest } from "../../types";

const router: Router = Router();


router.post('/', async (req: AuthenticatedRequest, res: Response) => {
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
        participants: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (existingRoom) {
      return res.status(400).json({
        message: "Room already exists with this user",
        room: existingRoom
      });
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


router.get('/', async(req: AuthenticatedRequest, res: Response)=>{
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

router.delete('/:roomId', async(req: AuthenticatedRequest, res: Response)=>{
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

export default router;