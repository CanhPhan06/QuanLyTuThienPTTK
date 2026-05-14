const API_URL = 'http://localhost:3000/api';

export const login = async (username, password) => {
  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (!res.ok) throw data.error || 'Lỗi đăng nhập';
    return data;
  } catch (error) {
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
  try {
    const res = await fetch(`${API_URL}/auth/profile/${username}`);
    const data = await res.json();
    if (!res.ok) throw data.error || 'Lỗi tải hồ sơ';
    return data;
  } catch (error) {
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
