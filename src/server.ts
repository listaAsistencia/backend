import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import apiRoutes from './routes/api';

dotenv.config();
const app = express();

app.use(cors({
  origin: '*'
}));
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api', apiRoutes);
app.get('/', (_req, res) => {
  res.send('API funcionando');
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`server corriendo en ${PORT}`));