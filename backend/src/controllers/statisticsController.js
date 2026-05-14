import express from 'express';
import { getCampaignEfficiency, getTopContributors, getParameters, updateParameter } from '../services/statisticsService.js';

const router = express.Router();

router.get('/campaign/:id/efficiency', async (req, res) => {
  try {
    const { id } = req.params;
    const efficiency = await getCampaignEfficiency(id);
    res.json(efficiency);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/top-contributors', async (req, res) => {
  try {
    const contributors = await getTopContributors();
    res.json(contributors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/parameters', async (req, res) => {
  try {
    const params = await getParameters();
    res.json(params);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/parameters', async (req, res) => {
  try {
    const { maTS, giaTriMoi } = req.body;
    if (!maTS || !giaTriMoi) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    await updateParameter(maTS, giaTriMoi);
    res.json({ success: true, message: 'Đã cập nhật tham số thành công' });
  } catch (error) {
    if (error.message.includes('ORA-')) {
      res.status(400).json({ error: 'Lỗi CSDL: ' + error.message.split('\n')[0] });
    } else {
      res.status(500).json({ error: 'Failed to update parameter' });
    }
  }
});

export default router;
