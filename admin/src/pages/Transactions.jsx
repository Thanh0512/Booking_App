import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../axios';
import Sidebar from '../components/Sidebar';
import styles from './Transactions.module.css';


const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 9; // 9 giao dịch/trang
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) return navigate('/login');

    const fetchTransactions = async () => {
      try {
        const res = await axios.get('/admin/transactions', {
          params: { page, limit }
        });
        setTransactions(res.data.transactions);
        setTotalPages(res.data.totalPages);
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem('adminToken');
          navigate('/login');
        }
        console.error('Lỗi tải giao dịch:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, [page, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/login');
  };

  const formatDate = (start, end) => {
    const format = (d) => {
      if (!d) return 'N/A';
      const date = new Date(d);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    };
    return `${format(start)} - ${format(end)}`;
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Booked': return styles.statusBooked;
      case 'Checkin': return styles.statusCheckin;
      case 'Checkout': return styles.statusCheckout;
      default: return styles.statusDefault;
    }
  };

  if (loading) return <div className={styles.loading}>Đang tải...</div>;

  return (
    <div className={styles.container}>
      <Sidebar onLogout={handleLogout} />
      <div className={styles.content}>
        <h1 className={styles.title}>Transactions List</h1>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th><input type="checkbox" disabled /></th>
                <th>ID</th>
                <th>User</th>
                <th>Hotel</th>
                <th>Room</th>
                <th>Date</th>
                <th>Price</th>
                <th>Payment Method</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan="9" className={styles.empty}>Chưa có giao dịch nào</td>
                </tr>
              ) : (
                transactions.map(t => (
                  <tr key={t._id}>
                    <td><input type="checkbox" disabled /></td>
                    <td>{t._id.slice(-12)}</td>
                    <td>{t.user?.username || 'Unknown'}</td>
                    <td>{t.hotel?.name || 'Unknown Hotel'}</td>
                    <td>{t.room?.roomNumbers?.map(r => r.number).join(', ') || 'N/A'}</td>
                    <td>{formatDate(t.dateStart, t.dateEnd)}</td>
                    <td>${t.price || 0}</td>
                    <td>{t.payment || 'Credit Card'}</td>
                    <td>
                      <span className={`${styles.status} ${getStatusClass(t.status)}`}>
                        {t.status || 'Booked'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PHÂN TRANG */}
        <div className={styles.pagination}>
          <span>
            {page * limit - limit + 1}-{Math.min(page * limit, transactions.length + (page - 1) * limit)} of {totalPages * limit}
          </span>
          <div className={styles.pageButtons}>
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className={styles.pageBtn}
            >
              Previous
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className={styles.pageBtn}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Transactions;