import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { request } from '../api';

export default function Ads() {
  const navigate = useNavigate();
  const [ads, setAds] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => { loadAds(); }, []);

  async function loadAds() {
    try {
      const data = await request('/api/ads');
      setAds(data);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div style={s.container}>
      <div style={s.nav}>
        <button style={s.backBtn} onClick={() => navigate('/menu')}>← 返回</button>
        <h3 style={{ margin: 0 }}>广告栏</h3>
      </div>
      {error && <p style={s.error}>{error}</p>}
      {ads.length === 0 && <p style={s.empty}>暂无广告</p>}
      <div style={s.list}>
        {ads.map(ad => (
          <div key={ad.id} style={s.item}>
            <p style={s.text}>{ad.text}</p>
            {ad.link && <a href={ad.link} target="_blank" rel="noreferrer" style={s.link}>查看链接</a>}
            <span style={s.time}>{new Date(ad.created_at).toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const s = {
  container: { maxWidth: 600, margin: '0 auto', padding: 20 },
  nav: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 },
  backBtn: { padding: '6px 12px', background: '#eee', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 14 },
  empty: { textAlign: 'center', color: '#999', padding: 40 },
  list: { display: 'flex', flexDirection: 'column', gap: 12 },
  item: { background: '#fff', border: '1px solid #e0e0e0', borderRadius: 8, padding: 16 },
  text: { fontSize: 15, color: '#333', lineHeight: 1.6, marginBottom: 8 },
  link: { fontSize: 13, color: '#1976d2', marginRight: 16 },
  time: { fontSize: 12, color: '#999' },
  error: { color: '#d32f2f', marginBottom: 8, fontSize: 14 },
};
