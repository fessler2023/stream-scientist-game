// --------------------------
// Game constants
// --------------------------
const TILE_SIZE = 16;
const SCALE = 2;
let player;
let cursors;
let rocks = [];
let score = 0;

// --------------------------
// Frame IDs for assets
// --------------------------
const GRASS = 0;
const WATER = 1;
const ROCK = 42;
const BUSH = 38;
const TREE = 70;
const PLAYER_START_FRAME = 0;

// --------------------------
// Level 1 map layout
// 0 = empty, 1 = grass, 2 = water
// 3 = rocks, 4 = bush, 5 = tree
// --------------------------
const LEVEL_1 = [
    [0,0,0,0,0,0,0,0,0,0],
    [0,1,1,1,1,1,1,1,1,0],
    [0,1,2,2,1,1,3,3,1,0],
    [0,1,2,2,1,1,3,3,1,0],
    [0,1,1,1,1,1,1,1,1,0],
    [0,1,4,1,1,5,1,4,1,0],
    [0,1,1,1,1,1,1,1,1,0],
    [0,0,0,0,0,0,0,0,0,0],
];

// --------------------------
// Phaser configuration
// --------------------------
const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: '#5DADE2',
    physics: {
        default: 'arcade',
        arcade: { debug: false }
    },
    scene: { preload, create, update },
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};

// --------------------------
// Create the Phaser game
// --------------------------
const game = new Phaser.Game(config);

// --------------------------
// Preload assets
// --------------------------
function preload() {
    this.load.spritesheet('overworld', 'assets/Overworld.png', { frameWidth: 16, frameHeight: 16 });
    this.load.spritesheet('objects', 'assets/objects.png', { frameWidth: 16, frameHeight: 16 });
    this.load.spritesheet('player', 'assets/character.png', { frameWidth: 16, frameHeight: 16 });
}

// --------------------------
// Create the game world
// --------------------------
function create() {
    for (let i = 0; i < 20; i++) {  // just first 20 frames for testing
    this.add.image(16*i, 0, 'overworld', i).setScale(2).setOrigin(0);
}

    const solidObjects = this.physics.add.staticGroup();
    rocks = [];

    // Build the world
    LEVEL_1.forEach((row, y) => {
        row.forEach((tile, x) => {
            const worldX = x * TILE_SIZE * SCALE;
            const worldY = y * TILE_SIZE * SCALE;

            if (tile === 1) {
                this.add.image(worldX, worldY, 'overworld', GRASS)
                    .setOrigin(0)
                    .setScale(SCALE);
            }

            if (tile === 2) {
                this.add.image(worldX, worldY, 'overworld', WATER)
                    .setOrigin(0)
                    .setScale(SCALE);
            }

            if (tile === 3) {
                const rock = this.physics.add.sprite(
                    worldX + TILE_SIZE,
                    worldY + TILE_SIZE,
                    'objects',
                    ROCK
                ).setScale(SCALE).setInteractive();

                rocks.push(rock);
            }

            if (tile === 4) {
                solidObjects.create(
                    worldX + TILE_SIZE,
                    worldY + TILE_SIZE,
                    'objects',
                    BUSH
                ).setScale(SCALE);
            }

            if (tile === 5) {
                solidObjects.create(
                    worldX + TILE_SIZE,
                    worldY + TILE_SIZE,
                    'objects',
                    TREE
                ).setScale(SCALE);
            }
        });
    });

    // Player
    player = this.physics.add.sprite(
        5 * TILE_SIZE * SCALE,
        6 * TILE_SIZE * SCALE,
        'player',
        PLAYER_START_FRAME
    ).setScale(SCALE);

    player.setCollideWorldBounds(true);

    this.physics.add.collider(player, solidObjects);

    cursors = this.input.keyboard.createCursorKeys();

    // Rock interaction
    rocks.forEach((rock, index) => {
        rock.on('pointerdown', () => {
            if (Phaser.Math.Distance.Between(player.x, player.y, rock.x, rock.y) < 40) {
                score += 10;
                console.log('Macroinvertebrate found under rock!');
                rock.destroy();
            } else {
                console.log('Move closer to flip the rock!');
            }
        });
    });
}

// --------------------------
// Game update loop
// --------------------------
function update() {
    player.setVelocity(0);
    const speed = 120;

    if (cursors.left.isDown) player.setVelocityX(-speed);
    else if (cursors.right.isDown) player.setVelocityX(speed);

    if (cursors.up.isDown) player.setVelocityY(-speed);
    else if (cursors.down.isDown) player.setVelocityY(speed);
}

// --------------------------
// Handle window resize
// --------------------------
window.addEventListener('resize', () => {
    game.scale.resize(window.innerWidth, window.innerHeight);
});



