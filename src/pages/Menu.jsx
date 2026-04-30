import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Menu() {
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  }

  const boxes = [
    { label: '发邮件', icon: '✉️', path: '/send-email', color: '#1976d2' },
    { label: '收件箱', icon: '📥', path: '/inbox', color: '#388e3c' },
    { label: '广告栏', icon: '📢', path: '/ads', color: '#f57c00' },
    { label: '个人主页', icon: '👤', path: '/profile', color: '#7b1fa2' },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#fff' }}>
      <header style={s.header}>
        <span style={s.headerTitle}>易信通，改变生活</span>
        <button style={s.headerBtn} onClick={() => navigate('/admin-login')}>后台</button>
      </header>

      <main style={s.main}>
        <div style={s.grid}>
          {boxes.map(b => (
            <div key={b.path} style={{ ...s.box, borderTop: `3px solid ${b.color}` }} onClick={() => navigate(b.path)}>
              <span style={s.icon}>{b.icon}</span>
              <span style={s.label}>{b.label}</span>
            </div>
          ))}
        </div>
        <button style={s.logoutBtn} onClick={handleLogout}>退出登录</button>
      </main>

      <footer style={s.footer}>
        开发者信息：水哥 | 联系方式：18563982192 | ICP备案号：
      </footer>
    </div>
  );
}

const s = {
  header: { background: '#bbdefb', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#0d47a1' },
  headerBtn: { padding: '6px 16px', background: '#1565c0', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 14 },
  main: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20 },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, maxWidth: 360, width: '100%' },
  box: { background: '#f5f5f5', borderRadius: 8, padding: '28px 16px', textAlign: 'center', cursor: 'pointer', transition: 'transform 0.15s' },
  icon: { fontSize: 36, display: 'block', marginBottom: 8 },
  label: { fontSize: 16, color: '#333' },
  logoutBtn: { marginTop: 30, padding: '10px 32px', background: '#eee', border: '1px solid #ccc', borderRadius: 6, cursor: 'pointer', fontSize: 14, color: '#666' },
  footer: { background: '#ffe0b2', padding: '12px 20px', textAlign: 'center', fontSize: 12, color: '#666' },
};
