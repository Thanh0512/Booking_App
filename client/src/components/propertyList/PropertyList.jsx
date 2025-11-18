import { useState, useEffect } from "react";
import "./propertyList.css";
import axios from "axios"; 

const PropertyList = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

  
    const propertyTypes = [
        
        { type: "hotel", name: "Hotel", img: "./images/type_1.webp" },
        { type: "apartment", name: "Apartment", img: "./images/type_2.jpg" },
        { type: "resort", name: "Resort", img: "./images/type_3.jpg" },
        { type: "villa", name: "Villa", img: "./images/type_4.jpg" },
        { type: "cabin", name: "Cabin", img: "./images/type_5.jpg" },
    ];

    useEffect(() => {
        const fetchData = async () => {
            try {
                
                const res = await axios.get("http://localhost:5000/api/hotels/countByType"); 
                
                
                const combinedData = propertyTypes.map(propItem => {
                   
                    const found = res.data.find(item => item.type === propItem.type);
                    
                    return {
                        ...propItem,
                        
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

    // Hiển thị trạng thái
    if (loading) {
        return <div className="pList">Đang tải loại bất động sản...</div>;
    }

    if (error) {
        return <div className="pList">Lỗi tải dữ liệu: {error}</div>;
    }

    // Hiển thị dữ liệu
    return (
        <div className="pList">
            {data.map((item, index) => (
                <div className="pListItem" key={index}>
                    <img
                        src={item.img}
                        alt={item.name}
                        className="pListImg"
                    />
                    <div className="pListTitles">
                        <h1>{item.name}</h1> 
                        
                        <h2>{item.count} properties</h2> 
                    </div>
                </div>
            ))}
        </div>
    );
};

export default PropertyList;