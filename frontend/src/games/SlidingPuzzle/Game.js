import Phaser from 'phaser';
import ShinePostFX from './ShinePostFX';
import WipePostFX from './WipePostFX';

/* constants for game logic */
const SlidingPuzzle = {
    ALLOW_CLICK: 0,
    TWEENING: 1
};

// Position to center the container at (500, 375)
const offsetX = 500 - 500/2;
const offsetY = 375 - 500/2;

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
    
    const frame_inside = this.add.image(500, 375, 'frame-inside'); 
    const play_button = this.add.image(500, 500, 'play-button'); 
    
    frame_inside.setPostPipeline('WipePostFX');
    play_button.setPostPipeline([ 'WipePostFX', 'ShinePostFX' ]);
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
        duration: 2500 ,  // wipe effect duration
    });

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

    //  The number of iterations the puzzle walker will go through when
    //  scrambling up the puzzle. 10 is a nice and easy puzzle, but
    //  push it higher for much harder ones.
    this.iterations = 6;

    //  The speed at which the tiles are shuffled at the start. This allows
    //  the player to see the puzzle before trying to solve it. However if
    //  you don't want this, just set the speed to zero and it'll appear
    //  instantly 'scrambled'.
    this.shuffleSpeed = 200;
    this.shuffleEase = 'power1';

    this.lastMove = null;

    //  The image in the Cache to be used for the puzzle.
    //  Set in the startPuzzle function.
    this.photo = '';

    this.slices = [];

    this.action = SlidingPuzzle.ALLOW_CLICK;

    this.backgnd = null;

  }
  create() {
    this.add.image(500, 375, 'frame');  // add the puzzle frame
    
    window.solve = () => {  
      this.nextRound();  // when solved, continue with next level
    };

    this.backgnd = this.add.image(500, 375, 'level1-back');  // background for level 1
    this.reveal = this.add.image(offsetX, offsetY, 'level1').setOrigin(0, 0);  // reveal the image

    this.reveal.setPostPipeline('WipePostFX');
    const pipeline_reveal = this.reveal.getPostPipeline('WipePostFX');

    pipeline_reveal.setTopToBottom();
    pipeline_reveal.setRevealEffect();

    this.tweens.add({
        targets: pipeline_reveal,
        progress: 1,
        duration: 2000,
        onComplete: () => {
          this.reveal.destroy();  // destroy the reveal
          this.startPuzzle('level1', 3, 3);  // start the Puzzle
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
  startPuzzle (key, rows, columns) {
    this.photo = key;

      //  The size if the puzzle, in pieces (not pixels)
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

      //  The last piece will be our 'spacer' to slide in to
      this.spacer = this.pieces.getAt(this.pieces.length - 1);
      this.spacer.alpha = 0;

      this.lastMove = null;

      this.shufflePieces();
  }

  /**
   * This shuffles up our puzzle.
   *
   * We can't just 'randomize' the tiles, or 50% of the time we'll get an
   * unsolvable puzzle. So instead lets walk it, making non-repeating random moves.
   */
  shufflePieces ()
  {
      //  Push all available moves into this array
      const moves = [];

      const spacerCol = this.spacer.data.get('column');
      const spacerRow = this.spacer.data.get('row');

      if (spacerCol > 0 && this.lastMove !== Phaser.DOWN)
      {
          moves.push(Phaser.UP);
      }

      if (spacerCol < this.columns - 1 && this.lastMove !== Phaser.UP)
      {
          moves.push(Phaser.DOWN);
      }

      if (spacerRow > 0 && this.lastMove !== Phaser.RIGHT)
      {
          moves.push(Phaser.LEFT);
      }

      if (spacerRow < this.rows - 1 && this.lastMove !== Phaser.LEFT)
      {
          moves.push(Phaser.RIGHT);
      }

      //  Pick a move at random from the array
      this.lastMove = Phaser.Utils.Array.GetRandom(moves);

      //  Then move the spacer into the new position
      switch (this.lastMove)
      {
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
  swapPiece (row, column)
  {
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
      if (this.shuffleSpeed === 0)
      {
          piece.setPosition(x, y);

          if (this.iterations > 0)
          {
              //  Any more iterations left? If so, shuffle, otherwise start play
              this.iterations--;

              this.shufflePieces();
          }
          else
          {
              this.startPlay();
          }
      }
      else
      {
          //  Otherwise, tween it into place
          const tween = this.tweens.add({
              targets: piece,
              x,
              y,
              duration: this.shuffleSpeed,
              ease: this.shuffleEase
          });

          if (this.iterations > 0)
          {
              //  Any more iterations left? If so, shuffle, otherwise start play
              this.iterations--;

              tween.on('complete', this.shufflePieces, this);
          }
          else
          {
              tween.on('complete', this.startPlay, this);
          }
      }
  }

  /**
   * Gets the piece at row and column.
   */
  getPiece (row, column)
  {
      for (let i = 0; i < this.pieces.length; i++)
      {
          const piece = this.pieces.getAt(i);

          if (piece.data.get('row') === row && piece.data.get('column') === column)
          {
              return piece;
          }
      }

      return null;
  }

  /**
   * Sets the game state to allow the user to click.
   */
  startPlay ()
  {
      this.action = SlidingPuzzle.ALLOW_CLICK;
  }

  /**
   * Called when the user clicks on any of the puzzle pieces.
   * It first checks to see if the piece is adjacent to the 'spacer', and if not, bails out.
   * If it is, the two pieces are swapped by calling `this.slidePiece`.
   */
  checkPiece (piece)
  {
      if (this.action !== SlidingPuzzle.ALLOW_CLICK)
      {
          return;
      }

      //  Only allowed if adjacent to the 'spacer'
      //
      //  Remember:
      //
      //  Columns = vertical (y) axis
      //  Rows = horizontal (x) axis

      const spacer = this.spacer;

      if (piece.data.values.row === spacer.data.values.row)
      {
          if (spacer.data.values.column === piece.data.values.column - 1)
          {
              //  Space above the piece?
              piece.data.values.column--;

              spacer.data.values.column++;
              spacer.y += this.pieceHeight;

              this.slidePiece(piece, piece.x, piece.y - this.pieceHeight);
          }
          else if (spacer.data.values.column === piece.data.values.column + 1)
          {
              //  Space below the piece?
              piece.data.values.column++;

              spacer.data.values.column--;
              spacer.y -= this.pieceHeight;

              this.slidePiece(piece, piece.x, piece.y + this.pieceHeight);
          }
      }
      else if (piece.data.values.column === spacer.data.values.column)
      {
          if (spacer.data.values.row === piece.data.values.row - 1)
          {
              //  Space to the left of the piece?
              piece.data.values.row--;

              spacer.data.values.row++;
              spacer.x += this.pieceWidth;

              this.slidePiece(piece, piece.x - this.pieceWidth, piece.y);
          }
          else if (spacer.data.values.row === piece.data.values.row + 1)
          {
              //  Space to the right of the piece?
              piece.data.values.row++;

              spacer.data.values.row--;
              spacer.x -= this.pieceWidth;

              this.slidePiece(piece, piece.x + this.pieceWidth, piece.y);
          }
      }
  }

  /**
   * Slides the piece into the position previously occupied by the spacer.
   * Uses a tween (see slideSpeed and slideEase for controls).
   * When complete, calls tweenOver.
   */
  slidePiece (piece, x, y)
  {
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
  tweenOver ()
  {
      //  Are all the pieces in the right place?

      let outOfSequence = false;

      this.pieces.each(piece => {

          if (piece.data.values.correctRow !== piece.data.values.row || piece.data.values.correctColumn !== piece.data.values.column)
          {
              outOfSequence = true;
          }

      });

      if (outOfSequence)
      {
          //  Not correct, so let the player carry on.
          this.action = SlidingPuzzle.ALLOW_CLICK;
      }
      else
      {
          //  If we get this far then the sequence is correct and the puzzle is solved.
          //  Fade the missing piece back in ...
          //  When the tween finishes we'll let them click to start the next round

          //this.sound.play('win');

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
  nextRound ()
  {
      let size;
      let iterations;
      let nextPhoto;
      let backgnd;
    
      if (this.photo === 'level1')
      {
          nextPhoto = 'level2';
          backgnd = 'level2-back';
          iterations = 20;
          size = 4;
      }
      else if (this.photo === 'level2')
      {
          nextPhoto = 'level3';
          backgnd = 'level2-back';
          iterations = 30;
          size = 5;
      }
      else
      {
          //  Back to the start again
          nextPhoto = 'level1';
          
          iterations = 10;
          size = 3;
      }
      
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
              //this.backgnd = this.add.image(500, 375, backgnd);  // backgLevel for the next level
              this.reveal.destroy();
              this.startPuzzle(nextPhoto, size, size);
              
          }
      });
  }

  
   
}





const config = {
  type: Phaser.AUTO,
  width: 1000,
  height: 750,
  backgroundColor: '#d2a679',
  parent: 'phaser-container',
  scene: [Preloader, GameStart, Game],
  pipeline: { ShinePostFX, WipePostFX }
  
};

export default config;  // export the config object for use in ../pages/SlidingPuzzlePage.jsx
