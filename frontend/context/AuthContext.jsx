import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

const normalizeUser = (value) => {
  if (!value || typeof value !== "object") return null;
  return {
    ...value,
    MaTaiKhoan: value.MaTaiKhoan ?? value.maTaiKhoan,
    TenDangNhap: value.TenDangNhap || value.tenDangNhap || value.username,
    VaiTro: value.VaiTro || value.vaiTro,
    Email: value.Email || value.email,
    HoTen: value.HoTen || value.hoTen || value.name
  };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check localStorage for saved session on mount
    const savedUser = localStorage.getItem("user_session");
    if (savedUser) {
      try {
        const parsedUser = normalizeUser(JSON.parse(savedUser));
        if (parsedUser?.VaiTro) {
          setUser(parsedUser);
          localStorage.setItem("user_session", JSON.stringify(parsedUser));
        } else {
          localStorage.removeItem("user_session");
        }
      } catch (e) {
        localStorage.removeItem("user_session");
      }
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    // userData nên chứa { maTaiKhoan, vaiTro, tenDangNhap, ... }
    const normalizedUser = normalizeUser(userData);
    setUser(normalizedUser);
    localStorage.setItem("user_session", JSON.stringify(normalizedUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user_session");
  };

  if (loading) return <div>Đang tải...</div>;

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
