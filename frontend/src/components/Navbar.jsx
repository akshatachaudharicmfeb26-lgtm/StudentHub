import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, LogOut, LayoutDashboard, User, ShieldAlert } from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAdmin, isStudent, isSuperAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar glass">
      <Link to="/" className="nav-brand">
        <BookOpen size={24} color="#88c440" />
        <span>StudentHub</span>
      </Link>
      
      <ul className="nav-links">
        <li>
          <NavLink to="/" end className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
            Home
          </NavLink>
        </li>
        <li>
          <NavLink to="/about" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
            About Us
          </NavLink>
        </li>
        <li>
          <NavLink to="/contact" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
            Contact Us
          </NavLink>
        </li>

        {user && (
          <>
            {isSuperAdmin && isSuperAdmin() && (
              <li>
                <NavLink to="/super-admin" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                  <span className="btn-icon-align"><ShieldAlert size={15} /> Super Admin Dashboard</span>
                </NavLink>
              </li>
            )}

            {isAdmin() && (
              <li>
                <NavLink to="/admin" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                  <span className="btn-icon-align"><ShieldAlert size={15} /> Admin Dashboard</span>
                </NavLink>
              </li>
            )}

            {isStudent() && (
              <li>
                <NavLink to="/student" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                  <span className="btn-icon-align"><LayoutDashboard size={15} /> Student Dashboard</span>
                </NavLink>
              </li>
            )}
            
            <li>
              <NavLink to="/profile" className="nav-profile-badge">
                <User size={14} /> {user.fullName.split(' ')[0]}
              </NavLink>
            </li>
            
            <li>
              <button 
                onClick={handleLogout} 
                className="btn btn-danger btn-sm"
              >
                <LogOut size={13} /> Logout
              </button>
            </li>
          </>
        )}

        {!user && (
          <>
            <li>
              <NavLink to="/login" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                Login
              </NavLink>
            </li>
            <li>
              <NavLink to="/register" className="btn btn-primary btn-sm">
                Sign Up
              </NavLink>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
