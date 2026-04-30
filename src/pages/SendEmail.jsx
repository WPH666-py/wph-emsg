import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { request } from '../api';

export default function SendEmail() {
  const navigate = useNavigate();
  const [receiverPhone, setReceiverPhone] = useState('');
  const [content, setContent] = useState('');
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');

  async function handleSend(e) {
    e.preventDefault();
    setError(''); setMsg('');
    if (!receiverPhone || !content.trim()) {
      setError('请填写收件人号码和内容');
      return;
    }
    try {
      const formData = new FormData();
      formData.append('receiverPhone', receiverPhone);
      formData.append('content', content);
      if (file) formData.append('attachment', file);
      await request('/api/emails', { method: 'POST', body: formData });
      setMsg('发送成功');
      setReceiverPhone(''); setContent(''); setFile(null);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div style={s.container}>
      <div style={s.nav}>
        <button style={s.backBtn} onClick={() => navigate('/menu')}>← 返回</button>
        <h3 style={{ margin: 0 }}>发邮件</h3>
      </div>
      {error && <p style={s.error}>{error}</p>}
      {msg && <p style={s.msg}>{msg}</p>}
      <form onSubmit={handleSend}>
        <input style={s.input} placeholder="收件人手机号" value={receiverPhone} onChange={e => setReceiverPhone(e.target.value)} />
        <textarea style={s.textarea} placeholder="邮件内容" rows={6} value={content} onChange={e => setContent(e.target.value)} />
        <div style={s.fileRow}>
          <label style={s.fileLabel}>
            选择附件
            <input type="file" style={{ display: 'none' }} accept=".docx,.pdf,.png,.xlsx,.ppt,.txt,.zip" onChange={e => setFile(e.target.files[0])} />
          </label>
          {file && <span style={s.fileName}>{file.name}</span>}
        </div>
        <button style={s.btn} type="submit">确认发送</button>
      </form>
    </div>
  );
}

const s = {
  container: { maxWidth: 500, margin: '0 auto', padding: 20 },
  nav: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 },
  backBtn: { padding: '6px 12px', background: '#eee', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 14 },
  input: { width: '100%', padding: 12, margin: '8px 0', border: '1px solid #ddd', borderRadius: 6, fontSize: 16, outline: 'none' },
  textarea: { width: '100%', padding: 12, margin: '8px 0', border: '1px solid #ddd', borderRadius: 6, fontSize: 16, outline: 'none', resize: 'vertical' },
  fileRow: { display: 'flex', alignItems: 'center', gap: 10, margin: '8px 0' },
  fileLabel: { padding: '8px 16px', background: '#eee', border: '1px solid #ddd', borderRadius: 6, cursor: 'pointer', fontSize: 14 },
  fileName: { fontSize: 13, color: '#666', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 200 },
  btn: { width: '100%', padding: 12, backgroundColor: '#1976d2', color: '#fff', border: 'none', borderRadius: 6, fontSize: 16, cursor: 'pointer', marginTop: 12 },
  error: { color: '#d32f2f', marginBottom: 8, fontSize: 14 },
  msg: { color: '#388e3c', marginBottom: 8, fontSize: 14 },
};
