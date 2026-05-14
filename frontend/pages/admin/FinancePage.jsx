import React, { useState, useEffect } from "react";
import MainLayout from "../../components/layout/MainLayout";
import GlassCard from "../../components/common/GlassCard";
import BudgetTracker from "../../components/finance/BudgetTracker";
import SystemModal from "../../components/common/SystemModal";
import { getCampaigns } from "../../services/campaigns";
import { 
  getCampaignFinanceSummary, 
  recordDonation, 
  requestExpense, 
  attachExpenseProof 
} from "../../services/finance";
import { useAuth } from "../../context/AuthContext";
import "./FinancePage.css";

const FinancePage = () => {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState("");
  const [financeData, setFinanceData] = useState({
    remainingBudget: 0,
    totalDonations: 0,
    totalExpenses: 0,
    expensesList: []
  });
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ isOpen: false, title: "", message: "", type: "error" });

  // Donation Form
  const [donationData, setDonationData] = useState({ maTK: user.MaTaiKhoan, soTien: "", phuongThuc: "ChuyenKhoan" });
  
  // Expense Form
  const [expenseData, setExpenseData] = useState({ tenKhoanChi: "", soTien: "", mucDich: "" });
  
  // Proof Form
  const [proofModal, setProofModal] = useState({ isOpen: false, maChiTieu: "" });
  const [proofData, setProofData] = useState({ hinhAnhUrl: "", loaiMinhChung: "HoaDon", ghiChu: "" });

  useEffect(() => {
    fetchCampaigns();
  }, []);

  useEffect(() => {
    if (selectedCampaign) {
      fetchFinanceSummary(selectedCampaign);
    }
  }, [selectedCampaign]);

  const fetchCampaigns = async () => {
    try {
      const data = await getCampaigns();
      setCampaigns(data);
      if (data.length > 0) {
        setSelectedCampaign(data[0].MaChienDich || data[0].MACHIENDICH);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFinanceSummary = async (maCD) => {
    try {
      const data = await getCampaignFinanceSummary(maCD);
      setFinanceData(data);
    } catch (error) {
      console.error("Failed to fetch finance summary:", error);
    }
  };

  const handleDonate = async (e) => {
    e.preventDefault();
    try {
      await recordDonation(donationData.maTK, selectedCampaign, Number(donationData.soTien), donationData.phuongThuc);
      setModal({ isOpen: true, title: "Thành công", message: "Đã ghi nhận khoản quyên góp.", type: "success" });
      setDonationData({ ...donationData, soTien: "" });
      fetchFinanceSummary(selectedCampaign);
    } catch (error) {
      setModal({ isOpen: true, title: "Lỗi", message: error.message, type: "error" });
    }
  };

  const handleExpense = async (e) => {
    e.preventDefault();
    try {
      await requestExpense(selectedCampaign, expenseData.tenKhoanChi, Number(expenseData.soTien), expenseData.mucDich, user.MaTaiKhoan);
      setModal({ isOpen: true, title: "Thành công", message: "Đã duyệt khoản chi.", type: "success" });
      setExpenseData({ tenKhoanChi: "", soTien: "", mucDich: "" });
      fetchFinanceSummary(selectedCampaign);
    } catch (error) {
      setModal({ isOpen: true, title: "Lỗi Ngân Quỹ", message: error.message, type: "error" });
    }
  };

  const handleUploadProof = async (e) => {
    e.preventDefault();
    try {
      await attachExpenseProof(proofModal.maChiTieu, proofData.hinhAnhUrl, proofData.loaiMinhChung, proofData.ghiChu);
      setModal({ isOpen: true, title: "Thành công", message: "Đã tải lên minh chứng chi tiêu.", type: "success" });
      setProofModal({ isOpen: false, maChiTieu: "" });
      setProofData({ hinhAnhUrl: "", loaiMinhChung: "HoaDon", ghiChu: "" });
      fetchFinanceSummary(selectedCampaign);
    } catch (error) {
      setModal({ isOpen: true, title: "Lỗi Minh Chứng", message: error.message, type: "error" });
    }
  };

  return (
    <MainLayout>
      <SystemModal isOpen={modal.isOpen} title={modal.title} message={modal.message} type={modal.type} onClose={() => setModal({ ...modal, isOpen: false })} />
      
      {proofModal.isOpen && (
        <div className="custom-modal-overlay">
          <div className="custom-modal">
            <h2>Nộp Minh Chứng Chi Tiêu</h2>
            <form onSubmit={handleUploadProof}>
              <div className="form-group">
                <label>URL Hình Ảnh/Hóa Đơn</label>
                <input type="url" value={proofData.hinhAnhUrl} onChange={e => setProofData({...proofData, hinhAnhUrl: e.target.value})} required placeholder="https://imgur.com/..."/>
              </div>
              <div className="form-group">
                <label>Ghi Chú</label>
                <input type="text" value={proofData.ghiChu} onChange={e => setProofData({...proofData, ghiChu: e.target.value})} required />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setProofModal({isOpen: false, maChiTieu: ""})} className="cancel-btn">Hủy</button>
                <button type="submit" className="submit-btn">Tải Lên</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="finance-page-container">
        <div className="page-header">
          <h1>Tài Chính & Ngân Quỹ</h1>
          <div className="campaign-selector">
            <label>Chọn chiến dịch: </label>
            <select value={selectedCampaign} onChange={(e) => setSelectedCampaign(e.target.value)}>
              {campaigns.map(c => (
                <option key={c.MaChienDich || c.MACHIENDICH} value={c.MaChienDich || c.MACHIENDICH}>
                  {c.TenChienDich || c.TENCHIENDICH}
                </option>
              ))}
            </select>
          </div>
        </div>

        {!loading && (
          <>
            <BudgetTracker 
              remainingBudget={financeData.remainingBudget}
              totalDonations={financeData.totalDonations}
              totalExpenses={financeData.totalExpenses}
            />

            <div className="finance-actions-grid">
              {user.VaiTro === 'BanQuanLy' && (
                <GlassCard title="Ghi Nhận Quyên Góp (Inbound)">
                  <form onSubmit={handleDonate} className="finance-form">
                    <div className="form-group">
                      <label>Số Tiền (VNĐ)</label>
                      <input type="number" min="1000" value={donationData.soTien} onChange={e => setDonationData({...donationData, soTien: e.target.value})} required />
                    </div>
                    <div className="form-group">
                      <label>Phương Thức</label>
                      <select value={donationData.phuongThuc} onChange={e => setDonationData({...donationData, phuongThuc: e.target.value})}>
                        <option value="ChuyenKhoan">Chuyển Khoản</option>
                        <option value="TienMat">Tiền Mặt</option>
                        <option value="MoMo">MoMo</option>
                        <option value="ZaloPay">ZaloPay</option>
                      </select>
                    </div>
                    <button type="submit" className="action-btn success-btn">Xác Nhận Thu</button>
                  </form>
                </GlassCard>
              )}

              {(user.VaiTro === 'BanQuanLy' || user.VaiTro === 'BanDieuHanh') && (
                <GlassCard title="Yêu Cầu Chi Tiêu (Outbound)">
                  <form onSubmit={handleExpense} className="finance-form">
                    <div className="form-group">
                      <label>Tên Khoản Chi</label>
                      <input type="text" value={expenseData.tenKhoanChi} onChange={e => setExpenseData({...expenseData, tenKhoanChi: e.target.value})} required />
                    </div>
                    <div className="form-group">
                      <label>Số Tiền (VNĐ)</label>
                      <input type="number" min="1000" value={expenseData.soTien} onChange={e => setExpenseData({...expenseData, soTien: e.target.value})} required />
                    </div>
                    <div className="form-group">
                      <label>Mục Đích</label>
                      <input type="text" value={expenseData.mucDich} onChange={e => setExpenseData({...expenseData, mucDich: e.target.value})} required />
                    </div>
                    <button type="submit" className="action-btn danger-btn">Duyệt Chi</button>
                  </form>
                </GlassCard>
              )}
            </div>

            <GlassCard title="Lịch Sử Chi Tiêu" className="mt-24">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Ngày Chi</th>
                    <th>Tên Khoản Chi</th>
                    <th>Số Tiền</th>
                    <th>Mục Đích</th>
                    <th>Minh Chứng</th>
                    <th>Thao Tác</th>
                  </tr>
                </thead>
                <tbody>
                  {financeData.expensesList.map(exp => (
                    <tr key={exp.MACHITIEU || exp.MaChiTieu}>
                      <td>{new Date(exp.NGAYCHI || exp.NgayChi).toLocaleDateString('vi-VN')}</td>
                      <td>{exp.TENKHOANCHI || exp.TenKhoanChi}</td>
                      <td className="expense-amount">{(exp.SOTIENCHI || exp.SoTienChi).toLocaleString()} đ</td>
                      <td>{exp.MUCDICH || exp.MucDich}</td>
                      <td>
                        {(exp.MAMINHCHUNG || exp.MaMinhChung) ? (
                          <a href={exp.HINHANH_URL || exp.HinhAnh_Url} target="_blank" rel="noreferrer" className="proof-link">Xem Hóa Đơn</a>
                        ) : (
                          <span className="no-proof">Chưa có</span>
                        )}
                      </td>
                      <td>
                        {!(exp.MAMINHCHUNG || exp.MaMinhChung) && (
                          <button className="btn-assign" onClick={() => setProofModal({ isOpen: true, maChiTieu: exp.MACHITIEU || exp.MaChiTieu })}>
                            Tải Hóa Đơn
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {financeData.expensesList.length === 0 && (
                    <tr><td colSpan="6" className="empty-state">Chưa có khoản chi nào.</td></tr>
                  )}
                </tbody>
              </table>
            </GlassCard>
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default FinancePage;
