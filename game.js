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
let rockFlipSound;

// -------------------------
// Insects Data
// -------------------------
const macroinvertebrates = [
    { key: 'caddisfly', sprite: 'caddisfly.png', name: 'Caddisfly Larva', blurb: 'Caddisfly larvae often build protective cases and indicate clean water.' },
    { key: 'hellgrammite', sprite: 'hellgrammite.png', name: 'Hellgrammite', blurb: 'Hellgrammites are fierce predators found in fast-moving, oxygen-rich streams.' },
    { key: 'mayfly', sprite: 'mayfly.png', name: 'Mayfly Nymph', blurb: 'Mayfly nymphs are sensitive to pollution and signal excellent water quality.' }
];

// -------------------------
// Environment Data (bushes only, trees will be random top border)
// -------------------------
const bushes = [
    { key: 'bush', x: 0.85, y: 0.2, scale: 0.3 },
    { key: 'bush', x: 0.75, y: 0.85, scale: 0.3 },
    { key: 'bush', x: 0.4, y: 0.7, scale: 0.3 },
    { key: 'bush', x: 0.2, y: 0.4, scale: 0.3 }
];

// -------------------------
// Preload
// -------------------------
function preload() {
    this.load.image('player', 'player.png');
    this.load.image('rock', 'rock.png');
    this.load.image('tree', 'tree.png');
    bushes.forEach(b => this.load.image(b.key, b.key + '.png'));
    macroinvertebrates.forEach(critter => this.load.image(critter.key, critter.sprite));

    // Load WAV sound
    this.load.audio('rockFlip', 'rockFlip.wav');
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

    // Bushes
    bushes.forEach(obj => {
        const sprite = this.add.image(w*obj.x, h*obj.y, obj.key).setScale(obj.scale).setDepth(1);
        envSprites.push(sprite);
    });

    // Trees top border (randomized)
    const treeCount = 10;
    for (let i = 0; i < treeCount; i++) {
        const randX = Phaser.Math.FloatBetween(0, 1);
        const scale = Phaser.Math.FloatBetween(0.5, 0.7);
        const depth = Phaser.Math.Between(1, 2);
        this.add.image(w * randX, h * 0.05, 'tree').setScale(scale).setDepth(depth);
    }

    // Player
    player = this.physics.add.sprite(w/2, h*0.8, 'player').setScale(0.5).setCollideWorldBounds(true).setDepth(2);
    cursors = this.input.keyboard.createCursorKeys();

    // Rocks
    rockFlipSound = this.sound.add('rockFlip', { volume: 0.5 });
    const rockCount = 12; // total rocks
    for (let i = 0; i < rockCount; i++) {
        const randX = Phaser.Math.FloatBetween(0.1, 0.9);
        const randY = Phaser.Math.FloatBetween(0.3, 0.8);
        const rock = this.physics.add.sprite(w * randX, h * randY, 'rock')
            .setScale(Phaser.Math.FloatBetween(0.4, 0.5))
            .setInteractive()
            .setDepth(2);

        // assign random bug
        rock.macro = Phaser.Utils.Array.GetRandom(macroinvertebrates);
        rocks.push(rock);

        rock.on('pointerdown', () => {
            if (Phaser.Math.Distance.Between(player.x, player.y, rock.x, rock.y) < 60) {
                rockFlipSound.play();
                this.tweens.add({
                    targets: rock,
                    alpha: 0,
                    duration: 300,
                    onComplete: () => rock.destroy()
                });
                score += 10;
                scoreText.setText('Score: ' + score);
                updateExplorer(rock.macro);
            } else {
                console.log('Move closer to flip the rock!');
            }
        });
    }

    // Handle window resize
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

    bushes.forEach((b,i)=> envSprites[i].setPosition(w*b.x, h*b.y));
    rocks.forEach((r,i)=> { if(r.active) r.setPosition(r.x/w * w, r.y/h * h); });
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
