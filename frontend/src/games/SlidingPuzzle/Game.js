import Phaser from 'phaser';
import ShinePostFX from './ShinePostFX';
import WipePostFX from './WipePostFX';

/* constants for game logic */
const SlidingPuzzle = {
  ALLOW_CLICK: 0,
  TWEENING: 1
};

// Constants for display positions of things in game screen
const timer_x = 875;
const timer_y = 250;
const timer_color = '#490d00';
const PenaltyPerMove = 5;
const PenaltyPerSecond = 3
const BasePoints = 50;

// Position to center the container at (500, 375)
const offsetX = 500 - 500 / 2;
const offsetY = 375 - 500 / 2;

/* Preloader */
class Preloader extends Phaser.Scene {
  constructor() {
    super('Preloader');
  }
  /* Load all game assets */
  preload() {
    this.load.image('frame', 'src/games/SlidingPuzzle/assets/frame.png');  // frame for the puzzle 
    this.load.image('play-button', 'src/games/SlidingPuzzle/assets/play-button.png');  // play button image
    this.load.image('frame-inside', 'src/games/SlidingPuzzle/assets/frame-inside.png');  // inside frame for the starting scene
    this.load.image('level1-back', 'src/games/SlidingPuzzle/assets/level1-back.jpg');  // backgLevel for level 1
    this.load.image('level1', 'src/games/SlidingPuzzle/assets/level1.jpg');  // puzzle image for level 1
    this.load.image('level2-back', 'src/games/SlidingPuzzle/assets/level2-back.jpg');  // backgLevel for level 2
    this.load.image('level2', 'src/games/SlidingPuzzle/assets/level2.jpg');  // puzzle image for level 2
  }
  create() {
    
    this.scene.start('GameStart');  // start the GameStart scene after preloading
  }
}

/* Game starting scene */
class GameStart extends Phaser.Scene {
  constructor() {
    super('GameStart');
  }
  create() {
    const color = this.registry.get('bgColor') || '#e6cab3';
this.cameras.main.setBackgroundColor(color);
    const frame_inside = this.add.image(500, 375, 'frame-inside');
    const play_button = this.add.image(500, 500, 'play-button');

    

    frame_inside.setPostPipeline('WipePostFX');
    play_button.setPostPipeline(['WipePostFX', 'ShinePostFX']);
    play_button.setInteractive();  // to make the play button work

    const pipeline = frame_inside.getPostPipeline('WipePostFX');
    const pipeline_button = play_button.getPostPipeline('WipePostFX');  // pipeline for the play button
    pipeline.setTopToBottom();
    pipeline.setRevealEffect();
    pipeline_button.setTopToBottom();
    pipeline_button.setRevealEffect();

    // Set the game cover wipe effect
    this.tweens.add({
      targets: pipeline,
      progress: 1,
      duration: 2500,  // wipe effect duration
    });
    // Set the play button effects
    this.tweens.add({
      targets: pipeline_button,
      progress: 1,
      duration: 2500,
    });
    // Set the play button shine effect and click event responses
    this.tweens.add({
      targets: play_button,
      y: 500,
      delay: 1500,
      duration: 150,  // response to the click
      ease: 'sine.out',
      onComplete: () => {
        play_button.once('pointerdown', () => {
          pipeline.setWipeEffect();
          //pipeline.setTexture('');
          this.tweens.add({
            targets: play_button,
            alpha: 0,
            duration: 500,  // fade out the play button in 0.5 secs
            ease: 'sine.out'
          });
          this.tweens.add({
            targets: pipeline,
            progress: 1,
            duration: 2000,  // wipe effect duration
            onComplete: () => {
              this.scene.start('Game');
              
            }
          });
        });
      }
    });
  }
}

