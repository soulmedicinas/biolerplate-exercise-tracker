import express, { json, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { sequelize } from './src/database/connection';
import { userRouter } from './src/routes/user';

dotenv.config();

const app = express();

app.use(json());
app.use(cors());
app.use(express.static('public'));

app.use('/', userRouter);

app.get('/', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

sequelize
    .sync({ force: false }) // Set `force: true` to drop existing tables during development
    .then(() => {
        console.log('Database synced successfully');
        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.error('Unable to connect to the database:', error);
    });
