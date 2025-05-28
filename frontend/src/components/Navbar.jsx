import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";
import logo from "../assets/playquick-logo.png";

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="nav-left">
        <div className="logo">
          <img src={logo} alt="PlayQuick Logo" />
        </div>
        <ul className="nav-links">
          <li><Link to="/">Home</Link></li>
          <li className="search-container">
            <i className="fas fa-search search-icon"></i>
            <form action="/search" method="GET">
              <input type="text" name="q" placeholder="Search games by name" className="search-input" />
            </form>
          </li>
          <li><Link to="/random">Random Play</Link></li>
        </ul>
      </div>

      <div className="nav-right">
        <ul>
          <li><Link to="/about">About</Link></li>
        </ul>
      </div>

    </nav>
  );
};

export default Navbar;



