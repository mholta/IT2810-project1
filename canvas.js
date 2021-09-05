/* Colors */
const co = {
  y: "#fcba03",
  g: "#808080",
  b: "#222",
};

/* Get canvas and 2d context */
const canvas = $("canvas")[0];
const ctx = canvas.getContext("2d");

/* Canvas sizing */
const canvasHeight = 400;
let canvasWidth = canvas.parentNode.clientWidth;
canvas.width = canvasWidth;
canvas.height = canvasHeight;

$(window).on("resize", () => {
  canvasWidth = canvas.parentNode.clientWidth;
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
});

/** Object holding state of the game, including the players position */
const gameState = {
  gameRunning: false,
  gameLost: false,
  gravity: 0.3,
  playerXPosition: 60,
  points: 0,
  speed: 100,
  player: {
    xMin: null,
    xMax: null,
    yMin: null,
    yMax: null,
  },
};

/* Graphic constants */
const floorHeight = 40;
const floorY = canvasHeight - floorHeight;

/** Static floor element */
const Floor = () => {
  ctx.beginPath();
  ctx.fillStyle = co.b;
  ctx.fillRect(0, floorY, canvasWidth, floorHeight);
  ctx.stroke();
};

/** Sun class */
class Sun {
  margin = 0;
  radius = 30;
  origR = 30;
  dR = 0;
  centerX = 0;
  centerY = 0;
  isClicked = false;

  constructor(margin, radius) {
    this.margin = margin;
    this.radius = radius;
    this.origR = this.radius;
    this.centerX = canvasWidth - this.radius - this.margin;
    this.centerY = this.radius + this.margin;
  }

  draw() {
    /* Circle */
    ctx.beginPath();
    ctx.arc(this.centerX, this.centerY, this.radius, 0, Math.PI * 2, false);
    ctx.fillStyle = this.isClicked ? co.y : co.b;
    ctx.fill();
  }

  update() {
    this.radius = this.origR - (this.isClicked ? 0.1 * this.origR : 0);

    this.draw();
  }

  click() {
    this.isClicked = true;
  }

  unClick() {
    this.isClicked = false;
  }

  containsCoordinates(x, y) {
    return (
      Math.abs(this.centerX - x) < this.radius &&
      Math.abs(this.centerY - y) < this.radius
    );
  }

  /* TODO: Add sun beams */
}

/** Display points */
const Points = () => {
  ctx.beginPath();
  ctx.font = "20px Courier";
  ctx.fillText(`Points: ${gameState.points}`, 10, 50);
};

/** Draw all static elements */
const StaticBackground = () => {
  Floor();
  Points();
};

/** Get random number between (min, max) */
const randomNum = (min, max) => Math.random() * (max - min) + min;

/** Increase points and speed */
const increasePoints = () => {
  gameState.points++;
  gameState.speed = gameState.speed + 5;
};

/** Check if two object collides */
const collides = ({ p, o }) =>
  p.yMax > o.yMin && p.xMin < o.xMax && p.xMax > o.xMin;

/** Function to call when a game is lost */
const gameLost = () => {
  gameState.gameLost = true;
  gameState.gameRunning = false;
};

/** Obstacle class containing position and method for updating and drawing on canvas */
class Obstacle {
  width;
  height;
  x = canvasWidth;
  dx = -gameState.speed / 33;
  y;
  pointGiven = false;

  constructor() {
    const { width, height } = {
      height: randomNum(30, 55),
      width: randomNum(15, 30),
    };
    this.width = width;
    this.height = height;
    this.y = floorY - height;
  }

  draw() {
    ctx.beginPath();
    ctx.fillStyle = "green";
    ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.stroke();
  }

  update() {
    /* If !exits canvas, stop animating */
    this.x += this.dx;

    if (
      collides({
        p: gameState.player,
        o: {
          xMin: this.x,
          xMax: this.x + this.width,
          yMin: this.y,
          yMax: this.y + this.height,
        },
      })
    ) {
      gameLost();
    } else if (!this.pointGiven && this.x < gameState.playerXPosition) {
      increasePoints();
      this.pointGiven = true;
    }

    this.draw();
  }
}

/**
 * Method for drawing a object on canvas based on matrix.
 *
 * @param {*} matrix list of lists with either null og color string
 * @param {*} blockSize size of each block drawn
 * @param {*} xLeft x start position
 * @param {*} yBottom y end position
 * @returns current player position object
 */
const ObjectFromMatrix = (matrix, blockSize, xLeft, yBottom) => {
  const height = matrix.length * blockSize;
  const width = (matrix[0]?.length ?? 0) * blockSize;

  const xStart = xLeft;
  const yStart = yBottom - height;

  let xMin = xLeft + 3;
  let xMax = xMin - 3 + (matrix[0].length - 1) * blockSize;
  let yMax = yBottom;
  let yMin = yMax - matrix.length * blockSize;

  matrix.forEach((xAxisList, i) => {
    if (xAxisList.length > matrix[0].length)
      xMax = xMin + (xAxisList.length - 1) * blockSize;

    xAxisList.forEach((fillPoint, j) => {
      if (fillPoint) {
        const currentXStart = xStart + j * blockSize;
        const currentYStart = yStart + i * blockSize;

        ctx.beginPath();
        ctx.fillStyle = fillPoint;
        ctx.fillRect(currentXStart, currentYStart, blockSize, blockSize);
        ctx.stroke();
      }
    });
  });

  return { xMax, xMin, yMax, yMin };
};

