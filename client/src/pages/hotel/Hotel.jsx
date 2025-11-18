import "./hotel.css";
import Navbar from "../../components/navbar/Navbar";
import Header from "../../components/header/Header";
import MailList from "../../components/mailList/MailList";
import Footer from "../../components/footer/Footer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleArrowLeft,
  faCircleArrowRight,
  faCircleXmark,
  faLocationDot,
} from "@fortawesome/free-solid-svg-icons";
import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "../../axios";

const Hotel = () => {
  const { hotelID } = useParams();
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);

  
  const [slideNumber, setSlideNumber] = useState(0);
  const [open, setOpen] = useState(false);


  const [showBookingForm, setShowBookingForm] = useState(false);
  const bookingFormRef = useRef(null);

  const [bookingData, setBookingData] = useState({
    checkIn: "",
    checkOut: "",
    roomsSelected: [], 
    paymentMethod: "Credit Card",
  });

  const [availableRooms, setAvailableRooms] = useState([]);
  const [userInfo, setUserInfo] = useState({
    name: "",
    email: "",
    phone: "",
    identityCard: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  
  useEffect(() => {
    const fetchHotel = async () => {
      try {
        const res = await axios.get(`/hotels/${hotelID}`);
        setHotel(res.data);
      } catch (err) {
        console.error(err);
        alert("Không lấy được thông tin khách sạn");
      } finally {
        setLoading(false);
      }
    };
    fetchHotel();
  }, [hotelID]);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      console.log("Token lấy từ localStorage:", token);
      if (!token) return;

      try {
        const res = await axios.get("/users/me", {
          headers: {Authorization: `Bearer ${token}`},
        });
        const user = res.data;
        setUserInfo({
          name: user.name || "",
          email: user.email || "",
          phone: user.phone || "",
          identityCard: user.identityCard || "",
        });
      } catch (err) {
        console.log("Không lấy được thông tin user");
      }
    };
    fetchUser();
  }, []);

 
  useEffect(() => {
    const fetchAvailableRooms = async () => {
      if (!bookingData.checkIn || !bookingData.checkOut) {
        setAvailableRooms([]);
        return;
      }

      if (new Date(bookingData.checkIn) >= new Date(bookingData.checkOut)) {
        setAvailableRooms([]);
        return;
      }

      try {
        const res = await axios.get(`/hotels/room/checkAvailable`, {
            params: {
              hotelId: hotelID,
              startDate: bookingData.checkIn,
              endDate: bookingData.checkOut,
            },
          }
        );
        setAvailableRooms(res.data);
      } catch (err) {
        console.error("Lỗi lấy phòng trống:", err);
        setAvailableRooms([]);
      }
    };

    fetchAvailableRooms();
  }, [bookingData.checkIn, bookingData.checkOut, hotelID]);

 
  useEffect(() => {
    setBookingData((prev) => ({ ...prev, roomsSelected: [] }));
  }, [bookingData.checkIn, bookingData.checkOut]);


  const handleOpen = (i) => {
    setSlideNumber(i);
    setOpen(true);
  };

  const handleMove = (direction) => {
    if (!hotel?.photos) return;
    let newSlideNumber;
    if (direction === "l") {
      newSlideNumber = slideNumber === 0 ? hotel.photos.length - 1 : slideNumber - 1;
    } else {
      newSlideNumber = slideNumber === hotel.photos.length - 1 ? 0 : slideNumber + 1;
    }
    setSlideNumber(newSlideNumber);
  };

  // === Chọn/Bỏ chọn phòng 
  const handleSelectRoom = (roomNumber, checked) => {
    let newRooms = [...bookingData.roomsSelected];
    if (checked) {
      if (!newRooms.includes(roomNumber)) { 
            newRooms.push(roomNumber);
        }
    } else {
      newRooms = newRooms.filter((num) => num !== roomNumber);
    }
    setBookingData({ ...bookingData, roomsSelected: newRooms });
  };

  const calculateTotal = () => {
    if (!bookingData.checkIn || !bookingData.checkOut) return 0;

    const start = new Date(bookingData.checkIn);
    const end = new Date(bookingData.checkOut);
    if (end <= start) return 0;

    const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    let total = 0;

    availableRooms.forEach((roomType) => {
      const selectedCount = roomType.roomNumbers.filter((room) =>
        bookingData.roomsSelected.includes(room.number)
      ).length;
      total += selectedCount * roomType.price;
    });

    return total * diffDays;
  };

  


  const handleBookNow = () => {
    setShowBookingForm(true);
    setTimeout(() => {
      bookingFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const handleReserve = async () => {
    if (isSubmitting) return;

    const { checkIn, checkOut, roomsSelected, paymentMethod } = bookingData;
    const { name, email, phone } = userInfo;

    if (!checkIn || !checkOut || roomsSelected.length === 0) {
      return alert("Vui lòng chọn ngày và ít nhất một phòng!");
    }
    if (!name || !email || !phone) {
      return alert("Vui lòng điền đầy đủ họ tên, email và số điện thoại!");
    }

    setIsSubmitting(true);
const token = localStorage.getItem("token"); 

    if (!token) {
        alert("Bạn cần đăng nhập để đặt phòng.");
        setIsSubmitting(false);
        return;
    }

    try {
      await axios.post("/transactions", {
       
        hotel: hotelID, 
        
        room: roomsSelected, 
       
        dateStart: checkIn,
      
        dateEnd: checkOut,
       
        payment: paymentMethod,
       
        price: calculateTotal(),
      },
{
            headers: {
                
               'Authorization': `Bearer ${token}`
                
            }
        });


      alert("Đặt phòng thành công!");
      window.location.href = "/transactions";
    } catch (err) {
      console.error(err);
      alert("Lỗi đặt phòng. Phòng có thể đã được đặt. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // === Loading & Error ===
  if (loading) return <p className="loading">Đang tải khách sạn...</p>;
  if (!hotel) return <p className="error">Không tìm thấy khách sạn</p>;

  return (
    <>
      <Navbar />
      <Header type="list" />

      <div className="hotelContainer">
        {open && (
          <div className="slider">
            <FontAwesomeIcon icon={faCircleXmark} className="close" onClick={() => setOpen(false)} />
            <FontAwesomeIcon icon={faCircleArrowLeft} className="arrow" onClick={() => handleMove("l")} />
            <div className="sliderWrapper">
              <img src={hotel.photos[slideNumber]} alt="" className="sliderImg" />
            </div>
            <FontAwesomeIcon icon={faCircleArrowRight} className="arrow" onClick={() => handleMove("r")} />
          </div>
        )}

        <div className="hotelWrapper">
          <h1 className="hotelTitle">{hotel.name}</h1>
          <div className="hotelAddress">
            <FontAwesomeIcon icon={faLocationDot} />
            <span>{hotel.address}</span>
          </div>
          <span className="hotelDistance">Excellent location {hotel.distance}m from center</span>
          <span className="hotelPriceHighlight">
            Book a stay over ${hotel.cheapestPrice} at this property and get a free airport taxi
          </span>

          <div className="hotelImages">
            {hotel.photos.map((photo, i) => (
              <div className="hotelImgWrapper" key={i}>
                <img onClick={() => handleOpen(i)} src={photo} alt="" className="hotelImg" />
              </div>
            ))}
          </div>

          <div className="hotelDetails">
            <div className="hotelDetailsTexts">
              <h1 className="hotelTitle">{hotel.name}</h1>
              <p className="hotelDesc">{hotel.desc}</p>
            </div>
            <div className="hotelDetailsPrice">
              <h2>
                <b>${hotel.cheapestPrice}</b> / night
              </h2>
              <button className="bookNow" onClick={handleBookNow}>
                Reserve or Book Now!
              </button>
            </div>
          </div>

          {showBookingForm && (
            <div className="bookingFormWrapper" ref={bookingFormRef}>
              <div className="bookingFormLeft">
                <h2>Dates</h2>
                <div className="datePickerGroup">
                  <div className="datePickerItem">
                    <label>Check in</label>
                    <input
                      type="date"
                      className="bookingDateInput"
                      value={bookingData.checkIn}
                      min={new Date().toISOString().split("T")[0]}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val < new Date().toISOString().split("T")[0]) {
                          alert("Ngày nhận phòng không hợp lệ!");
                          return;
                        }
                        setBookingData({ ...bookingData, checkIn: val });
                      }}
                    />
                  </div>
                  <div className="datePickerItem">
                    <label>Check out</label>
                    <input
                      type="date"
                      className="bookingDateInput"
                      value={bookingData.checkOut}
                      min={bookingData.checkIn || new Date().toISOString().split("T")[0]}
                      onChange={(e) => setBookingData({ ...bookingData, checkOut: e.target.value })}
                    />
                  </div>
                </div>

                <h3>Select Room </h3>
                <div className="availableRoomsList">
                  {availableRooms.length === 0 ? (
                    bookingData.checkIn && bookingData.checkOut ? (
                      <p style={{ color: "red", fontWeight: "bold" }}>
                        Không có phòng trống trong khoảng ngày này.
                      </p>
                    ) : (
                      <p>Vui lòng chọn ngày nhận và trả phòng.</p>
                    )
                  ) : (
                    availableRooms.map((roomType) => (
                      <div className="roomTypeItem" key={roomType._id}>
                        <div className="roomInfo">
                          <h4>{roomType.title}</h4>
                          <p>{roomType.desc}</p>
                          <p>
                            <strong>Max people:</strong> {roomType.maxPeople} 
                          </p>
                          <p>
                            <strong>Price:</strong> ${roomType.price}
                          </p>
                        </div>
                        <div className="roomSelectionCheckboxes">
                          <label>Select Room:</label>
                          <div className="roomCheckboxesWrapper">
                            {roomType.roomNumbers.map((room) => (
                              <div className="singleRoomOption" key={room.number}>
                                <label
                                  htmlFor={`room-${room.number}`}
                                  style={{
                                    fontWeight: bookingData.roomsSelected.includes(room.number)
                                      ? "bold"
                                      : "normal",
                                    color: bookingData.roomsSelected.includes(room.number)
                                      ? "#0071c2"
                                      : "inherit",
                                  }}
                                >
                                  Phòng {room.number}
                                </label>
                                <input
                                  type="checkbox"
                                  id={`room-${room.number}`}
                                  checked={bookingData.roomsSelected.includes(room.number)}
                                  onChange={(e) => handleSelectRoom(room.number, e.target.checked)}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* RIGHT: Thông tin đặt phòng */}
              <div className="bookingFormRight">
                <h2>Reserve Info</h2>
                <label>Your Full Name</label>
                <input
                  type="text"
                  placeholder="Nguyễn Văn A"
                  value={userInfo.name}
                  onChange={(e) => setUserInfo({ ...userInfo, name: e.target.value })}
                />
                <label>Email:</label>
                <input
                  type="email"
                  placeholder="email@example.com"
                  value={userInfo.email}
                  onChange={(e) => setUserInfo({ ...userInfo, email: e.target.value })}
                />
                <label>Your Phone Number:</label>
                <input
                  type="text"
                  placeholder="0901234567"
                  value={userInfo.phone}
                  onChange={(e) => setUserInfo({ ...userInfo, phone: e.target.value })}
                />
                <label>Your Indentity Car Number:</label>
                <input
                  type="text"
                  placeholder="123456789"
                  value={userInfo.identityCard}
                  onChange={(e) => setUserInfo({ ...userInfo, identityCard: e.target.value })}
                />

                <label>Select Payment Method</label>
                <select
                  value={bookingData.paymentMethod}
                  onChange={(e) =>
                    setBookingData({ ...bookingData, paymentMethod: e.target.value })
                  }
                >
                  <option value="credit_card">Credit Card</option>
                  <option value="paypal">PayPal</option>
                  <option value="cash">Cash</option>
                </select>

                <h3>
                  Total Bill: <strong>{calculateTotal()} $</strong>
                </h3>

                <button
                  className="reserveBtn"
                  onClick={handleReserve}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Đang xử lý..." : "Reserve Now"}
                </button>
              </div>
            </div>
          )}
        </div>

        <MailList />
        <Footer />
      </div>
    </>
  );
};

export default Hotel;