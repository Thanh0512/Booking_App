import { useState, useEffect } from "react";
import "./featured.css";
import axios from "../../axios";
const Featured = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
   
    const cityData = [
        { city: "Hà Nội", img: "./images/HN.jpg" },
        { city: "Hồ Chí Minh", img: "./images/HCM.jpg" },
        { city: "Đà Nẵng", img: "./images/DN.jpg" },
    ];
    
    useEffect(() => {
       const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);
                
               
                const res = await axios.get("/hotels/countByCity"); 
                
               
                const apiData = res.data; 
                
                const combinedData = cityData.map(cityItem => {
                    const found = apiData.find(item => item.city === cityItem.city);
                    
                    return {
                        ...cityItem,
                        count: found && typeof found.count === 'number' ? found.count : 0 
                    };
                });
                
                setData(combinedData);
                setLoading(false);

            } catch (err) {
                
                let errorMessage = 'Lỗi không xác định khi tải API.';
                
                if (err.response) {
                   
                    const status = err.response.status;
                    const serverMessage = err.response.data 
                                        ? JSON.stringify(err.response.data) 
                                        : 'Không có chi tiết lỗi.';
                    errorMessage = `API thất bại (Status ${status}). Chi tiết: ${serverMessage}`;
                } else if (err.request) {
                    // Lỗi mạng/CORS/Timeout (không nhận được phản hồi)
                    errorMessage = `Lỗi mạng: Không nhận được phản hồi từ máy chủ.`;
                } else {
                    // Lỗi khác
                    errorMessage = `Lỗi thiết lập Request: ${err.message}`;
                }

                setError(errorMessage);
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return <div className="featured">Đang tải dữ liệu thành phố...</div>;
    }

    if (error) {
        return <div className="featured">Lỗi tải dữ liệu: {error}</div>;
    }
    
    if (data.length === 0) {
        return <div className="featured">Không có dữ liệu khách sạn theo khu vực.</div>;
    }
    
    return (
       <div className="featured">
           {data.map((item, index) => (
               <div className="featuredItem" key={index}>
                   <img
                       src={item.img} 
                       alt={item.city}
                       className="featuredImg"
                   />
                   <div className="featuredTitles">
                       <h1>{item.city}</h1>
                       <h2>{item.count} properties</h2>
                   </div>
               </div>
           ))}
       </div>
    );
};

export default Featured;
