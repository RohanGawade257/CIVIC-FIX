import { Suspense, lazy } from "react";
import { Route, Routes } from "react-router-dom";

const HomePage = lazy(() => import("../pages/HomePage.jsx"));
const CreateReportPage = lazy(() => import("../pages/CreateReportPage.jsx"));
const LoginPage = lazy(() => import("../pages/LoginPage.jsx"));
const MyReportsPage = lazy(() => import("../pages/MyReportsPage.jsx"));
const NotFoundPage = lazy(() => import("../pages/NotFoundPage.jsx"));
const ProfilePage = lazy(() => import("../pages/ProfilePage.jsx"));
const ReportDetailPage = lazy(() => import("../pages/ReportDetailPage.jsx"));
const RegisterPage = lazy(() => import("../pages/RegisterPage.jsx"));
const AdminDashboardPage = lazy(() => import("../pages/AdminDashboardPage.jsx"));
const CivicFeedPage = lazy(() => import("../pages/CivicFeedPage.jsx"));

function AppRoutes() {
  return (
    <Suspense fallback={<main><p>Loading...</p></main>}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/admin" element={<AdminDashboardPage />} />
        <Route path="/feed" element={<CivicFeedPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/reports/my" element={<MyReportsPage />} />
        <Route path="/reports/new" element={<CreateReportPage />} />
        <Route path="/reports/:reportId" element={<ReportDetailPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}

export default AppRoutes;
