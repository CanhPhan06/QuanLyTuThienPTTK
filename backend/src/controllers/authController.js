import express from 'express';
import { loginUser, registerUser, verifyUser, resetPassword, getProfile, updateProfile } from '../services/authService.js';

const router = express.Router();

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await loginUser(username, password);
    return res.json(user);
  } catch (err) {
    if (err.message === 'Tài khoản đang chờ duyệt hoặc đã bị khóa.') {
      return res.status(403).json({ error: err.message });
    } else if (err.message === 'Mật khẩu không chính xác.' || err.message === 'Tên đăng nhập không tồn tại.') {
      return res.status(401).json({ error: err.message });
    }
    console.error(err);
    res.status(500).json({ error: 'Lỗi máy chủ nội bộ' });
  }
});

router.post('/register', async (req, res) => {
  try {
    await registerUser(req.body);
    res.json({ message: 'Đăng ký thành công' });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Lỗi hệ thống hoặc tài khoản đã tồn tại: ' + err.message });
  }
});

router.post('/verify-user', async (req, res) => {
  const { username, email } = req.body;
  if (!username || !email) {
    return res.status(400).json({ error: 'Username và Email là bắt buộc.' });
  }
  try {
    await verifyUser(username, email);
    res.json({ message: 'Xác thực thành công.' });
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

router.post('/reset-password', async (req, res) => {
  const { username, newPassword } = req.body;
  if (!username || !newPassword) {
    return res.status(400).json({ error: 'Username và Mật khẩu mới là bắt buộc.' });
  }
  try {
    await resetPassword(username, newPassword);
    res.json({ message: 'Đổi mật khẩu thành công.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi hệ thống.' });
  }
});

router.get('/profile/:username', async (req, res) => {
  try {
    const profile = await getProfile(req.params.username);
    res.json(profile);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

router.put('/profile/:username', async (req, res) => {
  try {
    await updateProfile(req.params.username, req.body);
    res.json({ message: 'Cập nhật hồ sơ thành công.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi khi cập nhật hồ sơ.' });
  }
});

export default router;
