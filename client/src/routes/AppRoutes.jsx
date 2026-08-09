import { Route, Routes } from "react-router-dom";
import HomePage from "../pages/HomePage.jsx";
import CreateReportPage from "../pages/CreateReportPage.jsx";
import LoginPage from "../pages/LoginPage.jsx";
import MyReportsPage from "../pages/MyReportsPage.jsx";
import NotFoundPage from "../pages/NotFoundPage.jsx";
import ProfilePage from "../pages/ProfilePage.jsx";
import ReportDetailPage from "../pages/ReportDetailPage.jsx";
import RegisterPage from "../pages/RegisterPage.jsx";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/reports/my" element={<MyReportsPage />} />
      <Route path="/reports/new" element={<CreateReportPage />} />
      <Route path="/reports/:reportId" element={<ReportDetailPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default AppRoutes;
