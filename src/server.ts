import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import apiRoutes from './routes/api';

dotenv.config();
const app = express();

app.use(cors({
  origin: process.env.FRONTEND_CLIENT
}));

app.use(express.json());
app.get('/', (_req, res) => {
app.use('/api', apiRoutes);
app.use('/api/auth', authRoutes);
  res.send('API funcionando');
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`server corriendo en ${PORT}`));