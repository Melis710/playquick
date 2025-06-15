
import React from "react";
import Header from "../components/Header";
import { Link } from "react-router-dom";
import GameSelect from "../components/GameSelect";

const HomePage = () => {
  return (
    <div className='HomePage'>
      <Header />
      <GameSelect></GameSelect>
    </div>
  );
};

export default HomePage;
