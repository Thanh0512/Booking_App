import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from '../axios';
import Sidebar from '../components/Sidebar';
import styles from './NewRoom.module.css';



const NewRoom = () => {
  const { id } = useParams(); // nếu có id => edit
  const isEdit = Boolean(id);
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    maxPeople: '',
    desc: '',
    hotel: '',
    roomNumbers: ''
  });
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Load danh sách khách sạn
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) return navigate('/login');
    const fetchHotels = async () => {
      try {
        const res = await axios.get('/hotels');
        setHotels(res.data);
      } catch (err) {
        console.log(err);
      }
    };
    fetchHotels();
  }, []);

  // Load dữ liệu phòng nếu edit
  useEffect(() => {
    if (!isEdit) { setLoading(false); return; }
    const fetchRoom = async () => {
      try {
        const res = await axios.get(`/admin/rooms/${id}`);
        const room = res.data;
        setFormData({
          title: room.title,
          price: room.price,
          maxPeople: room.maxPeople,
          desc: room.desc,
          hotel: room.hotel,
          roomNumbers: room.roomNumbers.map(r => r.number).join(', ')
        });
      } catch (err) {
        alert('Không tìm thấy phòng');
        navigate('/rooms');
      } finally {
        setLoading(false);
      }
    };
    fetchRoom();
  }, [id, isEdit, navigate]);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const { title, price, maxPeople, desc, hotel, roomNumbers } = formData;
    if (!hotel || !roomNumbers.trim()) return alert('Nhập đầy đủ thông tin');

    const roomNums = roomNumbers
      .split(',')
      .map(n => ({ number: parseInt(n.trim()) }))
      .filter(r => !isNaN(r.number));

    if (roomNums.length === 0) return alert('Số phòng không hợp lệ');

    try {
      const token = localStorage.getItem('adminToken');
      if (isEdit) {
        await axios.put(`/admin/rooms/${id}`, payload);
        alert('Cập nhật phòng thành công');
      } else {
        await axios.post('/admin/rooms', payload);
        alert('Tạo phòng thành công');
      }
      navigate('/rooms');
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi server');
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
        <h1>{isEdit ? 'Edit Room' : 'Add New Room'}</h1>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGrid}>
            <div className={styles.column}>
              <input name="title" value={formData.title} onChange={handleChange} placeholder="Title" required />
              <input type="number" name="price" value={formData.price} onChange={handleChange} placeholder="Price" required />
              <input type="number" name="maxPeople" value={formData.maxPeople} onChange={handleChange} placeholder="Max People" required />
            </div>
            <div className={styles.column}>
              <textarea name="desc" value={formData.desc} onChange={handleChange} placeholder="Description" rows="3" />
              <select name="hotel" value={formData.hotel} onChange={handleChange} required>
                <option value="">-- Chọn khách sạn --</option>
                {hotels.map(h => <option key={h._id} value={h._id}>{h.name} ({h.city})</option>)}
              </select>
            </div>
          </div>
          <textarea name="roomNumbers" value={formData.roomNumbers} onChange={handleChange} placeholder="101,102,103" rows="2" required />
          <button type="submit">{isEdit ? 'Update Room' : 'Create Room'}</button>
        </form>
      </div>
    </div>
  );
};

export default NewRoom;
