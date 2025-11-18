import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './Sidebar.module.css';

const Sidebar = ({ onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { label: 'Dashboard', icon: 'fa-solid fa-grip', path: '/dashboard' },
    { label: 'Users', icon: 'fas fa-users', path: '/users' },
    { label: 'Hotels', icon: 'fa-solid fa-hotel', path: '/hotels' },
    { label: 'Rooms', icon: 'fa-solid fa-bed', path: '/rooms' },
    { label: 'Transactions', icon: 'fa-solid fa-dollar-sign', path: '/transactions' },
    { label: 'New Hotel', icon: 'fa-solid fa-hotel', path: '/new-hotel' },
    { label: 'New Room', icon: 'fa-solid fa-bed', path: '/new-room' },
  ];

  return (
   <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <h2>Admin Page</h2>
      </div>

      <nav className={styles.nav}>
        <ul>
          {menuItems.map((item) => (
            <li key={item.path}>
              <button
                onClick={() => navigate(item.path)}
                className={`${styles.menuItem} ${location.pathname === item.path ? styles.active : ''}`}
              >
                <i className={item.icon}></i>
                <span className={styles.label}>{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className={styles.logout}>
        <button onClick={onLogout} className={styles.logoutBtn}>
          <i className="fas fa-sign-out-alt"></i>
          <span className={styles.label}>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

