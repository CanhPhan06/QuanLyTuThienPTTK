import express from 'express';
import { getNotifications, markAsRead } from '../services/thongBaoService.js';

const router = express.Router();

router.get('/:username', async (req, res) => {
  try {
    const notifications = await getNotifications(req.params.username);
    res.json(notifications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi khi lấy thông báo.' });
  }
});

router.put('/:username/:id/read', async (req, res) => {
  try {
    await markAsRead(req.params.username, req.params.id);
    res.json({ message: 'Đã đánh dấu đọc.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi khi cập nhật trạng thái.' });
  }
});

export default router;
