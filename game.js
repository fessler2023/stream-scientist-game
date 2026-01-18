const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: '#5DADE2', // light blue = stream/lake
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

let player;
let cursors;
let rocks = [];
let collectedSpecies = [];
let score = 0;
let scoreText;
let trashSound, rockFlipSound;
let macroinvertebrates = [];
let trashItems = [];
let clickedCount = 0;
let totalItems = 12; // rocks per level

function preload() {
    this.load.image('player', 'player.png');
    this.load.image('rock', 'rock.png');
    this.load.image('species', 'bug.png'); // default bug
    this.load.image('tree', 'tree.png');
    this.load.image('bush', 'bush.png');
    this.load.audio('rockFlip', 'rockFlip.wav');
    this.load.audio('trashSound', 'trash.wav');

    // Load your macroinvertebrate PNGs
    this.load.image('caddisfly', 'caddisfly.png');
    this.load.image('hellgrammite', 'hellgrammite.png');

    // Load trash PNGs
    this.load.image('plastic', 'plastic.png');
    this.load.image('can', 'can.png');
}

function create() {
    // Environment objects
    const envObjects = [
        { key: 'tree', x: 0.1, y: 0.15 },
        { key: 'bush', x: 0.85, y: 0.2 },
        { key: 'tree', x: 0.35, y: 0.65 },
        { key: 'bush', x: 0.75, y: 0.85 }
    ];

    envObjects.forEach(obj => {
        this.add.image(window.innerWidth * obj.x, window.innerHeight * obj.y, obj.key)
            .setScale(0.5)
            .setOrigin(0.5, 0.5);
    });

    // Player
    player = this.physics.add.sprite(window.innerWidth / 2, window.innerHeight * 0.8, 'player')
        .setScale(0.5)
        .setCollideWorldBounds(true);

    // Score display
    scoreText = this.add.text(10, 10, 'Score: 0', { font: '20px Arial', fill: '#fff' });

    cursors = this.input.keyboard.createCursorKeys();

    // Sounds
    rockFlipSound = this.sound.add('rockFlip', { volume: 0.5 });
    trashSound = this.sound.add('trashSound', { volume: 0.5 });

    // Macroinvertebrates
    macroinvertebrates = [
        { name: 'Caddisfly Larvae', sprite: 'caddisfly', blurb: 'Caddisfly larvae live under rocks in streams.' },
        { name: 'Hellgrammite', sprite: 'hellgrammite', blurb: 'Hellgrammites are the aquatic larvae of dobsonflies.' }
    ];

    // Trash items
    trashItems = [
        { name: 'Plastic Bottle', sprite: 'plastic', blurb: 'Plastic harms aquatic life and pollutes streams.', points: -5 },
        { name: 'Tin Can', sprite: 'can', blurb: 'Cans are pollution and can injure animals.', points: -5 }
    ];

    // Create rocks
    createRocks(this);

    // Create Explorer panel
    createExplorerPanel();

    // Create on-screen touch controls
    createTouchControls(this);
}

function createRocks(scene) {
    for (let i = 0; i < totalItems; i++) {
        const x = Phaser.Math.FloatBetween(0.1, 0.9) * window.innerWidth;
        const y = Phaser.Math.FloatBetween(0.3, 0.8) * window.innerHeight;

        const rock = scene.physics.add.sprite(x, y, 'rock')
            .setScale(Phaser.Math.FloatBetween(0.4, 0.5))
            .setInteractive()
            .setDepth(2);

        rocks.push(rock);

        rock.on('pointerdown', () => {
            if (Phaser.Math.Distance.Between(player.x, player.y, rock.x, rock.y) < 60) {
                // Randomly decide if trash or bug
                let isTrash = Phaser.Math.Between(1, 100) <= 20; // 20% trash
                let content;
                if (isTrash) {
                    content = Phaser.Utils.Array.GetRandom(trashItems);
                    trashSound.play();
                    score += content.points;
                } else {
                    content = Phaser.Utils.Array.GetRandom(macroinvertebrates);
                    rockFlipSound.play();
                    score += 10;
                    collectedSpecies.push(content.name);
                }

                rock.destroy();
                scoreText.setText('Score: ' + score);
                updateExplorer(content);

                clickedCount++;
                if (clickedCount >= totalItems) showLevelSummary();
            }
        });
    }
}

function createExplorerPanel() {
    // HTML overlay
    const container = document.createElement('div');
    container.id = 'explorer';
    container.innerHTML = `
        <h3>Field Journal</h3>
        <img id="explorerImg" src="player.png" />
        <p id="explorerText">Flip rocks to discover species or trash!</p>
    `;
    document.body.appendChild(container);

    // Style
    const style = document.createElement('style');
    style.innerHTML = `
        #explorer {
            position: fixed;
            bottom: 10px;
            left: 10px;
            width: 250px;
            background: #fff;
            padding: 10px;
            border: 2px solid #000;
            z-index: 9999;
        }
        #explorer img {
            width: 128px;
            height: 128px;
            display: block;
            margin-bottom: 10px;
        }
        #explorer p {
            color: #000;
            font-size: 14px;
        }
    `;
    document.head.appendChild(style);
}

function updateExplorer(content) {
    const img = document.getElementById('explorerImg');
    const text = document.getElementById('explorerText');
    img.src = content.sprite + '.png';
    text.innerText = `${content.name}\n${content.blurb}`;
}

function showLevelSummary() {
    alert(`Level Complete!\nScore: ${score}`);
}

function createTouchControls(scene) {
    const w = scene.scale.width;
    const h = scene.scale.height;
    const btnSize = 80;
    const alpha = 0.3;

    // Left
    scene.add.rectangle(50, h-100, btnSize, btnSize, 0x000000, alpha)
        .setInteractive()
        .on('pointerdown', () => player.setVelocityX(-200))
        .on('pointerup', () => player.setVelocityX(0));

    // Right
    scene.add.rectangle(150, h-100, btnSize, btnSize, 0x000000, alpha)
        .setInteractive()
        .on('pointerdown', () => player.setVelocityX(200))
        .on('pointerup', () => player.setVelocityX(0));

    // Up
    scene.add.rectangle(w-100, h-150, btnSize, btnSize, 0x000000, alpha)
        .setInteractive()
        .on('pointerdown', () => player.setVelocityY(-200))
        .on('pointerup', () => player.setVelocityY(0));

    // Down
    scene.add.rectangle(w-100, h-50, btnSize, btnSize, 0x000000, alpha)
        .setInteractive()
        .on('pointerdown', () => player.setVelocityY(200))
        .on('pointerup', () => player.setVelocityY(0));
}

function update() {
    player.setVelocity(0);
    const speed = 200;

    // Desktop controls
    if (cursors.left.isDown) player.setVelocityX(-speed);
    else if (cursors.right.isDown) player.setVelocityX(speed);
    if (cursors.up.isDown) player.setVelocityY(-speed);
    else if (cursors.down.isDown) player.setVelocityY(speed);
}

// Handle window resize
window.addEventListener('resize', () => {
    game.scale.resize(window.innerWidth, window.innerHeight);
});

