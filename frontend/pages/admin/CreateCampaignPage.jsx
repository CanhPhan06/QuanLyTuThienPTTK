import React, { useState } from "react";
import MainLayout from "../../components/layout/MainLayout";
import SystemModal from "../../components/common/SystemModal";
import { createCampaign } from "../../services/campaigns";
import { useAuth } from "../../context/AuthContext";
import "./CreateCampaignPage.css";

const CreateCampaignPage = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    tenChienDich: "",
    moTa: "",
    ngayBatDau: "",
    ngayKetThuc: "",
    diaDiem: "",
    soLuongMax: 100,
    maBDH: "TK00000003" // Default to the demo BDH account
  });
  
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState({ isOpen: false, title: "", message: "", type: "error" });

  const getLocalDateString = () => {
    const date = new Date();
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    return date.toISOString().split("T")[0];
  };

  const today = getLocalDateString();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.ngayBatDau < today) {
      setModal({ isOpen: true, title: "Lỗi Nhập Liệu", message: "Ngày bắt đầu phải từ hôm nay trở đi.", type: "error" });
      return;
    }

    if (formData.ngayBatDau > formData.ngayKetThuc) {
      setModal({ isOpen: true, title: "Lỗi Nhập Liệu", message: "Ngày kết thúc phải sau hoặc bằng ngày bắt đầu.", type: "error" });
      return;
    }

    setLoading(true);
    try {
      const res = await createCampaign({ ...formData, maBQL: user.MaTaiKhoan });
      setModal({ isOpen: true, title: "Thành công", message: `Đã tạo hoạt động/dự án Maison Chance. Mã: ${res.campaignId}`, type: "success" });
      setFormData({
        tenChienDich: "",
        moTa: "",
        ngayBatDau: "",
        ngayKetThuc: "",
        diaDiem: "",
        soLuongMax: 100,
        maBDH: "TK00000003"
      });
    } catch (error) {
      setModal({ isOpen: true, title: "Lỗi tạo hoạt động/dự án", message: error.message, type: "error" });
    } finally {
      setLoading(false);
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
      <div className="campaign-create-container">
        <div className="campaign-header">
          <h1>Tạo hoạt động/dự án Maison Chance</h1>
          <p>Khởi tạo hoạt động hỗ trợ, gây quỹ hoặc chương trình tình nguyện của Maison Chance.</p>
        </div>

        <form className="glass-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group full-width">
              <label>Tên hoạt động/dự án</label>
              <input type="text" name="tenChienDich" value={formData.tenChienDich} onChange={handleChange} required placeholder="VD: Hỗ trợ học nghề Maison Chance..." />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group full-width">
              <label>Mô tả chi tiết</label>
              <textarea name="moTa" value={formData.moTa} onChange={handleChange} required rows="4" placeholder="Nhập mô tả hoạt động..." />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Ngày bắt đầu</label>
              <input type="date" name="ngayBatDau" value={formData.ngayBatDau} min={today} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Ngày kết thúc</label>
              <input type="date" name="ngayKetThuc" value={formData.ngayKetThuc} min={formData.ngayBatDau || today} onChange={handleChange} required />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group full-width">
              <label>Địa điểm</label>
              <input type="text" name="diaDiem" value={formData.diaDiem} onChange={handleChange} required placeholder="Nhập địa điểm tổ chức..." />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Số lượng TNV tối đa</label>
              <input type="number" name="soLuongMax" value={formData.soLuongMax} onChange={handleChange} required min="1" />
            </div>
            <div className="form-group">
              <label>Phân công điều phối viên (Mã TK)</label>
              <input type="text" name="maBDH" value={formData.maBDH} onChange={handleChange} required placeholder="VD: TK00000003" />
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="gradient-submit-btn" disabled={loading}>
              {loading ? "Đang xử lý..." : "Tạo hoạt động/dự án"}
            </button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
};

export default CreateCampaignPage;
