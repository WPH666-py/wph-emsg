import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { request } from '../api';

export default function Profile() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [username, setUsername] = useState('');
  const [gender, setGender] = useState('');
  const [province, setProvince] = useState('');
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => { loadProfile(); }, []);

  async function loadProfile() {
    try {
      const data = await request('/api/user/profile');
      setPhone(data.phone);
      setUsername(data.username);
      setGender(data.gender);
      setProvince(data.province);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    setError(''); setMsg('');
    try {
      await request('/api/user/profile', {
        method: 'PUT',
        body: JSON.stringify({ username, gender, province }),
      });
      setMsg('更新成功');
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div style={s.container}>
      <div style={s.nav}>
        <button style={s.backBtn} onClick={() => navigate('/menu')}>← 返回</button>
        <h3 style={{ margin: 0 }}>个人主页</h3>
      </div>
      {error && <p style={s.error}>{error}</p>}
      {msg && <p style={s.msg}>{msg}</p>}
      <form onSubmit={handleSave}>
        <label style={s.label}>手机号（不可改）</label>
        <input style={s.inputDisabled} value={phone} disabled />
        <label style={s.label}>登录密码（不可改）</label>
        <input style={s.inputDisabled} value="******" disabled />
        <label style={s.label}>用户名</label>
        <input style={s.input} value={username} onChange={e => setUsername(e.target.value)} placeholder="请输入用户名" />
        <label style={s.label}>性别</label>
        <select style={s.input} value={gender} onChange={e => setGender(e.target.value)}>
          <option value="">请选择</option>
          <option value="男">男</option>
          <option value="女">女</option>
        </select>
        <label style={s.label}>所在省份</label>
        <input style={s.input} value={province} onChange={e => setProvince(e.target.value)} placeholder="请输入省份" />
        <button style={s.btn} type="submit">保存修改</button>
      </form>
    </div>
  );
}

const s = {
  container: { maxWidth: 400, margin: '0 auto', padding: 20 },
  nav: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 },
  backBtn: { padding: '6px 12px', background: '#eee', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 14 },
  label: { display: 'block', fontSize: 14, color: '#666', marginTop: 12, marginBottom: 4 },
  input: { width: '100%', padding: 10, border: '1px solid #ddd', borderRadius: 6, fontSize: 15, outline: 'none' },
  inputDisabled: { width: '100%', padding: 10, border: '1px solid #eee', borderRadius: 6, fontSize: 15, background: '#f5f5f5', color: '#999' },
  btn: { width: '100%', padding: 12, backgroundColor: '#7b1fa2', color: '#fff', border: 'none', borderRadius: 6, fontSize: 16, cursor: 'pointer', marginTop: 20 },
  error: { color: '#d32f2f', marginBottom: 8, fontSize: 14 },
  msg: { color: '#388e3c', marginBottom: 8, fontSize: 14 },
};
