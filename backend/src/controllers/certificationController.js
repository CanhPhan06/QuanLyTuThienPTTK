import express from 'express';
import { issueCertificates, getEligibleVolunteers, getCertificatesByCampaign, getMyCertificates } from '../services/certificationService.js';

const router = express.Router();

router.post('/issue', async (req, res) => {
  try {
    const { campaignId } = req.body;
    if (!campaignId) {
      return res.status(400).json({ error: 'Missing campaignId' });
    }
    await issueCertificates(campaignId);
    res.json({ success: true, message: 'Đã cấp chứng nhận thành công' });
  } catch (error) {
    if (error.message.includes('ORA-')) {
      res.status(400).json({ error: 'Lỗi CSDL: ' + error.message.split('\n')[0] });
    } else {
      res.status(500).json({ error: 'Failed to issue certificates' });
    }
  }
});

router.get('/eligible/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const volunteers = await getEligibleVolunteers(id);
    res.json(volunteers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/campaign/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const certificates = await getCertificatesByCampaign(id);
    res.json(certificates);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/my-certificates', async (req, res) => {
  try {
    const { username } = req.query; // in real app, get from auth token
    if (!username) {
      return res.status(400).json({ error: 'Missing username' });
    }
    const certificates = await getMyCertificates(username);
    res.json(certificates);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
