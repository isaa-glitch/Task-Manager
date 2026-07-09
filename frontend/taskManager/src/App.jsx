import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AuthPage from "./components/authPage";
import Dashboard from "./components/DashBoard";
// import ResetPassword from "./ResetPassword";
import Hidden from "./components/Hidden";
import "./App.css";
import ForgotPassword from "./components/ForgotPassword";
import ChangePassword from "./components/ChangePassword";
import LoginInfo from "./components/loginInfo";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<AuthPage isLogin={true} />} />
        <Route path="/signup" element={<AuthPage isLogin={false} />} />
        {/* <Route path="/reset-password" element={<ResetPassword />} /> */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/hidden" element={<Hidden />} />
        <Route path="/reset-password" element={<ForgotPassword />} />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/LoginInfo" element={<LoginInfo />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
