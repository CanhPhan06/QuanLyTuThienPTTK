import express from 'express';
import { 
  recordDonation, 
  requestExpense, 
  getCampaignFinanceSummary, 
  attachExpenseProof 
} from '../services/financeService.js';

const router = express.Router();

router.post('/donate', async (req, res) => {
  try {
    const { maTK, maCD, soTien, phuongThuc } = req.body;
    if (!maTK || !maCD || !soTien) {
      return res.status(400).json({ error: 'Thiếu thông tin yêu cầu.' });
    }
    
    await recordDonation(maTK, maCD, soTien, phuongThuc);
    res.json({ success: true, message: 'Ghi nhận quyên góp thành công!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/expense', async (req, res) => {
  try {
    const { maCD, tenKhoanChi, soTien, mucDich, maNguoiChi } = req.body;
    if (!maCD || !soTien || !mucDich) {
      return res.status(400).json({ error: 'Thiếu thông tin yêu cầu.' });
    }
    
    await requestExpense(maCD, tenKhoanChi, soTien, mucDich, maNguoiChi);
    res.json({ success: true, message: 'Đã tạo khoản chi thành công.' });
  } catch (error) {
    let errorMessage = error.message;
    if (errorMessage.includes('ORA-')) {
        // Handle trigger errors if needed
        errorMessage = 'Lỗi CSDL: ' + errorMessage.split('\n')[0];
    }
    res.status(500).json({ error: errorMessage });
  }
});

router.get('/campaign/:id', async (req, res) => {
  try {
    const summary = await getCampaignFinanceSummary(req.params.id);
    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/expense-proof', async (req, res) => {
  try {
    const { maChiTieu, hinhAnhUrl, loaiMinhChung, ghiChu } = req.body;
    if (!maChiTieu || !hinhAnhUrl) {
      return res.status(400).json({ error: 'Thiếu mã chi tiêu hoặc URL hình ảnh.' });
    }
    
    await attachExpenseProof(maChiTieu, hinhAnhUrl, loaiMinhChung, ghiChu);
    res.json({ success: true, message: 'Đã tải lên minh chứng chi tiêu.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
