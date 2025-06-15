import React, { useEffect, useState } from "react";
import Phaser from 'phaser';
import config from '../games/SlidingPuzzle/Game';
import { FaVolumeMute, FaVolumeUp } from 'react-icons/fa';


let game = null;
export default function SlidingPuzzlePage() {
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (!game) {
      game = new Phaser.Game(config); 
    } else {
      if (game.sound) {
        game.sound.mute = isMuted;
      }
    }

    const checkMute = () => {
      if (game && game.sound) {
        setIsMuted(game.sound.mute);
      }
    };

    const timer = setTimeout(checkMute, 500);

    return () => {
      if (game) {
        game.destroy(true);
        game = null;
      }
      clearTimeout(timer);
    };
  }, []);

  const toggleMute = () => {
    if (!game || !game.sound) return;

    const newMuteState = !game.sound.mute;
    game.sound.mute = newMuteState;

    setIsMuted(newMuteState);
  };

  const handleFullscreen = () => {
    if (!game) return;

    const scale = game.scale;
    if (!scale.isFullscreen) {
      scale.startFullscreen();
      scale.setMode(Phaser.Scale.FIT);
      scale.refresh();
    } else {
      scale.stopFullscreen();
      scale.setMode(Phaser.Scale.NONE);
      scale.refresh();
    }
  };

  const handleColorChange = (color) => {
    if (!game) return;

    game.registry.set('bgColor', color);

    game.scene.scenes.forEach(scene => {
      if (!scene.hasBackgroundColorListener) {
        scene.events.on('start', () => {
          if (scene.cameras && scene.cameras.main) {
            const currentColor = game.registry.get('bgColor') || '#d2a679';
            scene.cameras.main.setBackgroundColor(currentColor);
          }
        });
        scene.hasBackgroundColorListener = true;
      }

      if (scene.cameras && scene.cameras.main) {
        scene.cameras.main.setBackgroundColor(color);
      }
    });
  };

  const colorButtonStyle = {
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    border: '2px solid white',
    cursor: 'pointer',
  };

  const iconButtonStyle = {
    width: '30px',
    height: '30px',
    fontSize: '20px',
    cursor: 'pointer',
    borderRadius: '50%',
    backgroundColor: 'rgba(255, 255, 255)',
    border: '2px solid white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    userSelect: 'none',
    color: '#333',
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>

      {/* Phaser Container */}
      <div
        id="phaser-container"
        style={{
          width: '100%',
          height: '100vh',
          margin: '0 auto',
          position: 'relative',
          top: '0',
          zIndex: 0,
        }}
      />

      {/* Top Bar */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '1000px',
          height: '40px',
          backgroundColor: '#3366ff',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 0px',
          borderRadius: '0px',
          zIndex: 10,
          boxShadow: '2px 2px 2px rgba(0,0,0,0.5)'
        }}
      >
        {/* Game Title */}
        <div style={{ fontSize: '20px', fontWeight: 'bold', padding: '20px', color: '#ffa366' }}>
          Sliding Puzzle Game
        </div>

        {/* Control Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingRight: '10px' }}>
          {/* Color buttons */}
          {['#cce6ff', '#ffccff', '#ccffef', '#e6cab3'].map((color) => (
            <button
              key={color}
              onClick={() => handleColorChange(color)}
              style={{ ...colorButtonStyle, backgroundColor: color }}
              title={`Change background to ${color}`}
            />
          ))}

          {/* Mute Button */}
          <button onClick={toggleMute} style={iconButtonStyle} title={isMuted ? 'Unmute' : 'Mute'}>
            {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
          </button>

          {/* Fullscreen */}
          <button
            onClick={handleFullscreen}
            style={iconButtonStyle}
            title="Fullscreen"
          >
            ⛶
          </button>
        </div>
      </div>
    </div>
  );
}
