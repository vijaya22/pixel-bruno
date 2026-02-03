import Phaser from 'phaser';

export default class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOver');
  }

  init(data) {
    this.finalScore = data.score || 0;
  }

  create() {
    const { width, height } = this.cameras.main;
    this.cameras.main.setBackgroundColor('#1a1a2e');

    // Check and update high score
    const storedHigh = parseInt(localStorage.getItem('pixelBrunoHighScore') || '0', 10);
    const isNewHigh = this.finalScore > storedHigh;
    if (isNewHigh) {
      localStorage.setItem('pixelBrunoHighScore', this.finalScore.toString());
    }
    const highScore = Math.max(storedHigh, this.finalScore);

    // Overlay
    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.6).setDepth(0);

    // Game Over text
    const gameOverText = this.add.text(width / 2, 80, 'GAME OVER', {
      fontFamily: 'monospace',
      fontSize: '48px',
      color: '#ff4444',
      stroke: '#000000',
      strokeThickness: 6,
    }).setOrigin(0.5);

    // Hurt dog
    const dog = this.add.sprite(width / 2, height / 2 - 20, 'dog-spritesheet', 6);
    dog.setScale(3);

    // Score display
    this.add.text(width / 2, height / 2 + 40, `SCORE: ${this.finalScore}m`, {
      fontFamily: 'monospace',
      fontSize: '24px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5);

    // High score
    const highColor = isNewHigh ? '#FFD700' : '#aaaaaa';
    const highPrefix = isNewHigh ? 'NEW HIGH SCORE!' : 'HIGH SCORE';
    this.add.text(width / 2, height / 2 + 75, `${highPrefix}: ${highScore}m`, {
      fontFamily: 'monospace',
      fontSize: '16px',
      color: highColor,
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5);

    // New high score celebration
    if (isNewHigh) {
      this.tweens.add({
        targets: gameOverText,
        scaleX: 1.05,
        scaleY: 1.05,
        duration: 500,
        repeat: -1,
        yoyo: true,
      });
    }

    // Restart text
    const restartText = this.add.text(width / 2, height - 80, 'TAP TO RESTART', {
      fontFamily: 'monospace',
      fontSize: '20px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5);

    this.tweens.add({
      targets: restartText,
      alpha: 0.3,
      duration: 600,
      repeat: -1,
      yoyo: true,
    });

    // Menu option
    const menuText = this.add.text(width / 2, height - 50, 'PRESS M FOR MENU', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#888888',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5);

    // Input (delayed to avoid accidental restarts)
    this.time.delayedCall(500, () => {
      this.input.once('pointerdown', () => this.restartGame());
      this.input.keyboard.once('keydown-SPACE', () => this.restartGame());
      this.input.keyboard.once('keydown-ENTER', () => this.restartGame());
      this.input.keyboard.once('keydown-M', () => this.goToMenu());
    });
  }

  restartGame() {
    this.cameras.main.fadeOut(200, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('Game');
    });
  }

  goToMenu() {
    this.cameras.main.fadeOut(200, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('Menu');
    });
  }
}
