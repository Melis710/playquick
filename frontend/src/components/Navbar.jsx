import { Link } from "react-router-dom";
import "./Navbar.css";
import logo from "../assets/playquick-logo.png";

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="nav-left">
        <ul className="nav-links">
          <div className="logo">
          <li><Link to="/"><img src={logo} alt="PlayQuick Logo" /></Link></li>
          </div>
          <li className="search-container">
            <i className="fas fa-search search-icon"></i>
            <form action="/search" method="GET">
              <input type="text" name="q" placeholder="Search games by name" className="search-input" />
            </form>
          </li>
          <li><Link to="/random">Random Play</Link></li>
          <li><Link to="/sliding-puzzle-game">SlidingPuzzle</Link></li>
          
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



