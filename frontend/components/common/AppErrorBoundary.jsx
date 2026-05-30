import React from "react";

const OPERATIONS_STORAGE_KEY = "maison-chance-operations-v5";

class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  reloadApp = () => {
    window.location.reload();
  };

  resetOperationsData = () => {
    localStorage.removeItem(OPERATIONS_STORAGE_KEY);
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <main className="app-error-screen">
        <section className="app-error-panel">
          <span>Maison Chance</span>
          <h1>Ứng dụng cần tải lại</h1>
          <p>Dữ liệu tạm trên máy có thể không còn khớp với phiên bản hiện tại. Tải lại trước; nếu vẫn lỗi thì khôi phục dữ liệu nghiệp vụ mẫu.</p>
          <div>
            <button type="button" onClick={this.reloadApp}>Tải lại</button>
            <button type="button" className="secondary" onClick={this.resetOperationsData}>Khôi phục dữ liệu mẫu</button>
          </div>
        </section>
      </main>
    );
  }
}

export default AppErrorBoundary;
