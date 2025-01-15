import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

function Navbar({ onCreateSales }) {
  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/" className="nav-link">
          <div className="navbar-button">Today's Sales</div>
        </Link>
        <Link to="/history-sales" className="nav-link">
            <div className="navbar-button">History Sales</div>
        </Link>
      </div>
      <div className="navbar-right">
        <button className="create-sales-btn" onClick={onCreateSales}>
          Create Sales
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
