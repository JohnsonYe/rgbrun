import React from "react";
import { NavLink } from "react-router-dom";
import "./Navbar.css";

function Navbar({ onCreateSales, onCreateParty }) {
  return (
    <nav className="navbar">
      <NavLink to="/" className="navbar-brand">
        <span className="brand-mark">R</span>
        <span>RGB Run</span>
      </NavLink>

      <div className="navbar-center">
        <NavLink to="/" end className="nav-link">
          {({ isActive }) => (
            <div className={`nav-pill ${isActive ? "active" : ""}`}>Today</div>
          )}
        </NavLink>
        <NavLink to="/history-sales" className="nav-link">
          {({ isActive }) => (
            <div className={`nav-pill ${isActive ? "active" : ""}`}>History</div>
          )}
        </NavLink>
        <NavLink to="/party-sales" className="nav-link">
          {({ isActive }) => (
            <div className={`nav-pill ${isActive ? "active" : ""}`}>Party</div>
          )}
        </NavLink>
      </div>

      <div className="navbar-right">
        <button className="btn-secondary" onClick={onCreateParty}>
          <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M12 5v14M5 12h14" strokeLinecap="round" />
          </svg>
          Party
        </button>
        <button className="btn-primary" onClick={onCreateSales}>
          <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M12 5v14M5 12h14" strokeLinecap="round" />
          </svg>
          Sale
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
