import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { request } from '../api';

export default function Login() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [captcha, setCaptcha] = useState('');
  const [captchaSvg, setCaptchaSvg] = useState('');
  const [error, setError] = useState('');

  useEffect(() => { loadCaptcha(); }, []);

  async function loadCaptcha() {
    const res = await fetch('/api/captcha');
    setCaptchaSvg(await res.text());
  }

  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    try {
      const data = await request('/api/login', {
        method: 'POST',
        body: JSON.stringify({ phone, password, captcha }),
      });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/menu');
    } catch (err) {
      setError(err.message);
      setCaptcha('');
      loadCaptcha();
    }
  }

  return (
    <div style={s.container}>
      <h2 style={s.title}>易信通 登录</h2>
      {error && <p style={s.error}>{error}</p>}
      <form onSubmit={handleLogin}>
        <input style={s.input} placeholder="手机号" value={phone} onChange={e => setPhone(e.target.value)} />
        <input style={s.input} type="password" placeholder="密码" value={password} onChange={e => setPassword(e.target.value)} />
        <div style={s.captchaRow}>
          <input style={{ ...s.input, flex: 1, marginBottom: 0 }} placeholder="验证码" value={captcha} onChange={e => setCaptcha(e.target.value)} />
          <div style={s.captchaImg} onClick={loadCaptcha} dangerouslySetInnerHTML={{ __html: captchaSvg }} title="点击刷新" />
        </div>
        <button style={s.btn} type="submit">登录</button>
      </form>
      <div style={s.links}>
        <Link to="/register">注册账号</Link>
        <Link to="/reset-password">忘记密码</Link>
      </div>
    </div>
  );
}

const s = {
  container: { maxWidth: 400, margin: '60px auto', padding: 24 },
  title: { textAlign: 'center', marginBottom: 24, color: '#333' },
  input: { width: '100%', padding: 12, margin: '8px 0', border: '1px solid #ddd', borderRadius: 6, fontSize: 16, outline: 'none' },
  captchaRow: { display: 'flex', alignItems: 'center', gap: 10, margin: '8px 0' },
  captchaImg: { cursor: 'pointer', height: 40, flexShrink: 0 },
  btn: { width: '100%', padding: 12, backgroundColor: '#1976d2', color: '#fff', border: 'none', borderRadius: 6, fontSize: 16, cursor: 'pointer', marginTop: 12 },
  links: { display: 'flex', justifyContent: 'space-between', marginTop: 16, fontSize: 14 },
  error: { color: '#d32f2f', textAlign: 'center', marginBottom: 8, fontSize: 14 },
};
