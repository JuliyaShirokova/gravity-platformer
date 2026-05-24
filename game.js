const config = {
  type: Phaser.AUTO,
  width: 640,
  height: 360,
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 600 }, debug: false }
  },
  scene: { preload, create, update }
};

const game = new Phaser.Game(config);

function preload() {}

function create() {
   // Фон со звёздами
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e);
    bg.fillRect(0, 0, 640, 360);

    for (let i = 0; i < 80; i++) {
    const x = Phaser.Math.Between(0, 640);
    const y = Phaser.Math.Between(0, 360);
    const size = Phaser.Math.FloatBetween(0.5, 2);
    const brightness = Phaser.Math.Between(150, 255);
    const color = Phaser.Display.Color.GetColor(brightness, brightness, brightness);
    bg.fillStyle(color);
    bg.fillRect(x, y, size, size);
    }
  
  const platforms = this.physics.add.staticGroup();

  // Пол
  platforms.create(320, 350, null)
    .setDisplaySize(640, 20).setTint(0x00ff88).refreshBody();

  // Потолок
  platforms.create(320, 10, null)
    .setDisplaySize(640, 20).setTint(0x00ff88).refreshBody();

  // Платформы в воздухе
  platforms.create(150, 250, null)
    .setDisplaySize(120, 16).setTint(0x4488ff).refreshBody();

  platforms.create(350, 180, null)
    .setDisplaySize(120, 16).setTint(0x4488ff).refreshBody();

  platforms.create(530, 250, null)
    .setDisplaySize(120, 16).setTint(0x4488ff).refreshBody();

  platforms.create(250, 110, null)
    .setDisplaySize(120, 16).setTint(0xff4488).refreshBody();

  platforms.create(470, 110, null)
    .setDisplaySize(120, 16).setTint(0xff4488).refreshBody();

  // Монеты
  this.coins = this.physics.add.staticGroup();
  const coinPositions = [
    [150, 220], [350, 150], [530, 220],
    [250, 80],  [470, 80],  [400, 320]
  ];
  coinPositions.forEach(([x, y]) => {
    this.coins.create(x, y, null)
      .setDisplaySize(12, 12).setTint(0xffdd00).refreshBody();
  });

  // Игрок
    const playerGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    playerGraphics.fillStyle(0xff6600);
    playerGraphics.fillRect(0, 0, 28, 28);
    playerGraphics.generateTexture('player', 28, 28);
    playerGraphics.destroy();

    this.player = this.physics.add.sprite(60, 300, 'player');
    this.player.setBounce(0).setCollideWorldBounds(true);
    this.player.setBounce(0).setCollideWorldBounds(true);

    this.physics.add.collider(this.player, platforms);

  // Сбор монет
  this.score = 0;
  this.physics.add.overlap(this.player, this.coins, (player, coin) => {
    coin.destroy();
    this.score++;
    this.scoreText.setText('Монеты: ' + this.score);
    new Audio(this.soundCoin).play();
  });

  // Управление
    this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.keyE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.keyX = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);
    this.shiftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
    this.gravityFlipped = false;

  // Интерфейс
  this.scoreText = this.add.text(10, 10, 'Монеты: 0', {
    fontSize: '14px', fill: '#ffdd00'
  }).setScrollFactor(0);

  this.add.text(10, 340, 'S D движение  |  E прыжок вверх  |  X прыжок вниз  |  SHIFT гравитация', {
    fontSize: '10px', fill: '#aaaaaa'
  }).setScrollFactor(0);
   
  //Звуки
    this.soundJump = jsfxr([0,0.35,0.12,,0.18,0.28,,,,,,,,,,,,,1,,,,,0.5]);
    this.soundFlip = jsfxr([3,0.05,0.25,,0.1,0.15,,,,,,,,,,,-0.12,,1,,,,,0.5]);
    this.soundCoin = jsfxr([0,,,0.02,0.1,0.6,,,0.54,,,0.36,,,,,,,,1,,,,,0.5]);
  
    // Музыка
    // Фоновая 8-битная музыка
    const notes = [
    329, 329, 0, 329, 0, 262, 329, 0,
    392, 0, 0, 0, 196, 0, 0, 0
    ];

    let noteIndex = 0;
    const bpm = 140;
    const noteTime = (60 / bpm) * 0.5;

    // Музыка запустится после первого нажатия клавиши
    this.input.keyboard.once('keydown', () => {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.audioCtx = ctx;

    this.musicTimer = this.time.addEvent({
        delay: noteTime * 1000,
        loop: true,
        callback: () => {
        const freq = notes[noteIndex % notes.length];
        if (freq > 0) {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.type = 'square';
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0.08, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0, ctx.currentTime + noteTime * 0.8);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + noteTime);
        }
        noteIndex++;
        }
    });
    });

  // Жизни
    this.lives = 3;
    this.livesText = this.add.text(550, 10, '❤️ x3', {
    fontSize: '14px', fill: '#ff4444'
    }).setScrollFactor(0);

    // Враг
  // Создаём красную текстуру для врага
    const enemyGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    enemyGraphics.fillStyle(0xff0000);
    enemyGraphics.fillRect(0, 0, 28, 28);
    enemyGraphics.generateTexture('enemy', 28, 28);
    enemyGraphics.destroy();

    this.enemy = this.physics.add.sprite(400, 300, 'enemy');
    this.enemy.setCollideWorldBounds(true).setBounce(1, 0);
    this.enemy.setVelocityX(120);
    this.enemy.setCollideWorldBounds(true).setBounce(1, 0);
    this.enemy.setVelocityX(120);
    this.physics.add.collider(this.enemy, platforms);

    // Столкновение игрока с врагом
    this.physics.add.overlap(this.player, this.enemy, () => {
    this.lives--;
    this.livesText.setText('❤️ x' + this.lives);
    this.playSound(100, 50, 0.3, 'sawtooth');
    // Откидываем игрока назад
    this.player.setVelocityX(this.player.x < this.enemy.x ? -300 : 300);
    this.player.setVelocityY(this.gravityFlipped ? 300 : -300);

    if (this.lives <= 0) {
        this.add.text(220, 160, 'GAME OVER', {
        fontSize: '48px', fill: '#ff0000'
        });
        this.physics.pause();
    }
    });

}

function update() {
  const onGround = this.player.body.blocked.down || this.player.body.blocked.up;

  if (this.keyS.isDown) {
    this.player.setVelocityX(-220);
  } else if (this.keyD.isDown) {
    this.player.setVelocityX(220);
  } else {
    this.player.setVelocityX(0);
  }

  // E — прыжок вверх, X — прыжок вниз (при инвертированной гравитации)
  if (this.keyE.isDown && onGround && !this.gravityFlipped) {
    this.player.setVelocityY(-450);
    new Audio(this.soundJump).play();
  }
  if (this.keyX.isDown && onGround && this.gravityFlipped) {
    this.player.setVelocityY(450);
    new Audio(this.soundJump).play();
  }

  if (Phaser.Input.Keyboard.JustDown(this.shiftKey)) {
    this.gravityFlipped = !this.gravityFlipped;
    this.physics.world.gravity.y = this.gravityFlipped ? -600 : 600;
    this.player.setFlipY(this.gravityFlipped);
    new Audio(this.soundFlip).play();
  }
}