const s = 10;
let blocks = {};
let newBlocks = {};
let test;

function setup() {
  createCanvas(800, 800);
  frameRate(1);
  for (let i = 0; i < width / s; i++) {
    for (let j = 0; j < height / s; j++) {
      const newC = random([LifeBlock, DeadBlock, poisonBlock]);
      const x = i;
      const y = j;

      blocks[`${x}-${y}`] = new newC(x, y);
    }
  }
  console.log(blocks["0-0"]);
  test = blocks["0-0"];
}

let g = 0;
function draw() {
  for (const block of Object.values(blocks)) {
    block.show();
    const newBlock = block.update();
    newBlocks[`${block.x}-${block.y}`] = newBlock;
  }

  blocks = newBlocks;
  newBlocks = {};
  console.log(g);
  g++;
}

class Block {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.showX = x * s;
    this.showY = y * s;

    this.color = 255;
  }

  show() {
    noStroke();
    fill(this.color);
    square(this.showX, this.showY, s);
  }

  findNeighbors() {
    return {
      up: blocks[`${this.x}-${this.y - 1}`],
      down: blocks[`${this.x}-${this.y + 1}`],
      left: blocks[`${this.x - 1}-${this.y}`],
      right: blocks[`${this.x + 1}-${this.y}`],
      array: [
        blocks[`${this.x}-${this.y - 1}`],
        blocks[`${this.x}-${this.y + 1}`],
        blocks[`${this.x - 1}-${this.y}`],
        blocks[`${this.x + 1}-${this.y}`],
      ].filter(Boolean),
    };
  }
}

class LifeBlock extends Block {
  constructor(x, y) {
    super(x, y);
    this.color = 0;
    this.type = "life";
  }

  update() {
    const neighbors = this.findNeighbors().array;
    const deadNeighbors = neighbors.filter((n) => n.type === "dead");
    if (deadNeighbors.length == neighbors.length) {
      return new DeadBlock(this.x, this.y);
    }
    const poisonNeighbors = neighbors.filter((n) => n.type === "poison");
    if (poisonNeighbors.length > neighbors.length / 2) {
      return new poisonBlock(this.x, this.y);
    }

    return this;
  }
}

class DeadBlock extends Block {
  constructor(x, y) {
    super(x, y);
    this.color = 255;
    this.type = "dead";
  }

  update() {
    const neighbors = this.findNeighbors().array;
    const lifeNeighbors = neighbors.filter((n) => n.type === "life");
    if (lifeNeighbors.length == neighbors.length) {
      return new LifeBlock(this.x, this.y);
    }

    return this;
  }
}

class poisonBlock extends Block {
  constructor(x, y) {
    super(x, y);
    this.color = [0, 255, 0];
    this.type = "poison";
  }

  update() {
    const neighbors = this.findNeighbors().array;
    const lifeNeighbors = neighbors.filter((n) => n.type === "life");
    const notLifeNeighbors = neighbors.filter((n) => n.type !== "life");
    if (lifeNeighbors.length > notLifeNeighbors.length) {
      return new LifeBlock(this.x, this.y);
    }
    if (lifeNeighbors.length < notLifeNeighbors.length) {
      return new DeadBlock(this.x, this.y);
    }

    return this;
  }
}
