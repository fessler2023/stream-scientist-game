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
let envSprites = [];
let collectedSpecies = [];
let score = 0;
let scoreText;
let inventorySprites = [];

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
    { x: 0.5, y: 0.25 },
];

function preload() {
    this.load.image('player', 'player.png');
    this.load.image('rock', 'rock.png');
    this.load.image('species', 'bug.png');
    this.load.image('tree', 'tree.png');
    this.load.image('bush', 'bush.png');
}

function create() {
    const w = window.innerWidth;
    const h = window.innerHeight;

    // -------------------------
    // Environment objects
    // -------------------------
    envObjects.forEach(obj => {
        const sprite = this.add.image(w * obj.x, h * obj.y, obj.key)
            .setScale(0.5)
            .setOrigin(0.5, 0.5);
        // Depth layering: trees/bushes behind player
        sprite.setDepth(1);
        envSprites.push(sprite);
    });

    // -------------------------
    // Player
    // -------------------------
    player = this.physics.add.sprite(w / 2, h * 0.8, 'player')
        .setScale(0.5)
        .setCollideWorldBounds(true);
    player.setDepth(2); // player appears above environment

    // -------------------------
    // Score display
    // -------------------------
    scoreText = this.add.text(10, 10, 'Score: 0', { font: '20px Arial', fill: '#fff' });

    cursors = this.input.keyboard.createCursorKeys();

    // -------------------------
    // Rocks
    // -------------------------
    rockPositions.forEach((pos, index) => {
        const rock = this.physics.add.sprite(w * pos.x, h * pos.y, 'rock')
            .setScale(0.5)
            .setInteractive();
        rock.setDepth(2); // rocks above environment, behind player if needed
        rocks.push(rock);

        rock.on('pointerdown', () => {
            if (Phaser.Math.Distance.Between(player.x, player.y, rock.x, rock.y) < 60) {
                const species = this.add.sprite(rock.x, rock.y, 'species').setScale(0.3);
                collectedSpecies.push('species' + (index + 1));
                score += 10;
                scoreText.setText('Score: ' + score);

                // Add species icon to inventory
                const invX = 10 + inventorySprites.length * 40;
                const invY = h - 50;
                const invSprite = this.add.image(invX, invY, 'species').setScale(0.3).setScrollFactor(0);
                inventorySprites.push(invSprite);

                this.tweens.add({
                    targets: rock,
                    alpha: 0,
                    duration: 300,
                    onComplete: () => rock.destroy()
                });
            } else {
                console.log('Move closer to flip the rock!');
            }
        });
    });

    // -------------------------
    // Resize listener
    // -------------------------
    window.addEventListener('resize', () => resizeGame(this));
}

function update() {
    player.setVelocity(0);
    const speed = 200;

    if (cursors.left.isDown) player.setVelocityX(-speed);
    else if (cursors.right.isDown) player.setVelocityX(speed);

    if (cursors.up.isDown) player.setVelocityY(-speed);
    else if (cursors.down.isDown) player.setVelocityY(speed);
}

// -------------------------
// Handle window resize
// -------------------------
function resizeGame(scene) {
    const w = window.innerWidth;
    const h = window.innerHeight;

    game.scale.resize(w, h);

    // Reposition environment objects
    envObjects.forEach((obj, i) => {
        envSprites[i].setPosition(w * obj.x, h * obj.y);
    });

    // Reposition rocks
    rockPositions.forEach((pos, i) => {
        if (rocks[i] && rocks[i].active) rocks[i].setPosition(w * pos.x, h * pos.y);
    });

    // Reposition player proportionally
    player.setPosition(w / 2, h * 0.8);

    // Reposition inventory icons
    inventorySprites.forEach((inv, i) => {
        inv.setPosition(10 + i * 40, h - 50);
    });
}

