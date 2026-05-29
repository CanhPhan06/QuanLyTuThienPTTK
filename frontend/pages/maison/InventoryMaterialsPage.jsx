import React, { useState } from "react";
import MainLayout from "../../components/layout/MainLayout";
import SystemModal from "../../components/common/SystemModal";
import { useAuth } from "../../context/AuthContext";
import { loadMaisonData, nextId, saveMaisonData, today } from "./maisonData";
import "./MaisonWorkflow.css";

const InventoryMaterialsPage = () => {
  const { user } = useAuth();
  const [data, setData] = useState(loadMaisonData);
  const [materialId, setMaterialId] = useState(data.inventory.materials[0]?.id || "");
  const [transactionType, setTransactionType] = useState("Nhap");
  const [quantity, setQuantity] = useState(1);
  const [purpose, setPurpose] = useState("Lop may can ban");
  const [product, setProduct] = useState({ serial: "", name: "Tui vai Maison Chance", maker: "", status: "Trong kho" });
  const [modal, setModal] = useState({ isOpen: false, title: "", message: "", type: "success" });

  const persist = (nextData) => {
    setData(nextData);
    saveMaisonData(nextData);
  };

  const handleStock = () => {
    const material = data.inventory.materials.find((item) => item.id === materialId);
    if (!material || quantity <= 0) return;
    if (transactionType === "Xuat" && material.stock < quantity) {
      setModal({ isOpen: true, title: "Không đủ tồn kho", message: "Số lượng xuất vượt quá tồn hiện tại.", type: "error" });
      return;
    }

    const nextMaterials = data.inventory.materials.map((item) =>
      item.id === materialId
        ? { ...item, stock: transactionType === "Nhap" ? item.stock + quantity : item.stock - quantity }
        : item
    );
    const nextLog = { id: nextId("PX", data.inventory.logs), type: transactionType, materialId, quantity, purpose, date: today() };
    persist({ ...data, inventory: { ...data.inventory, materials: nextMaterials, logs: [nextLog, ...data.inventory.logs] } });
    setModal({ isOpen: true, title: "Đã cập nhật kho", message: "Phiếu nhập/xuất đã được ghi và tồn kho được cập nhật.", type: "success" });
  };

  const handleCreateProduct = () => {
    if (!product.serial.trim() || !product.maker.trim()) {
      setModal({ isOpen: true, title: "Thiếu thông tin", message: "Cần nhập serial và người thực hiện sản phẩm.", type: "error" });
      return;
    }
    if (data.inventory.products.some((item) => item.serial === product.serial)) {
      setModal({ isOpen: true, title: "Trùng serial", message: "Mã định danh sản phẩm phải duy nhất.", type: "error" });
      return;
    }
    const nextProduct = { ...product, createdAt: today() };
    persist({ ...data, inventory: { ...data.inventory, products: [nextProduct, ...data.inventory.products] } });
    setModal({ isOpen: true, title: "Đã định danh sản phẩm", message: "Sản phẩm thủ công đã được gắn mã truy xuất nguồn gốc.", type: "success" });
    setProduct({ serial: "", name: "Tui vai Maison Chance", maker: "", status: "Trong kho" });
  };

  const lowStock = data.inventory.materials.filter((item) => item.stock <= item.minStock);

  return (
    <MainLayout>
      <SystemModal {...modal} onClose={() => setModal({ ...modal, isOpen: false })} />
      <div className="mc-page">
        <header className="mc-header">
          <div>
            <span className="mc-eyebrow">UC4 - Thủ kho / Thu mua</span>
            <h1>Nhập xuất kho & định mức nguyên liệu</h1>
            <p>Theo dõi nguyên liệu, xuất nhập kho, định danh sản phẩm thủ công và cảnh báo tồn kho thấp.</p>
          </div>
          <div className="mc-role-card"><span>Tài khoản sử dụng</span><strong>{user?.TenDangNhap || "bdh01"} - Thủ kho</strong></div>
        </header>

        {lowStock.length > 0 && (
          <div className="mc-alert">
            <b>Cảnh báo thu mua:</b> {lowStock.map((item) => `${item.name} còn ${item.stock}/${item.minStock} ${item.unit}`).join("; ")}
          </div>
        )}

        <section className="mc-grid">
          <div className="mc-card">
            <h2>Tồn kho nguyên liệu</h2>
            <table className="mc-table">
              <thead><tr><th>Mã</th><th>Nguyên liệu</th><th>Tồn</th><th>Định mức</th><th>Trạng thái</th></tr></thead>
              <tbody>
                {data.inventory.materials.map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.name}</td>
                    <td>{item.stock} {item.unit}</td>
                    <td>{item.minStock} {item.unit}</td>
                    <td><span className={`mc-tag ${item.stock <= item.minStock ? "bad" : "good"}`}>{item.stock <= item.minStock ? "Cần mua" : "Đủ dùng"}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>

            <h3 style={{ marginTop: "1rem" }}>Sản phẩm thủ công có serial</h3>
            <table className="mc-table">
              <thead><tr><th>Serial/QR</th><th>Sản phẩm</th><th>Người làm</th><th>Ngày tạo</th></tr></thead>
              <tbody>
                {data.inventory.products.map((item) => (
                  <tr key={item.serial}><td>{item.serial}</td><td>{item.name}</td><td>{item.maker}</td><td>{item.createdAt}</td></tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mc-card">
            <h2>Phiếu nhập/xuất kho</h2>
            <div className="mc-form">
              <label>Nguyên liệu<select value={materialId} onChange={(e) => setMaterialId(e.target.value)}>{data.inventory.materials.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
              <label>Loại phiếu<select value={transactionType} onChange={(e) => setTransactionType(e.target.value)}><option>Nhap</option><option>Xuat</option></select></label>
              <label>Số lượng<input type="number" min="1" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} /></label>
              <label>Mục đích<input value={purpose} onChange={(e) => setPurpose(e.target.value)} /></label>
            </div>
            <div className="mc-actions"><button className="mc-btn" onClick={handleStock}>Xác nhận phiếu kho</button></div>

            <h2 style={{ marginTop: "1.3rem" }}>Định danh sản phẩm</h2>
            <div className="mc-form">
              <label>Serial/QR<input value={product.serial} onChange={(e) => setProduct({ ...product, serial: e.target.value })} placeholder="MC-BAG-2026-002" /></label>
              <label>Tên sản phẩm<input value={product.name} onChange={(e) => setProduct({ ...product, name: e.target.value })} /></label>
              <label className="mc-full">Người thực hiện<input value={product.maker} onChange={(e) => setProduct({ ...product, maker: e.target.value })} /></label>
            </div>
            <div className="mc-actions"><button className="mc-btn secondary" onClick={handleCreateProduct}>Gắn mã sản phẩm</button></div>
          </div>
        </section>
      </div>
    </MainLayout>
  );
};

export default InventoryMaterialsPage;
