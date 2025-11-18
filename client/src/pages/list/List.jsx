// pages/list/List.js
import "./list.css";
import Navbar from "../../components/navbar/Navbar";
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import { useLocation, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { DateRange } from "react-date-range";
import SearchItem from "../../components/searchItem/SearchItem";
import axios from "axios";

const List = () => {
  const location = useLocation();
  const initialData = location.state || {};

  const [destination, setDestination] = useState(initialData.destination || "");
  const [date, setDate] = useState(
    initialData.date || [
      { startDate: new Date(), endDate: new Date(), key: "selection" }
    ]
  );
  const [openDate, setOpenDate] = useState(false);
  const [options, setOptions] = useState(
    initialData.options || { adult: 1, children: 0, room: 1 }
  );

  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData.destination) {
      handleSearch();
    }
  }, []);

  const handleSearch = async () => {
    if (!destination) return alert("Vui lòng nhập điểm đến");

    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/hotels/search", {
  params: {
    city: destination,
    startDate: format(date[0].startDate, "yyyy-MM-dd"),
    endDate: format(date[0].endDate, "yyyy-MM-dd"),
    rooms: options.room,
    adults: options.adult,
    children: options.children,
  },
});;
      setHotels(res.data.results || []);
    } catch (err) {
      console.error(err);
      alert("Lỗi tìm kiếm.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <Header type="list" />
      <div className="listContainer">
        <div className="listWrapper">
          <div className="listSearch">
            <h1 className="lsTitle">Search</h1>
            <div className="lsItem">
              <label>Destination</label>
              <input
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                type="text"
              />
            </div>
            <div className="lsItem">
              <label>Check-in Date</label>
              <span onClick={() => setOpenDate(!openDate)}>
                {`${format(date[0].startDate, "MM/dd/yyyy")} to ${format(date[0].endDate, "MM/dd/yyyy")}`}
              </span>
              {openDate && (
                <DateRange
                  onChange={(item) => setDate([item.selection])}
                  minDate={new Date()}
                  ranges={date}
                />
              )}
            </div>
            <div className="lsItem">
              <label>Options</label>
              <div className="lsOptions">
                <div className="lsOptionItem">
                  <span className="lsOptionText">Adult</span>
                  <input
                    type="number"
                    min={1}
                    value={options.adult}
                    onChange={(e) => setOptions({ ...options, adult: +e.target.value })}
                    className="lsOptionInput"
                  />
                </div>
                <div className="lsOptionItem">
                  <span className="lsOptionText">Children</span>
                  <input
                    type="number"
                    min={0}
                    value={options.children}
                    onChange={(e) => setOptions({ ...options, children: +e.target.value })}
                    className="lsOptionInput"
                  />
                </div>
                <div className="lsOptionItem">
                  <span className="lsOptionText">Room</span>
                  <input
                    type="number"
                    min={1}
                    value={options.room}
                    onChange={(e) => setOptions({ ...options, room: +e.target.value })}
                    className="lsOptionInput"
                  />
                </div>
              </div>
            </div>
            <button onClick={handleSearch}>Search</button>
          </div>

          {/* === KẾT QUẢ TÌM KIẾM === */}
          <div className="listResult">
            {loading ? (
              <p style={{ textAlign: "center", padding: "20px" }}>Đang tìm...</p>
            ) : hotels.length === 0 ? (
              <p style={{ textAlign: "center", padding: "20px" }}>Không tìm thấy khách sạn nào.</p>
            ) : (
              hotels.map((hotel) => (
                <Link
                  key={hotel._id}
                  to={`/hotels/${hotel._id}`}
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <SearchItem
                    name={hotel.name}
                    distance={hotel.distance}
                    tag="Free airport taxi"
                    type={hotel.type.charAt(0).toUpperCase() + hotel.type.slice(1)}
                    description={hotel.desc}
                    free_cancel={true}
                    price={hotel.cheapestPrice}
                    rate={hotel.rating || 8.9}
                    rate_text={hotel.rating >= 9 ? "Excellent" : "Very Good"}
                    img_url={hotel.photos[0] || "https://via.placeholder.com/200"}
                  />
                </Link>
              ))
            )}
          </div>
        </div>
      </div >
      <div className="footerWrapper">
      <Footer />
      </div>  
    </div>
  );
};

export default List;