import React, { useState } from 'react';
import { registerUser } from '../../api/userApi';
import { useNavigate } from 'react-router-dom';
import './register.css';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await registerUser(formData);
      alert(res.data.message || 'Đăng ký thành công!');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng ký thất bại');
    }
  };

  return (
    <div className="register">
      <div className="registerContainer">
        <h2 className="registerTitle">Sign Up</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder='Enter Email'
            className="registerInput"
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Enter Password"
            className="registerInput"
            onChange={handleChange}
            required
          />
          {error && <p className="registerError">{error}</p>}
          <button type="submit" className="registerButton">
            Creat Account
          </button>
        </form>
        <p className="registerText">
          
Already have an account? <a href="/login">Login</a>
        </p>
      </div>
    </div>
  );
};

export default Register;
