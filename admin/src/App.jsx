// admin/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Hotels from './pages/Hotels';
import Room from './pages/Room';
import NewHotel from './pages/NewHotel';
import NewRoom from './pages/NewRoom';
import Transactions from './pages/Transactions';
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('adminToken');
  return token ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const token = localStorage.getItem('adminToken');
  return token ? <Navigate to="/dashboard" replace /> : children;
};

function App() {
  return (
    <Router>
      <div style={{ minHeight: '100vh', background: '#f4f6f9', fontFamily: 'Arial, sans-serif' }}>
        <Routes>
          
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />

        
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/users"
            element={
              <PrivateRoute>
                <Users />
              </PrivateRoute>
            }
          />
          <Route
            path="/hotels"
            element={
              <PrivateRoute>
                <Hotels />
              </PrivateRoute>
            }
          />
          <Route
            path="/rooms"
            element={
              <PrivateRoute>
                <Room />
              </PrivateRoute>
            }
          />
          <Route
            path="/new-hotel"
            element={
              <PrivateRoute>
                <NewHotel />
              </PrivateRoute>
            }
          />
          <Route
            path="/edit-hotel/:id"
            element={
              <PrivateRoute>
                <NewHotel />
              </PrivateRoute>
            }
          />
          <Route
            path="/new-room"
            element={
              <PrivateRoute>
                <NewRoom />
              </PrivateRoute>
            }
          />
           <Route
            path="/new-room/:id"
            element={
              <PrivateRoute>
                <NewRoom />
              </PrivateRoute>
            }
          />
          <Route
            path="/transactions"
            element={
              <PrivateRoute>
                <Transactions />
              </PrivateRoute>
            }
          />

          
          <Route path="/" element={<Navigate to="/login" replace />} />

          
          <Route
            path="*"
            element={
              <div style={{ textAlign: 'center', padding: 50 }}>
                <h2>404 - Trang không tồn tại</h2>
                <button
                  onClick={() => window.location.href = '/login'}
                  style={{
                    padding: '10px 20px',
                    background: '#3498db',
                    color: 'white',
                    border: 'none',
                    borderRadius: 8,
                    cursor: 'pointer'
                  }}
                >
                  Về trang đăng nhập
                </button>
              </div>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;