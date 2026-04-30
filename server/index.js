const express = require('express');
const cors = require('cors');
const session = require('express-session');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { pool, initDB } = require('./db');
const { initKafka, sendEmailMessage } = require('./kafka');

const app = express();
const PORT = 3012;
const JWT_SECRET = 'emsg-jwt-secret-2024';

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'emsg-session-secret',
  resave: false,
  saveUninitialized: true,
  cookie: { sameSite: 'lax' },
}));

const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
app.use('/uploads', express.static(uploadsDir));

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + Buffer.from(file.originalname, 'latin1').toString('utf8')),
});
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowed = ['.docx', '.pdf', '.png', '.xlsx', '.ppt', '.txt', '.zip'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error('不支持的文件类型'));
  },
});

function generateCaptcha() {
  const digits = '23456789';
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower = 'abcdefghjkmnpqrstuvwxyz';
  let chars = '';
  chars += digits[Math.floor(Math.random() * digits.length)];
  chars += upper[Math.floor(Math.random() * upper.length)];
  chars += lower[Math.floor(Math.random() * lower.length)];
  const all = digits + upper + lower;
  chars += all[Math.floor(Math.random() * all.length)];
  return chars.split('').sort(() => Math.random() - 0.5).join('');
}

function createCaptchaSvg(text) {
  const colors = ['#c00', '#090', '#009', '#960', '#609', '#069'];
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="40" style="background:#eee;border-radius:4px">`;
  for (let i = 0; i < 3; i++) {
    svg += `<line x1="${Math.random()*120}" y1="${Math.random()*40}" x2="${Math.random()*120}" y2="${Math.random()*40}" stroke="#bbb" stroke-width="1"/>`;
  }
  for (let i = 0; i < text.length; i++) {
    const x = 15 + i * 26;
    const y = 28 + (Math.random() * 8 - 4);
    const color = colors[Math.floor(Math.random() * colors.length)];
    const rotate = Math.random() * 20 - 10;
    svg += `<text x="${x}" y="${y}" fill="${color}" font-size="22" font-weight="bold" font-family="monospace" transform="rotate(${rotate} ${x} ${y})">${text[i]}</text>`;
  }
  svg += `</svg>`;
  return svg;
}

function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: '未登录' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'token无效' });
  }
}

function adminMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: '未登录' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded.isAdmin) return res.status(403).json({ error: '无权限' });
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'token无效' });
  }
}

app.get('/api/captcha', (req, res) => {
  const text = generateCaptcha();
  req.session.captcha = text;
  res.type('svg').send(createCaptchaSvg(text));
});

app.post('/api/register', async (req, res) => {
  try {
    const { phone, password } = req.body;
    if (!phone || !password) return res.status(400).json({ error: '请填写完整信息' });
    const hash = await bcrypt.hash(password, 10);
    await pool.execute('INSERT INTO users (phone, password_hash) VALUES (?, ?)', [phone, hash]);
    res.json({ message: '注册成功' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ error: '该手机号已注册' });
    res.status(500).json({ error: '注册失败' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { phone, password, captcha } = req.body;
    if (!phone || !password || !captcha) return res.status(400).json({ error: '请填写完整信息' });
    if (!req.session.captcha || captcha.toLowerCase() !== req.session.captcha.toLowerCase()) {
      return res.status(400).json({ error: '验证码错误' });
    }
    req.session.captcha = null;
    const [rows] = await pool.execute('SELECT * FROM users WHERE phone = ?', [phone]);
    if (rows.length === 0) return res.status(400).json({ error: '用户不存在' });
    const user = rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(400).json({ error: '密码错误' });
    const token = jwt.sign({ id: user.id, phone: user.phone }, JWT_SECRET, { expiresIn: '7d' });
    res.json({
      token,
      user: { id: user.id, phone: user.phone, username: user.username, gender: user.gender, province: user.province },
    });
  } catch (err) {
    res.status(500).json({ error: '登录失败' });
  }
});

app.post('/api/reset-password', async (req, res) => {
  try {
    const { phone, newPassword, confirmPassword } = req.body;
    if (!phone || !newPassword || !confirmPassword) return res.status(400).json({ error: '请填写完整信息' });
    if (newPassword !== confirmPassword) return res.status(400).json({ error: '两次密码不一致' });
    const [rows] = await pool.execute('SELECT id FROM users WHERE phone = ?', [phone]);
    if (rows.length === 0) return res.status(400).json({ error: '用户不存在' });
    const hash = await bcrypt.hash(newPassword, 10);
    await pool.execute('UPDATE users SET password_hash = ? WHERE phone = ?', [hash, phone]);
    res.json({ message: '密码重置成功' });
  } catch (err) {
    res.status(500).json({ error: '重置失败' });
  }
});

app.post('/api/emails', authMiddleware, upload.single('attachment'), async (req, res) => {
  try {
    const { receiverPhone, content } = req.body;
    if (!receiverPhone || !content) return res.status(400).json({ error: '请填写完整信息' });
    const [rows] = await pool.execute('SELECT id FROM users WHERE phone = ?', [receiverPhone]);
    if (rows.length === 0) return res.status(400).json({ error: '收件方不存在' });
    const attachment = req.file ? req.file.filename : null;
    await sendEmailMessage({ senderPhone: req.user.phone, receiverPhone, content, attachment });
    res.json({ message: '发送成功' });
  } catch (err) {
    res.status(500).json({ error: '发送失败' });
  }
});

app.get('/api/emails/inbox', authMiddleware, async (req, res) => {
  try {
    const { q } = req.query;
    let rows;
    if (q) {
      [rows] = await pool.execute(
        'SELECT * FROM emails WHERE receiver_phone = ? AND (content LIKE ? OR sender_phone LIKE ?) ORDER BY created_at DESC',
        [req.user.phone, `%${q}%`, `%${q}%`]
      );
    } else {
      [rows] = await pool.execute(
        'SELECT * FROM emails WHERE receiver_phone = ? ORDER BY created_at DESC',
        [req.user.phone]
      );
    }
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: '获取失败' });
  }
});

app.get('/api/emails/:id', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM emails WHERE id = ? AND receiver_phone = ?', [req.params.id, req.user.phone]);
    if (rows.length === 0) return res.status(404).json({ error: '邮件不存在' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: '获取失败' });
  }
});

app.delete('/api/emails/:id', authMiddleware, async (req, res) => {
  try {
    const [result] = await pool.execute('DELETE FROM emails WHERE id = ? AND receiver_phone = ?', [req.params.id, req.user.phone]);
    if (result.affectedRows === 0) return res.status(404).json({ error: '邮件不存在' });
    res.json({ message: '删除成功' });
  } catch (err) {
    res.status(500).json({ error: '删除失败' });
  }
});

app.get('/api/emails/:id/download', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT attachment FROM emails WHERE id = ? AND (receiver_phone = ? OR sender_phone = ?)', [req.params.id, req.user.phone, req.user.phone]);
    if (rows.length === 0 || !rows[0].attachment) return res.status(404).json({ error: '附件不存在' });
    const filePath = path.join(uploadsDir, rows[0].attachment);
    if (!fs.existsSync(filePath)) return res.status(404).json({ error: '文件已丢失' });
    res.download(filePath);
  } catch (err) {
    res.status(500).json({ error: '下载失败' });
  }
});

app.get('/api/user/profile', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT phone, username, gender, province FROM users WHERE id = ?', [req.user.id]);
    if (rows.length === 0) return res.status(404).json({ error: '用户不存在' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: '获取失败' });
  }
});

app.put('/api/user/profile', authMiddleware, async (req, res) => {
  try {
    const { username, gender, province } = req.body;
    await pool.execute('UPDATE users SET username = ?, gender = ?, province = ? WHERE id = ?', [username || '', gender || '', province || '', req.user.id]);
    res.json({ message: '更新成功' });
  } catch (err) {
    res.status(500).json({ error: '更新失败' });
  }
});

app.get('/api/ads', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM ads ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: '获取失败' });
  }
});

app.post('/api/ads', adminMiddleware, async (req, res) => {
  try {
    const { text, link } = req.body;
    if (!text) return res.status(400).json({ error: '请输入广告内容' });
    await pool.execute('INSERT INTO ads (text, link) VALUES (?, ?)', [text, link || '']);
    res.json({ message: '上传成功' });
  } catch (err) {
    res.status(500).json({ error: '上传失败' });
  }
});

app.delete('/api/ads/:id', adminMiddleware, async (req, res) => {
  try {
    await pool.execute('DELETE FROM ads WHERE id = ?', [req.params.id]);
    res.json({ message: '删除成功' });
  } catch (err) {
    res.status(500).json({ error: '删除失败' });
  }
});

app.get('/api/ads/search', adminMiddleware, async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json([]);
    const [rows] = await pool.execute('SELECT * FROM ads WHERE text LIKE ? ORDER BY created_at DESC', [`%${q}%`]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: '搜索失败' });
  }
});

app.post('/api/admin/login', async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) return res.status(400).json({ error: '请输入密码' });
    const [rows] = await pool.execute('SELECT * FROM admin LIMIT 1');
    if (rows.length === 0) return res.status(400).json({ error: '管理员不存在' });
    const match = await bcrypt.compare(password, rows[0].password_hash);
    if (!match) return res.status(400).json({ error: '密码错误' });
    const token = jwt.sign({ isAdmin: true }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: '登录失败' });
  }
});

app.get('/api/admin/users', adminMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT username, phone, password_hash FROM users');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: '获取失败' });
  }
});

const distPath = path.join(__dirname, '..', 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

async function start() {
  await initDB();
  await initKafka();
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
}

start();
