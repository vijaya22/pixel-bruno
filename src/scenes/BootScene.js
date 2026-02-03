import Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  preload() {
    // Create loading bar
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const barBg = this.add.rectangle(width / 2, height / 2, 300, 24, 0x222222);
    const bar = this.add.rectangle(width / 2 - 148, height / 2, 0, 20, 0x44aa44);
    bar.setOrigin(0, 0.5);

    const loadingText = this.add.text(width / 2, height / 2 - 30, 'Loading...', {
      fontFamily: 'monospace',
      fontSize: '16px',
      color: '#ffffff',
    }).setOrigin(0.5);

    this.load.on('progress', (value) => {
      bar.width = 296 * value;
    });

    this.load.on('complete', () => {
      loadingText.setText('Ready!');
    });

    // Generate all placeholder assets programmatically
    this.generateAssets();
  }

  generateAssets() {
    // --- Dog spritesheet: 32x32, 8 frames ---
    // Frames: 0-3 run, 4 jump, 5 duck, 6 hurt, 7 idle
    const dogCanvas = document.createElement('canvas');
    dogCanvas.width = 256; // 8 frames * 32
    dogCanvas.height = 32;
    const dctx = dogCanvas.getContext('2d');

    const dogColor = '#8B4513';
    const dogLight = '#CD853F';
    const dogDark = '#5C2E00';
    const eyeColor = '#FFFFFF';
    const noseColor = '#000000';

    for (let f = 0; f < 8; f++) {
      const ox = f * 32;
      const isRun = f < 4;
      const isJump = f === 4;
      const isDuck = f === 5;
      const isHurt = f === 6;

      // Body
      if (isDuck) {
        // Ducking: wider, shorter body
        fillRect(dctx, ox + 4, 18, 24, 10, dogColor);
        fillRect(dctx, ox + 2, 20, 4, 6, dogColor);
        // Head (low)
        fillRect(dctx, ox + 22, 16, 8, 8, dogLight);
        // Eye
        fillRect(dctx, ox + 26, 18, 2, 2, eyeColor);
        fillRect(dctx, ox + 27, 18, 1, 1, noseColor);
        // Ears flat
        fillRect(dctx, ox + 24, 15, 3, 2, dogDark);
        // Legs (short)
        fillRect(dctx, ox + 6, 28, 3, 4, dogDark);
        fillRect(dctx, ox + 20, 28, 3, 4, dogDark);
        // Tail
        fillRect(dctx, ox + 2, 17, 3, 2, dogColor);
      } else {
        const bodyY = isJump ? 4 : 6;
        // Torso
        fillRect(dctx, ox + 6, bodyY + 4, 18, 12, dogColor);
        // Chest
        fillRect(dctx, ox + 20, bodyY + 6, 4, 8, dogLight);
        // Head
        fillRect(dctx, ox + 20, bodyY, 10, 10, dogLight);
        // Ear
        fillRect(dctx, ox + 22, bodyY - 2, 3, 4, dogDark);
        // Eye
        fillRect(dctx, ox + 26, bodyY + 2, 2, 2, eyeColor);
        fillRect(dctx, ox + 27, bodyY + 2, 1, 1, noseColor);
        // Nose
        fillRect(dctx, ox + 29, bodyY + 5, 2, 2, noseColor);
        // Mouth (hurt)
        if (isHurt) {
          fillRect(dctx, ox + 27, bodyY + 7, 3, 1, noseColor);
          // X eyes
          fillRect(dctx, ox + 26, bodyY + 2, 1, 1, '#ff0000');
          fillRect(dctx, ox + 27, bodyY + 3, 1, 1, '#ff0000');
          fillRect(dctx, ox + 27, bodyY + 2, 1, 1, '#ff0000');
          fillRect(dctx, ox + 26, bodyY + 3, 1, 1, '#ff0000');
        }
        // Tail
        const tailY = isJump ? bodyY + 2 : bodyY + 3;
        fillRect(dctx, ox + 3, tailY, 4, 2, dogColor);
        fillRect(dctx, ox + 2, tailY - 2, 2, 3, dogColor);

        // Legs with run animation
        if (isRun) {
          const legOffsets = [
            [0, 2, -2, 0],
            [2, 0, 0, -2],
            [-2, 0, 2, 0],
            [0, -2, 0, 2],
          ];
          const lo = legOffsets[f];
          // Front legs
          fillRect(dctx, ox + 18, bodyY + 16 + lo[0], 3, 6 - lo[0], dogDark);
          fillRect(dctx, ox + 22, bodyY + 16 + lo[1], 3, 6 - lo[1], dogDark);
          // Back legs
          fillRect(dctx, ox + 8, bodyY + 16 + lo[2], 3, 6 - lo[2], dogDark);
          fillRect(dctx, ox + 12, bodyY + 16 + lo[3], 3, 6 - lo[3], dogDark);
        } else if (isJump) {
          // Legs tucked
          fillRect(dctx, ox + 18, bodyY + 14, 3, 4, dogDark);
          fillRect(dctx, ox + 22, bodyY + 14, 3, 4, dogDark);
          fillRect(dctx, ox + 8, bodyY + 14, 3, 4, dogDark);
          fillRect(dctx, ox + 12, bodyY + 14, 3, 4, dogDark);
        } else {
          // Standing legs (idle/hurt)
          fillRect(dctx, ox + 18, bodyY + 16, 3, 6, dogDark);
          fillRect(dctx, ox + 22, bodyY + 16, 3, 6, dogDark);
          fillRect(dctx, ox + 8, bodyY + 16, 3, 6, dogDark);
          fillRect(dctx, ox + 12, bodyY + 16, 3, 6, dogDark);
        }
      }
    }

    this.textures.addCanvas('dog-spritesheet', dogCanvas);

    // --- Obstacles spritesheet: 3 obstacles, each 32x32 ---
    const obsCanvas = document.createElement('canvas');
    obsCanvas.width = 96;
    obsCanvas.height = 32;
    const octx = obsCanvas.getContext('2d');

    // Cactus (tall)
    fillRect(octx, 12, 2, 8, 30, '#2d6b2d');
    fillRect(octx, 6, 8, 6, 4, '#2d6b2d');
    fillRect(octx, 6, 6, 2, 6, '#2d6b2d');
    fillRect(octx, 20, 12, 6, 4, '#2d6b2d');
    fillRect(octx, 24, 10, 2, 6, '#2d6b2d');
    fillRect(octx, 14, 4, 4, 2, '#1a4a1a');
    // Spines
    fillRect(octx, 10, 5, 1, 1, '#1a4a1a');
    fillRect(octx, 21, 9, 1, 1, '#1a4a1a');

    // Rock (short)
    fillRect(octx, 36, 20, 20, 12, '#666666');
    fillRect(octx, 38, 18, 16, 4, '#777777');
    fillRect(octx, 40, 16, 12, 4, '#888888');
    fillRect(octx, 42, 18, 2, 2, '#555555');
    fillRect(octx, 50, 20, 2, 2, '#555555');

    // Bird (flying)
    fillRect(octx, 72, 12, 16, 6, '#444444');
    fillRect(octx, 76, 10, 8, 2, '#555555');
    // Wings
    fillRect(octx, 68, 8, 6, 4, '#555555');
    fillRect(octx, 86, 8, 6, 4, '#555555');
    fillRect(octx, 66, 6, 4, 3, '#555555');
    fillRect(octx, 88, 6, 4, 3, '#555555');
    // Eye
    fillRect(octx, 86, 13, 2, 2, '#ffffff');
    fillRect(octx, 87, 13, 1, 1, '#000000');
    // Beak
    fillRect(octx, 88, 15, 4, 2, '#cc8800');

    this.textures.addCanvas('obstacles', obsCanvas);

    // --- Ground tile: 64x16 ---
    const groundCanvas = document.createElement('canvas');
    groundCanvas.width = 64;
    groundCanvas.height = 16;
    const gctx = groundCanvas.getContext('2d');

    fillRect(gctx, 0, 0, 64, 3, '#4a8c2a');
    fillRect(gctx, 0, 3, 64, 13, '#8B6914');
    fillRect(gctx, 0, 3, 64, 2, '#7a5c12');
    // Grass blades
    for (let i = 0; i < 64; i += 4) {
      const h = 1 + Math.floor(Math.random() * 3);
      fillRect(gctx, i, -h + 3, 2, h, '#3a7c1a');
    }
    // Dirt texture
    for (let i = 0; i < 10; i++) {
      const dx = Math.floor(Math.random() * 60);
      const dy = 5 + Math.floor(Math.random() * 10);
      fillRect(gctx, dx, dy, 2, 1, '#9a7924');
    }
    this.textures.addCanvas('ground', groundCanvas);

    // --- Cloud: 48x20 ---
    const cloudCanvas = document.createElement('canvas');
    cloudCanvas.width = 48;
    cloudCanvas.height = 20;
    const cctx = cloudCanvas.getContext('2d');

    fillRect(cctx, 8, 6, 32, 10, '#ffffff');
    fillRect(cctx, 4, 8, 8, 6, '#ffffff');
    fillRect(cctx, 36, 8, 8, 6, '#ffffff');
    fillRect(cctx, 14, 2, 12, 6, '#ffffff');
    fillRect(cctx, 24, 4, 14, 6, '#ffffff');
    // Shading
    fillRect(cctx, 8, 14, 32, 2, '#e8e8e8');
    fillRect(cctx, 4, 12, 8, 2, '#e8e8e8');

    this.textures.addCanvas('clouds', cloudCanvas);

    // --- Heart: 12x12 ---
    const heartCanvas = document.createElement('canvas');
    heartCanvas.width = 12;
    heartCanvas.height = 12;
    const hctx = heartCanvas.getContext('2d');

    fillRect(hctx, 1, 2, 4, 3, '#ff0000');
    fillRect(hctx, 7, 2, 4, 3, '#ff0000');
    fillRect(hctx, 0, 4, 12, 3, '#ff0000');
    fillRect(hctx, 1, 7, 10, 2, '#ff0000');
    fillRect(hctx, 2, 9, 8, 1, '#ff0000');
    fillRect(hctx, 3, 10, 6, 1, '#ff0000');
    fillRect(hctx, 4, 11, 4, 1, '#ff0000');
    // Shine
    fillRect(hctx, 2, 3, 2, 1, '#ff6666');

    this.textures.addCanvas('heart', heartCanvas);

    // --- Dust particle: 4x4 ---
    const dustCanvas = document.createElement('canvas');
    dustCanvas.width = 4;
    dustCanvas.height = 4;
    const dustCtx = dustCanvas.getContext('2d');
    fillRect(dustCtx, 0, 0, 4, 4, '#c8b070');
    fillRect(dustCtx, 1, 1, 2, 2, '#d4c090');
    this.textures.addCanvas('dust', dustCanvas);

    // Generate placeholder sounds
    this.generateSounds();
  }

  generateSounds() {
    // We'll create silent audio buffers as placeholders
    // The game will work without actual audio files
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();

    const createBeep = (frequency, duration, type = 'square') => {
      const sampleRate = audioContext.sampleRate;
      const length = sampleRate * duration;
      const buffer = audioContext.createBuffer(1, length, sampleRate);
      const data = buffer.getChannelData(0);

      for (let i = 0; i < length; i++) {
        const t = i / sampleRate;
        let val = 0;
        if (type === 'square') {
          val = Math.sin(2 * Math.PI * frequency * t) > 0 ? 0.3 : -0.3;
        } else if (type === 'noise') {
          val = (Math.random() * 2 - 1) * 0.3 * Math.max(0, 1 - t / duration);
        } else if (type === 'sine') {
          val = Math.sin(2 * Math.PI * frequency * t) * 0.3 * Math.max(0, 1 - t / duration);
        }
        // Fade out
        const fade = Math.max(0, 1 - (t / duration));
        data[i] = val * fade;
      }
      return buffer;
    };

    // Jump sound: rising pitch
    const jumpBuffer = audioContext.createBuffer(1, audioContext.sampleRate * 0.15, audioContext.sampleRate);
    const jumpData = jumpBuffer.getChannelData(0);
    for (let i = 0; i < jumpBuffer.length; i++) {
      const t = i / audioContext.sampleRate;
      const freq = 300 + (t / 0.15) * 400;
      jumpData[i] = (Math.sin(2 * Math.PI * freq * t) > 0 ? 0.25 : -0.25) * (1 - t / 0.15);
    }
    this.cache.audio.add('jump', { data: jumpBuffer, sampleRate: audioContext.sampleRate });

    // Hit sound: noise burst
    const hitBuffer = createBeep(200, 0.2, 'noise');
    this.cache.audio.add('hit', { data: hitBuffer, sampleRate: audioContext.sampleRate });

    // Score sound: two quick beeps
    const scoreBuffer = audioContext.createBuffer(1, audioContext.sampleRate * 0.15, audioContext.sampleRate);
    const scoreData = scoreBuffer.getChannelData(0);
    for (let i = 0; i < scoreBuffer.length; i++) {
      const t = i / audioContext.sampleRate;
      const freq = t < 0.07 ? 600 : 800;
      scoreData[i] = Math.sin(2 * Math.PI * freq * t) * 0.2 * (1 - t / 0.15);
    }
    this.cache.audio.add('score', { data: scoreBuffer, sampleRate: audioContext.sampleRate });

    audioContext.close();
  }

  create() {
    // Create spritesheet frame data for dog
    const dogTexture = this.textures.get('dog-spritesheet');
    dogTexture.add('__BASE', 0, 0, 0, 256, 32);
    for (let i = 0; i < 8; i++) {
      dogTexture.add(i, 0, i * 32, 0, 32, 32);
    }

    // Create spritesheet frame data for obstacles
    const obsTexture = this.textures.get('obstacles');
    obsTexture.add('__BASE', 0, 0, 0, 96, 32);
    for (let i = 0; i < 3; i++) {
      obsTexture.add(i, 0, i * 32, 0, 32, 32);
    }

    this.scene.start('Menu');
  }
}

function fillRect(ctx, x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}
