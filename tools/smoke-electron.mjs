import { app, BrowserWindow } from "electron";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const users = [
  { TenDangNhap: "admin", VaiTro: "AdminKeToan", HoTen: "Nguyễn Mai Anh", ChucVu: "Admin / Kế toán" },
  { TenDangNhap: "nhanvien", VaiTro: "NhanVien", HoTen: "Lê Thu Hằng", ChucVu: "Nhân viên xã hội" },
  { TenDangNhap: "dieuhanh", VaiTro: "BanDieuHanh", HoTen: "Trần Quốc Minh", ChucVu: "Ban điều hành" },
  { TenDangNhap: "tnv", VaiTro: "TinhNguyenVien", HoTen: "Lê Hoàng Nam", ChucVu: "Tình nguyện viên y tế", linkedVolunteerId: "TNV-002" },
  { TenDangNhap: "donor", VaiTro: "NhaTaiTro", HoTen: "Công ty ABC", ChucVu: "Nhà tài trợ", linkedDonorId: "NHT-001" }
];

app.commandLine.appendSwitch("disable-gpu");

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const waitForText = async (window, expected) => {
  let lastText = "";
  for (let attempt = 0; attempt < 30; attempt += 1) {
    const text = await window.webContents.executeJavaScript("document.body ? document.body.innerText : ''");
    lastText = String(text || "").replace(/\s+/g, " ").slice(0, 500);
    if (expected.every((entry) => text.includes(entry)) && !text.includes("Ứng dụng cần tải lại")) {
      return text;
    }
    await wait(250);
  }
  throw new Error(`Không thấy nội dung mong đợi: ${expected.join(", ")}. DOM hiện tại: ${lastText}`);
};

const run = async () => {
  const window = new BrowserWindow({
    show: false,
    width: 1280,
    height: 800,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  await window.loadFile(path.join(rootDir, "dist", "index.html"), { hash: "/login" });
  await waitForText(window, ["Đăng Nhập", "Tài khoản demo"]);

  for (const user of users) {
    await window.webContents.executeJavaScript(`
      localStorage.setItem('user_session', ${JSON.stringify(JSON.stringify(user))});
      location.hash = '/operations';
      location.reload();
    `);
    await waitForText(window, ["Bảng xử lý yêu cầu", user.HoTen]);
    console.log(`OK ${user.VaiTro}`);

    if (["AdminKeToan", "BanDieuHanh", "NhaTaiTro"].includes(user.VaiTro)) {
      await window.webContents.executeJavaScript(`
        location.hash = '/admin/reconciliation';
        location.reload();
      `);
      await waitForText(window, ["Dashboard minh bạch", "Tài chính tổng hợp", user.HoTen]);
      console.log(`OK report ${user.VaiTro}`);
    }
  }

  window.close();
};

app.whenReady()
  .then(run)
  .then(() => app.quit())
  .catch((error) => {
    console.error(error);
    app.exit(1);
  });
