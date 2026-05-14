import express from 'express';
import { 
  uploadProof, 
  getCampaignProofs, 
  verifyProof,
  getParticipantTasks
} from '../services/proofService.js';

const router = express.Router();

router.post('/upload', async (req, res) => {
  try {
    const { maThamGia, hinhAnhUrl, loai } = req.body;
    if (!maThamGia || !hinhAnhUrl) {
      return res.status(400).json({ error: 'Thiếu thông tin yêu cầu.' });
    }
    
    await uploadProof(maThamGia, hinhAnhUrl, loai || 'Chung');
    res.json({ success: true, message: 'Đã tải lên minh chứng.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/campaign/:id', async (req, res) => {
  try {
    const proofs = await getCampaignProofs(req.params.id);
    res.json(proofs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/tasks/:maThamGia', async (req, res) => {
  try {
    const tasks = await getParticipantTasks(req.params.maThamGia);
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/verify', async (req, res) => {
  try {
    const { maPhanCong, trangThai } = req.body;
    if (!maPhanCong || !trangThai) {
      return res.status(400).json({ error: 'Thiếu thông tin phân công hoặc trạng thái.' });
    }
    
    await verifyProof(maPhanCong, trangThai);
    res.json({ success: true, message: 'Đã lưu kết quả xác thực (điểm danh).' });
  } catch (error) {
    let errorMessage = error.message;
    if (errorMessage.includes('ORA-')) {
        errorMessage = 'Lỗi CSDL: ' + errorMessage.split('\n')[0];
    }
    res.status(500).json({ error: errorMessage });
  }
});

export default router;