/* Game Logic Scene */
class Game extends Phaser.Scene {
  constructor() {
    super('Game');

    /* attributes will be all set in the startPuzzle function */
    this.rows = 0;  // number of rows in the puzzle
    this.columns = 0;  // number of columns in the puzzle
    this.pieceWidth = 0;  // width of each tile in the puzzle
    this.pieceHeight = 0;  // height of each tile in the puzzle
    this.pieces = null;
    this.spacer = null;
    //  The speed at which the tiles slide, and the tween they use
    this.slideSpeed = 300;
    this.slideEase = 'power3';
    this.iterations = 15;  // number of iterations for the puzzle walker scrambling up the puzzle
    this.shuffleSpeed = 100;  // speed of the shuffle, 0 for instantly scrambled
    this.shuffleEase = 'power1';
    this.lastMove = null;
    this.photo = '';  // image to be used for the puzzle
    this.slices = [];
    this.action = SlidingPuzzle.ALLOW_CLICK;
    this.backgnd = null;
    this.leveltimer = null;  // max amount of time to complete each level
    this.moves = null;  // user valid moves on puzzle pieces 
    this.moveText = null;  // text object
    this.movesLabel = null;
    this.score = 0;  // cumulative score
    this.scoreLabel = null;  // text object for score
    this.scoreText = null;  // text object for score val
    this.BaseScore = null;  // base score according to each level
  }

  create() {
    
    const color = this.registry.get('bgColor') || '#e6cab3';
this.cameras.main.setBackgroundColor(color);
    const frame = this.add.image(500, 375, 'frame');  // add the puzzle frame

    window.solve = () => {
      this.nextRound();  // when solved, continue with next level
    };

    // Set the first level 
    this.backgnd = this.add.image(500, 375, 'level1-back');  // background for level 1
    this.reveal = this.add.image(offsetX, offsetY, 'level1').setOrigin(0, 0);  // reveal the image
    // reveal image effects
    this.reveal.setPostPipeline('WipePostFX');
    const pipeline_reveal = this.reveal.getPostPipeline('WipePostFX');

    pipeline_reveal.setTopToBottom();
    pipeline_reveal.setRevealEffect();

    /*this.scale.on('resize', (gameSize) => {
        const width = gameSize.width;
        const height = gameSize.height;

        backgnd.setPosition(width / 2, height / 2);
        reveal.setPosition(width / 2, height / 2 + 125);
        frame.setPosition(width / 2, height / 2 + 125);
    });*/

    this.tweens.add({
      targets: pipeline_reveal,
      progress: 1,
      duration: 2000,
      onComplete: () => {
        this.reveal.destroy();  // destroy the reveal
        this.leveltimer = 120;  // set timer to 2 mins for level1
        this.BaseScore = 500;  // base score is 500 for level1
        this.scoreLabel = this.add.text(timer_x, timer_y+300, 'Score:', {
      fontSize: '28px',
      fontFamily: 'Arial',
      color: timer_color,
      //fontStyle: 'bold',
    }).setOrigin(0.5);
    this.scoreText = this.add.text(timer_x+70, timer_y+300, this.score.toString(), {
      fontSize: '28px',
      fontFamily: 'Arial',
      color: timer_color,
      //fontStyle: 'bold',
    }).setOrigin(0.5);
        this.startPuzzle('level1', 2, 2);  // start the Puzzle
      }
    });
  }

