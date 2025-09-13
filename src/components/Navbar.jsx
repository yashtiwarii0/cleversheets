import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import logo from '../assets/logo.svg';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/">
          <img src={logo} alt="CleverSheets Logo" className="nav-logo" />
          <span>CleverSheets</span>
        </Link>
      </div>
      
      <div className="navbar-links">
        <Link to="/" className="nav-link">Home</Link>
        {user && <Link to="/my-questions" className="nav-link">My Questions</Link>}
      </div>
      
      <div className="navbar-auth">
        {user ? (
          <div className="user-menu">
            <span className="username">Hello, {user.username}</span>
            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
          </div>
        ) : (
          <div className="auth-buttons">
            <Link to="/login" className="login-button">Login</Link>
            <Link to="/register" className="register-button">Register</Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;