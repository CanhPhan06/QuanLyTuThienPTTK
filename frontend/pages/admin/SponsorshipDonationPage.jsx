import React, { useState, useEffect } from "react";
import MainLayout from "../../components/layout/MainLayout";
import GlassCard from "../../components/common/GlassCard";
import SystemModal from "../../components/common/SystemModal";
import BudgetTracker from "../../components/finance/BudgetTracker";
import { getCampaigns } from "../../services/campaigns";
import { getCampaignFinanceSummary } from "../../services/finance";
import { getInventory } from "../../services/logistics";
import { 
  getPendingMonetary, 
  getPendingItems, 
  approveMonetary, 
  approveItems 
} from "../../services/adminFinance";
import { recordDonation } from "../../services/finance";
import { stockIn } from "../../services/logistics";
import { useAuth } from "../../context/AuthContext";
import "./SponsorshipDonationPage.css";

const SponsorshipDonationPage = () => {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState("");
  const [financeData, setFinanceData] = useState({ remainingBudget: 0, totalDonations: 0, totalExpenses: 0 });
  const [inventory, setInventory] = useState([]);
  
  // Forms state
  const [moneyForm, setMoneyForm] = useState({ amount: "", method: "ChuyenKhoan", note: "" });
  const [itemForm, setItemForm] = useState({ maLoai: "", quantity: "" });

  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ isOpen: false, title: "", message: "", type: "info" });

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedCampaign) {
      fetchCampaignSpecificData(selectedCampaign);
    }
  }, [selectedCampaign]);

  const fetchInitialData = async () => {
    try {
      const campData = await getCampaigns();
      setCampaigns(campData);
      if (campData.length > 0) {
        const initialCD = campData[0].MaChienDich || campData[0].MACHIENDICH;
        setSelectedCampaign(initialCD);
        fetchCampaignSpecificData(initialCD);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCampaignSpecificData = async (maCD) => {
    try {
      const [fin, inv] = await Promise.all([
        getCampaignFinanceSummary(maCD),
        getInventory(maCD)
      ]);
      setFinanceData(fin);
      setInventory(inv);
      if (inv.length > 0) {
        setItemForm(prev => ({ ...prev, maLoai: inv[0].MaLoai || inv[0].MALOAI }));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleMoneySubmit = async (e) => {
    e.preventDefault();
    try {
      await recordDonation(user.MaTaiKhoan, selectedCampaign, Number(moneyForm.amount), moneyForm.method, moneyForm.note);
      localStorage.setItem(
        "finance-updated",
        JSON.stringify({ campaignId: selectedCampaign, time: Date.now() })
      );
      setModal({ isOpen: true, title: "Thành công", message: "Đã ghi nhận đóng góp tiền.", type: "success" });
      setMoneyForm({ amount: "", method: "ChuyenKhoan", note: "" });
      fetchCampaignSpecificData(selectedCampaign);
    } catch (error) {
      setModal({ isOpen: true, title: "Lỗi", message: error.message, type: "error" });
    }
  };

  const handleItemSubmit = async (e) => {
    e.preventDefault();
    try {
      await stockIn(selectedCampaign, itemForm.maLoai, Number(itemForm.quantity));
      setModal({ isOpen: true, title: "Thành công", message: "Đã nhập kho vật phẩm cho chiến dịch này.", type: "success" });
      setItemForm({ ...itemForm, quantity: "" });
      fetchCampaignSpecificData(selectedCampaign);
    } catch (error) {
      setModal({ isOpen: true, title: "Lỗi", message: error.message, type: "error" });
    }
  };

  return (
    <MainLayout>
      <SystemModal 
        isOpen={modal.isOpen} 
        title={modal.title} 
        message={modal.message} 
        type={modal.type} 
        onClose={() => setModal({ ...modal, isOpen: false })} 
      />

      <div className="sponsor-mgmt-container">
        <header className="page-header">
          <div className="header-info">
            <h1>Sổ vàng nhà hảo tâm Maison Chance</h1>
            <p>Ghi nhận tiền mặt, chuyển khoản, hiện vật và phiếu xác nhận đóng góp</p>
          </div>
          <div className="campaign-selector-box">
            <label>Hoạt động/dự án:</label>
            <select value={selectedCampaign} onChange={(e) => setSelectedCampaign(e.target.value)}>
              {campaigns.map(c => (
                <option key={c.MaChienDich || c.MACHIENDICH} value={c.MaChienDich || c.MACHIENDICH}>
                  {c.TenChienDich || c.TENCHIENDICH}
                </option>
              ))}
            </select>
          </div>
        </header>

        {loading ? (
          <div className="loading-spinner">Đang tải...</div>
        ) : (
          <div className="mgmt-layout">
            {/* Row 1: Finance Summary */}
            <section className="full-width-section">
              <BudgetTracker 
                remainingBudget={financeData.remainingBudget}
                totalDonations={financeData.totalDonations}
                totalExpenses={financeData.totalExpenses}
              />
            </section>

            {/* Row 2: Inventory */}
            <section className="full-width-section">
              <GlassCard title="Kho hiện tại">
                <div className="inventory-grid">
                  {inventory.map(item => {
                    const qty = item.SOLUONGTON !== undefined ? item.SOLUONGTON : (item.SoLuongTon || 0);
                    const name = item.TENLOAI || item.TenLoai;
                    const unit = item.DONVITINH || item.DonViTinh;
                    const id = item.MALOAI || item.MaLoai;
                    
                    return (
                      <div key={id} className="inv-item-card">
                        <div className="inv-info">
                          <span className="inv-name">{name}</span>
                          <span className="inv-unit">{unit}</span>
                        </div>
                        <div className={`inv-qty ${qty > 0 ? 'active' : 'empty'}`}>
                          {qty}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </GlassCard>
            </section>

            {/* Row 3: Entry Forms */}
            <div className="pending-grid">
              {/* Money Entry */}
              <GlassCard title="Ghi sổ vàng đóng góp tiền" className="pending-card">
                <form onSubmit={handleMoneySubmit} className="mgmt-form">
                  <div className="form-group">
                    <label>Số tiền (VNĐ)</label>
                    <input 
                      type="number" min="1000" required 
                      value={moneyForm.amount}
                      onChange={e => setMoneyForm({...moneyForm, amount: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Phương thức</label>
                    <select value={moneyForm.method} onChange={e => setMoneyForm({...moneyForm, method: e.target.value})}>
                      <option value="ChuyenKhoan">Chuyển Khoản</option>
                      <option value="TienMat">Tiền Mặt</option>
                      <option value="MoMo">MoMo</option>
                      <option value="VNPay">VNPay</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Ghi chú / Nhà hảo tâm</label>
                    <input 
                      type="text" 
                      placeholder="VD: Cty ABC tài trợ 10tr"
                      value={moneyForm.note}
                      onChange={e => setMoneyForm({...moneyForm, note: e.target.value})}
                    />
                  </div>
                  <button type="submit" className="submit-btn full-width">Ghi sổ vàng</button>
                </form>
              </GlassCard>

              {/* Item Entry */}
              <GlassCard title="Ghi nhận đóng góp hiện vật" className="pending-card">
                <form onSubmit={handleItemSubmit} className="mgmt-form">
                  <div className="form-group">
                    <label>Loại vật phẩm</label>
                    <select value={itemForm.maLoai} onChange={e => setItemForm({...itemForm, maLoai: e.target.value})}>
                      {inventory.map(item => (
                        <option key={item.MaLoai || item.MALOAI} value={item.MaLoai || item.MALOAI}>
                          {item.TenLoai || item.TENLOAI} ({item.DonViTinh || item.DONVITINH})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Số lượng nhập</label>
                    <input 
                      type="number" min="1" required 
                      value={itemForm.quantity}
                      onChange={e => setItemForm({...itemForm, quantity: e.target.value})}
                    />
                  </div>
                  <div className="form-info-box">
                    Lưu ý: Vật phẩm sẽ được cộng vào kho riêng của chiến dịch này.
                  </div>
                  <button type="submit" className="submit-btn full-width">Xác nhận nhập kho</button>
                </form>
              </GlassCard>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default SponsorshipDonationPage;
