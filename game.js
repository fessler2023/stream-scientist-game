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

const game = new Phaser.Game(config);

// --------------------------
// Preload assets
// --------------------------
function preload() {
    this.load.spritesheet('overworld', 'assets/Overworld.png', { frameWidth: TILE_SIZE, frameHeight: TILE_SIZE });
    this.load.spritesheet('objects', 'assets/objects.png', { frameWidth: TILE_SIZE, frameHeight: TILE_SIZE });
    this.load.spritesheet('player', 'assets/character.png', { frameWidth: TILE_SIZE, frameHeight: TILE_SIZE });
}

// --------------------------
// Create the game world
// --------------------------
function create() {
    const solidObjects = this.physics.add.staticGroup();
    rocks = [];

    // --------------------------
    // TEMP: Display first 20 frames for debugging
    // --------------------------
    for (let i = 0; i < 20; i++) {
        this.add.image(16*i, 0, 'overworld', i).setScale(2).setOrigin(0);
        this.add.image(16*i, 32, 'objects', i).setScale(2).setOrigin(0);
    }

    // --------------------------
    // Once you confirm which frame number is which, update these constants:
    // --------------------------
    const GRASS = 0;    // <-- frame number of grass in Overworld.png
    const WATER = 1;    // <-- frame number of water in Overworld.png
    const ROCK  = 42;   // <-- frame number of rock in Objects.png
    const BUSH  = 38;   // <-- frame number of bush in Objects.png
    const TREE  = 70;   // <-- frame number of tree in Objects.png
    const PLAYER_START_FRAME = 0; // frame for your character sprite

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
    // Centering offsets
    // --------------------------
    const mapWidthPx = LEVEL_1[0].length * TILE_SIZE * SCALE;
    const mapHeightPx = LEVEL_1.length * TILE_SIZE * SCALE;
    const offsetX = (this.scale.width - mapWidthPx) / 2;
    const offsetY = (this.scale.height - mapHeightPx) / 2;

    // --------------------------
    // Build the world
    // --------------------------
    LEVEL_1.forEach((row, y) => {
        row.forEach((tile, x) => {
            const worldX = offsetX + x * TILE_SIZE * SCALE;
            const worldY = offsetY + y * TILE_SIZE * SCALE;

            switch(tile) {
                case 1: // Grass
                    this.add.image(worldX, worldY, 'overworld', GRASS)
                        .setOrigin(0)
                        .setScale(SCALE);
                    break;
                case 2: // Water
                    this.add.image(worldX, worldY, 'overworld', WATER)
                        .setOrigin(0)
                        .setScale(SCALE);
                    break;
                case 3: // Rock
                    const rock = this.physics.add.sprite(
                        worldX + TILE_SIZE,
                        worldY + TILE_SIZE,
                        'objects',
                        ROCK
                    ).setScale(SCALE).setInteractive();
                    rocks.push(rock);
                    break;
                case 4: // Bush
                    solidObjects.create(
                        worldX + TILE_SIZE,
                        worldY + TILE_SIZE,
                        'objects',
                        BUSH
                    ).setScale(SCALE);
                    break;
                case 5: // Tree
                    solidObjects.create(
                        worldX + TILE_SIZE,
                        worldY + TILE_SIZE,
                        'objects',
                        TREE
                    ).setScale(SCALE);
                    break;
            }
        });
    });

    // --------------------------
    // Player sprite
    // --------------------------
    player = this.physics.add.sprite(
        offsetX + 5 * TILE_SIZE * SCALE,
        offsetY + 6 * TILE_SIZE * SCALE,
        'player',
        PLAYER_START_FRAME
    ).setScale(SCALE);

    player.setCollideWorldBounds(true);
    this.physics.add.collider(player, solidObjects);

    cursors = this.input.keyboard.createCursorKeys();

    // --------------------------
    // Rock interaction
    // --------------------------
    rocks.forEach((rock) => {
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

