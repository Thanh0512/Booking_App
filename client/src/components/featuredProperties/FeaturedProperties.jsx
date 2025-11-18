import { useState, useEffect } from "react";
import "./featuredProperties.css";
import axios from "axios"; 

const FeaturedProperties = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                
                const res = await axios.get("http://localhost:5000/api/hotels/topRated"); 
                
                setData(res.data); 
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    
    const getRatingText = (rating) => {
        if (rating >= 9) return "Exceptional";
        if (rating >= 8) return "Excellent";
        if (rating >= 7) return "Very Good";
        return "Good";
    };

    if (loading) {
        return <div className="fp">Đang tải khách sạn hàng đầu...</div>;
    }

    if (error) {
        return <div className="fp">Lỗi tải dữ liệu: {error}</div>;
    }

    if (data.length === 0) {
        return <div className="fp">Không tìm thấy khách sạn hàng đầu nào.</div>;
    }

    return (
        <div className="fp">
           
            {data.map((item) => (
                <div className="fpItem" key={item._id}>
                    
                   
                    <img
                        
                        src={item.photos[0] || "https://via.placeholder.com/300"} 
                        alt={item.name}
                        className="fpImg"
                    />
                    <span className="fpName">
                        
                        <a href={`./hotels/${item._id}`} target="_blank">{item.name}</a>
                    </span>
                    <span className="fpCity">{item.city}</span>
                    
                    <span className="fpPrice">Starting from ${item.cheapestPrice || '??'}</span> 
                    <div className="fpRating">
                        
                        {item.rating && (
                            <>
                                <button>{item.rating.toFixed(1)}</button>
                                <span>{getRatingText(item.rating)}</span>
                            </>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default FeaturedProperties;