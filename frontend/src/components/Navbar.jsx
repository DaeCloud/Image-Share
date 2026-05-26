import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Camera } from 'lucide-react';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner container">
        <Link to="/dashboard" className="navbar-brand">
          <Camera size={18} strokeWidth={1.5} />
          <span>PhotoShare</span>
        </Link>
        <div className="navbar-right">
          {user && (
            <>
              <span className="navbar-username">{user.username}</span>
              <button className="btn btn-ghost" onClick={handleLogout} title="Sign out">
                <LogOut size={15} />
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
