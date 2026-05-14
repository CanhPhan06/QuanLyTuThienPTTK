import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { getProfile, updateProfile } from "../../services/auth";
import SystemModal from "../../components/common/SystemModal";
import NullAvtIcon from "../../assets/NullAvtIcon.png";
import "./ProfilePage.css";

const ProfilePage = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modal, setModal] = useState({ isOpen: false, title: "", message: "", type: "error" });

  const [formData, setFormData] = useState({
    HoTen: "",
    MSSV: "",
    GioiTinh: "Nam",
    NgaySinh: "",
    SoDienThoai: "",
    Khoa: "",
    Lop: "",
    CCCD: "",
    Nganh: "",
    DiaChiTamTruType: "Ký túc xá",
    DiaChiTamTru: "",
    LienHeKhanCap: "",
    NgheNghiepVoChong: "",
    ThongTinAnhChiEm: ""
  });

  useEffect(() => {
    if (user && user.TenDangNhap) {
      loadProfile(user.TenDangNhap);
    }
  }, [user]);

  const loadProfile = async (username) => {
    try {
      const data = await getProfile(username);
      setProfile(data);
      setFormData({
        HoTen: data.HoTen || "",
        MSSV: data.MSSV || "",
        GioiTinh: data.GioiTinh || "Nam",
        NgaySinh: data.NgaySinh || "",
        SoDienThoai: data.SoDienThoai || "",
        Khoa: data.Khoa || "",
        Lop: data.Lop || "",
        CCCD: data.CCCD || "",
        Nganh: data.Nganh || "",
        DiaChiTamTruType: (data.DiaChiTamTru && data.DiaChiTamTru.includes("Ký túc xá")) ? "Ký túc xá" : "Khác",
        DiaChiTamTru: data.DiaChiTamTru || "",
        LienHeKhanCap: data.LienHeKhanCap || "",
        NgheNghiepVoChong: data.NgheNghiepVoChong || "",
        ThongTinAnhChiEm: data.ThongTinAnhChiEm || ""
      });
    } catch (error) {
      setModal({ isOpen: true, title: "Lỗi", message: "Không thể tải hồ sơ: " + error, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.HoTen || !formData.SoDienThoai || !formData.NgaySinh) {
      setModal({ isOpen: true, title: "Cảnh báo", message: "Vui lòng nhập đầy đủ Họ tên, Ngày sinh và Số điện thoại.", type: "error" });
      return;
    }

    setSaving(true);
    try {
      await updateProfile(user.TenDangNhap, formData);
      setModal({ isOpen: true, title: "Thành công", message: "Cập nhật hồ sơ thành công!", type: "success" });
    } catch (error) {
      setModal({ isOpen: true, title: "Lỗi", message: "Cập nhật thất bại: " + error, type: "error" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="profile-loading">Đang tải hồ sơ...</div>;
  if (!profile) return <div className="profile-error">Không có thông tin.</div>;

  return (
    <div className="profile-container">
      <SystemModal
        isOpen={modal.isOpen}
        title={modal.title}
        message={modal.message}
        type={modal.type}
        onClose={() => setModal({ ...modal, isOpen: false })}
      />

      {/* Header Block */}
      <div className="profile-header-block">
        <div className="profile-header-content">
          <div className="profile-avatar-wrapper">
            <img src={NullAvtIcon} alt="Avatar" className="profile-avatar" />
          </div>
          <div className="profile-brief">
            <h1 className="profile-name">{formData.HoTen || "Chưa cập nhật tên"}</h1>
            <p className="profile-role">{profile.VaiTro}</p>
            <div className="profile-badges">
              {profile.VaiTro === "BanQuanLy" && (
                <>
                  <span className="badge">Admin ID: {formData.MSSV || "N/A"}</span>
                  <span className="badge">Vai Trò: Quản Trị Hệ Thống</span>
                </>
              )}
              {profile.VaiTro === "BanDieuHanh" && (
                <>
                  <span className="badge">Mã ĐH: {formData.MSSV || "N/A"}</span>
                  <span className="badge">Ban: {formData.Khoa || "N/A"}</span>
                  <span className="badge">Chức vụ: {formData.Lop || "N/A"}</span>
                </>
              )}
              {profile.VaiTro === "TinhNguyenVien" && (
                <>
                  <span className="badge">MSSV: {formData.MSSV || "N/A"}</span>
                  <span className="badge">Khoa: {formData.Khoa || "N/A"}</span>
                  <span className="badge">Lớp: {formData.Lop || "N/A"}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Forms Block */}
      {profile.VaiTro !== "BanQuanLy" && (
      <div className="profile-form-block">
        <form onSubmit={handleSubmit}>
          
          <div className="form-section">
            <h3 className="section-title">1. Sơ yếu lý lịch</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Họ và tên *</label>
                <input type="text" name="HoTen" value={formData.HoTen} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Giới tính</label>
                <select name="GioiTinh" value={formData.GioiTinh} onChange={handleChange}>
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                  <option value="Khác">Khác</option>
                </select>
              </div>
              <div className="form-group">
                <label>Ngày sinh *</label>
                <input type="date" name="NgaySinh" value={formData.NgaySinh} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Số điện thoại *</label>
                <input type="tel" name="SoDienThoai" value={formData.SoDienThoai} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Số CCCD/CMND</label>
                <input type="text" name="CCCD" value={formData.CCCD} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Ngành học</label>
                <input type="text" name="Nganh" value={formData.Nganh} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Khoa</label>
                <input type="text" name="Khoa" value={formData.Khoa} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Lớp</label>
                <input type="text" name="Lop" value={formData.Lop} onChange={handleChange} />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3 className="section-title">2. Địa chỉ tạm trú</h3>
            <div className="radio-group" style={{ marginBottom: '1rem' }}>
              <label>
                <input type="radio" name="DiaChiTamTruType" value="Ký túc xá" checked={formData.DiaChiTamTruType === "Ký túc xá"} onChange={handleChange} /> 
                Ký túc xá
              </label>
              <label style={{ marginLeft: '1.5rem' }}>
                <input type="radio" name="DiaChiTamTruType" value="Khác" checked={formData.DiaChiTamTruType === "Khác"} onChange={handleChange} /> 
                Khác
              </label>
            </div>
            {formData.DiaChiTamTruType === "Ký túc xá" ? (
              <div className="form-group">
                <label>Tòa nhà / Phòng Ký túc xá</label>
                <input type="text" name="DiaChiTamTru" value={formData.DiaChiTamTru} onChange={handleChange} placeholder="Ví dụ: Tòa BA4, Phòng 102, KTX Khu B" />
              </div>
            ) : (
              <div className="form-group">
                <label>Địa chỉ chi tiết (Số nhà, Đường, Phường/Xã, Quận/Huyện, Tỉnh/TP)</label>
                <input type="text" name="DiaChiTamTru" value={formData.DiaChiTamTru} onChange={handleChange} placeholder="Nhập địa chỉ tạm trú cụ thể..." />
              </div>
            )}
          </div>

          <div className="form-section">
            <h3 className="section-title">3. Thông tin gia đình & Liên hệ khẩn cấp</h3>
            <div className="form-grid">
              <div className="form-group full-width">
                <label>Khi cần báo tin cho ai? (Họ tên, SĐT, Mối quan hệ)</label>
                <textarea name="LienHeKhanCap" value={formData.LienHeKhanCap} onChange={handleChange} rows="2" placeholder="Ví dụ: Ông Nguyễn Văn A - 0988xxxxxx - Bố đẻ"></textarea>
              </div>
              <div className="form-group full-width">
                <label>Nghề nghiệp vợ/chồng (Nếu có)</label>
                <input type="text" name="NgheNghiepVoChong" value={formData.NgheNghiepVoChong} onChange={handleChange} />
              </div>
              <div className="form-group full-width">
                <label>Thông tin anh chị em ruột</label>
                <textarea name="ThongTinAnhChiEm" value={formData.ThongTinAnhChiEm} onChange={handleChange} rows="3" placeholder="Ghi rõ họ tên, năm sinh, nghề nghiệp của từng anh/chị/em ruột..."></textarea>
              </div>
            </div>
          </div>

          <div className="profile-actions">
            <button type="submit" className="gradient-update-btn" disabled={saving}>
              {saving ? "Đang lưu..." : "Cập nhật Hồ Sơ"}
            </button>
          </div>
        </form>
      </div>
      )}
    </div>
  );
};

export default ProfilePage;
