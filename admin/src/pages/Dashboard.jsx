// admin/src/pages/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import InfoBoard from '../components/InfoBoard';
import TransactionTable from '../components/TransactionTable';
import styles from './Dashboard.module.css';

const API_BASE = 'http://localhost:5000/api/admin';

const Dashboard = () => {
  const [info, setInfo] = useState({});
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) return navigate('/login');

    const fetchData = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const [infoRes, transRes] = await Promise.all([
          axios.get(`${API_BASE}/infoboard`, { headers }),
          axios.get(`${API_BASE}/transactions/latest`, { headers })
        ]);
        setInfo(infoRes.data || {});
        setTransactions(Array.isArray(transRes.data) ? transRes.data : []);
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem('adminToken');
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/login');
  };

  if (loading) return <div className={styles.loading}>Đang tải...</div>;

  return (
    <div className={styles.container}>
  <Sidebar onLogout={handleLogout} />
  <div className={styles.content}>
    <h1 className={styles.title}>Admin Dashboard</h1>
    <InfoBoard data={info} />
    <TransactionTable transactions={transactions} />
  </div>
</div>
  );
};

export default Dashboard;