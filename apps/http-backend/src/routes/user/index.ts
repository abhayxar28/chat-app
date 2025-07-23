import { Response, Router } from "express";
import { prisma } from "@repo/db/prisma";
import { AuthenticatedRequest } from "../../types";
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '@repo/backend-common/jwt';

const router:Router = Router();

router.post('/signup', async(req: AuthenticatedRequest, res: Response)=>{
    const {email, password, name} = req.body;

    await prisma.user.create({
        data:{
            email,
            password,
            name
        }
    })
    res.json({
        message: "User created successfully"
    })
})

router.post('/signin', async(req: AuthenticatedRequest, res: Response)=>{
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


export default router;