import express from 'express';
import { 
  getInventory, 
  stockIn, 
  stockOut, 
  getCampaignLogistics 
} from '../services/logisticsService.js';

const router = express.Router();

router.get('/inventory', async (req, res) => {
  try {
    const inventory = await getInventory();
    res.json(inventory);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/stock-in', async (req, res) => {
  try {
    const { maCD, maLoai, soLuong } = req.body;
    if (!maCD || !maLoai || !soLuong) {
      return res.status(400).json({ error: 'Thiếu thông tin nhập kho.' });
    }
    
    await stockIn(maCD, maLoai, soLuong);
    res.json({ success: true, message: 'Nhập kho thành công!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/stock-out', async (req, res) => {
  try {
    const { maCD, maLoai, soLuong, nguoiNhan } = req.body;
    if (!maCD || !maLoai || !soLuong || !nguoiNhan) {
      return res.status(400).json({ error: 'Thiếu thông tin xuất kho.' });
    }
    
    await stockOut(maCD, maLoai, soLuong, nguoiNhan);
    res.json({ success: true, message: 'Xuất kho thành công!' });
  } catch (error) {
    let errorMessage = error.message;
    if (errorMessage.includes('ORA-')) {
        errorMessage = 'Lỗi CSDL: ' + errorMessage.split('\n')[0];
    }
    res.status(500).json({ error: errorMessage });
  }
});

router.get('/campaign/:id', async (req, res) => {
  try {
    const logs = await getCampaignLogistics(req.params.id);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
