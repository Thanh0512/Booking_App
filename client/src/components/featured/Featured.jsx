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
                
                const res = await axios.get("/hotels/countByCity"); 
                
                if (!res.ok) {
                    
                    const errorDetails = await res.text().catch(() => 'No error body');
                    throw new Error(`API failed with status ${res.status}. Details: ${errorDetails.substring(0, 50)}`);
                }
                const apiData = await res.json();
                
                const combinedData = cityData.map(cityItem => {
                    
                    const found = apiData.find(item => item.city === cityItem.city);
                    
                    return {
                        ...cityItem,
                        count: found ? found.count : 0 
                    };
                });
                
                setData(combinedData);
                setLoading(false);
            } catch (err) {
                setError(err.message);
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
