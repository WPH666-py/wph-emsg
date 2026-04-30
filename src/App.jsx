import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import ResetPassword from './pages/ResetPassword';
import Menu from './pages/Menu';
import SendEmail from './pages/SendEmail';
import Inbox from './pages/Inbox';
import Ads from './pages/Ads';
import Profile from './pages/Profile';
import AdminLogin from './pages/AdminLogin';
import Admin from './pages/Admin';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/menu" element={<Menu />} />
      <Route path="/send-email" element={<SendEmail />} />
      <Route path="/inbox" element={<Inbox />} />
      <Route path="/ads" element={<Ads />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/admin-login" element={<AdminLogin />} />
      <Route path="/admin" element={<Admin />} />
    </Routes>
  );
}
