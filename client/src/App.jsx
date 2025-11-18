import {BrowserRouter,Routes,Route,} from "react-router-dom";
import Home from "./pages/home/Home";
import Hotel from "./pages/hotel/Hotel";
import List from "./pages/list/List";
import Login from "./pages/login/Login";
import Register from "./pages/register/Register";
import Transactions from "./pages/transactions/Transactions";
import { SearchProvider } from './context/SearchContext';

function App() {
   return (
    <SearchProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/hotels" element={<List/>}/>
        <Route path="/hotels/:hotelID" element={<Hotel/>}/>
        <Route path="/login" element={<Login/>}/>
        <Route path="/register" element={<Register/>}/>
        <Route path="/transactions" element={<Transactions/>}/>
      </Routes>
     </BrowserRouter>
     </SearchProvider>
  );
}

export default App;