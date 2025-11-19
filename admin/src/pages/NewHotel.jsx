import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "../axios";
import Sidebar from "../components/Sidebar";
import styles from "./NewHotel.module.css";


const NewHotel = () => {
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    city: "",
    address: "",
    distance: "",
    title: "",
    desc: "",
    cheapestPrice: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams(); 

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) return navigate('/login');
    if (!id) return;
    const fetchHotel = async () => {
      try {
        const res = await axios.get(`/admin/hotels/${id}`);
        setFormData(res.data);
      } catch (err) {
        alert("Không thể tải dữ liệu khách sạn!");
      }
    };
    fetchHotel();
  }, [id]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem("adminToken");
    if (!token) {
        setLoading(false);
        return navigate("/login");
    }
    try {
      if (id) {
        await axios.put(`/admin/hotels/${id}`, formData);
        alert("Cập nhật thành công!");
      } else {
        await axios.post('/admin/hotels', formData);
        alert("Thêm khách sạn thành công!");
      }
      navigate("/hotels");
    } catch (error) {
      alert("Lưu thất bại: " + (error.response?.data?.message || "Lỗi server"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <Sidebar />
      <div className={styles.content}>
        <h1>{id ? "Edit Hotel" : "Add New Hotel"}</h1>
        <form onSubmit={handleSubmit} className={styles.form}>
          <input name="name" placeholder="Name" value={formData.name} onChange={handleChange} required />
          <input name="type" placeholder="Type" value={formData.type} onChange={handleChange} required />
          <input name="city" placeholder="City" value={formData.city} onChange={handleChange} required />
          <input name="address" placeholder="Address" value={formData.address} onChange={handleChange} required />
          <input name="distance" placeholder="Distance" value={formData.distance} onChange={handleChange} />
          <input name="title" placeholder="Title" value={formData.title} onChange={handleChange} />
          <textarea name="desc" placeholder="Description" value={formData.desc} onChange={handleChange} />
          <input name="cheapestPrice" placeholder="Cheapest Price" value={formData.cheapestPrice} onChange={handleChange} />

          <button type="submit" disabled={loading} className={styles.saveBtn}>
            {loading ? "Saving..." : id ? "Update" : "Create"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default NewHotel;
