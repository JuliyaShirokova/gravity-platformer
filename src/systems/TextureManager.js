export default function createTextures(scene) {

  // Текстура платформы
  if (scene.textures.exists('tile')) scene.textures.remove('tile');
  const tg = scene.make.graphics({ x: 0, y: 0, add: false });
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
  if (scene.textures.exists('player')) scene.textures.remove('player');
  const pg = scene.make.graphics({ x: 0, y: 0, add: false });
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
  if (scene.textures.exists('enemy')) scene.textures.remove('enemy');
  const eg = scene.make.graphics({ x: 0, y: 0, add: false });
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
  if (scene.textures.exists('coin')) scene.textures.remove('coin');
  const cg = scene.make.graphics({ x: 0, y: 0, add: false });
  cg.fillStyle(0xffdd00);
  cg.fillCircle(6, 6, 6);
  cg.fillStyle(0xffaa00);
  cg.fillCircle(6, 6, 4);
  cg.fillStyle(0xffff88);
  cg.fillRect(4, 3, 2, 2);
  cg.generateTexture('coin', 12, 12);
  cg.destroy();

  // Текстура БУРГЕР
  if (scene.textures.exists('burger')) scene.textures.remove('burger');
  const bg = scene.make.graphics({ x: 0, y: 0, add: false });
  const burgerPixels = [
    [0,0,0,1,1,1,1,0,0,0],
    [0,0,1,1,1,1,1,1,0,0],
    [0,0,0,2,2,2,2,0,0,0], // сыр
    [0,0,3,3,3,3,3,3,0,0], // котлета
    [0,0,4,4,4,4,4,4,0,0], // салат
    [0,0,0,1,1,1,1,0,0,0], // булочка
  ];
  const bColors = [0, 0xDEB887, 0xFFD700, 0x8B4513, 0x32CD32];
  burgerPixels.forEach((row, y) => {
    row.forEach((val, x) => {
      if (val > 0) {
        bg.fillStyle(bColors[val]);
        bg.fillRect(x * 2, y * 2, 2, 2);
      }
    });
  });
  bg.generateTexture('burger', 20, 12);
  bg.destroy();

  // Текстура МОРОЖЕНОЕ
  if (scene.textures.exists('icecream')) scene.textures.remove('icecream');
  const ig = scene.make.graphics({ x: 0, y: 0, add: false });
  const icePixels = [
    [0,0,0,2,2,2,0,0,0], // шарик
    [0,0,2,2,2,2,2,0,0],
    [0,0,2,2,2,2,2,0,0],
    [0,0,0,1,1,1,0,0,0], // рожок
    [0,0,1,1,1,1,1,0,0],
    [0,1,1,1,1,1,1,1,0],
  ];
  const iColors = [0, 0xD2691E, 0xFFC0CB]; // коричневый и розовый
  icePixels.forEach((row, y) => {
    row.forEach((val, x) => {
      if (val > 0) {
        ig.fillStyle(iColors[val]);
        ig.fillRect(x * 2, y * 2, 2, 2);
      }
    });
  });
  ig.generateTexture('icecream', 18, 12);
  ig.destroy();
}