  /**
   * startPuzzle builds the puzzle.
   *  params:
   *    key: key of the image
   *    rows: number of rows in puzzle
   *    columns: number of columns in puzzle
   */
  startPuzzle(key, rows, columns) {
    this.photo = key;

    //  The size of the puzzle, in pieces (not pixels)
    this.rows = rows;
    this.columns = columns;
    //  Get the size of the source image
    const texture = this.textures.getFrame(key);
    const photoWidth = texture.width;
    const photoHeight = texture.height;

    /* Create sliding pieces */
    const pieceWidth = photoWidth / rows;  // width of each tile
    const pieceHeight = photoHeight / columns;  // height of each tile

    this.pieceWidth = pieceWidth;
    this.pieceHeight = pieceHeight;

    //  A Container to put the pieces in
    if (this.pieces) {  // if already puzzle pieces (after first round), remove all
      this.pieces.removeAll(true);
    } else {
      //  The position sets the top-left of the container for the pieces to expand down from
      this.pieces = this.add.container(offsetX, offsetY);
    }

    //  An array to put the texture slices in
    if (this.slices) {  // if already slices, remove them
      this.slices.forEach(slice => slice.destroy());
      this.slices = [];
    }

    let i = 0;  // slices array index
    /*  Loop through the image and create a new Sprite for each piece of the puzzle. */
    for (let y = 0; y < this.columns; y++) {
      for (let x = 0; x < this.rows; x++) {
        const slice = this.textures.addDynamicTexture(`slice${i}`, pieceWidth, pieceHeight);
        const ox = 0 + (x / this.rows);  // horizontal origin
        const oy = 0 + (y / this.columns);  // vertical origin
        slice.stamp(key, null, 0, 0, { originX: ox, originY: oy });
        this.slices.push(slice);  // push slice to slices array
        const piece = this.add.image(x * pieceWidth, y * pieceHeight, `slice${i}`);
        piece.setOrigin(0, 0);

        //  The current row and column of the piece
        //  Store the row and column the piece _should_ be in, when the puzzle is solved
        piece.setData({
          row: x,
          column: y,
          correctRow: x,
          correctColumn: y
        });

        piece.setInteractive();
        piece.on('pointerdown', () => this.checkPiece(piece));
        this.pieces.add(piece);
        i++;
      }
    }

    this.spacer = this.pieces.getAt(this.pieces.length - 1);  // last piece of the puzzle
    this.spacer.alpha = 0;  // make the spacer invisible
    this.lastMove = null;
    this.shufflePieces();
  }

  /**
   * This shuffles up our puzzle, walking it. It makes non-repeating random moves.
   */
  shufflePieces() {
    //  Push all available moves into this array
    const moves = [];

    const spacerCol = this.spacer.data.get('column');
    const spacerRow = this.spacer.data.get('row');

    /* check the lastMove in order not to return the previous location */
    if (spacerCol > 0 && this.lastMove !== Phaser.DOWN) {
      moves.push(Phaser.UP);
    }

    if (spacerCol < this.columns - 1 && this.lastMove !== Phaser.UP) {
      moves.push(Phaser.DOWN);
    }

    if (spacerRow > 0 && this.lastMove !== Phaser.RIGHT) {
      moves.push(Phaser.LEFT);
    }

    if (spacerRow < this.rows - 1 && this.lastMove !== Phaser.LEFT) {
      moves.push(Phaser.RIGHT);
    }

    //  Pick a move at random from the array
    this.lastMove = Phaser.Utils.Array.GetRandom(moves);

    //  Then move the spacer into the new position
    switch (this.lastMove) {
      case Phaser.UP:
        this.swapPiece(spacerRow, spacerCol - 1);
        break;

      case Phaser.DOWN:
        this.swapPiece(spacerRow, spacerCol + 1);
        break;

      case Phaser.LEFT:
        this.swapPiece(spacerRow - 1, spacerCol);
        break;

      case Phaser.RIGHT:
        this.swapPiece(spacerRow + 1, spacerCol);
        break;
    }

  }

