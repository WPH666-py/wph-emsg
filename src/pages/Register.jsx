import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { request } from '../api';

export default function Register() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');

  async function handleRegister(e) {
    e.preventDefault();
    setError(''); setMsg('');
    try {
      const data = await request('/api/register', {
        method: 'POST',
        body: JSON.stringify({ phone, password }),
      });
      setMsg(data.message);
      setTimeout(() => navigate('/login'), 1000);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div style={s.container}>
      <h2 style={s.title}>易信通 注册</h2>
      {error && <p style={s.error}>{error}</p>}
      {msg && <p style={s.msg}>{msg}</p>}
      <form onSubmit={handleRegister}>
        <input style={s.input} placeholder="手机号" value={phone} onChange={e => setPhone(e.target.value)} />
        <input style={s.input} type="password" placeholder="密码" value={password} onChange={e => setPassword(e.target.value)} />
        <button style={s.btn} type="submit">注册</button>
      </form>
      <div style={s.links}>
        <Link to="/login">已有账号？去登录</Link>
      </div>
    </div>
  );
}

const s = {
  container: { maxWidth: 400, margin: '60px auto', padding: 24 },
  title: { textAlign: 'center', marginBottom: 24, color: '#333' },
  input: { width: '100%', padding: 12, margin: '8px 0', border: '1px solid #ddd', borderRadius: 6, fontSize: 16, outline: 'none' },
  btn: { width: '100%', padding: 12, backgroundColor: '#388e3c', color: '#fff', border: 'none', borderRadius: 6, fontSize: 16, cursor: 'pointer', marginTop: 12 },
  links: { textAlign: 'center', marginTop: 16, fontSize: 14 },
  error: { color: '#d32f2f', textAlign: 'center', marginBottom: 8, fontSize: 14 },
  msg: { color: '#388e3c', textAlign: 'center', marginBottom: 8, fontSize: 14 },
};
