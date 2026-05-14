import React, { useState, useEffect } from "react";
import MainLayout from "../../components/layout/MainLayout";
import GlassCard from "../../components/common/GlassCard";
import SystemModal from "../../components/common/SystemModal";
import { getCampaigns } from "../../services/campaigns";
import { 
  getInventory, 
  stockIn, 
  stockOut, 
  getCampaignLogistics 
} from "../../services/logistics";
import { useAuth } from "../../context/AuthContext";
import "./LogisticsPage.css";

const LogisticsPage = () => {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState("");
  const [inventory, setInventory] = useState([]);
  const [logs, setLogs] = useState({ imports: [], exports: [] });
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ isOpen: false, title: "", message: "", type: "error" });

  const [stockInData, setStockInData] = useState({ maLoai: "", soLuong: "" });
  const [stockOutData, setStockOutData] = useState({ maLoai: "", soLuong: "", nguoiNhan: "" });

  useEffect(() => {
    fetchCampaigns();
    fetchInventory();
  }, []);

  useEffect(() => {
    if (selectedCampaign) {
      fetchLogs(selectedCampaign);
    }
  }, [selectedCampaign]);

  const fetchCampaigns = async () => {
    try {
      const data = await getCampaigns();
      setCampaigns(data);
      if (data.length > 0) setSelectedCampaign(data[0].MaChienDich || data[0].MACHIENDICH);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchInventory = async () => {
    try {
      const data = await getInventory();
      setInventory(data);
      if (data.length > 0) {
        setStockInData(prev => ({ ...prev, maLoai: data[0].MaLoai || data[0].MALOAI }));
        setStockOutData(prev => ({ ...prev, maLoai: data[0].MaLoai || data[0].MALOAI }));
      }
      setLoading(false);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchLogs = async (maCD) => {
    try {
      const data = await getCampaignLogistics(maCD);
      setLogs(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleStockIn = async (e) => {
    e.preventDefault();
    try {
      await stockIn(selectedCampaign, stockInData.maLoai, Number(stockInData.soLuong));
      setModal({ isOpen: true, title: "Thành công", message: "Đã nhập kho thành công.", type: "success" });
      setStockInData({ ...stockInData, soLuong: "" });
      fetchInventory();
      fetchLogs(selectedCampaign);
    } catch (error) {
      setModal({ isOpen: true, title: "Lỗi", message: error.message, type: "error" });
    }
  };

  const handleStockOut = async (e) => {
    e.preventDefault();
    try {
      await stockOut(selectedCampaign, stockOutData.maLoai, Number(stockOutData.soLuong), stockOutData.nguoiNhan);
      setModal({ isOpen: true, title: "Thành công", message: "Đã xuất kho thành công.", type: "success" });
      setStockOutData({ ...stockOutData, soLuong: "", nguoiNhan: "" });
      fetchInventory();
      fetchLogs(selectedCampaign);
    } catch (error) {
      setModal({ isOpen: true, title: "Lỗi Hậu Cần", message: error.message, type: "error" });
    }
  };

  return (
    <MainLayout>
      <SystemModal isOpen={modal.isOpen} title={modal.title} message={modal.message} type={modal.type} onClose={() => setModal({ ...modal, isOpen: false })} />
      
      <div className="logistics-page-container">
        <div className="page-header">
          <h1>Hậu Cần & Kho Vật Phẩm</h1>
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
            <GlassCard title="Tồn Kho Hiện Tại" className="mb-24">
              <div className="inventory-badges">
                {inventory.map(item => (
                  <div key={item.MaLoai || item.MALOAI} className="inventory-badge">
                    <span className="item-name">{item.TenLoai || item.TENLOAI}</span>
                    <span className={`item-count ${(item.SoLuongTon || item.SOLUONGTON) > 0 ? 'in-stock' : 'out-of-stock'}`}>
                      {item.SoLuongTon || item.SOLUONGTON} {item.DonViTinh || item.DONVITINH}
                    </span>
                  </div>
                ))}
              </div>
            </GlassCard>

            <div className="logistics-actions-grid mb-24">
              {user.VaiTro === 'BanQuanLy' && (
                <GlassCard title="Nhập Kho (Tài trợ/Mua mới)">
                  <form onSubmit={handleStockIn} className="finance-form">
                    <div className="form-group">
                      <label>Loại Vật Phẩm</label>
                      <select value={stockInData.maLoai} onChange={e => setStockInData({...stockInData, maLoai: e.target.value})}>
                        {inventory.map(item => (
                          <option key={item.MaLoai || item.MALOAI} value={item.MaLoai || item.MALOAI}>
                            {item.TenLoai || item.TENLOAI} ({item.DonViTinh || item.DONVITINH})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Số Lượng Nhập</label>
                      <input type="number" min="1" value={stockInData.soLuong} onChange={e => setStockInData({...stockInData, soLuong: e.target.value})} required />
                    </div>
                    <button type="submit" className="action-btn success-btn">Xác Nhận Nhập Kho</button>
                  </form>
                </GlassCard>
              )}

              {(user.VaiTro === 'BanQuanLy' || user.VaiTro === 'BanDieuHanh') && (
                <GlassCard title="Xuất Kho (Cấp phát)">
                  <form onSubmit={handleStockOut} className="finance-form">
                    <div className="form-group">
                      <label>Loại Vật Phẩm</label>
                      <select value={stockOutData.maLoai} onChange={e => setStockOutData({...stockOutData, maLoai: e.target.value})}>
                        {inventory.map(item => (
                          <option key={item.MaLoai || item.MALOAI} value={item.MaLoai || item.MALOAI}>
                            {item.TenLoai || item.TENLOAI} ({item.DonViTinh || item.DONVITINH})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Số Lượng Xuất</label>
                      <input type="number" min="1" value={stockOutData.soLuong} onChange={e => setStockOutData({...stockOutData, soLuong: e.target.value})} required />
                    </div>
                    <div className="form-group">
                      <label>Người/Đội Nhận</label>
                      <input type="text" value={stockOutData.nguoiNhan} onChange={e => setStockOutData({...stockOutData, nguoiNhan: e.target.value})} required />
                    </div>
                    <button type="submit" className="action-btn danger-btn">Xác Nhận Xuất Kho</button>
                  </form>
                </GlassCard>
              )}
            </div>

            <div className="logistics-logs-grid">
              <GlassCard title="Lịch Sử Nhập">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Ngày Nhập</th>
                      <th>Vật Phẩm</th>
                      <th>Số Lượng</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.imports.map(log => (
                      <tr key={log.MAPHIEU || log.MaPhieu}>
                        <td>{new Date(log.NGAY || log.Ngay).toLocaleDateString('vi-VN')}</td>
                        <td>{log.TENLOAI || log.TenLoai}</td>
                        <td className="text-success">+{log.SOLUONG || log.SoLuong}</td>
                      </tr>
                    ))}
                    {logs.imports.length === 0 && <tr><td colSpan="3" className="empty-state">Chưa có lịch sử.</td></tr>}
                  </tbody>
                </table>
              </GlassCard>

              <GlassCard title="Lịch Sử Xuất">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Ngày Xuất</th>
                      <th>Vật Phẩm</th>
                      <th>Số Lượng</th>
                      <th>Người Nhận</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.exports.map(log => (
                      <tr key={log.MAPHIEU || log.MaPhieu}>
                        <td>{new Date(log.NGAY || log.Ngay).toLocaleDateString('vi-VN')}</td>
                        <td>{log.TENLOAI || log.TenLoai}</td>
                        <td className="text-danger">-{log.SOLUONG || log.SoLuong}</td>
                        <td>{log.NGUOINHAN || log.NguoiNhan}</td>
                      </tr>
                    ))}
                    {logs.exports.length === 0 && <tr><td colSpan="4" className="empty-state">Chưa có lịch sử.</td></tr>}
                  </tbody>
                </table>
              </GlassCard>
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default LogisticsPage;
