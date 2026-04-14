import './Navbar.css';

interface NavbarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

export default function Navbar({ activeSection, setActiveSection }: NavbarProps) {
  const navItems = ['Home', 'About', 'Skills', 'Projects', 'Contact']; // Adjusted to match the actual pages in the 3D scroll

  const handleNavClick = (item: string) => {
    setActiveSection(item);
    // Dispatch a custom event to the ScrollTracker sitting inside the 3D Canvas
    // That way Drei can seamlessly animate the camera tracking natively!
    window.dispatchEvent(new CustomEvent('nav-click', { detail: item }));
  };

  return (
    <nav className="navbar-container">
      <ul className="navbar">
        {navItems.map((item) => (
          <li 
            key={item} 
            className={`nav-item ${activeSection === item ? 'active' : ''}`}
            onClick={() => handleNavClick(item)}
            style={{ cursor: 'pointer' }}
          >
            {item}
          </li>
        ))}
      </ul>
    </nav>
  );
}