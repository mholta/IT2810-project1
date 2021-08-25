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

/** Static sun element */
const Sun = () => {
  const margin = 20;
  const radius = 30;
  const centerX = canvasWidth - radius - margin;
  const centerY = radius + margin;
  const beams = 6;

  /* Circle */
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2, false);
  ctx.strokeStyle = co.b;
  ctx.stroke();

  /* TODO: Add sun beams */
};

/** Display points */
const Points = () => {
  ctx.beginPath();
  ctx.font = "20px Courier";
  ctx.fillText(`Points: ${gameState.points}`, 10, 50);
};

/** Draw all static elements */
const StaticBackground = () => {
  Floor();
  Sun();
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

const getPlayer = () => (player.length ? player[0] : null);

/* Jump player if space is pressed */
window.addEventListener("keydown", (e) => {
  if (e.key === " ") {
    e.preventDefault();
    getPlayer()?.jump();
  }
});

/* Jump if game is running, else start new game */
canvas.addEventListener("click", () => {
  if (!gameState.gameLost && gameState.gameRunning) {
    getPlayer()?.jump();
  } else {
    gameState.gameLost = false;
    start();
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
