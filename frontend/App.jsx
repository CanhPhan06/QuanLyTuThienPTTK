import { HashRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";

// Pages
import LoginPage from "./pages/common/LoginPage";
import RegisterPage from "./pages/common/RegisterPage";
import ForgotPasswordPage from "./pages/common/ForgotPasswordPage";
import ProfilePage from "./pages/common/ProfilePage";
import ThongBaoList from "./pages/common/ThongBaoList";
import MainLayout from "./components/layout/MainLayout";

import ApproveVolunteerPage from "./pages/admin/ApproveVolunteerPage";
import CreateCampaignPage from "./pages/admin/CreateCampaignPage";

import ApproveParticipationPage from "./pages/executive/ApproveParticipationPage";
import AttendancePage from "./pages/executive/AttendancePage";
import LogisticsPage from "./pages/executive/LogisticsPage";
import ProofReviewPage from "./pages/executive/ProofReviewPage";
import DashboardBDH from "./pages/executive/DashboardBDH";

import CampaignsPage from "./pages/volunteer/CampaignsPage";
import HistoryPage from "./pages/volunteer/HistoryPage";
import ProofUploadPage from "./pages/volunteer/ProofUploadPage";
import FinancePage from "./pages/admin/FinancePage";
import EvaluationPage from "./pages/executive/EvaluationPage";
import CertificationPage from "./pages/admin/CertificationPage";
import AnalyticsDashboard from "./pages/admin/AnalyticsDashboard";
import MyCertificatesPage from "./pages/volunteer/MyCertificatesPage";
import DashboardTNV from "./pages/tnv/DashboardTNV";
import TrangChiTietChienDich from "./pages/tnv/TrangChiTietChienDich";
import TaskDetailPage from "./pages/executive/TaskDetailPage";
import SponsorshipDonationPage from "./pages/admin/SponsorshipDonationPage";
import SystemConfigPage from "./pages/admin/SystemConfigPage";
import ExecutiveFinancePage from "./pages/executive/ExecutiveFinancePage";
import ConcurrencyDemoPage from "./pages/admin/ConcurrencyDemoPage";
import CaseIntakePage from "./pages/maison/CaseIntakePage";
import CouncilReviewPage from "./pages/maison/CouncilReviewPage";
import TrainingProgressPage from "./pages/maison/TrainingProgressPage";
import InventoryMaterialsPage from "./pages/maison/InventoryMaterialsPage";
import DonorLedgerPage from "./pages/maison/DonorLedgerPage";
import VolunteerAssignmentPage from "./pages/maison/VolunteerAssignmentPage";
import ExpenseApprovalPage from "./pages/maison/ExpenseApprovalPage";
import ReconciliationReportPage from "./pages/maison/ReconciliationReportPage";
import AlertsReminderPage from "./pages/maison/AlertsReminderPage";
import OperationsHubPage from "./pages/maison/OperationsHubPage";

const roleHome = {
  AdminKeToan: "/operations",
  NhanVien: "/operations",
  BanDieuHanh: "/operations",
  TinhNguyenVien: "/operations",
  NhaTaiTro: "/operations",
  BanQuanLy: "/operations"
};

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.VaiTro)) {
    // If not allowed, send to appropriate default route based on role
    return <Navigate to={roleHome[user.VaiTro] || "/operations"} replace />;
  }

  return children;
};

