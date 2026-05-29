import React, { useState, useEffect } from "react";
import MainLayout from "../../components/layout/MainLayout";
import GlassCard from "../../components/common/GlassCard";
import SystemModal from "../../components/common/SystemModal";
import { getParameters, updateParameter } from "../../services/statistics";
import "./SystemConfigPage.css";

const SystemConfigPage = () => {
  const [parameters, setParameters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ isOpen: false, title: "", message: "", type: "info" });
  
  // Edit state
  const [editingParam, setEditingParam] = useState(null);
  const [newValue, setNewValue] = useState("");

  useEffect(() => {
    fetchParams();
  }, []);

  const fetchParams = async () => {
    try {
      const data = await getParameters();
      setParameters(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (param) => {
    setEditingParam(param);
    setNewValue(param.GiaTri || param.GIATRI);
  };

  const handleSave = async () => {
    try {
      await updateParameter(
        editingParam.MaThamSo || editingParam.MATHAMSO,
        newValue,
        editingParam.GiaTri || editingParam.GIATRI
      );
      setModal({ isOpen: true, title: "Thành công", message: "Đã cập nhật tham số hệ thống.", type: "success" });
      setEditingParam(null);
      fetchParams();
    } catch (error) {
      setModal({ isOpen: true, title: "Lỗi", message: error.message, type: "error" });
      fetchParams();
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

      <div className="config-container">
        <header className="config-header">
          <h1>Quy định & cảnh báo hệ thống</h1>
          <p>Điều chỉnh tham số, quy tắc nghiệp vụ và ngưỡng cảnh báo của Maison Chance</p>
        </header>

        {loading ? (
          <div className="loading">Đang tải...</div>
        ) : (
          <GlassCard title="Danh sách quy định/tham số">
            <div className="params-list">
              <table className="config-table">
                <thead>
                  <tr>
                    <th>Mã</th>
                    <th>Tên tham số</th>
                    <th>Giá trị hiện tại</th>
                    <th>Mô tả</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {parameters.map(p => (
                    <tr key={p.MaThamSo || p.MATHAMSO}>
                      <td>{p.MaThamSo || p.MATHAMSO}</td>
                      <td className="param-name">{p.TenThamSo || p.TENTHAMSO}</td>
                      <td>
                        {editingParam?.MATHAMSO === (p.MaThamSo || p.MATHAMSO) ? (
                          <input 
                            type="text" 
                            className="edit-input" 
                            value={newValue} 
                            onChange={(e) => setNewValue(e.target.value)}
                          />
                        ) : (
                          <span className="param-value">{p.GiaTri || p.GIATRI}</span>
                        )}
                      </td>
                      <td className="param-desc">{p.GhiChu || p.GHICHU || "Không có mô tả"}</td>
                      <td>
                        {editingParam?.MATHAMSO === (p.MaThamSo || p.MATHAMSO) ? (
                          <div className="action-btns">
                            <button className="save-btn" onClick={handleSave}>Lưu</button>
                            <button className="cancel-btn" onClick={() => setEditingParam(null)}>Hủy</button>
                          </div>
                        ) : (
                          <button className="config-btn" onClick={() => handleEdit(p)}>Cấu hình</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        )}
      </div>
    </MainLayout>
  );
};

export default SystemConfigPage;
