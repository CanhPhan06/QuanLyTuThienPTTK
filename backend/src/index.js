import express from 'express';
import cors from 'cors';
import authRoutes from './controllers/authController.js';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

import thongBaoRoutes from './controllers/thongBaoController.js';
import campaignRoutes from './controllers/campaignController.js';
import executiveRoutes from './controllers/executiveController.js';
import financeRoutes from './controllers/financeController.js';
import logisticsRoutes from './controllers/logisticsController.js';
import proofRoutes from './controllers/proofController.js';
import evaluationRoutes from './controllers/evaluationController.js';
import certificationRoutes from './controllers/certificationController.js';
import statisticsRoutes from './controllers/statisticsController.js';

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/notifications', thongBaoRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/executive', executiveRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/logistics', logisticsRoutes);
app.use('/api/proof', proofRoutes);
app.use('/api/evaluation', evaluationRoutes);
app.use('/api/certification', certificationRoutes);
app.use('/api/statistics', statisticsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Node.js Backend server is running on http://localhost:${PORT}`);
});
