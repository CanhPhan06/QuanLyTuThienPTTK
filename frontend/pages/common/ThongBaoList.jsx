import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import "./ThongBaoList.css";

const ThongBaoList = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.TenDangNhap) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`http://localhost:3000/api/notifications/${user.TenDangNhap}`);
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error("Lỗi lấy danh sách thông báo:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await fetch(`http://localhost:3000/api/notifications/${user.TenDangNhap}/${id}/read`, {
        method: 'PUT'
      });
      // Update local state
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, status: 'DaDoc' } : n));
    } catch (error) {
      console.error(error);
    }
  };

  const handleNotificationClick = (noti) => {
    if (noti.status === 'ChuaDoc') {
      markAsRead(noti.id);
    }
    // Expand notification details logic here
    alert("Nội dung chi tiết:\n" + (noti.content || "Không có nội dung"));
  };

  const formatDateTime = (dateString) => {
    const d = new Date(dateString);
    return `${d.toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})} - ${d.toLocaleDateString('vi-VN')}`;
  };

  if (loading) return <div className="tb-loading">Đang tải thông báo...</div>;

  return (
    <div className="tb-page-container">
      <div className="tb-header">
        <h1>Tất Cả Thông Báo</h1>
      </div>

      <div className="tb-list-container card">
        {notifications.length === 0 ? (
          <div className="tb-empty">Hiện tại bạn không có thông báo nào.</div>
        ) : (
          notifications.map(noti => (
            <div 
              key={noti.id} 
              className={`tb-item-row ${noti.status === 'ChuaDoc' ? 'tb-unread' : ''}`}
              onClick={() => handleNotificationClick(noti)}
            >
              <div className="tb-item-content">
                <div className="tb-item-meta">
                  <span className="tb-item-category">{noti.category}</span>
                  <span className="tb-item-date">{formatDateTime(noti.date)}</span>
                </div>
                <h3 className="tb-item-title">{noti.title}</h3>
                <p className="tb-item-preview">
                  {noti.content ? (noti.content.substring(0, 100) + '...') : 'Bấm để xem chi tiết.'}
                </p>
              </div>
              {noti.status === 'ChuaDoc' && <div className="tb-item-dot"></div>}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ThongBaoList;
