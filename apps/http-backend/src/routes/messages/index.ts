import { Response, Router } from "express";
import { prisma } from "@repo/db/prisma";
import { AuthenticatedRequest } from "../../types";

const router: Router = Router();


router.get('/:roomId', async(req: AuthenticatedRequest, res: Response)=>{
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



router.delete('/:chatId', async(req: AuthenticatedRequest, res: Response)=>{
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

export default router;