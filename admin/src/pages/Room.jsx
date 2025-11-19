import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../axios';
import Sidebar from '../components/Sidebar';
import styles from './Room.module.css';



const Room = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return navigate('/login');

    const fetchRooms = async () => {
      try {
        const res = await axios.get('/admin/rooms/details');
        setRooms(res.data);
      } catch (err) {
        console.error(err);
      } finally { setLoading(false); }
    };
    fetchRooms();
  }, [navigate]);

  const handleDelete = async id => {
    if (!window.confirm('Bạn có chắc muốn xóa phòng này?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/admin/rooms/${id}`);
      setRooms(prev => prev.filter(r => r._id !== id));
      alert('Xóa phòng thành công');
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi server');
    }
  };

  if (loading) return <div className={styles.loading}>Đang tải...</div>;

  return (
    <div className={styles.container}>
      <Sidebar onLogout={() => { localStorage.removeItem('token'); navigate('/login'); }} />
      <div className={styles.content}>
        <h1>Rooms List</h1>
        <button onClick={() => navigate('/new-room')}>Add New Room</button>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th><th>Title</th><th>Price</th><th>Max People</th><th>Rooms</th><th>Action</th>
            </tr>
          </thead>
          <tbody>
            {rooms.length === 0 ? <tr><td colSpan="6">Chưa có phòng nào</td></tr> :
              rooms.map(room => (
                <tr key={room._id}>
                  <td>{room._id.slice(-6)}</td>
                  <td>{room.title}</td>
                  <td>${room.price}</td>
                  <td>{room.maxPeople}</td>
                  <td>{room.roomNumbers?.map(r => r.number).join(', ') || 'N/A'}</td>
                  <td>
                    <button onClick={() => navigate(`/new-room/${room._id}`)}>Edit</button>
                    <button onClick={() => handleDelete(room._id)}>Delete</button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Room;
