import Phaser from 'phaser';
import Dog from '../sprites/Dog.js';
import ObstacleSpawner from '../utils/ObstacleSpawner.js';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('Game');
  }

  create() {
    const { width, height } = this.cameras.main;
    this.cameras.main.fadeIn(300);

    // Game state
    this.gameSpeed = 200;
    this.score = 0;
    this.gameOver = false;
    this.speedTimer = 0;
    this.scoreTimer = 0;
    this.milestoneScore = 100;

    // Ground level
    this.groundY = height - 16;

    // --- Parallax background ---
    this.clouds = [];
    for (let i = 0; i < 6; i++) {
      const cloud = this.add.image(
        Phaser.Math.Between(0, width),
        Phaser.Math.Between(30, 130),
        'clouds'
      );
      cloud.setScale(Phaser.Math.FloatBetween(1.5, 3));
      cloud.setAlpha(Phaser.Math.FloatBetween(0.4, 0.7));
      cloud.setDepth(0);
      cloud.speed = Phaser.Math.FloatBetween(0.2, 0.5);
      this.clouds.push(cloud);
    }

    // --- Scrolling ground ---
    this.groundTiles = [];
    for (let x = -64; x < width + 128; x += 64) {
      const tile = this.add.image(x, this.groundY, 'ground');
      tile.setScale(2);
      tile.setOrigin(0, 0);
      tile.setDepth(1);
      this.groundTiles.push(tile);
    }

    // Ground physics platform (invisible)
    this.groundPlatform = this.add.rectangle(width / 2, this.groundY + 16, width * 2, 32);
    this.physics.add.existing(this.groundPlatform, true);
    this.groundPlatform.setVisible(false);

    // --- Dog ---
    this.dog = new Dog(this, 120, this.groundY);
    this.dog.setDepth(5);
    this.physics.add.collider(this.dog, this.groundPlatform);

    // --- Obstacle spawner ---
    this.obstacleSpawner = new ObstacleSpawner(this, this.groundY);
    this.physics.add.collider(this.obstacleSpawner.obstacles, this.groundPlatform);
    this.physics.add.overlap(
      this.dog,
      this.obstacleSpawner.obstacles,
      this.handleCollision,
      null,
      this
    );
    this.obstacleSpawner.start();

    // --- UI ---
    // Score text
    this.scoreText = this.add.text(width - 16, 16, '0m', {
      fontFamily: 'monospace',
      fontSize: '20px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(1, 0).setDepth(10).setScrollFactor(0);

    // Hearts
    this.hearts = [];
    for (let i = 0; i < 3; i++) {
      const heart = this.add.image(20 + i * 28, 20, 'heart');
      heart.setScale(2);
      heart.setDepth(10);
      heart.setScrollFactor(0);
      this.hearts.push(heart);
    }

    // Speed lines container (for high speed visual)
    this.speedLines = [];

    // --- Input ---
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceBar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // Touch/pointer input
    this.input.on('pointerdown', (pointer) => {
      if (this.gameOver) return;
      this.swipeStartY = pointer.y;
      this.swipeStartTime = this.time.now;
      this.dog.jump();
    });

    this.input.on('pointerup', (pointer) => {
      if (this.gameOver) return;
      if (this.swipeStartY !== undefined) {
        const deltaY = pointer.y - this.swipeStartY;
        const deltaTime = this.time.now - this.swipeStartTime;
        if (deltaY > 30 && deltaTime < 300) {
          this.dog.duck();
          this.time.delayedCall(500, () => {
            this.dog.standUp();
          });
        }
      }
      this.swipeStartY = undefined;
    });
  }

  handleCollision(dog, obstacle) {
    if (dog.invincible || this.gameOver) return;

    const survived = dog.hurt();

    // Update hearts
    this.updateHearts();

    // Destroy the obstacle that was hit
    obstacle.destroy();

    if (!survived) {
      this.triggerGameOver();
    }
  }

  updateHearts() {
    for (let i = 0; i < this.hearts.length; i++) {
      if (i < this.dog.lives) {
        this.hearts[i].setAlpha(1);
        this.hearts[i].setTint(0xffffff);
      } else {
        this.hearts[i].setAlpha(0.3);
        this.hearts[i].setTint(0x333333);
      }
    }
  }

  triggerGameOver() {
    this.gameOver = true;
    this.obstacleSpawner.stop();

    // Freeze after a short delay
    this.time.delayedCall(800, () => {
      this.physics.pause();
      const finalScore = Math.floor(this.score);
      this.scene.start('GameOver', { score: finalScore });
    });
  }

  update(time, delta) {
    if (this.gameOver) return;

    const dt = delta / 1000;

    // Update score
    this.score += this.gameSpeed * dt / 20;
    this.scoreText.setText(`${Math.floor(this.score)}m`);

    // Score milestone sound
    if (this.score >= this.milestoneScore) {
      this.dog.playSound('score');
      this.milestoneScore += 100;
    }

    // Speed increase every 10 seconds
    this.speedTimer += dt;
    if (this.speedTimer >= 10) {
      this.speedTimer = 0;
      this.gameSpeed += 20;
      this.obstacleSpawner.setSpeed(this.gameSpeed);

      // Run animation speed increases with game speed
      const animRate = 10 + (this.gameSpeed - 200) / 20;
      if (this.anims.exists('dog-run')) {
        this.anims.get('dog-run').frameRate = animRate;
      }
    }

    // Update spawner with current score
    this.obstacleSpawner.setScore(Math.floor(this.score));

    // Keyboard input
    if (Phaser.Input.Keyboard.JustDown(this.spaceBar) || Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
      this.dog.jump();
    }
    if (this.cursors.down.isDown) {
      this.dog.duck();
    } else if (this.cursors.down.isUp && this.dog.isDucking) {
      this.dog.standUp();
    }

    // Update dog
    this.dog.update();

    // Update obstacle spawner
    this.obstacleSpawner.update();

    // Scroll ground
    this.groundTiles.forEach((tile) => {
      tile.x -= this.gameSpeed * dt;
      if (tile.x < -128) {
        tile.x += (this.groundTiles.length) * 64;
      }
    });

    // Scroll clouds (parallax)
    this.clouds.forEach((cloud) => {
      cloud.x -= this.gameSpeed * dt * cloud.speed;
      if (cloud.x < -60) {
        cloud.x = this.cameras.main.width + 60;
        cloud.y = Phaser.Math.Between(30, 130);
      }
    });

    // Speed lines at high speed
    this.updateSpeedLines(dt);
  }

  updateSpeedLines(dt) {
    const { width, height } = this.cameras.main;

    // Only show speed lines above certain speed
    if (this.gameSpeed > 300) {
      // Spawn new lines occasionally
      if (Math.random() < (this.gameSpeed - 300) / 500 * dt * 10) {
        const line = this.add.rectangle(
          width + 10,
          Phaser.Math.Between(20, height - 40),
          Phaser.Math.Between(20, 60),
          1,
          0xffffff,
          0.3
        ).setDepth(2);
        this.speedLines.push(line);
      }
    }

    // Move and remove speed lines
    for (let i = this.speedLines.length - 1; i >= 0; i--) {
      const line = this.speedLines[i];
      line.x -= this.gameSpeed * dt * 1.5;
      if (line.x < -80) {
        line.destroy();
        this.speedLines.splice(i, 1);
      }
    }
  }
}
