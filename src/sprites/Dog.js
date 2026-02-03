import Phaser from 'phaser';

export default class Dog extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'dog-spritesheet', 7);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setScale(2);
    this.setOrigin(0.5, 1);

    // Physics body
    this.body.setSize(20, 28);
    this.body.setOffset(6, 4);
    this.setCollideWorldBounds(true);

    // State
    this.isJumping = false;
    this.isDucking = false;
    this.isHurt = false;
    this.isAlive = true;
    this.lives = 3;
    this.invincible = false;
    this.invincibilityTimer = null;
    this.normalBodySize = { width: 20, height: 28, offX: 6, offY: 4 };
    this.duckBodySize = { width: 24, height: 14, offX: 4, offY: 18 };

    // Create animations
    this.createAnimations();

    // Dust particle emitter
    this.dustEmitter = scene.add.particles(0, 0, 'dust', {
      speed: { min: 10, max: 40 },
      angle: { min: 150, max: 210 },
      scale: { start: 1, end: 0 },
      lifespan: 400,
      frequency: 120,
      alpha: { start: 0.8, end: 0 },
      gravityY: -50,
      on: false,
    });
  }

  createAnimations() {
    const scene = this.scene;

    if (!scene.anims.exists('dog-run')) {
      scene.anims.create({
        key: 'dog-run',
        frames: [
          { key: 'dog-spritesheet', frame: 0 },
          { key: 'dog-spritesheet', frame: 1 },
          { key: 'dog-spritesheet', frame: 2 },
          { key: 'dog-spritesheet', frame: 3 },
        ],
        frameRate: 10,
        repeat: -1,
      });

      scene.anims.create({
        key: 'dog-jump',
        frames: [{ key: 'dog-spritesheet', frame: 4 }],
        frameRate: 1,
      });

      scene.anims.create({
        key: 'dog-duck',
        frames: [{ key: 'dog-spritesheet', frame: 5 }],
        frameRate: 1,
      });

      scene.anims.create({
        key: 'dog-hurt',
        frames: [{ key: 'dog-spritesheet', frame: 6 }],
        frameRate: 1,
      });

      scene.anims.create({
        key: 'dog-idle',
        frames: [{ key: 'dog-spritesheet', frame: 7 }],
        frameRate: 1,
      });
    }
  }

  jump() {
    if (!this.isAlive || this.isDucking) return;
    if (this.body.blocked.down || this.body.touching.down) {
      this.setVelocityY(-420);
      this.isJumping = true;
      this.isDucking = false;
      this.play('dog-jump', true);

      // Squash and stretch effect
      this.setScale(2.2, 1.8);
      this.scene.tweens.add({
        targets: this,
        scaleX: 2,
        scaleY: 2,
        duration: 200,
        ease: 'Back.easeOut',
      });

      this.playSound('jump');
    }
  }

  duck() {
    if (!this.isAlive || this.isJumping) return;
    if (!this.isDucking) {
      this.isDucking = true;
      this.play('dog-duck', true);
      // Shrink hitbox for ducking
      this.body.setSize(this.duckBodySize.width, this.duckBodySize.height);
      this.body.setOffset(this.duckBodySize.offX, this.duckBodySize.offY);
    }
  }

  standUp() {
    if (this.isDucking) {
      this.isDucking = false;
      this.body.setSize(this.normalBodySize.width, this.normalBodySize.height);
      this.body.setOffset(this.normalBodySize.offX, this.normalBodySize.offY);
    }
  }

  hurt() {
    if (!this.isAlive || this.invincible) return;

    this.lives--;
    this.isHurt = true;
    this.invincible = true;

    this.play('dog-hurt', true);
    this.playSound('hit');

    // Camera shake
    this.scene.cameras.main.shake(200, 0.01);

    // Tint redder with fewer lives
    const tints = [0xffffff, 0xffaaaa, 0xff6666, 0xff2222];
    this.setTint(tints[3 - this.lives] || 0xff0000);

    // Flash during invincibility
    this.scene.tweens.add({
      targets: this,
      alpha: 0.3,
      duration: 100,
      repeat: 7,
      yoyo: true,
      onComplete: () => {
        this.alpha = 1;
      },
    });

    // Invincibility period
    if (this.invincibilityTimer) {
      this.invincibilityTimer.remove();
    }
    this.invincibilityTimer = this.scene.time.delayedCall(1500, () => {
      this.invincible = false;
      this.isHurt = false;
    });

    if (this.lives <= 0) {
      this.isAlive = false;
      this.setVelocityY(-200);
      this.dustEmitter.stop();
      return false;
    }
    return true;
  }

  playSound(key) {
    // Use Web Audio API for generated sounds
    const cached = this.scene.cache.audio.get(key);
    if (cached && cached.data) {
      try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const source = audioContext.createBufferSource();
        source.buffer = cached.data;
        source.connect(audioContext.destination);
        source.start(0);
        source.onended = () => audioContext.close();
      } catch (e) {
        // Ignore audio errors
      }
    }
  }

  update() {
    if (!this.isAlive) return;

    // Landing detection
    if (this.isJumping && (this.body.blocked.down || this.body.touching.down)) {
      this.isJumping = false;
      // Landing squash
      this.setScale(2.2, 1.8);
      this.scene.tweens.add({
        targets: this,
        scaleX: 2,
        scaleY: 2,
        duration: 150,
        ease: 'Bounce.easeOut',
      });
    }

    // Play correct animation
    if (!this.isHurt) {
      if (this.isJumping) {
        this.play('dog-jump', true);
      } else if (this.isDucking) {
        this.play('dog-duck', true);
      } else {
        this.play('dog-run', true);
      }
    }

    // Dust particles while running on ground
    if (!this.isJumping && !this.isDucking && this.body.blocked.down) {
      this.dustEmitter.setPosition(this.x - 10, this.y - 4);
      this.dustEmitter.start();
    } else {
      this.dustEmitter.stop();
    }
  }
}
