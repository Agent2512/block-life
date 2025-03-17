const s = 2;
let blocks = {};
let newBlocks = {};
let test;

function setup() {
  createCanvas(800, 800);
  randomSeed(0);
  frameRate(5);
  for (let i = 0; i < width / s; i++) {
    for (let j = 0; j < height / s; j++) {
      const newC = random([LifeBlock, DeadBlock, ZombieBlock]);
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

  if (JSON.stringify(blocks) === JSON.stringify(newBlocks)) {
    console.log("done");
    noLoop();
  } else {
    // log the difference
    const diffKeys = Object.keys(blocks).filter(
      (key) => blocks[key] !== newBlocks[key]
    );
    const diff = diffKeys.map((key) => ({
      key,
      old: blocks[key],
      new: newBlocks[key],
    }));
    console.log(diff);
  }

  blocks = newBlocks;
  newBlocks = {};
  console.log(g);
  g++;
}

////////////////////////////////////////////
// Base Block Class
////////////////////////////////////////////

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

  // n is the distance to the neighbors
  findNeighbors(n) {
    // Returns four direct neighbors plus an array with those that exist.
    return {
      up: blocks[`${this.x}-${this.y - n}`],
      down: blocks[`${this.x}-${this.y + n}`],
      left: blocks[`${this.x - n}-${this.y}`],
      right: blocks[`${this.x + n}-${this.y}`],
      array: [
        blocks[`${this.x}-${this.y - n}`],
        blocks[`${this.x}-${this.y + n}`],
        blocks[`${this.x - n}-${this.y}`],
        blocks[`${this.x + n}-${this.y}`],
      ].filter(Boolean),
    };
  }
}

////////////////////////////////////////////
// Block subClass
////////////////////////////////////////////

class LifeBlock extends Block {
  constructor(x, y) {
    super(x, y);
    this.color = 0;
    this.type = "life";
  }

  update() {
    const neighbors = this.findNeighbors(1).array;
    const deadNeighbors = neighbors.filter((n) => n.type === "dead");
    // If ALL neighbors are dead, transform to dead
    if (deadNeighbors.length === neighbors.length) {
      return new DeadBlock(this.x, this.y);
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
    const neighbors = this.findNeighbors(1).array;
    const lifeNeighbors = neighbors.filter((n) => n.type === "life");
    // If all neighbors are life, become life
    if (lifeNeighbors.length === neighbors.length) {
      return new LifeBlock(this.x, this.y);
    }

    return this;
  }
}

////////////////////////////////////////////////
// New Block Subclass: ZombieBlock
////////////////////////////////////////////////

class ZombieBlock extends Block {
  constructor(x, y) {
    super(x, y);
    // Purplish color
    this.color = color(128, 0, 128);
    this.type = "zombie";
  }

  update() {
    const neighbors = this.findNeighbors(1).array;
    const lifeNeighbors = neighbors.filter((n) => n.type === "life");
    const deadNeighbors = neighbors.filter((n) => n.type === "dead");

    // Example logic:
    // If we have 3 or more life neighbors, become life
    // Else if we have 3 or more dead neighbors, become dead
    // Otherwise remain a zombie

    if (lifeNeighbors.length >= 3) {
      return new LifeBlock(this.x, this.y);
    } else if (deadNeighbors.length >= 3) {
      return new DeadBlock(this.x, this.y);
    }
    return this;
  }
}
