const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');

async function login(req, res) {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'பயனர் பெயர் மற்றும் கடவுச்சொல் தேவை.' });
    }

    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );
    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'தவறான பயனர் பெயர் அல்லது கடவுச்சொல்.' });
    }

    const user = rows[0];
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ success: false, message: 'தவறான பயனர் பெயர் அல்லது கடவுச்சொல்.' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      success: true,
      message: 'வெற்றிகரமாக உள்நுழைந்தீர்கள்.',
      token,
      user: { id: user.id, username: user.username, name: user.name },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'சேவை பிழை. மீண்டும் முயற்சிக்கவும்.' });
  }
}

async function changePassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'தேவையான தகவல்கள் இல்லை.' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'கடவுச்சொல் குறைந்தது 6 எழுத்துகள் வேண்டும்.' });
    }

    const [rows] = await pool.execute('SELECT * FROM users WHERE id = ?', [userId]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'பயனர் கிடைக்கவில்லை.' });

    const user = rows[0];
    const isValid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isValid) return res.status(401).json({ success: false, message: 'தற்போதைய கடவுச்சொல் தவறு.' });

    const hash = await bcrypt.hash(newPassword, 10);
    await pool.execute('UPDATE users SET password_hash = ? WHERE id = ?', [hash, userId]);

    res.json({ success: true, message: 'கடவுச்சொல் மாற்றப்பட்டது.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'சேவை பிழை.' });
  }
}

module.exports = { login, changePassword };
