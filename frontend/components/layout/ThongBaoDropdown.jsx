import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./ThongBaoDropdown.css";

const ThongBaoDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (user && user.TenDangNhap) {
      fetchNotifications();
    }
    // Handle click outside to close dropdown
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`http://localhost:3000/api/notifications/${user.TenDangNhap}`);
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
        setUnreadCount(data.filter(n => n.status === 'ChuaDoc').length);
      }
    } catch (error) {
      console.error("Lỗi lấy thông báo:", error);
    }
  };

  const markAsRead = async (id) => {
    try {
      await fetch(`http://localhost:3000/api/notifications/${user.TenDangNhap}/${id}/read`, {
        method: 'PUT'
      });
      fetchNotifications(); // Refresh
    } catch (error) {
      console.error(error);
    }
  };

  const handleNotificationClick = (noti) => {
    if (noti.status === 'ChuaDoc') {
      markAsRead(noti.id);
    }
    setIsOpen(false);
    // In a real app, you might navigate to a specific campaign or profile based on noti.category
    navigate("/notifications"); 
  };

  const formatRelativeTime = (dateString) => {
    const notiDate = new Date(dateString);
    const now = new Date();
    const diffMs = now - notiDate;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 60) return `${diffMins} phút trước`;
    const diffHrs = Math.floor(diffMins / 60);
    if (diffHrs < 24) return `${diffHrs} giờ trước`;
    const diffDays = Math.floor(diffHrs / 24);
    return `${diffDays} ngày trước`;
  };

  const previewList = notifications.slice(0, 5);

  return (
    <div className="thongbao-container" ref={dropdownRef}>
      <button className="thongbao-bell-btn" onClick={() => setIsOpen(!isOpen)}>
        🔔
        {unreadCount > 0 && <span className="thongbao-badge">{unreadCount}</span>}
      </button>

      {isOpen && (
        <div className="thongbao-dropdown">
          <div className="thongbao-header">
            <h3>Thông báo</h3>
            {unreadCount > 0 && <span className="thongbao-count">{unreadCount} chưa đọc</span>}
          </div>
          
          <div className="thongbao-list">
            {previewList.length === 0 ? (
              <div className="thongbao-empty">Không có thông báo nào</div>
            ) : (
              previewList.map(noti => (
                <div 
                  key={noti.id} 
                  className={`thongbao-item ${noti.status === 'ChuaDoc' ? 'unread' : ''}`}
                  onClick={() => handleNotificationClick(noti)}
                >
                  <div className="thongbao-item-header">
                    <span className="thongbao-category">{noti.category}</span>
                    <span className="thongbao-time">{formatRelativeTime(noti.date)}</span>
                  </div>
                  <h4 className="thongbao-title">{noti.title}</h4>
                </div>
              ))
            )}
          </div>
          
          <div className="thongbao-footer">
            <button className="thongbao-see-all" onClick={() => {
              setIsOpen(false);
              navigate("/notifications");
            }}>
              Xem tất cả
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThongBaoDropdown;
