import { Link } from "react-router-dom";
import logo from "../assets/playquick-logo.png";

const Navbar = () => {
  return (
    <nav className="bg-blue-400">
      <ul className="max-w-full p-3 pb-0 font-medium flow-root">
        <li className="hover:bg-blue-200 rounded-md hover:border-gray-700 border-transparent border-2 float-left object-contain origin-left h-10 w-20 box-content">
          <Link to="/"><img className="" src={logo} alt="PlayQuick Logo" /></Link>
          </li>
        <li className="hover:bg-blue-200 rounded-md hover:border-gray-700 border-transparent border-2 float-left mx-4"><Link to="/random">Random Play</Link></li>
        <li className="flex flex-wrap items-center justify-start p-0 gap-1 float-left mx-4">
          <i className="fas fa-search search-icon"></i>
          <form action="/search" method="GET">
            <input type="text" name="q" placeholder="Search games by name" className="search-input rounded-md" />
          </form>
          </li>
        <li className="hover:bg-blue-200 rounded-md hover:border-gray-700 border-transparent border-2 float-left mx-4"><Link to="/sliding_puzzle_game">SlidingPuzzle</Link></li>
        <li className="hover:bg-blue-200 rounded-md hover:border-gray-700 border-transparent border-2 float-left mx-4"><Link to="/car_game">CarGame</Link></li>
        <li className="hover:bg-blue-200 rounded-md hover:border-gray-700 border-transparent border-2 float-right mx-4"><Link to="/about">About</Link></li>
      </ul>
    </nav>


    /*
    <nav className="bg-blue-400 border-gray-400 border">
      <div className="flex items-center justify-between mx-0 p-1">
        <ul className="font-medium flex flex-col p-0 mt-0 border border-gray-400 rounded-lg bg-gray-50">
          <li className="block py-2 px-3 text-white"><Link to="/"><img src={logo} alt="PlayQuick Logo" /></Link></li>
          
          <li><Link to="/random">Random Play</Link></li>
          
        
        </ul>
      </div>

      <div className="nav-right">
        
        <ul>
          
        </ul>
      </div>

    </nav>
    */
  );
};

export default Navbar;



