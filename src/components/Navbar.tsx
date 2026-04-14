import { useState } from 'react';
import './Navbar.css';

export default function Navbar() {
  const [active, setActive] = useState('About');
  const navItems = ['Home', 'About', 'Projects', 'Skills', 'Experience', 'Contact'];

  return (
    <nav className="navbar-container">
      <ul className="navbar">
        {navItems.map((item) => (
          <li 
            key={item} 
            className={`nav-item ${active === item ? 'active' : ''}`}
            onClick={() => setActive(item)}
          >
            {item}
          </li>
        ))}
      </ul>
    </nav>
  );
}