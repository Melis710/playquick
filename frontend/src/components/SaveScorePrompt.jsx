import React, { useState, useRef, useEffect } from "react";
import { X } from "lucide-react";
import api from "../api/api";

const SaveScorePrompt = ({ visible, onClose, score, gameName }) => {
  const [wantsToSave, setWantsToSave] = useState(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const modalRef = useRef(null);
  const clickStartedInside = useRef(false);

  useEffect(() => {
    if (!visible) return;

    const handleMouseDown = (e) => {
      if (modalRef.current?.contains(e.target)) {
        clickStartedInside.current = true;
      } else {
        clickStartedInside.current = false;
      }
    };

    const handleMouseUp = (e) => {
      const endedInside = modalRef.current?.contains(e.target);
      if (!clickStartedInside.current && !endedInside) {
        handleClose();
      }
    };

    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [visible]);

  if (!visible) return null;

  const handleClose = () => {
    setWantsToSave(null);
    setUsername("");
    setPassword("");
    setMessage("");
    onClose?.();
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/score/save", {
        username,
        password,
        game_name: gameName,
        score,
      });
      setMessage("Score saved successfully!");
      setTimeout(handleClose, 1500);
    } catch (error) {
      if (error?.response?.data?.error) {
        setMessage(error.response.data.error);
      } else {
        setMessage("Failed to save score. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
      <div
        ref={modalRef}
        className="relative bg-white p-6 rounded-2xl shadow-lg w-full max-w-md"
      >
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-black"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        {wantsToSave === null ? (
          <>
            <h2 className="text-xl font-semibold mb-4">
              Do you want to save your score of {score}?
            </h2>
            <div className="flex gap-4">
              <button
                onClick={() => setWantsToSave(true)}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl"
              >
                Yes
              </button>
              <button
                onClick={handleClose}
                className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-xl"
              >
                No
              </button>
            </div>
          </>
        ) : (
          <form onSubmit={handleSave} className="space-y-4">
            <h2 className="text-xl font-semibold mb-2">
              Save Your Score of {score}
            </h2>
            <input
              type="text"
              placeholder="Username"
              className="w-full p-2 border rounded-xl"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full p-2 border rounded-xl"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-xl"
            >
              {loading ? "Saving..." : "Submit"}
            </button>
            {message && (
              <p className="text-sm text-center mt-2 text-red-500">{message}</p>
            )}
          </form>
        )}
      </div>
    </div>
  );
};

export default SaveScorePrompt;
