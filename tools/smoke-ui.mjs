import { spawn } from "node:child_process";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const appUrl = process.env.APP_URL || "http://127.0.0.1:5173";
const debugPort = Number(process.env.EDGE_DEBUG_PORT || 9333);
const userDataDir = path.join(rootDir, ".edge-smoke");

const users = [
  { TenDangNhap: "admin", VaiTro: "AdminKeToan", HoTen: "Nguyễn Mai Anh", ChucVu: "Admin / Kế toán" },
  { TenDangNhap: "nhanvien", VaiTro: "NhanVien", HoTen: "Lê Thu Hằng", ChucVu: "Nhân viên xã hội" },
  { TenDangNhap: "dieuhanh", VaiTro: "BanDieuHanh", HoTen: "Trần Quốc Minh", ChucVu: "Ban điều hành" },
  { TenDangNhap: "tnv", VaiTro: "TinhNguyenVien", HoTen: "Lê Hoàng Nam", ChucVu: "Tình nguyện viên y tế", linkedVolunteerId: "TNV-002" },
  { TenDangNhap: "donor", VaiTro: "NhaTaiTro", HoTen: "Công ty ABC", ChucVu: "Nhà tài trợ", linkedDonorId: "NHT-001" }
];

const edgeCandidates = [
  process.env.EDGE_PATH,
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
].filter(Boolean);

const edgePath = edgeCandidates.find((candidate) => fs.existsSync(candidate));

if (!edgePath) {
  throw new Error("Không tìm thấy Edge/Chrome để chạy smoke UI.");
}

const requestJson = (url) => new Promise((resolve, reject) => {
  const request = http.get(url, (response) => {
    let body = "";
    response.setEncoding("utf8");
    response.on("data", (chunk) => { body += chunk; });
    response.on("end", () => {
      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(error);
      }
    });
  });
  request.on("error", reject);
  request.setTimeout(3000, () => {
    request.destroy(new Error(`Timeout khi gọi ${url}`));
  });
});

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const assertServerReady = async () => {
  await new Promise((resolve, reject) => {
    const request = http.get(appUrl, (response) => {
      response.resume();
      response.statusCode && response.statusCode < 500
        ? resolve()
        : reject(new Error(`App trả HTTP ${response.statusCode}`));
    });
    request.on("error", reject);
    request.setTimeout(3000, () => request.destroy(new Error(`Không kết nối được ${appUrl}`)));
  });
};

const connectWebSocket = (url) => new Promise((resolve, reject) => {
  const socket = new WebSocket(url);
  const pending = new Map();
  let counter = 0;

  socket.addEventListener("open", () => {
    resolve({
      send(method, params = {}, sessionId) {
        const id = ++counter;
        const message = { id, method, params };
        if (sessionId) message.sessionId = sessionId;
        socket.send(JSON.stringify(message));
        return new Promise((messageResolve, messageReject) => {
          pending.set(id, { resolve: messageResolve, reject: messageReject });
        });
      },
      close() {
        socket.close();
      }
    });
  });

  socket.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    if (!message.id || !pending.has(message.id)) return;
    const entry = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) {
      entry.reject(new Error(message.error.message));
    } else {
      entry.resolve(message.result);
    }
  });

  socket.addEventListener("error", reject);
});

const waitForText = async (client, sessionId, expected) => {
  let lastText = "";
  for (let attempt = 0; attempt < 25; attempt += 1) {
    const result = await client.send("Runtime.evaluate", {
      expression: "document.body ? document.body.innerText : ''",
      returnByValue: true
    }, sessionId);
    const text = result.result?.value || "";
    lastText = text.replace(/\s+/g, " ").slice(0, 500);
    if (expected.every((entry) => text.includes(entry)) && !text.includes("Ứng dụng cần tải lại")) {
      return text;
    }
    await wait(250);
  }
  throw new Error(`Không thấy nội dung mong đợi: ${expected.join(", ")}. DOM hiện tại: ${lastText}`);
};

await assertServerReady();
fs.mkdirSync(userDataDir, { recursive: true });

const edge = spawn(edgePath, [
  "--headless",
  "--disable-gpu",
  `--remote-debugging-port=${debugPort}`,
  `--user-data-dir=${userDataDir}`,
  `${appUrl}/#/login`
], { stdio: "ignore" });

try {
  let version;
  for (let attempt = 0; attempt < 30; attempt += 1) {
    try {
      version = await requestJson(`http://127.0.0.1:${debugPort}/json/version`);
      break;
    } catch {
      await wait(250);
    }
  }
  if (!version?.webSocketDebuggerUrl) {
    throw new Error("Không mở được DevTools endpoint của Edge.");
  }

  const browserClient = await connectWebSocket(version.webSocketDebuggerUrl);
  const target = await browserClient.send("Target.createTarget", { url: `${appUrl}/#/login` });
  const attached = await browserClient.send("Target.attachToTarget", { targetId: target.targetId, flatten: true });
  const sessionId = attached.sessionId;

  await browserClient.send("Runtime.enable", {}, sessionId);
  await waitForText(browserClient, sessionId, ["Đăng Nhập", "Tài khoản demo"]);

  for (const user of users) {
    const targetUrl = `${appUrl}/?smoke=${Date.now()}-${user.VaiTro}#/operations`;
    const expression = `
      localStorage.setItem('user_session', ${JSON.stringify(JSON.stringify(user))});
      location.href = ${JSON.stringify(targetUrl)};
    `;
    await browserClient.send("Runtime.evaluate", { expression, returnByValue: true }, sessionId);
    await waitForText(browserClient, sessionId, ["Bảng xử lý yêu cầu", user.HoTen]);
    console.log(`OK ${user.VaiTro}`);
  }

  browserClient.close();
} finally {
  edge.kill();
}
