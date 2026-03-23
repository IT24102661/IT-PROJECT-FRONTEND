import { Navigate, Route, Routes } from "react-router-dom";

import Home from "./pages/Home";
import TrainersPage from "./pages/TrainersPage";
import BookPage from "./pages/BookPage";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import TrainerRegister from "./pages/TrainerRegister";
import Logout from "./pages/Logout";
import LoginChoice from "./pages/LoginChoice";
import JoinPage from "./pages/JoinPage";
import MemberRegister  from "./pages/MemberRegister";
import MemberDashboard from "./pages/MemberDashboard";
import MarkAttendance from "./pages/MarkAttendance";


function getAdminAuth() {
  try { return JSON.parse(localStorage.getItem("rf_admin_auth")); }
  catch { return null; }
}

function RequireAdmin({ children }) {
  const auth = getAdminAuth();
  if (!auth?.token) return <Navigate to="/admin-login" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/"               element={<Home />} />
      <Route path="/join" element={<JoinPage />} />
      <Route path="/member-register"    element={<MemberRegister />} />
      <Route path="/my-profile/:memberId" element={<MemberDashboard />} />
      <Route path="/mark-attendance" element={<MarkAttendance />} />
      <Route path="/trainers"       element={<TrainersPage />} />
      <Route path="/book/:trainerId" element={<BookPage />} />
      <Route path="/trainer-register" element={<TrainerRegister />} />
      <Route path="/admin-login"    element={<AdminLogin />} />
      <Route path="/login"          element={<LoginChoice />} />
      <Route path="/logout"         element={<Logout />} />
      <Route path="/admin" element={
        <RequireAdmin><AdminDashboard /></RequireAdmin>
      }/>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}