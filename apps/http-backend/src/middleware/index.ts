import jwt, { JwtPayload } from 'jsonwebtoken';
import { AuthenticatedRequest } from '../types';
import { NextFunction, Response } from 'express';
import {JWT_SECRET} from '@repo/backend-common/jwt';

export const authenticateJWT = (req: AuthenticatedRequest, res: Response, next: NextFunction)=>{
    const authHeader = req.headers.authorization;

    try{
        if(!authHeader || !authHeader.startsWith("Bearer ")){
            res.status(403).json({
                message: "Authorization token missing or invalid"
            })
            return;
        }

        const token = authHeader.split(" ")[1]

        const decoded = jwt.verify(token as string, JWT_SECRET) as JwtPayload;

        req.userId = decoded.userId;
        next();
    }catch(err){
        res.status(403).json({
            message: "Authorization token invalid" 
        })
    }
}