import { useState, useEffect } from "react";

const CarGame = () => {
  const [high_score, setHighScore] = useState(0);

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data?.type === 'highScoreUpdate') {
        setHighScore(event.data.score);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return (
    <div style={{ width: '100%', height: '720px' }}>
      <h1>High Score: {high_score}</h1>
      <iframe
        title="Godot Game"
        src="/godot/car_game.html"
        width="100%"
        height="100%"
        frameBorder="0"
        allowFullScreen
      ></iframe>
    </div>
  );
};

export default CarGame;