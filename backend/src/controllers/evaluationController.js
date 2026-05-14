import express from 'express';
import { getVolunteersByCampaign, evaluateVolunteer } from '../services/evaluationService.js';

const router = express.Router();

router.get('/campaigns/:id/volunteers', async (req, res) => {
  try {
    const { id } = req.params;
    const volunteers = await getVolunteersByCampaign(id);
    res.json(volunteers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/score', async (req, res) => {
  try {
    const { maThamGia, diem, nhanXet } = req.body;
    if (!maThamGia || diem === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    await evaluateVolunteer(maThamGia, diem, nhanXet);
    res.json({ success: true, message: 'Đã lưu đánh giá thành công' });
  } catch (error) {
    if (error.message.includes('ORA-')) {
      res.status(400).json({ error: 'Lỗi CSDL: ' + error.message.split('\n')[0] });
    } else {
      res.status(500).json({ error: 'Failed to save evaluation' });
    }
  }
});

export default router;