  /**
   * Swaps the spacer with the piece in the given row and column.
   */
  swapPiece(row, column) {
    //  row and column is the new destination of the spacer

    const piece = this.getPiece(row, column);

    const spacer = this.spacer;
    const x = spacer.x;
    const y = spacer.y;

    // piece.data.set({
    //     row: spacer.data.get('row'),
    //     column: spacer.data.get('column')
    // });

    piece.data.values.row = spacer.data.values.row;
    piece.data.values.column = spacer.data.values.column;

    spacer.data.values.row = row;
    spacer.data.values.column = column;

    // spacer.data.set({
    //     row,
    //     column
    // });

    // this.spacer.data.row = row;
    // this.spacer.data.column = column;

    spacer.setPosition(piece.x, piece.y);

    //  If we don't want them to watch the puzzle get shuffled, then just
    //  set the piece to the new position immediately.
    if (this.shuffleSpeed === 0) {
      piece.setPosition(x, y);

      if (this.iterations > 0) {
        //  Any more iterations left? If so, shuffle, otherwise start play
        this.iterations--;

        this.shufflePieces();
      }
      else {
        this.startPlay();
      }
    }
    else {
      //  Otherwise, tween it into place
      const tween = this.tweens.add({
        targets: piece,
        x,
        y,
        duration: this.shuffleSpeed,
        ease: this.shuffleEase
      });

      if (this.iterations > 0) {
        //  Any more iterations left? If so, shuffle, otherwise start play
        this.iterations--;

        tween.on('complete', this.shufflePieces, this);
      }
      else {
        tween.on('complete', this.startPlay, this);
      }
    }
  }

  /**
   * Gets the piece at row and column.
   */
  getPiece(row, column) {
    for (let i = 0; i < this.pieces.length; i++) {
      const piece = this.pieces.getAt(i);

      if (piece.data.get('row') === row && piece.data.get('column') === column) {
        return piece;
      }
    }

    return null;
  }

  /**
   * Sets the game state to allow the user to click.
   */
  startPlay() {
    this.action = SlidingPuzzle.ALLOW_CLICK;  // game actually starts for user
    this.moves = 0;  // initialize move count for the new level
    const moveX = timer_x;
    const moveY = timer_y+150;

    // Moves
    this.movesLabel = this.add.text(moveX, moveY, 'Moves:', {
      fontSize: '28px',
      fontFamily: 'Arial',
      color: timer_color,
      //fontStyle: 'bold',
    }).setOrigin(0.5);
    this.moveText = this.add.text(moveX+70, moveY, this.moves.toString(), {
      fontSize: '28px',
      fontFamily: 'Arial',
      color: timer_color,
    }).setOrigin(0.5);
    
    
    this.startLevelCountdown(this.leveltimer);  // start the timer
  }

  /**
   * Called when the user clicks on any of the puzzle pieces.
   * It first checks to see if the piece is adjacent to the 'spacer', and if not, bails out.
   * If it is, the two pieces are swapped by calling `this.slidePiece`.
   */
  checkPiece(piece) {
    if (this.action !== SlidingPuzzle.ALLOW_CLICK) {
      return;
    }

    //  Only allowed if adjacent to the 'spacer'
    //
    //  Remember:
    //
    //  Columns = vertical (y) axis
    //  Rows = horizontal (x) axis

    const spacer = this.spacer;

    if (piece.data.values.row === spacer.data.values.row) {
      if (spacer.data.values.column === piece.data.values.column - 1) {
        //  Space above the piece?
        piece.data.values.column--;

        spacer.data.values.column++;
        spacer.y += this.pieceHeight;

        this.slidePiece(piece, piece.x, piece.y - this.pieceHeight);
        this.moves++;
      }
      else if (spacer.data.values.column === piece.data.values.column + 1) {
        //  Space below the piece?
        piece.data.values.column++;

        spacer.data.values.column--;
        spacer.y -= this.pieceHeight;

        this.slidePiece(piece, piece.x, piece.y + this.pieceHeight);
        this.moves++;
      }
    }
    else if (piece.data.values.column === spacer.data.values.column) {
      if (spacer.data.values.row === piece.data.values.row - 1) {
        //  Space to the left of the piece?
        piece.data.values.row--;

        spacer.data.values.row++;
        spacer.x += this.pieceWidth;

        this.slidePiece(piece, piece.x - this.pieceWidth, piece.y);
        this.moves++;
      }
      else if (spacer.data.values.row === piece.data.values.row + 1) {
        //  Space to the right of the piece?
        piece.data.values.row++;

        spacer.data.values.row--;
        spacer.x -= this.pieceWidth;

        this.slidePiece(piece, piece.x + this.pieceWidth, piece.y);
        this.moves++;
      }
    }
    this.moveText.setText(this.moves.toString());


  }