const playerMatrix = [
  [, , , , , co.b, co.b, co.b, , ,],
  [, , , , co.b, co.b, , , co.b, co.b],
  [, , , , co.b, , , co.b, , co.b, co.y],
  [, , , , co.b, co.b, , , , co.b],
  [, , , , co.b, co.b, co.b, co.b, co.b, ,],
  [, , , co.b, co.b, co.b, co.g, co.g, co.g, ,],
  [, , , co.b, co.b, co.b, co.b, co.g, co.g, co.g],
  [, , co.b, co.b, co.b, co.b, co.b, co.g, co.g, co.g],
  [co.b, co.b, co.b, co.b, co.b, co.b, co.b, co.g, co.g, co.g],
  [, co.b, co.b, co.b, co.b, co.b, co.g, co.g, co.g, co.g],
  [, , co.b, co.b, co.g, co.g, co.g, co.g, co.g, co.g],
  [, co.b, co.b, co.g, co.g, co.g, co.g, co.g, co.g, ,],
  [, , co.b, co.b, co.g, co.g, co.y, co.y, co.y, co.y],
];

/** Player class containing position and jumping variables */
class Player {
  playerMatrix = playerMatrix;

  x = gameState.playerXPosition;
  y = floorY;
  dy = 0;
  friction = 0.2;
  jumpBy = -7;
  jumpCount = 0;

  constructor() {}

  draw() {
    gameState.player = ObjectFromMatrix(this.playerMatrix, 6, this.x, this.y);
    ctx.beginPath();
    ctx.fillStyle = "red";

    ctx.stroke();
  }

  update() {
    // Inspiration from https://youtu.be/3b7FyIxWW94?t=1178
    if (this.y + this.dy > floorY) {
      this.dy = -this.dy * this.friction;
      this.jumpCount = 0;
    } else {
      this.dy += gameState.gravity;
    }
    this.y += this.dy;

    this.draw();
  }

  jump() {
    if (this.jumpCount < 2) {
      this.jumpCount++;
      this.dy = this.jumpBy;
    }
  }
}

/* Arrays for holding moving elements in game */
const obstacleArray = [];
const player = [];
let sun = new Sun(20, 30);

const getPlayer = () => (player.length ? player[0] : null);

/* Jump player if space is pressed */
window.addEventListener("keydown", (e) => {
  if (e.key === " ") {
    e.preventDefault();
    getPlayer()?.jump();
  }
});

const getCanvasMouseEventPosition = (e) => {
  const c = canvas.getBoundingClientRect();
  const x = e.clientX - c.left;
  const y = e.clientY - c.top;
  return { x, y };
};

const hitsButton = (e) => {
  const { x, y } = getCanvasMouseEventPosition(e);
  return sun.containsCoordinates(x, y);
};

/* Jump if game is running, else start new game */
canvas.addEventListener("mousedown", (e) => {
  if (!gameState.gameLost && gameState.gameRunning) {
    // If clicks button
    if (hitsButton(e)) {
      getPlayer()?.jump();
      sun.click();
    }
  } else {
    gameState.gameLost = false;
    start();
  }
});
canvas.addEventListener("mouseup", (e) => {
  if (!gameState.gameLost && gameState.gameRunning) {
    sun.unClick();
  }
});

/** Draw lost text onto canvas */
const LostText = () => {
  ctx.beginPath();
  ctx.font = "35px Courier";
  ctx.fillText(`You lost.\n Score: ${gameState.points}`, 80, 150);
  ctx.fillText("Click to try again", 80, 200);
};

/** Draw start text onto canvas */
const StartText = () => {
  ctx.beginPath();
  ctx.font = "35px Courier";
  ctx.fillText(`Click to start`, 80, 150);
  canvas.style.cursor = "pointer";
};

/** Animate function with `requestAnimationFrame`. */
const animate = () => {
  if (!gameState.gameLost) {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    StaticBackground();

    getPlayer()?.update();

    sun.update();

    obstacleArray.forEach((o) => o.update());
  } else {
    LostText();
    clearGame();
    canvas.style.cursor = "pointer";
  }
};

let addObstacleTimeout;

/** Function for clearing game after loss */
const clearGame = () => {
  if (addObstacleTimeout) clearTimeout(addObstacleTimeout);
  player.splice(0, player.length);
  obstacleArray.splice(0, obstacleArray.length);
  gameState.player = {};
  gameState.points = 0;
  gameState.speed = 100;
};

const addNewObstacle = () => obstacleArray.push(new Obstacle());

/** Add obstacle using random timeout */
const addRandomObstacle = () => {
  addObstacleTimeout = setTimeout(() => {
    addNewObstacle();
    addRandomObstacle();
  }, randomNum(150000 / gameState.speed, 300000 / gameState.speed));
};

/** Method for starting game */
const start = () => {
  if (!gameState.gameRunning) {
    player.push(new Player());
    animate();
    addNewObstacle();
    addRandomObstacle();
    gameState.gameRunning = true;
    canvas.style.cursor = "default";
  }
};

/* Start off by displaying start text */
StartText();
