import express from 'express';
import { getEnrollmentsForBDH, approveEnrollmentWithCheck, assignTask } from '../services/executiveService.js';

const router = express.Router();

router.get('/enrollments/:maTK', async (req, res) => {
  try {
    const { maTK } = req.params;
    const enrollments = await getEnrollmentsForBDH(maTK);
    res.json(enrollments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/enrollments/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, expectedCount } = req.body;
    
    if (!['DaDuyet', 'TuChoi'].includes(status)) {
      return res.status(400).json({ error: 'Trạng thái không hợp lệ' });
    }
    
    await approveEnrollmentWithCheck(id, status, expectedCount);
    res.json({ success: true, message: 'Cập nhật trạng thái thành công' });
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
});

router.post('/assignments', async (req, res) => {
  try {
    const { maThamGia, maChienDich, tenNhiemVu, vaiTro } = req.body;
    
    if (!maThamGia || !maChienDich || !tenNhiemVu || !vaiTro) {
      return res.status(400).json({ error: 'Thiếu thông tin phân công' });
    }
    
    await assignTask(maThamGia, maChienDich, tenNhiemVu, vaiTro);
    res.json({ success: true, message: 'Phân công nhiệm vụ thành công' });
  } catch (error) {
    let errorMessage = error.message;
    if (errorMessage.includes('ORA-20010')) errorMessage = 'Tình nguyện viên đã đạt tối đa số lượng nhiệm vụ.';
    res.status(error.status || 500).json({ error: errorMessage });
  }
});

export default router;
