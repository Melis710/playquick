import React from "react";
import { useEffect } from 'react';
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

  return (
    <div style={{textAlign: 'center', padding: '20px' }}>
      <h2>PlayQuick Game Preview</h2>
      <div id="phaser-container" />
    </div>
  );
}

