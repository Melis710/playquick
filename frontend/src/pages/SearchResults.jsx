import React, { useState } from "react";
import { useLocation, Link } from "react-router-dom";

const games = [
  { id: 1, name: "Car Game", path: "/car_game" },
  { id: 2, name: "Sliding Puzzle Game", path: "/sliding_puzzle_game" },
];

const SearchResults = () => {
  const location = useLocation();
  const query = new URLSearchParams(location.search).get("q") || ""; // Get 'q' parameter from URL
  const [filteredGames, setFilteredGames] = useState([]);

  React.useEffect(() => {
    const results = games.filter((game) =>
      game.name.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredGames(results);
  }, [query]);

  return (
    <div>
      <h2>Search Results</h2>
      <ul>
        {filteredGames.length > 0 ? (
          filteredGames.map((game) => (
            <li key={game.id}>
              <Link to={game.path}>{game.name}</Link>
            </li>
          ))
        ) : (
          <p>No results found.</p>
        )}
      </ul>
    </div>
  );
};

export default SearchResults;