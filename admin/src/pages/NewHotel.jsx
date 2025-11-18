import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import styles from "./NewHotel.module.css";

const API_ADMIN = "http://localhost:5000/api/admin/hotels";

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
  const { id } = useParams(); // 👈 lấy id từ URL

  useEffect(() => {
    if (!id) return;
    const fetchHotel = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        const res = await axios.get(`${API_ADMIN}/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
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

    try {
      if (id) {
        await axios.put(`${API_ADMIN}/${id}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("Cập nhật thành công!");
      } else {
        await axios.post(API_ADMIN, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
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
