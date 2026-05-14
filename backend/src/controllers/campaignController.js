import express from 'express';
import { getAllCampaigns, createCampaign, enrollCampaign, getMyEnrollments } from '../services/campaignService.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const campaigns = await getAllCampaigns();
    res.json(campaigns);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const campaignId = await createCampaign(req.body);
    res.json({ success: true, campaignId, message: 'Tạo chiến dịch thành công' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:id/enroll', async (req, res) => {
  try {
    const { id } = req.params;
    const { maTK } = req.body;
    if (!maTK) return res.status(400).json({ error: 'Thiếu MaTaiKhoan' });
    
    await enrollCampaign(maTK, id);
    res.json({ success: true, message: 'Đăng ký thành công, vui lòng chờ duyệt' });
  } catch (error) {
    // Oracle error messages are structured like ORA-20003: message
    let errorMessage = error.message;
    if (errorMessage.includes('ORA-20002')) errorMessage = 'Chiến dịch đã đủ số lượng tình nguyện viên.';
    else if (errorMessage.includes('ORA-20003')) errorMessage = 'Trùng lịch với chiến dịch khác đang tham gia hoặc chờ duyệt.';
    else if (errorMessage.includes('ORA-20011')) errorMessage = 'Tài khoản của bạn chưa được kích hoạt.';
    
    res.status(500).json({ error: errorMessage });
  }
});

router.get('/my-enrollments/:maTK', async (req, res) => {
  try {
    const { maTK } = req.params;
    const enrollments = await getMyEnrollments(maTK);
    res.json(enrollments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
