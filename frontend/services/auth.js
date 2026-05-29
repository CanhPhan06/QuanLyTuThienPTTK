const API_URL = 'http://localhost:3000/api';

export const DEMO_USERS = [
  {
    username: 'admin',
    password: 'admin123',
    MaTaiKhoan: 1,
    TenDangNhap: 'admin',
    VaiTro: 'AdminKeToan',
    Email: 'admin@maisonchance.vn',
    HoTen: 'Nguyễn Mai Anh',
    ChucVu: 'Admin / Kế toán',
    department: 'Tài chính - Quản trị'
  },
  {
    username: 'nhanvien',
    password: 'nhanvien123',
    MaTaiKhoan: 2,
    TenDangNhap: 'nhanvien',
    VaiTro: 'NhanVien',
    Email: 'nhanvien@maisonchance.vn',
    HoTen: 'Lê Thu Hằng',
    ChucVu: 'Nhân viên xã hội',
    department: 'Công tác xã hội'
  },
  {
    username: 'dieuhanh',
    password: 'dieuhanh123',
    MaTaiKhoan: 3,
    TenDangNhap: 'dieuhanh',
    VaiTro: 'BanDieuHanh',
    Email: 'dieuhanh@maisonchance.vn',
    HoTen: 'Trần Quốc Minh',
    ChucVu: 'Ban điều hành',
    department: 'Điều hành trung tâm'
  },
  {
    username: 'tnv',
    password: 'tnv123',
    MaTaiKhoan: 4,
    TenDangNhap: 'tnv',
    VaiTro: 'TinhNguyenVien',
    Email: 'tnv@maisonchance.vn',
    HoTen: 'Lê Hoàng Nam',
    ChucVu: 'Tình nguyện viên y tế',
    linkedVolunteerId: 'TNV-002'
  },
  {
    username: 'donor',
    password: 'donor123',
    MaTaiKhoan: 5,
    TenDangNhap: 'donor',
    VaiTro: 'NhaTaiTro',
    Email: 'donor@maisonchance.vn',
    HoTen: 'Công ty ABC',
    ChucVu: 'Nhà tài trợ',
    linkedDonorId: 'NHT-001'
  }
];

const toSessionUser = (account) => {
  const { password, username, ...user } = account;
  return user;
};

const findDemoAccount = (username, password) =>
  DEMO_USERS.find((user) => user.username === username && user.password === password);

const findDemoByUsername = (username) =>
  DEMO_USERS.find((user) => user.username === username || user.TenDangNhap === username);

export const login = async (username, password) => {
  const demoAccount = findDemoAccount(username, password);
  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (!res.ok) {
      if (demoAccount) return toSessionUser(demoAccount);
      throw data.error || 'Lỗi đăng nhập';
    }
    return data;
  } catch (error) {
    if (demoAccount) return toSessionUser(demoAccount);
    throw error.toString();
  }
};

export const register = async (userData) => {
  try {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    const data = await res.json();
    if (!res.ok) throw data.error || 'Lỗi đăng ký';
    return data;
  } catch (error) {
    throw error.toString();
  }
};

export const getProfile = async (username) => {
  const demoAccount = findDemoByUsername(username);
  try {
    const res = await fetch(`${API_URL}/auth/profile/${username}`);
    const data = await res.json();
    if (!res.ok) {
      if (demoAccount) return { ...toSessionUser(demoAccount), success: true };
      throw data.error || 'Lỗi tải hồ sơ';
    }
    return data;
  } catch (error) {
    if (demoAccount) return { ...toSessionUser(demoAccount), success: true };
    throw error.toString();
  }
};

export const updateProfile = async (username, profileData) => {
  try {
    const res = await fetch(`${API_URL}/auth/profile/${username}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profileData)
    });
    const data = await res.json();
    if (!res.ok) throw data.error || 'Lỗi cập nhật hồ sơ';
    return data;
  } catch (error) {
    throw error.toString();
  }
};

export const verifyUser = async (username, email) => {
  try {
    const res = await fetch(`${API_URL}/auth/verify-user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email })
    });
    const data = await res.json();
    if (!res.ok) throw data.error || 'Lỗi xác thực';
    return data;
  } catch (error) {
    throw error.toString();
  }
};

export const resetPassword = async (username, newPassword) => {
  try {
    const res = await fetch(`${API_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, newPassword })
    });
    const data = await res.json();
    if (!res.ok) throw data.error || 'Lỗi đổi mật khẩu';
    return data;
  } catch (error) {
    throw error.toString();
  }
};
