import React from 'react';
import styles from './InfoBoard.module.css';

const InfoBoard = ({ data = {} }) => {
  const cards = [
    { label: 'USERS', value: data.users ?? 0, color: '#e74c3c', icon: 'fas fa-users' },
    { label: 'ORDERS', value: data.orders ?? 0, color: '#f39c12', icon: 'fas fa-shopping-cart' },
    { label: 'EARNINGS', value: data.earnings ?? '$0', color: '#3498db', icon: 'fas fa-dollar-sign' },
    { label: 'BALANCE', value: data.balance ?? '$0', color: '#27ae60', icon: 'fas fa-wallet' },
  ];

  return (
    <div className={styles.container}>
      {cards.map((card, i) => (
        <div key={i} className={styles.card} style={{ backgroundColor: card.color }}>
          <div className={styles.header}>
            <span className={styles.label}>{card.label}</span>
            <i className={card.icon}></i>
          </div>
          <div className={styles.value}>{card.value}</div>
        </div>
      ))}
    </div>
  );
};

export default InfoBoard;