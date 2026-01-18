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

// -------------------------
// Globals
// -------------------------
let player;
let cursors;
let rocks = [];
let envSprites = [];
let score = 0;
let scoreText;
let titleText;
let titleBg;

// -------------------------
// Macroinvertebrate Data
// -------------------------
const macroinvertebrates = [
    {
        key: 'caddisfly',
        sprite: 'caddisfly.png',
        name: 'Caddisfly Larva',
        blurb: 'Caddisfly larvae often build protective cases and indicate clean water.'
    },
    {
        key: 'hellgrammite',
        sprite: 'hellgrammite.png',
        name: 'Hellgrammite',
        blurb: 'Hellgrammites are fierce predators found in fast-moving, oxygen-rich streams.'
    },
    {
        key: 'mayfly',
        sprite: 'mayfly.png',
        name: 'Mayfly Nymph',
        blurb: 'Mayfly nymphs are sensitive to pollution and signal excellent water quality.'
    }
];

// -------------------------
// Environment Layout
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

    macroinvertebrates.forEach(critter => {
        this.load.image(critter.key, critter.sprite);
    });
}

// -------------------------
// Create
// -------------------------
function create() {
    const w = this.scale.width;
    const h = this.scale.height;

    // -------------------------
    // Title Bar
    // -------------------------
    titleBg = this.add.rectangle(w / 2, 0, w, 40, 0x000000, 0.4)
        .setOrigin(0.5, 0)
        .setDepth(10);

    titleText = this.add.text(
        w / 2,
        8,
        'The Adventures of Little Doug',
        { font: '22px Arial', fill: '#ffffff', fontStyle: 'bold' }
    ).setOrigin(0.5, 0).setDepth(11);

    // -------------------------
    // Score
    // -------------------------
    scoreText = this.add.text(10, 50, 'Score: 0', {
        font: '18px Arial',
        fill: '#ffffff'
    }).setDepth(11);

    // -------------------------
    // Environment
    // -------------------------
    envObjects.forEach(obj => {
        const sprite = this.add.image(w * obj.x, h * obj.y, obj.key)
            .setScale(0.5)
            .setDepth(1);
        envSprites.push(sprite);
    });

    // -------------------------
    // Player
    // -------------------------
    player = this.physics.add.sprite(w / 2, h * 0.8, 'player')
        .setScale(0.5)
        .setCollideWorldBounds(true)
        .setDepth(2);

    cursors = this.input.keyboard.createCursorKeys();

    // -------------------------
    // Rocks
    // -------------------------
    rockPositions.forEach(pos => {
        const rock = this.physics.add.sprite(w * pos.x, h * pos.y, 'rock')
            .setScale(0.5)
            .setInteractive()
            .setDepth(2);

        rock.macro = Phaser.Utils.Array.GetRandom(macroinvertebrates);
        rocks.push(rock);

        rock.on('pointerdown', () => {
            if (Phaser.Math.Distance.Between(player.x, player.y, rock.x, rock.y) < 60) {

                const critter = this.add.sprite(rock.x, rock.y, rock.macro.key);
                const targetWidth = 64;
                const scale = targetWidth / critter.width;
                critter.setScale(scale).setDepth(3);

                this.tweens.add({
                    targets: critter,
                    scale: { from: 0, to: scale },
                    duration: 300,
                    ease: 'Back.Out'
                });

                score += 10;
                scoreText.setText('Score: ' + score);

                const infoText = this.add.text(
                    rock.x,
                    rock.y - 50,
                    `You found a ${rock.macro.name}!\n${rock.macro.blurb}`,
                    {
                        font: '15px Arial',
                        fill: '#ffffff',
                        backgroundColor: '#000000AA',
                        padding: 6,
                        wordWrap: { width: 220 }
                    }
                ).setOrigin(0.5).setDepth(4);

                this.time.delayedCall(4000, () => infoText.destroy());

                this.tweens.add({
                    targets: rock,
                    alpha: 0,
                    duration: 300,
                    onComplete: () => rock.destroy()
                });
            }
        });
    });

    window.addEventListener('resize', resizeGame);
}

// -------------------------
// Update
// -------------------------
function update() {
    player.setVelocity(0);
    const speed = 200;

    if (cursors.left.isDown) player.setVelocityX(-speed);
    else if (cursors.right.isDown) player.setVelocityX(speed);

    if (cursors.up.isDown) player.setVelocityY(-speed);
    else if (cursors.down.isDown) player.setVelocityY(speed);
}

// -------------------------
// Resize Handler
// -------------------------
function resizeGame() {
    const w = window.innerWidth;
    const h = window.innerHeight;

    game.scale.resize(w, h);

    titleBg.setSize(w, 40);
    titleBg.setPosition(w / 2, 0);
    titleText.setPosition(w / 2, 8);

    envObjects.forEach((obj, i) => {
        envSprites[i].setPosition(w * obj.x, h * obj.y);
    });

    rockPositions.forEach((pos, i) => {
        if (rocks[i] && rocks[i].active) {
            rocks[i].setPosition(w * pos.x, h * pos.y);
        }
    });

    player.setPosition(w / 2, h * 0.8);
}
