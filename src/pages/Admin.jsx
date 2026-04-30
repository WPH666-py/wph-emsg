import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminRequest } from '../api';

export default function Admin() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [ads, setAds] = useState([]);
  const [adText, setAdText] = useState('');
  const [adLink, setAdLink] = useState('');
  const [searchQ, setSearchQ] = useState('');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  useEffect(() => { loadUsers(); loadAds(); }, []);

  async function loadUsers() {
    try {
      const data = await adminRequest('/api/admin/users');
      setUsers(data);
    } catch (err) {
      setError(err.message);
    }
  }

  async function loadAds() {
    try {
      const data = await adminRequest('/api/ads');
      setAds(data);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleUploadAd(e) {
    e.preventDefault();
    setError(''); setMsg('');
    try {
      await adminRequest('/api/ads', { method: 'POST', body: JSON.stringify({ text: adText, link: adLink }) });
      setMsg('上传成功');
      setAdText(''); setAdLink('');
      loadAds();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDeleteAd(id) {
    if (!window.confirm('确定删除此广告？')) return;
    try {
      await adminRequest(`/api/ads/${id}`, { method: 'DELETE' });
      loadAds();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleSearchAds(e) {
    e.preventDefault();
    try {
      const data = await adminRequest(`/api/ads/search?q=${encodeURIComponent(searchQ)}`);
      setAds(data);
    } catch (err) {
      setError(err.message);
    }
  }

  function handleLogout() {
    localStorage.removeItem('adminToken');
    navigate('/menu');
  }

  return (
    <div style={s.wrapper}>
      <div style={s.sidebar}>
        <button style={s.backFront} onClick={handleLogout}>← 返回前台</button>
        <h3 style={s.sideTitle}>后台管理</h3>
        <button style={tab === 'users' ? s.tabActive : s.tab} onClick={() => setTab('users')}>用户信息</button>
        <button style={tab === 'ads' ? s.tabActive : s.tab} onClick={() => setTab('ads')}>广告管理</button>
      </div>
      <div style={s.content}>
        {error && <p style={s.error}>{error}</p>}
        {msg && <p style={s.msg}>{msg}</p>}
        {tab === 'users' ? (
          <div>
            <h3 style={s.sectionTitle}>用户信息</h3>
            <div style={s.tableWrap}>
              <table style={s.table}>
                <thead>
                  <tr><th>用户名</th><th>电话</th><th>密码(哈希)</th></tr>
                </thead>
                <tbody>
                  {users.map((u, i) => (
                    <tr key={i}><td>{u.username || '-'}</td><td>{u.phone}</td><td style={s.hash}>{u.password_hash?.slice(0, 20)}...</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div>
            <h3 style={s.sectionTitle}>广告管理</h3>
            <form style={s.uploadForm} onSubmit={handleUploadAd}>
              <input style={s.input} placeholder="广告文字" value={adText} onChange={e => setAdText(e.target.value)} />
              <input style={s.input} placeholder="链接（可选）" value={adLink} onChange={e => setAdLink(e.target.value)} />
              <button style={s.uploadBtn} type="submit">上传广告</button>
            </form>
            <form style={s.searchRow} onSubmit={handleSearchAds}>
              <input style={s.searchInput} placeholder="搜索广告" value={searchQ} onChange={e => setSearchQ(e.target.value)} />
              <button style={s.searchBtn} type="submit">搜索</button>
              <button style={s.resetBtn} type="button" onClick={() => { setSearchQ(''); loadAds(); }}>重置</button>
            </form>
            <div style={s.adList}>
              {ads.length === 0 && <p style={s.empty}>暂无广告</p>}
              {ads.map(ad => (
                <div key={ad.id} style={s.adItem}>
                  <div>
                    <p style={s.adText}>{ad.text}</p>
                    {ad.link && <p style={s.adLink}>链接：{ad.link}</p>}
                    <p style={s.adTime}>{new Date(ad.created_at).toLocaleString()}</p>
                  </div>
                  <button style={s.deleteBtn} onClick={() => handleDeleteAd(ad.id)}>删除</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const s = {
  wrapper: { display: 'flex', minHeight: '100vh' },
  sidebar: { width: 180, background: '#263238', color: '#fff', padding: '20px 0', flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' },
  backFront: { padding: '8px 16px', background: '#37474f', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 13, marginBottom: 20 },
  sideTitle: { fontSize: 16, marginBottom: 20, textAlign: 'center' },
  tab: { width: '80%', padding: '10px', background: 'transparent', color: '#b0bec5', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 14, marginBottom: 6, textAlign: 'left' },
  tabActive: { width: '80%', padding: '10px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 14, marginBottom: 6, textAlign: 'left' },
  content: { flex: 1, padding: 24, overflow: 'auto' },
  sectionTitle: { marginBottom: 16, color: '#333' },
  tableWrap: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 14 },
  hash: { fontSize: 12, color: '#999', wordBreak: 'break-all' },
  uploadForm: { display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' },
  input: { padding: 10, border: '1px solid #ddd', borderRadius: 6, fontSize: 14, outline: 'none', flex: 1, minWidth: 120 },
  uploadBtn: { padding: '10px 20px', background: '#388e3c', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' },
  searchRow: { display: 'flex', gap: 8, marginBottom: 16 },
  searchInput: { padding: 10, border: '1px solid #ddd', borderRadius: 6, fontSize: 14, outline: 'none', flex: 1 },
  searchBtn: { padding: '10px 16px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' },
  resetBtn: { padding: '10px 16px', background: '#eee', border: '1px solid #ddd', borderRadius: 6, cursor: 'pointer' },
  adList: { display: 'flex', flexDirection: 'column', gap: 10 },
  empty: { textAlign: 'center', color: '#999', padding: 30 },
  adItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', border: '1px solid #e0e0e0', borderRadius: 8, padding: 14 },
  adText: { fontSize: 14, color: '#333', marginBottom: 4 },
  adLink: { fontSize: 12, color: '#1976d2', marginBottom: 4 },
  adTime: { fontSize: 12, color: '#999' },
  deleteBtn: { padding: '6px 14px', background: '#ffebee', color: '#c62828', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 13, flexShrink: 0 },
  error: { color: '#d32f2f', marginBottom: 8, fontSize: 14 },
  msg: { color: '#388e3c', marginBottom: 8, fontSize: 14 },
};
