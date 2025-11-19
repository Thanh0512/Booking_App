import React, { useState } from 'react';
import { loginUser } from '../../api/userApi';
import { useNavigate } from 'react-router-dom';
import './login.css'
const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    onsole.log("Sending login data:", formData);
    try {
      const res = await loginUser(formData);
      console.log("Login response:", res.data); 
      localStorage.setItem('user', JSON.stringify(res.data.user));
      localStorage.setItem('token', res.data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng nhập thất bại');
    }
  };

  return (
    <div className="login">
      <div className="loginContainer">
        <h2 className="loginTitle">Login</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            className="loginInput"
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            className="loginInput"
            onChange={handleChange}
            required
          />
          <button type="submit" className="loginButton">
            Login
          </button>
        </form>
        <p className="loginText">
          Don't have an account? <a href="/register">Sign Up</a>
        </p>
      </div>
    </div>
  );
};

export default Login;
