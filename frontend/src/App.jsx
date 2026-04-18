import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import AdminLayout from "./layouts/AdminLayout.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import FeeStructurePage from "./pages/FeeStructurePage.jsx";
import FeesPage from "./pages/FeesPage.jsx";
import HomePage from "./pages/HomePage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import SalariesPage from "./pages/SalariesPage.jsx";
import StaffPage from "./pages/StaffPage.jsx";
import StudentsPage from "./pages/StudentsPage.jsx";
import TeachersPage from "./pages/TeachersPage.jsx";

const App = () => (
  <Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/login" element={<LoginPage />} />

    <Route element={<ProtectedRoute />}>
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="students" element={<StudentsPage />} />
        <Route path="fees" element={<FeesPage />} />
        <Route path="fee-structure" element={<FeeStructurePage />} />
        <Route path="teachers" element={<TeachersPage />} />
        <Route path="staff" element={<StaffPage />} />
        <Route path="salaries" element={<SalariesPage />} />
      </Route>
    </Route>

    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default App;
