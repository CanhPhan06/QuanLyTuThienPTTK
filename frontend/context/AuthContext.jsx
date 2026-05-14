import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check localStorage for saved session on mount
    const savedUser = localStorage.getItem("user_session");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem("user_session");
      }
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    // userData nên chứa { maTaiKhoan, vaiTro, tenDangNhap, ... }
    setUser(userData);
    localStorage.setItem("user_session", JSON.stringify(userData));
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