  /**
   * Slides the piece into the position previously occupied by the spacer.
   * Uses a tween (see slideSpeed and slideEase for controls).
   * When complete, calls tweenOver.
   */
  slidePiece(piece, x, y) {
    this.action = SlidingPuzzle.TWEENING;

    //this.sound.play('move');

    this.tweens.add({
      targets: piece,
      x,
      y,
      duration: this.slideSpeed,
      ease: this.slideEase,
      onComplete: () => this.tweenOver()
    });
  }

  /**
   * Called when a piece finishes sliding into place.
   * First checks if the puzzle is solved. If not, allows the player to carry on.
   */
  tweenOver() {
    //  Are all the pieces in the right place?

    let outOfSequence = false;

    this.pieces.each(piece => {

      if (piece.data.values.correctRow !== piece.data.values.row || piece.data.values.correctColumn !== piece.data.values.column) {
        outOfSequence = true;
      }

    });

    if (outOfSequence) {
      //  Not correct, so let the player carry on.
      this.action = SlidingPuzzle.ALLOW_CLICK;
    }
    else {
      //  If we get this far then the sequence is correct and the puzzle is solved.
      //  Fade the missing piece back in ...
      //  When the tween finishes we'll let them click to start the next round

      //this.sound.play('win');
      /* calculate the level's score and find the cumulative score */
      // Score = Math.min(BaseScore - (PenaltyPerMove * Moves) - (PenaltyPerSecond * TimeElapsed)) + basePoints
      let levelScore = Math.min(this.BaseScore - (PenaltyPerMove*this.moves) - (PenaltyPerSecond * (this.leveltimer-this.timeLeft))) + BasePoints;
      this.score = levelScore;

      this.timerEvent.destroy();
      this.timerText.destroy();
      this.timerGraphics.destroy();
      this.moveText.destroy();
      this.movesLabel.destroy();
      this.scoreText.setText(this.score.toString());  // update score
      this.tweens.add({
        targets: this.spacer,
        alpha: 1,
        duration: this.slideSpeed,  // this.slideSpeed * 2
        ease: 'linear',
        onComplete: () => {
          this.input.once('pointerdown', this.nextRound, this);
        }
      });

      this.pieces.each(piece => {
        piece.setPostPipeline('ShinePostFX');
      });
    }
  }

  /**
   * Starts the next round of the game.
   *
   * In this template it cycles between the 3 pictures, increasing the iterations and complexity
   * as it progresses. But you can replace this with whatever you need - perhaps returning to
   * a main menu to select a new puzzle?
   */
  nextRound() {
    let size;
    let iterations;
    let nextPhoto;
    let backgnd;

    if (this.photo === 'level1') {
      nextPhoto = 'level2';
      backgnd = 'level2-back';
      iterations = 5;
      size = 4;
      this.leveltimer = 120;  // set timer to 4 mins for level2
      this.BaseScore = 1000;
    } /*else if (this.photo === 'level2') {
      nextPhoto = 'level2';
      backgnd = 'level2-back';
      iterations = 30;
      size = 5;
    }*/

    // if next level configured, set and start the next level
    this.moveText.destroy();
    this.movesLabel.destroy();


    this.backgnd.setTexture(backgnd);  // replace the puzzle background 
    this.reveal = this.add.image(this.pieces.x, this.pieces.y, nextPhoto).setOrigin(0, 0);
    this.reveal.setPostPipeline('WipePostFX');
    const pipeline = this.reveal.getPostPipeline('WipePostFX');
    pipeline.setTopToBottom();
    pipeline.setRevealEffect();

    this.tweens.add({
      targets: pipeline,
      progress: 1,
      duration: 2000,

      onComplete: () => {
        this.photo = nextPhoto;
        this.iterations = iterations;
        this.reveal.destroy();
        if (size && iterations && nextPhoto && backgnd) {
          this.startPuzzle(nextPhoto, size, size);
        } else {
          this.scene.start('FinalScene');
        }
      }
    });

  }

