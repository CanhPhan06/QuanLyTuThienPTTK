import React from "react";
import "./SystemModal.css";

const SystemModal = ({ isOpen, title, message, onClose, onConfirm, type = "error" }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className={`modal-content ${type}`}>
        <h2 className="modal-title">{title}</h2>
        <p className="modal-message">{message}</p>
        {type === "confirm" ? (
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="modal-btn" style={{ background: '#6c757d', boxShadow: 'none' }} onClick={onClose}>Không</button>
            <button className="modal-btn" onClick={onConfirm}>Có</button>
          </div>
        ) : (
          <button className="modal-btn" onClick={onClose}>OK</button>
        )}
      </div>
    </div>
  );
};

export default SystemModal;
