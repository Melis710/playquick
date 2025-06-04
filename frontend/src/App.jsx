
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import About from "./pages/About";
import RandomPlay from "./pages/RandomPlay";
import SearchResults from "./pages/SearchResults";
import CarGame from './games/CarGame'
import PuzzleGame from "./games/PuzzleGame";

function App() {

  return (
    <Router>
      <Navbar />
      <div style={{ paddingTop: "80px" }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<About />} />
          <Route path="/random" element={<RandomPlay />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/car_game" element={<CarGame />} />
          <Route path="/puzzle_game" element={<PuzzleGame />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