const HomeRedirect = () => {
  const { user } = useAuth();
  return <Navigate to={user ? (roleHome[user.VaiTro] || "/operations") : "/login"} replace />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          
          <Route path="/profile" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />
          
          <Route path="/notifications" element={
            <ProtectedRoute>
              <ThongBaoList />
            </ProtectedRoute>
          } />

          <Route path="/operations" element={
            <ProtectedRoute allowedRoles={["AdminKeToan", "NhanVien", "BanDieuHanh", "TinhNguyenVien", "NhaTaiTro", "BanQuanLy"]}>
              <OperationsHubPage />
            </ProtectedRoute>
          } />

          {/* Admin Routes */}
          <Route path="/staff/case-intake" element={
            <ProtectedRoute allowedRoles={["NhanVien", "BanDieuHanh", "AdminKeToan", "BanQuanLy"]}>
              <CaseIntakePage />
            </ProtectedRoute>
          } />
          <Route path="/admin/council-review" element={
            <ProtectedRoute allowedRoles={["BanDieuHanh", "AdminKeToan", "BanQuanLy"]}>
              <CouncilReviewPage />
            </ProtectedRoute>
          } />
          <Route path="/staff/training" element={
            <ProtectedRoute allowedRoles={["NhanVien", "BanDieuHanh", "AdminKeToan", "BanQuanLy"]}>
              <TrainingProgressPage />
            </ProtectedRoute>
          } />
          <Route path="/staff/inventory" element={
            <ProtectedRoute allowedRoles={["NhanVien", "BanDieuHanh", "AdminKeToan", "BanQuanLy"]}>
              <InventoryMaterialsPage />
            </ProtectedRoute>
          } />
          <Route path="/admin/donors" element={
            <ProtectedRoute allowedRoles={["AdminKeToan", "NhaTaiTro", "BanQuanLy"]}>
              <DonorLedgerPage />
            </ProtectedRoute>
          } />
          <Route path="/staff/volunteer-assignment" element={
            <ProtectedRoute allowedRoles={["NhanVien", "BanDieuHanh", "TinhNguyenVien", "AdminKeToan", "BanQuanLy"]}>
              <VolunteerAssignmentPage />
            </ProtectedRoute>
          } />
          <Route path="/admin/expense-approval" element={
            <ProtectedRoute allowedRoles={["NhanVien", "AdminKeToan", "BanDieuHanh", "BanQuanLy"]}>
              <ExpenseApprovalPage />
            </ProtectedRoute>
          } />
          <Route path="/admin/reconciliation" element={
            <ProtectedRoute allowedRoles={["AdminKeToan", "BanDieuHanh", "NhaTaiTro", "BanQuanLy"]}>
              <ReconciliationReportPage />
            </ProtectedRoute>
          } />
          <Route path="/admin/alerts" element={
            <ProtectedRoute allowedRoles={["NhanVien", "AdminKeToan", "BanDieuHanh", "BanQuanLy"]}>
              <AlertsReminderPage />
            </ProtectedRoute>
          } />
          <Route path="/admin/approve-volunteer" element={
            <ProtectedRoute allowedRoles={["AdminKeToan", "BanQuanLy"]}>
              <ApproveVolunteerPage />
            </ProtectedRoute>
          } />
          <Route path="/admin/create-campaign" element={
            <ProtectedRoute allowedRoles={["AdminKeToan", "BanQuanLy"]}>
              <CreateCampaignPage />
            </ProtectedRoute>
          } />
          <Route path="/admin/finance" element={
            <ProtectedRoute allowedRoles={["AdminKeToan", "BanQuanLy"]}>
              <SponsorshipDonationPage />
            </ProtectedRoute>
          } />
          <Route path="/admin/certification" element={
            <ProtectedRoute allowedRoles={["AdminKeToan", "BanQuanLy"]}>
              <CertificationPage />
            </ProtectedRoute>
          } />
          <Route path="/admin/analytics" element={
            <ProtectedRoute allowedRoles={["AdminKeToan", "BanDieuHanh", "BanQuanLy"]}>
              <AnalyticsDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/config" element={
            <ProtectedRoute allowedRoles={["AdminKeToan", "BanQuanLy"]}>
              <SystemConfigPage />
            </ProtectedRoute>
          } />
          <Route path="/admin/concurrency-demo" element={
            <ProtectedRoute allowedRoles={["AdminKeToan", "BanQuanLy"]}>
              <ConcurrencyDemoPage />
            </ProtectedRoute>
          } />

          {/* Executive Routes */}
          <Route path="/executive/dashboard" element={
            <ProtectedRoute allowedRoles={["BanDieuHanh"]}>
              <DashboardBDH />
            </ProtectedRoute>
          } />
          <Route path="/executive/approve-participation" element={
            <ProtectedRoute allowedRoles={["BanDieuHanh"]}>
              <ApproveParticipationPage />
            </ProtectedRoute>
          } />
          <Route path="/executive/attendance" element={
            <ProtectedRoute allowedRoles={["BanDieuHanh"]}>
              <AttendancePage />
            </ProtectedRoute>
          } />
          <Route path="/executive/logistics" element={
            <ProtectedRoute allowedRoles={["BanDieuHanh"]}>
              <LogisticsPage />
            </ProtectedRoute>
          } />
          <Route path="/executive/proof-review" element={
            <ProtectedRoute allowedRoles={["BanDieuHanh"]}>
              <ProofReviewPage />
            </ProtectedRoute>
          } />
          <Route path="/executive/evaluation" element={
            <ProtectedRoute allowedRoles={["BanDieuHanh"]}>
              <EvaluationPage />
            </ProtectedRoute>
          } />
          <Route path="/executive/finance" element={
            <ProtectedRoute allowedRoles={["BanDieuHanh"]}>
              <ExecutiveFinancePage />
            </ProtectedRoute>
          } />
          <Route path="/executive/task/:id" element={
            <ProtectedRoute allowedRoles={["BanDieuHanh"]}>
              <TaskDetailPage />
            </ProtectedRoute>
          } />

          {/* Volunteer Routes */}
          <Route path="/volunteer/dashboard" element={
            <ProtectedRoute allowedRoles={["TinhNguyenVien"]}>
              <DashboardTNV />
            </ProtectedRoute>
          } />
          <Route path="/volunteer/campaigns" element={
            <ProtectedRoute allowedRoles={["TinhNguyenVien"]}>
              <CampaignsPage />
            </ProtectedRoute>
          } />
          <Route path="/volunteer/campaigns/:id" element={
            <ProtectedRoute allowedRoles={["TinhNguyenVien"]}>
              <TrangChiTietChienDich />
            </ProtectedRoute>
          } />
          <Route path="/volunteer/history" element={
            <ProtectedRoute allowedRoles={["TinhNguyenVien"]}>
              <HistoryPage />
            </ProtectedRoute>
          } />
          <Route path="/volunteer/proof-upload" element={
            <ProtectedRoute allowedRoles={["TinhNguyenVien"]}>
              <ProofUploadPage />
            </ProtectedRoute>
          } />
          <Route path="/volunteer/certificates" element={
            <ProtectedRoute allowedRoles={["TinhNguyenVien"]}>
              <MyCertificatesPage />
            </ProtectedRoute>
          } />

          {/* Default Route */}
          <Route path="/" element={<HomeRedirect />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
