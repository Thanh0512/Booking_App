import React from 'react';
import styles from './TransactionTable.module.css';

const TransactionTable = ({ transactions = [] }) => {
  if (!transactions.length) {
    return (
      <div className={styles.empty}>
        <h3>Latest Transactions</h3>
        <p>Chưa có giao dịch nào.</p>
      </div>
    );
  }

  const getStatusColor = (status) => {
    const s = status?.toLowerCase() || '';
    if (s.includes('checkin')) return '#27ae60';
    if (s.includes('checkout')) return '#3498db';
    if (s.includes('booked')) return '#e74c3c';
    return '#95a5a6';
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Latest Transactions</h3>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th><input type="checkbox" /></th>
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
            {transactions.map(t => (
              <tr key={t._id}>
                <td><input type="checkbox" /></td>
                <td>{String(t._id || '').slice(-6)}</td>
                <td>{t.user}</td>
                <td>{t.hotel || 'N/A'}</td>
                <td>{t.room}</td>
                <td>{t.date || 'N/A'}</td>
                <td>{t.price || 0}</td>
                <td>{t.payment || 'N/A'}</td>
                <td>
                  <span className={styles.status} style={{ backgroundColor: getStatusColor(t.status) }}>
                    {t.status || 'Unknown'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className={styles.pagination}>
        1–{transactions.length} of {transactions.length}
      </div>
    </div>
  );
};

export default TransactionTable;