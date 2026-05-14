import React from 'react';
import GlassCard from '../common/GlassCard';
import './BudgetTracker.css';

const BudgetTracker = ({ remainingBudget, totalDonations, totalExpenses }) => {
  const percentSpent = totalDonations > 0 ? (totalExpenses / totalDonations) * 100 : 0;
  
  return (
    <GlassCard title="Quản lý Ngân Quỹ" className="budget-tracker">
      <div className="budget-stats">
        <div className="stat-box income">
          <span className="stat-label">Tổng Quyên Góp</span>
          <span className="stat-value">{totalDonations.toLocaleString()} VNĐ</span>
        </div>
        <div className="stat-box expense">
          <span className="stat-label">Đã Chi Tiêu</span>
          <span className="stat-value">{totalExpenses.toLocaleString()} VNĐ</span>
        </div>
        <div className="stat-box balance">
          <span className="stat-label">Số Dư Khả Dụng</span>
          <span className="stat-value">{remainingBudget.toLocaleString()} VNĐ</span>
        </div>
      </div>
      
      <div className="progress-container">
        <div className="progress-labels">
          <span>Tỷ lệ giải ngân</span>
          <span>{percentSpent.toFixed(1)}%</span>
        </div>
        <div className="progress-bar-bg">
          <div 
            className="progress-bar-fill" 
            style={{ width: `${Math.min(percentSpent, 100)}%` }}
          ></div>
        </div>
      </div>
    </GlassCard>
  );
};

export default BudgetTracker;
