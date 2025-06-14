import React, { useEffect } from "react";
import Phaser from 'phaser';
import config from '../games/SlidingPuzzle/Game';

let game = null;

export default function SlidingPuzzlePage() {

  useEffect(() => {
    if (!game) {
      game = new Phaser.Game(config);
    }

    return () => {
      if (game) {
        game.destroy(true);
        game = null;
      }
    };
  }, []);

  const handleFullscreen = () => {
    if (!game) return;

    const scale = game.scale;
    if (!scale.isFullscreen) {
      scale.startFullscreen();
    } else {
      scale.stopFullscreen();
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

    console.log('Global background color set to:', color);
  };

  const colorButtonStyle = {
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    border: '2px solid white',
    cursor: 'pointer',
  };

  const fullscreenButtonStyle = {
    width: '35px',
    height: '35px',
    fontSize: '20px',
    cursor: 'pointer',
    borderRadius: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    border: '1px solid #ccc',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    userSelect: 'none',
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden' }}>
      
      {/* Phaser Container (ortada, olduğu gibi) */}
      <div
        id="phaser-container"
        style={{
          width: '1000px',
          height: '750px',
          margin: '0 auto',
          position: 'relative',
          top: '0',
          zIndex: 0,
        }}
      />

      {/* Üst Bar (Phaser container'ın üstünde overlay gibi) */}
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
        {/* Oyun Adı */}
        <div style={{ fontSize: '20px', fontWeight: 'bold', padding: '20px', color: '#ffa366' }}>
          Sliding Puzzle Game
        </div>

        {/* Renk Butonları + Fullscreen */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {['#cce6ff', '#ffccff', '#ccffef', '#e6cab3'].map((color) => (
            <button
              key={color}
              onClick={() => handleColorChange(color)}
              style={{ ...colorButtonStyle, backgroundColor: color }}
              title={`Change background to ${color}`}
            />
          ))}
          <button
            onClick={handleFullscreen}
            style={fullscreenButtonStyle}
            title="Fullscreen"
          >
            ⛶
          </button>
        </div>
      </div>
    </div>
  );
}
