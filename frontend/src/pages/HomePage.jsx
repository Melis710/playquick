
import React from "react";
import Header from "../components/Header";
import GameSelect from "../components/GameSelect";

const HomePage = () => {

  return (
    <div className="flex flex-col gap-y-4">
      <Header />
      <GameSelect gameName="car_game" gameNameDisplay="Car Game" ></GameSelect>
      <GameSelect gameName="sliding_puzzle_game" gameNameDisplay="Sliding Puzzle Game" ></GameSelect>
    </div>
    
  );
};

export default HomePage;
