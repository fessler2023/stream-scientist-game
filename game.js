// -------------------------
// Phaser Config
// -------------------------
const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: '#5DADE2',
    physics: { default: 'arcade', arcade: { debug: false } },
    scene: { preload, create, update },
    scale: { mode: Phaser.Scale.RESIZE, autoCenter: Phaser.Scale.CENTER_BOTH }
};

const game = new Phaser.Game(config);

// -------------------------
// Globals
// -------------------------
let player, cursors;
let rocks = [];
let envSprites = [];
let score = 0, scoreText;
let titleText, titleBg;

// -------------------------
// Insects Data
// -------------------------
const macroinvertebrates = [
    { key: 'caddisfly', sprite: 'caddisfly.png', name: 'Caddisfly Larva', blurb: 'Caddisfly larvae often build protective cases and indicate clean water.' },
    { key: 'hellgrammite', sprite: 'hellgrammite.png', name: 'Hellgrammite', blurb: 'Hellgrammites are fierce predators found in fast-moving, oxygen-rich streams.' },
    { key: 'mayfly', sprite: 'mayfly.png', name: 'Mayfly Nymph', blurb: 'Mayfly nymphs are sensitive to pollution and signal excellent water quality.' }
];

// -------------------------
// Environment Data
// -------------------------
const envObjects = [
    { key: 'tree', x: 0.1, y: 0.15 },
    { key: 'bush', x: 0.85, y: 0.2 },
    { key: 'tree', x: 0.35, y: 0.65 },
    { key: 'bush', x: 0.75, y: 0.85 }
];

const rockPositions = [
    { x: 0.25, y: 0.5 },
    { x: 0.45, y: 0.4 },
    { x: 0.65, y: 0.35 },
    { x: 0.75, y: 0.55 },
    { x: 0.5, y: 0.25 }
];

// -------------------------
// Preload
// -------------------------
function preload() {
    this.load.image('player', 'player.png');
    this.load.image('rock', 'rock.png');
    this.load.image('tree', 'tree.png');
    this.load.image('bush', 'bush.png');

    macroinvertebrates.forEach(critter => this.load.image(critter.key, critter.sprite));
}

// -------------------------
// Create
// -------------------------
function create() {
    const w = this.scale.width;
    const h = this.scale.height;

    // Title Bar
    titleBg = this.add.rectangle(w/2, 0, w, 40, 0x000000, 0.4).setOrigin(0.5,0).setDepth(10);
    titleText = this.add.text(w/2, 8, 'The Adventures of Little Doug', { font:'22px Arial', fill:'#fff', fontStyle:'bold' })
        .setOrigin(0.5,0).setDepth(11);

    // Score
    scoreText = this.add.text(10, 50, 'Score: 0', { font:'18px Arial', fill:'#fff' }).setDepth(11);

    // Environment
    envObjects.forEach(obj => {
        const sprite = this.add.image(w*obj.x, h*obj.y, obj.key).setScale(0.5).setDepth(1);
        envSprites.push(sprite);
    });

    // Player
    player = this.physics.add.sprite(w/2, h*0.8, 'player').setScale(0.5).setCollideWorldBounds(true).setDepth(2);
    cursors = this.input.keyboard.createCursorKeys();

    // Rocks
    rockPositions.forEach(pos => {
        const rock = this.physics.add.sprite(w*pos.x, h*pos.y, 'rock').setScale(0.5).setInteractive().setDepth(2);

        // Assign a random insect to this rock
        rock.macro = Phaser.Utils.Array.GetRandom(macroinvertebrates);

        rocks.push(rock);

        // Rock flip handler
        rock.on('pointerdown', () => {
            if (Phaser.Math.Distance.Between(player.x, player.y, rock.x, rock.y) < 60) {

                // Remove rock visually
                this.tweens.add({
                    targets: rock,
                    alpha: 0,
                    duration: 300,
                    onComplete: () => rock.destroy()
                });

                // Update score
                score += 10;
                scoreText.setText('Score: ' + score);

                // Update Explorer panel ONLY
                updateExplorer(rock.macro);

            } else {
                console.log('Move closer to flip the rock!');
            }
        });
    });

    // Resize handling
    window.addEventListener('resize', resizeGame);
}

// -------------------------
// Update
// -------------------------
function update() {
    player.setVelocity(0);
    const speed = 200;

    if(cursors.left.isDown) player.setVelocityX(-speed);
    else if(cursors.right.isDown) player.setVelocityX(speed);

    if(cursors.up.isDown) player.setVelocityY(-speed);
    else if(cursors.down.isDown) player.setVelocityY(speed);
}

// -------------------------
// Resize Handler
// -------------------------
function resizeGame() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    game.scale.resize(w,h);

    titleBg.setSize(w,40);
    titleBg.setPosition(w/2,0);
    titleText.setPosition(w/2,8);

    envObjects.forEach((obj,i)=> envSprites[i].setPosition(w*obj.x, h*obj.y));
    rockPositions.forEach((pos,i)=> { if(rocks[i] && rocks[i].active) rocks[i].setPosition(w*pos.x,h*pos.y); });
    player.setPosition(w/2,h*0.8);
}

// -------------------------
// Explorer Panel Update
// -------------------------
function updateExplorer(critter) {
    document.getElementById("explorerImage").src = critter.sprite;
    document.getElementById("explorerName").innerText = critter.name;
    document.getElementById("explorerText").innerText = critter.blurb;
}
