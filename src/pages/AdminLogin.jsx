import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { request } from '../api';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    try {
      const data = await request('/api/admin/login', {
        method: 'POST',
        body: JSON.stringify({ password }),
      });
      localStorage.setItem('adminToken', data.token);
      navigate('/admin');
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div style={s.container}>
      <h2 style={s.title}>后台管理登录</h2>
      {error && <p style={s.error}>{error}</p>}
      <form onSubmit={handleLogin}>
        <input style={s.input} type="password" placeholder="管理员密码" value={password} onChange={e => setPassword(e.target.value)} />
        <button style={s.btn} type="submit">登录</button>
      </form>
      <div style={s.links}>
        <Link to="/menu">返回前台</Link>
      </div>
    </div>
  );
}

const s = {
  container: { maxWidth: 400, margin: '60px auto', padding: 24 },
  title: { textAlign: 'center', marginBottom: 24, color: '#333' },
  input: { width: '100%', padding: 12, margin: '8px 0', border: '1px solid #ddd', borderRadius: 6, fontSize: 16, outline: 'none' },
  btn: { width: '100%', padding: 12, backgroundColor: '#c62828', color: '#fff', border: 'none', borderRadius: 6, fontSize: 16, cursor: 'pointer', marginTop: 12 },
  links: { textAlign: 'center', marginTop: 16, fontSize: 14 },
  error: { color: '#d32f2f', textAlign: 'center', marginBottom: 8, fontSize: 14 },
};
