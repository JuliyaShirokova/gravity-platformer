const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 500,
  backgroundColor: '#000000',
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
  bg.fillRect(0, 0, 800, 500);
  for (let i = 0; i < 100; i++) {
    const x = Phaser.Math.Between(0, 800);
    const y = Phaser.Math.Between(0, 500);
    const size = Phaser.Math.FloatBetween(0.5, 2);
    const brightness = Phaser.Math.Between(150, 255);
    bg.fillStyle(Phaser.Display.Color.GetColor(brightness, brightness, brightness));
    bg.fillRect(x, y, size, size);
  }

  // Текстура платформы
  if (this.textures.exists('tile')) this.textures.remove('tile');
  const tg = this.make.graphics({ x: 0, y: 0, add: false });
  tg.fillStyle(0x8B4513);
  tg.fillRect(0, 0, 32, 16);
  tg.fillStyle(0x228B22);
  tg.fillRect(0, 0, 32, 5);
  tg.fillStyle(0x33aa33);
  tg.fillRect(2, 1, 4, 3);
  tg.fillRect(10, 0, 3, 4);
  tg.fillRect(20, 1, 5, 3);
  tg.fillStyle(0x000000);
  tg.fillRect(0, 5, 32, 1);
  tg.generateTexture('tile', 32, 16);
  tg.destroy();

  // Текстура игрока
  if (this.textures.exists('player')) this.textures.remove('player');
  const pg = this.make.graphics({ x: 0, y: 0, add: false });
  const playerPixels = [
    [0,0,1,1,1,1,0,0],
    [0,1,1,1,1,1,1,0],
    [0,2,2,3,3,2,2,0],
    [0,2,3,3,3,3,2,0],
    [0,0,3,3,3,3,0,0],
    [0,4,4,4,4,4,4,0],
    [4,4,4,4,4,4,4,4],
    [4,4,4,4,4,4,4,4],
    [0,4,4,0,0,4,4,0],
    [0,5,5,0,0,5,5,0],
    [0,5,5,0,0,5,5,0],
    [0,6,6,0,0,6,6,0],
  ];
  const pColors = [0, 0xff0000, 0xffcc99, 0x000000, 0x0044ff, 0x8B4513, 0x8B6914];
  playerPixels.forEach((row, y) => {
    row.forEach((val, x) => {
      if (val > 0) {
        pg.fillStyle(pColors[val]);
        pg.fillRect(x * 2, y * 2, 2, 2);
      }
    });
  });
  pg.generateTexture('player', 16, 24);
  pg.destroy();

  // Текстура врага — слайм
  if (this.textures.exists('enemy')) this.textures.remove('enemy');
  const eg = this.make.graphics({ x: 0, y: 0, add: false });
  const enemyPixels = [
    [0,0,0,1,1,1,1,0],
    [0,0,1,1,1,1,1,1],
    [0,1,1,2,1,1,2,1],
    [0,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1],
    [0,1,3,1,1,3,1,0],
    [0,0,1,1,1,1,0,0],
  ];
  const eColors = [0, 0xff3333, 0xffffff, 0x000000];
  enemyPixels.forEach((row, y) => {
    row.forEach((val, x) => {
      if (val > 0) {
        eg.fillStyle(eColors[val]);
        eg.fillRect(x * 2, y * 2, 2, 2);
      }
    });
  });
  eg.generateTexture('enemy', 16, 16);
  eg.destroy();

  // Текстура монеты
  if (this.textures.exists('coin')) this.textures.remove('coin');
  const cg = this.make.graphics({ x: 0, y: 0, add: false });
  cg.fillStyle(0xffdd00);
  cg.fillCircle(6, 6, 6);
  cg.fillStyle(0xffaa00);
  cg.fillCircle(6, 6, 4);
  cg.fillStyle(0xffff88);
  cg.fillRect(4, 3, 2, 2);
  cg.generateTexture('coin', 12, 12);
  cg.destroy();

  // Платформы
  const platforms = this.physics.add.staticGroup();
    platforms.create(400, 470, 'tile').setDisplaySize(800, 20).refreshBody();
    platforms.create(400, 10,  'tile').setDisplaySize(800, 20).refreshBody();
    platforms.create(150, 340, 'tile').setDisplaySize(120, 16).refreshBody();
    platforms.create(400, 260, 'tile').setDisplaySize(120, 16).refreshBody();
    platforms.create(650, 340, 'tile').setDisplaySize(120, 16).refreshBody();
    platforms.create(280, 160, 'tile').setDisplaySize(120, 16).refreshBody();
    platforms.create(560, 160, 'tile').setDisplaySize(120, 16).refreshBody();                           
  // Монеты
  this.coins = this.physics.add.staticGroup();
  const coinPositions = [
  [150, 310], [400, 230], [650, 310],
  [280, 130], [560, 130], [500, 440]
  ];
  coinPositions.forEach(([x, y]) => {
    this.coins.create(x, y, 'coin').refreshBody();
  });

  // Игрок
  this.player = this.physics.add.sprite(60, 420, 'player');
  this.player.setBounce(0).setCollideWorldBounds(true);
  this.physics.add.collider(this.player, platforms);

  // Враг
    const enemyGfx = this.make.graphics({ x: 0, y: 0, add: false });
    this.enemy = this.physics.add.sprite(500, 420, 'enemy');
    this.enemy.setCollideWorldBounds(true);
    this.enemy.setVelocityX(120);
    this.enemyDirection = 1;
    this.enemyChasing = false;
    // Таймер разворота патруля каждые 2 секунды
    this.time.addEvent({
    delay: 2000,
    loop: true,
    callback: () => {
        if (!this.enemyChasing) {
        this.enemyDirection *= -1;
        }
    }
    });
    this.physics.add.collider(this.enemy, platforms);

  // Жизни
  this.lives = 3;
  this.livesText = this.add.text(740, 10, '❤️ x3', {
    fontSize: '14px', fill: '#ff4444'
  }).setScrollFactor(0);

  // Счёт
  this.score = 0;
  this.scoreText = this.add.text(10, 10, 'Монеты: 0', {
    fontSize: '14px', fill: '#ffdd00'
  }).setScrollFactor(0);

  // Сбор монет
    this.physics.add.overlap(this.player, this.coins, (player, coin) => {
        coin.destroy();
        this.score++;
        this.scoreText.setText('Монеты: ' + this.score);
        this.playSound(500, 900, 0.1);

   if (this.coins.countActive() === 0) {
    this.physics.pause();

    // Собираем все элементы победного экрана в массив
    const winScreenObjects = [];

    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.6);
    overlay.fillRect(0, 0, 800, 500);
    winScreenObjects.push(overlay);

    winScreenObjects.push(this.add.text(400, 180, '🎉 УРОВЕНЬ ПРОЙДЕН!', {
        fontSize: '36px', fill: '#ffdd00'
    }).setOrigin(0.5));

    winScreenObjects.push(this.add.text(400, 250, 'Монеты: ' + this.score + ' / 6', {
        fontSize: '22px', fill: '#ffffff'
    }).setOrigin(0.5));

    winScreenObjects.push(this.add.text(400, 310, 'Нажми ПРОБЕЛ для продолжения', {
        fontSize: '16px', fill: '#aaaaaa'
    }).setOrigin(0.5));

    // Победная мелодия
    const winNotes = [262, 330, 392, 523, 392, 523, 659];
    let i = 0;
    this.time.addEvent({
        delay: 150,
        repeat: winNotes.length - 1,
        callback: () => {
            this.playSound(winNotes[i], winNotes[i], 0.15);
            i++;
        }
    });

    // Перезапуск по пробелу
    this.input.keyboard.once('keydown-SPACE', () => {
        // Удаляем все элементы экрана победы
        winScreenObjects.forEach(obj => obj.destroy());

        // Сброс монет
        coinPositions.forEach(([x, y]) => {
            this.coins.create(x, y, 'coin').refreshBody();
        });

        // Сброс игрока
        this.player.setPosition(60, 420);
        this.player.setVelocity(0, 0);
        this.gravityFlipped = false;
        this.physics.world.gravity.y = 600;
        this.player.setFlipY(false);

        // Сброс врага
        this.enemy.setPosition(500, 420);
        this.enemy.setVelocity(120, 0);
        this.enemyChasing = false;
        this.enemy.clearTint();

        // Сброс счёта и жизней
        this.score = 0;
        this.lives = 3;
        this.scoreText.setText('Монеты: 0');
        this.livesText.setText('❤️ x3');

        // Возобновляем физику
        this.physics.resume();
         });
    }
    }); 

  // Столкновение с врагом
  this.physics.add.overlap(this.player, this.enemy, () => {
    this.lives--;
    this.livesText.setText('❤️ x' + this.lives);
    this.playSound(100, 50, 0.3, 'sawtooth');
    this.player.setVelocityX(this.player.x < this.enemy.x ? -300 : 300);
    this.player.setVelocityY(this.gravityFlipped ? 300 : -300);
    if (this.lives <= 0) {
        this.add.text(400, 250, 'GAME OVER', {
        fontSize: '48px', fill: '#ff0000'
    }).setOrigin(0.5);
      this.physics.pause();
    }
  });

  // Управление
  this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
  this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
  this.keyE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
  this.keyX = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);
  this.shiftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
  this.gravityFlipped = false;

  // Звуки
  this.playSound = function(freq1, freq2, duration, type = 'square') {
    if (!this.audioCtx) return;
    const ctx = this.audioCtx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(freq1, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(freq2, ctx.currentTime + duration);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + duration);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  }.bind(this);

  // Подсказка
 this.add.text(10, 478, 'S D движение  |  E прыжок вверх  |  X прыжок вниз  |  SHIFT гравитация', {
  fontSize: '10px', fill: '#aaaaaa'
 }).setScrollFactor(0);

  // Музыка после первого нажатия
  const notes = [329,329,0,329,0,262,329,0,392,0,0,0,196,0,0,0];
  let noteIndex = 0;
  const noteTime = (60 / 140) * 0.5;

  this.input.keyboard.once('keydown', () => {
    this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    this.time.addEvent({
      delay: noteTime * 1000,
      loop: true,
      callback: () => {
        const freq = notes[noteIndex % notes.length];
        if (freq > 0) {
          const ctx = this.audioCtx;
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
}

function update() {
  if (!this.player) return;
  const onGround = this.player.body.blocked.down || this.player.body.blocked.up;

  // Движение игрока
  if (this.keyS.isDown) {
    this.player.setVelocityX(-220);
    this.player.setFlipX(true);
  } else if (this.keyD.isDown) {
    this.player.setVelocityX(220);
    this.player.setFlipX(false);
  } else {
    this.player.setVelocityX(0);
  }

  // Прыжок
  if (this.keyE.isDown && onGround && !this.gravityFlipped) {
    this.player.setVelocityY(-450);
    this.playSound(200, 400, 0.15);
  }
  if (this.keyX.isDown && onGround && this.gravityFlipped) {
    this.player.setVelocityY(450);
    this.playSound(200, 400, 0.15);
  }

  // Инверсия гравитации
  if (Phaser.Input.Keyboard.JustDown(this.shiftKey)) {
    this.gravityFlipped = !this.gravityFlipped;
    this.physics.world.gravity.y = this.gravityFlipped ? -600 : 600;
    this.player.setFlipY(this.gravityFlipped);
    this.playSound(400, 100, 0.25, 'sawtooth');
  }

  // ИИ врага
  if (this.enemy && this.enemy.active) {
    const dist = Phaser.Math.Distance.Between(
      this.player.x, this.player.y,
      this.enemy.x, this.enemy.y
    );

    if (dist < 200) {
      // Режим преследования
      if (!this.enemyChasing) {
        this.enemyChasing = true;
        this.enemy.setTint(0xff0000);
        this.playSound(300, 600, 0.2, 'sawtooth');
      }

    const chaseSpeed = 180;
      const diffX = this.player.x - this.enemy.x;

      // Меняем направление только если разница больше 10px
      if (Math.abs(diffX) > 10) {
        if (diffX < 0) {
          this.enemy.setVelocityX(-chaseSpeed);
          this.enemy.setFlipX(true);
        } else {
          this.enemy.setVelocityX(chaseSpeed);
          this.enemy.setFlipX(false);
        }
      } else {
        // Враг достиг игрока — останавливается
        this.enemy.setVelocityX(0);
      }

      // Прыжок если стена впереди
      if ((this.enemy.body.blocked.right || this.enemy.body.blocked.left)
           && this.enemy.body.blocked.down) {
        this.enemy.setVelocityY(-400);
      }

      // Прыжок если стена впереди
      if ((this.enemy.body.blocked.right || this.enemy.body.blocked.left)
           && this.enemy.body.blocked.down) {
        this.enemy.setVelocityY(-400);
      }

    } else {
      // Режим патруля
      if (this.enemyChasing) {
        this.enemyChasing = false;
        this.enemy.clearTint();
      }

     // Разворот у стены
      if (this.enemy.body.blocked.right) {
        this.enemyDirection = -1;
      } else if (this.enemy.body.blocked.left) {
        this.enemyDirection = 1;
      }

      this.enemy.setVelocityX(120 * this.enemyDirection);
      this.enemy.setFlipX(this.enemyDirection < 0);
    }

    // Индикатор опасности
    if (!this.dangerText) {
      this.dangerText = this.add.text(0, 0, '', {
        fontSize: '12px', fill: '#ff0000'
      });
    }
    if (dist < 200) {
      this.dangerText.setText('❗');
      this.dangerText.setPosition(this.enemy.x - 6, this.enemy.y - 30);
    } else {
      this.dangerText.setText('');
    }
  }

}