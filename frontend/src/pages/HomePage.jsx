
import React from "react";
import Header from "../components/Header";
import { Link } from "react-router-dom";


const HomePage = () => {
  return (
    <div className='HomePage'>
      <Header />
      <Link to="/car_game">Car Game</Link>
    </div>
  );
};

export default HomePage;
