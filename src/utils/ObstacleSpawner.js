import Phaser from 'phaser';

const OBSTACLE_TYPES = {
  ROCK: { frame: 1, y: 0, bodyW: 20, bodyH: 12, bodyOffX: 6, bodyOffY: 16, unlockScore: 0 },
  CACTUS: { frame: 0, y: 0, bodyW: 12, bodyH: 30, bodyOffX: 10, bodyOffY: 2, unlockScore: 50 },
  BIRD: { frame: 2, y: -60, bodyW: 18, bodyH: 10, bodyOffX: 7, bodyOffY: 10, unlockScore: 150 },
};

export default class ObstacleSpawner {
  constructor(scene, groundY) {
    this.scene = scene;
    this.groundY = groundY;
    this.obstacles = scene.physics.add.group();
    this.spawnTimer = null;
    this.baseInterval = 2000;
    this.minInterval = 700;
    this.gameSpeed = 200;
    this.score = 0;
  }

  start() {
    this.scheduleNext();
  }

  stop() {
    if (this.spawnTimer) {
      this.spawnTimer.remove();
      this.spawnTimer = null;
    }
  }

  setSpeed(speed) {
    this.gameSpeed = speed;
    // Update velocity of existing obstacles
    this.obstacles.getChildren().forEach((obs) => {
      obs.setVelocityX(-speed);
    });
  }

  setScore(score) {
    this.score = score;
  }

  scheduleNext() {
    // Interval decreases as speed increases
    const speedFactor = Math.max(0, (this.gameSpeed - 200) / 400);
    const interval = Math.max(
      this.minInterval,
      this.baseInterval - speedFactor * (this.baseInterval - this.minInterval)
    );
    // Add some randomness
    const jitter = Phaser.Math.Between(-200, 400);
    const delay = Math.max(this.minInterval, interval + jitter);

    this.spawnTimer = this.scene.time.delayedCall(delay, () => {
      this.spawn();
      this.scheduleNext();
    });
  }

  spawn() {
    const available = this.getAvailableTypes();
    const type = Phaser.Utils.Array.GetRandom(available);
    const config = OBSTACLE_TYPES[type];

    const x = this.scene.cameras.main.width + 40;
    const y = this.groundY + config.y;

    const obstacle = this.obstacles.create(x, y, 'obstacles', config.frame);
    obstacle.setScale(2);
    obstacle.setOrigin(0.5, 1);
    obstacle.body.setAllowGravity(false);
    obstacle.body.setSize(config.bodyW, config.bodyH);
    obstacle.body.setOffset(config.bodyOffX, config.bodyOffY);
    obstacle.setVelocityX(-this.gameSpeed);
    obstacle.obstacleType = type;

    // Bird bobbing animation
    if (type === 'BIRD') {
      obstacle.setOrigin(0.5, 0.5);
      obstacle.y = this.groundY - 70;
      this.scene.tweens.add({
        targets: obstacle,
        y: obstacle.y - 15,
        duration: 400,
        repeat: -1,
        yoyo: true,
        ease: 'Sine.easeInOut',
      });
    }

    return obstacle;
  }

  getAvailableTypes() {
    const types = ['ROCK'];
    if (this.score >= OBSTACLE_TYPES.CACTUS.unlockScore) types.push('CACTUS');
    if (this.score >= OBSTACLE_TYPES.BIRD.unlockScore) types.push('BIRD');
    return types;
  }

  update() {
    // Remove off-screen obstacles
    this.obstacles.getChildren().forEach((obs) => {
      if (obs.x < -50) {
        obs.destroy();
      }
    });
  }
}
