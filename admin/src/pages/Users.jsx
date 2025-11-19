// src/pages/Users.jsx
import React, { useState, useEffect } from 'react';
import axios from '../axios';
import styles from './Users.module.css';
import Sidebar from '../components/Sidebar';
import { useNavigate } from 'react-router-dom';
const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) return navigate('/login');
    const fetchUsers = async () => {
      try {
        const res = await axios.get("/admin/users");
        setUsers(res.data);
      } catch (err) {
        setError('Không thể tải danh sách người dùng');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) {
    return <div className={styles.loading}>Đang tải...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <div className={styles.usersPage}>
      <Sidebar />
      <div className={styles.contentWrapper}>
        <div className={styles.header}>
          <h1 className={styles.title}>Quản Lý Người Dùng</h1>
          <p className={styles.subtitle}>
            Tổng: <strong>{users.length}</strong> người dùng
          </p>
        </div>

        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>#</th>
                <th>UserName</th>
                <th>Email</th>
                <th>Vai Trò</th>
                <th>Ngày Tạo</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan="5" className={styles.noData}>
                    Chưa có người dùng nào
                  </td>
                </tr>
              ) : (
                users.map((user, index) => (
                  <tr
                    key={user._id}
                    className={user.role === 'Admin' ? styles.adminRow : ''}
                  >
                    <td>{index + 1}</td>
                    <td className={styles.userName}>
                      <div className={styles.avatar}>
                        {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <span>{user.username || '—'}</span>
                    </td>
                    <td>{user.email}</td>
                    <td>
                      <span
                        className={`${styles.roleBadge} ${
                          user.role === 'Admin' ? styles.adminBadge : styles.userBadge
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td>{new Date(user.createdAt).toLocaleDateString('vi-VN')}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Users;