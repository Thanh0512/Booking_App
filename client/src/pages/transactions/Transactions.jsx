import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../../components/navbar/Navbar';
import Footer from '../../components/footer/Footer';
import './transactions.css';

const Transactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const token = localStorage.getItem("token");

    useEffect(() => {
        const fetchTransactions = async () => {
            if (!token) {
                setError("Vui lòng đăng nhập để xem giao dịch.");
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                const res = await axios.get(`http://localhost:5000/api/transactions/me`, {
                    headers: { "Authorization": `Bearer ${token}` },
                });
                setTransactions(res.data);
                setError(null);
            } catch (err) {
                console.error("Lỗi khi lấy giao dịch:", err);
                if (err.response && err.response.status === 401) {
                    setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
                } else {
                    setError("Không thể tải lịch sử giao dịch. Vui lòng kiểm tra Server.");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchTransactions();
    }, [token]);

    // TÍNH STATUS THEO NGÀY HIỆN TẠI
    const getCalculatedStatus = (dateStart, dateEnd) => {
        if (!dateStart || !dateEnd) return 'Booked';
        const now = new Date();
        const checkIn = new Date(dateStart);
        const checkOut = new Date(dateEnd);
        if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) return 'Booked';
        if (now >= checkOut) return 'Checkout';
        if (now >= checkIn) return 'Checkin';
        return 'Booked';
    };

    const formatDateRange = (start, end) => {
        if (!start || !end) return '—';
        const s = new Date(start).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
        const e = new Date(end).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
        return `${s} - ${e}`;
    };

    

    const getPaymentText = (method) => {
        if (!method) return '—';
        if (method === 'Credit Card') return 'Credit Card';
        if (method === 'Paypal') return 'PayPal';
        if (method === 'Cash') return 'Cash';
        return method;
    };

    const getDisplayStatus = (status) => {
        if (status === 'Booked') return 'Booked';
        if (status === 'Checkin') return 'Checkin';
        if (status === 'Checkout') return 'Checkout';
        return '—';
    };

    const getStatusClass = (status) => {
        if (status === 'Booked') return 'statusBooked';
        if (status === 'Checkin') return 'statusCheckin';
        if (status === 'Checkout') return 'statusCheckout';
        return 'statusDefault';
    };

    if (loading) {
        return (
            <>
                <Navbar />
                <p style={{ textAlign: 'center', margin: '100px' }}>Đang tải giao dịch...</p>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className="transactionsContainer">
                <div className="transactionsWrapper">
                    <h1 className="transactionsTitle">Lịch sử Giao dịch của bạn</h1>

                    {error && <p style={{ color: 'red', fontWeight: 'bold', textAlign: 'center' }}>{error}</p>}

                    {transactions.length === 0 && !error ? (
                        <p style={{ textAlign: 'center', color: '#666' }}>Bạn chưa có giao dịch nào.</p>
                    ) : (
                        <table className="transactionsTable">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Hotel</th>
                                    <th>Rooms</th>
                                    <th>Date</th>
                                    <th>Price</th>
                                    <th>Payment Method</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.map((t, index) => {
                                    const status = getCalculatedStatus(t.dateStart, t.dateEnd);
                                    return (
                                        <tr key={t._id}>
                                            <td>{index + 1}</td>
                                            <td>{t.hotelName || 'Không rõ'}</td>
                                            <td>{t.rooms || '—'}</td>
                                            <td>{formatDateRange(t.dateStart, t.dateEnd)}</td>
                                            <td>{t.price}$</td>
                                            <td>{getPaymentText(t.paymentMethod)}</td>
                                            <td>
                                                <span className={`statusBadge ${getStatusClass(status)}`}>
                                                    {getDisplayStatus(status)}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
            <div className="footer-section">
                <Footer />
            </div>
        </>
    );
};

export default Transactions;