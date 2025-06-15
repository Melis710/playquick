
import { FaPlay } from 'react-icons/fa';
import api from '../api/api';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const GameSelect = ({gameName, gameNameDisplay}) => {
  const navigate = useNavigate();
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchScores = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/score/players/${encodeURIComponent(gameName)}`);
        setScores(res.data.users);
      } catch (err) {
        setError("Failed to load scores.");
      } finally {
        setLoading(false);
      }
    };

    fetchScores();
  }, [gameName]);

  return (
    <div className="box-border w-96 border-4 p-4 bg-blue-400 mx-10 flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-4">{gameNameDisplay}</h1>
      <div className="flex w-full max-w-5xl gap-8">
        <button
          onClick={() => navigate(`/${gameName}`)}
          className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg shadow-md">
          <FaPlay />
          Play
        </button>
        <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-md p-4 w-72 bg-white shadow">
          <h2 className="text-lg font-semibold mb-2">Leaderboard</h2>
          {loading && <p>Loading...</p>}
          {error && <p className="text-red-500">{error}</p>}
          <ul className="divide-y divide-gray-200">
            {scores.map((entry, index) => (
              <li key={index} className="flex justify-between py-2 text-sm">
                <span>{entry.username}</span>
                <span>{entry.score}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default GameSelect