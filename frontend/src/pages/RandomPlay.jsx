
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const RandomPlay = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const gamePages = ['/car_game','/puzzle_game']
        const random = gamePages[Math.floor(Math.random()*gamePages.length)];
        navigate(random);
    }, [navigate]);
    
    return <p>Redirecting you to a random game...</p>;
}

export default RandomPlay;