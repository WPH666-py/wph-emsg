import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { request } from '../api';

export default function Inbox() {
  const navigate = useNavigate();
  const [emails, setEmails] = useState([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => { loadEmails(); }, []);

  async function loadEmails(q) {
    try {
      const url = q ? `/api/emails/inbox?q=${encodeURIComponent(q)}` : '/api/emails/inbox';
      const data = await request(url);
      setEmails(data);
    } catch (err) {
      setError(err.message);
    }
  }

  function handleSearch(e) {
    e.preventDefault();
    loadEmails(search);
  }

  async function handleDelete(id) {
    if (!window.confirm('确定删除此邮件？')) return;
    try {
      await request(`/api/emails/${id}`, { method: 'DELETE' });
      setEmails(prev => prev.filter(e => e.id !== id));
      if (selected?.id === id) setSelected(null);
    } catch (err) {
      setError(err.message);
    }
  }

  function handleDownload(id) {
    window.open(`/api/emails/${id}/download`, '_blank');
  }

  return (
    <div style={s.container}>
      <div style={s.nav}>
        <button style={s.backBtn} onClick={() => navigate('/menu')}>← 返回</button>
        <h3 style={{ margin: 0 }}>收件箱</h3>
      </div>
      {error && <p style={s.error}>{error}</p>}
      <form style={s.searchRow} onSubmit={handleSearch}>
        <input style={s.searchInput} placeholder="搜索邮件" value={search} onChange={e => setSearch(e.target.value)} />
        <button style={s.searchBtn} type="submit">搜索</button>
      </form>
      {selected ? (
        <div style={s.detail}>
          <button style={s.backBtn} onClick={() => setSelected(null)}>← 返回列表</button>
          <p style={s.meta}>发件人：{selected.sender_phone}</p>
          <p style={s.meta}>时间：{new Date(selected.created_at).toLocaleString()}</p>
          <div style={s.content}>{selected.content}</div>
          {selected.attachment && (
            <button style={s.downloadBtn} onClick={() => handleDownload(selected.id)}>下载附件</button>
          )}
          <button style={s.deleteBtn} onClick={() => handleDelete(selected.id)}>删除邮件</button>
        </div>
      ) : (
        <div style={s.list}>
          {emails.length === 0 && <p style={s.empty}>暂无邮件</p>}
          {emails.map(e => (
            <div key={e.id} style={s.item} onClick={() => setSelected(e)}>
              <div style={s.itemTop}>
                <span style={s.sender}>{e.sender_phone}</span>
                <span style={s.time}>{new Date(e.created_at).toLocaleString()}</span>
              </div>
              <div style={s.itemContent}>{e.content.length > 50 ? e.content.slice(0, 50) + '...' : e.content}</div>
              <button style={s.itemDeleteBtn} onClick={ev => { ev.stopPropagation(); handleDelete(e.id); }}>删除</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const s = {
  container: { maxWidth: 600, margin: '0 auto', padding: 20 },
  nav: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 },
  backBtn: { padding: '6px 12px', background: '#eee', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 14 },
  searchRow: { display: 'flex', gap: 8, marginBottom: 16 },
  searchInput: { flex: 1, padding: 10, border: '1px solid #ddd', borderRadius: 6, fontSize: 14, outline: 'none' },
  searchBtn: { padding: '10px 16px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' },
  list: { display: 'flex', flexDirection: 'column', gap: 10 },
  empty: { textAlign: 'center', color: '#999', padding: 40 },
  item: { background: '#fff', border: '1px solid #e0e0e0', borderRadius: 8, padding: 14, cursor: 'pointer', position: 'relative' },
  itemTop: { display: 'flex', justifyContent: 'space-between', marginBottom: 6 },
  sender: { fontWeight: 'bold', fontSize: 14, color: '#333' },
  time: { fontSize: 12, color: '#999' },
  itemContent: { fontSize: 14, color: '#555', lineHeight: 1.5 },
  itemDeleteBtn: { position: 'absolute', top: 10, right: 10, padding: '4px 10px', background: '#ffebee', color: '#c62828', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12 },
  detail: { background: '#fff', border: '1px solid #e0e0e0', borderRadius: 8, padding: 20 },
  meta: { fontSize: 14, color: '#666', marginBottom: 6 },
  content: { padding: 16, background: '#fafafa', borderRadius: 6, margin: '12px 0', lineHeight: 1.6, whiteSpace: 'pre-wrap' },
  downloadBtn: { padding: '8px 16px', background: '#388e3c', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', marginRight: 10 },
  deleteBtn: { padding: '8px 16px', background: '#d32f2f', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' },
  error: { color: '#d32f2f', marginBottom: 8, fontSize: 14 },
};
