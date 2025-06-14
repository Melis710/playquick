import { useEffect, useState } from "react";
import SaveScorePrompt from "../components/SaveScorePrompt";

const CarGame = () => {
  const [showSavePrompt, setShowSavePrompt] = useState(false);
  const [score, setScore] = useState(null);

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.origin !== window.location.origin) return;

      if (event.data?.type === "highScoreUpdate") {
        setScore(event.data.score);
        setShowSavePrompt(true);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return (
    <div style={{ width: "100%", height: "720px", position: "relative" }}>
      <iframe
        title="Godot Game"
        src="/godot/car_game.html"
        width="100%"
        height="100%"
        frameBorder="0"
        allowFullScreen
      ></iframe>

      <SaveScorePrompt
        visible={showSavePrompt}
        onClose={() => setShowSavePrompt(false)}
        score={score}
        gameName="car_game"
      />
    </div>
  );
};

export default CarGame;