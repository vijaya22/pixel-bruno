import Phaser from 'phaser';

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super('Menu');
  }

  create() {
    const { width, height } = this.cameras.main;

    // Sky gradient background
    this.cameras.main.setBackgroundColor('#87CEEB');

    // Clouds
    for (let i = 0; i < 5; i++) {
      const cloud = this.add.image(
        Phaser.Math.Between(50, width - 50),
        Phaser.Math.Between(30, 120),
        'clouds'
      );
      cloud.setScale(Phaser.Math.FloatBetween(1.5, 3));
      cloud.setAlpha(Phaser.Math.FloatBetween(0.5, 0.8));
      this.tweens.add({
        targets: cloud,
        x: cloud.x - 200,
        duration: Phaser.Math.Between(8000, 15000),
        repeat: -1,
        yoyo: true,
        ease: 'Sine.easeInOut',
      });
    }

    // Ground
    for (let x = 0; x < width + 64; x += 64) {
      this.add.image(x, height - 8, 'ground').setScale(2);
    }

    // Dog idle animation in the center
    const dog = this.add.sprite(width / 2, height - 56, 'dog-spritesheet', 7);
    dog.setScale(3);

    // Simple idle bob
    this.tweens.add({
      targets: dog,
      y: dog.y - 6,
      duration: 800,
      repeat: -1,
      yoyo: true,
      ease: 'Sine.easeInOut',
    });

    // Title
    const title = this.add.text(width / 2, 80, 'PIXEL BRUNO', {
      fontFamily: 'monospace',
      fontSize: '48px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 6,
    }).setOrigin(0.5);

    // Subtitle
    const subtitle = this.add.text(width / 2, 130, 'An Endless Runner', {
      fontFamily: 'monospace',
      fontSize: '16px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5);

    // Tap to start text
    const startText = this.add.text(width / 2, height - 100, 'TAP TO START', {
      fontFamily: 'monospace',
      fontSize: '20px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5);

    // Blink the start text
    this.tweens.add({
      targets: startText,
      alpha: 0.3,
      duration: 600,
      repeat: -1,
      yoyo: true,
      ease: 'Sine.easeInOut',
    });

    // Controls hint
    this.add.text(width / 2, height - 70, 'SPACE/TAP = Jump  |  DOWN/SWIPE = Duck', {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: '#cccccc',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5);

    // High score
    const highScore = localStorage.getItem('pixelBrunoHighScore') || 0;
    if (highScore > 0) {
      this.add.text(width / 2, 160, `HIGH SCORE: ${highScore}m`, {
        fontFamily: 'monospace',
        fontSize: '14px',
        color: '#FFD700',
        stroke: '#000000',
        strokeThickness: 3,
      }).setOrigin(0.5);
    }

    // Start game on input
    this.input.once('pointerdown', () => this.startGame());
    this.input.keyboard.once('keydown-SPACE', () => this.startGame());
    this.input.keyboard.once('keydown-ENTER', () => this.startGame());
  }

  startGame() {
    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('Game');
    });
  }
}
