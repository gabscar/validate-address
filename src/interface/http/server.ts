import express from 'express';
import cors from 'cors';
import addressRoutes from './routes/addressRoutes';
import { setupSwagger } from './swagger';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'production') {
  setupSwagger(app);
}

app.use('/api', addressRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});


export default app; 