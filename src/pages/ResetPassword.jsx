import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { request } from '../api';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');

  async function handleReset(e) {
    e.preventDefault();
    setError(''); setMsg('');
    try {
      const data = await request('/api/reset-password', {
        method: 'POST',
        body: JSON.stringify({ phone, newPassword, confirmPassword }),
      });
      setMsg(data.message);
      setTimeout(() => navigate('/login'), 1000);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div style={s.container}>
      <h2 style={s.title}>重置密码</h2>
      {error && <p style={s.error}>{error}</p>}
      {msg && <p style={s.msg}>{msg}</p>}
      <form onSubmit={handleReset}>
        <input style={s.input} placeholder="手机号" value={phone} onChange={e => setPhone(e.target.value)} />
        <input style={s.input} type="password" placeholder="新密码" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
        <input style={s.input} type="password" placeholder="确认新密码" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
        <button style={s.btn} type="submit">重置密码</button>
      </form>
      <div style={s.links}>
        <Link to="/login">返回登录</Link>
      </div>
    </div>
  );
}

const s = {
  container: { maxWidth: 400, margin: '60px auto', padding: 24 },
  title: { textAlign: 'center', marginBottom: 24, color: '#333' },
  input: { width: '100%', padding: 12, margin: '8px 0', border: '1px solid #ddd', borderRadius: 6, fontSize: 16, outline: 'none' },
  btn: { width: '100%', padding: 12, backgroundColor: '#f57c00', color: '#fff', border: 'none', borderRadius: 6, fontSize: 16, cursor: 'pointer', marginTop: 12 },
  links: { textAlign: 'center', marginTop: 16, fontSize: 14 },
  error: { color: '#d32f2f', textAlign: 'center', marginBottom: 8, fontSize: 14 },
  msg: { color: '#388e3c', textAlign: 'center', marginBottom: 8, fontSize: 14 },
};
