import express from 'express'
import roomRoutes from './routes/rooms';
import { authenticateJWT } from './middleware';
import cors from 'cors';
import userRoutes from './routes/user';
import messageRoutes from './routes/messages';

const PORT = 3001
const app = express();

app.use(express.json());
app.use(cors());

app.use('/api/v1/user', authenticateJWT, userRoutes)
app.use('/api/v1/rooms', authenticateJWT, roomRoutes)
app.use('/api/v1/messages', authenticateJWT, messageRoutes)


app.listen(PORT, ()=>{
    console.log('server running on port 3001')
})