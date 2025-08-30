import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import apiRoutes from './routes/api';

dotenv.config();
const app = express();

const corsOptions = {
  origin: ['https://portal-fusalmo.vercel.app', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

app.use(express.json());
app.use('/api', apiRoutes);
app.use('/api/auth', authRoutes);

app.get('/', (_req, res) => {
  res.send('API funcionando');
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`server corriendo en ${PORT}`));