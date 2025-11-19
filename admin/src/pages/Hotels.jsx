import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../axios';
import Sidebar from '../components/Sidebar';
import styles from './Hotels.module.css';



const Hotels = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return navigate('/login');

    const fetchHotels = async () => {
      try {
        const res = await axios.get('/hotels');
        setHotels(res.data);
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchHotels();
  }, [navigate]);

  const handleDelete = async (hotelId) => {
    const confirmDelete = window.confirm('Bạn có chắc muốn xóa khách sạn này?');
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem('adminToken');
     const transactionRes = await axios.get(`/transactions/hotel/${hotelId}`);

      if (transactionRes.data.length > 0) {
        alert('Không thể xóa! Khách sạn này đã có giao dịch.');
        return;
      }

      await axios.delete(`/admin/hotels/${hotelId}`);

      setHotels((prev) => prev.filter((h) => h._id !== hotelId));
      alert('Xóa thành công!');
    } catch (err) {
      alert('Xóa thất bại: ' + (err.response?.data?.message || 'Lỗi server'));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/login');
  };

  if (loading) return <div className={styles.loading}>Đang tải...</div>;

  return (
    <div className={styles.container}>
      <Sidebar onLogout={handleLogout} />
      <div className={styles.content}>
        <div className={styles.header}>
          <h1>Hotels List</h1>
          <button onClick={() => navigate('/new-hotel')} className={styles.addBtn}>
            Add New
          </button>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Type</th>
                <th>Title</th>
                <th>City</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {hotels.map((h) => (
                <tr key={h._id}>
                  <td>{h._id.slice(-8)}</td>
                  <td>{h.name}</td>
                  <td>{h.type}</td>
                  <td>{h.title}</td>
                  <td>{h.city}</td>
                  <td>
                    <button
                       onClick={() => navigate(`/edit-hotel/${h._id}`)}
                      className={styles.editBtn}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(h._id)}
                      className={styles.deleteBtn}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Hotels;