  startLevelCountdown(seconds) {
    // If timer exists from previous level, destroy 
    if (this.timerText) this.timerText.destroy();
    if (this.timerGraphics) this.timerGraphics.destroy();
    // initialize time values with the argument passed in
    this.timeLeft = seconds;
    this.totalTime = seconds;

    const { width } = this.sys.game.canvas;
    const padding = 20;
    const radius = 60; // reduce size to fit nicely in the corner
    const arcX = width - radius - padding;
    const arcY = radius + padding;

    this.timerText = this.add.text(timer_x, timer_y, '', {
      fontSize: '28px',
      fontFamily: 'monospace',
      color: timer_color,
      align: 'center'
    }).setOrigin(0.5);

    // Draw arc centered at (arcX, arcY)
    this.timerGraphics = this.add.graphics({ x: timer_x, y: timer_y });


    /*const { width, height } = this.sys.game.canvas;
    const radius = 100;
  
    // Sayaç yazısı
    this.timerText = this.add.text(width / 2, height / 2, '', {
      fontSize: '40px',
      fontFamily: 'monospace',
      color: '#ffffff'
    }).setOrigin(0.5);
  
    // Yay çizimi için graphics objesi
    this.timerGraphics = this.add.graphics({ x: width / 2, y: height / 2 });*/

    const updateTimerDisplay = () => {
      const minutes = Math.floor(this.timeLeft / 60);
      const seconds = this.timeLeft % 60;
      this.timerText.setText(`${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
    };

    const drawArc = () => {
      const progress = this.timeLeft / this.totalTime;
      const startAngle = Phaser.Math.DegToRad(270);
      const endAngle = startAngle + Phaser.Math.PI2 * progress;
      this.timerGraphics.clear();
      this.timerGraphics.lineStyle(5, timer_color, 1);
      this.timerGraphics.beginPath();
      this.timerGraphics.arc(0, 0, radius, startAngle, endAngle, false);
      this.timerGraphics.strokePath();
    };

    updateTimerDisplay();
    drawArc();

    this.timerEvent = this.time.addEvent({
      delay: 1000,
      repeat: seconds - 1,
      callback: () => {
        this.timeLeft--;
        updateTimerDisplay();
        drawArc();

        if (this.timeLeft === 0) {
          this.onCountdownFinished();
        }
      }
    });
  }
}


class FinalScene extends Phaser.Scene {
  constructor() {
    super('FinalScene');
  }

  preload() {

    this.load.spritesheet('raster', 'https://labs.phaser.io/assets/demoscene/sunset-raster.png', { frameWidth: 16, frameHeight: 16 });
  }

  create() {
    const color = this.registry.get('bgColor') || '#e6cab3';
this.cameras.main.setBackgroundColor(color);
    this.add.particles(0, 0, 'raster', {
      speed: 100,
      lifespan: 5000,
      gravityY: 100,
      frame: [0, 4, 8, 12, 16],
      x: { min: 0, max: 800 },
      scaleX: {
        onEmit: (particle) => {
          return -1.0
        },
        onUpdate: (particle) => {
          return (particle.scaleX > 1.0 ? -1.0 : particle.scaleX + 0.05)
        }
      },
      rotate: {
        onEmit: (particle) => {
          return 0
        },
        onUpdate: (particle) => {
          return particle.angle + 1
        }
      }
    });
  }
}


const config = {
  type: Phaser.AUTO,
  width: 1000,
  height: 750,
  backgroundColor: '#e6cab3',
  parent: 'phaser-container',
  scene: [Preloader, GameStart, Game, FinalScene], //
  pipeline: { ShinePostFX, WipePostFX },
  
  

};  

export default config;  // export the config object for use in ../pages/SlidingPuzzlePage.jsx
