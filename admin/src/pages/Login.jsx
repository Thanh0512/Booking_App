import React, { useState } from 'react';
import axios from '../axios';
import { useNavigate } from 'react-router-dom';
import styles from './Login.module.css';



const Login = () => {
  const [form, setForm] = useState({ email: 'admin@mail.com', password: '1' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();


const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setLoading(true);
  try {
    const res = await axios.post('/admin/login', form);
    
   
    const token = res.data.token;
    if (!token) throw new Error('Không nhận được token');

    localStorage.setItem('token', token);
    console.log('TOKEN SAVED:', token); // DEBUG

    navigate('/dashboard');
  } catch (err) {
    console.error('LOGIN ERROR:', err.response?.data);
    setError(err.response?.data?.message || 'Đăng nhập thất bại');
  } finally {
    setLoading(false);
  }
};

  return (
    <div className={styles.container}>
      <div className={styles.form}>
        <h2>Admin Login</h2>
        {error && <p className={styles.error}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            className={styles.input}
            required
            disabled={loading}
          />
          <input
            type="password"
            placeholder="Mật khẩu"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            className={styles.input}
            required
            disabled={loading}
          />
          <button type="submit" className={styles.btn} disabled={loading}>
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
