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

function preload() {
    // Make sure the PNGs are in "assets" folder if you're using that folder
    this.load.image('player', 'assets/player.png');
    this.load.image('rock', 'assets/rock.png');
    this.load.image('species', 'assets/bug.png');
    this.load.image('tree', 'assets/tree.png');
    this.load.image('bush', 'assets/bush.png');
}

function create() {
    // -------------------------
    // Environment objects
    // -------------------------
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

    // -------------------------
    // Player
    // -------------------------
    player = this.physics.add.sprite(window.innerWidth / 2, window.innerHeight * 0.8, 'player')
        .setScale(0.5)
        .setCollideWorldBounds(true);

    // -------------------------
    // Score display
    // -------------------------
    scoreText = this.add.text(10, 10, 'Score: 0', { font: '20px Arial', fill: '#fff' });

    cursors = this.input.keyboard.createCursorKeys();

    // -------------------------
    // Rock positions
    // -------------------------
    const rockPositions = [
        { x: 0.25, y: 0.5 },
        { x: 0.45, y: 0.4 },
        { x: 0.65, y: 0.35 },
        { x: 0.75, y: 0.55 },
        { x: 0.5, y: 0.25 },
    ];

    rockPositions.forEach((pos, index) => {
        const rock = this.physics.add.sprite(window.innerWidth * pos.x, window.innerHeight * pos.y, 'rock')
            .setScale(0.5)
            .setInteractive();
        rocks.push(rock);

        rock.on('pointerdown', () => {
            if (Phaser.Math.Distance.Between(player.x, player.y, rock.x, rock.y) < 60) {
                const species = this.add.sprite(rock.x, rock.y, 'species').setScale(0.3);
                collectedSpecies.push('species' + (index + 1));
                score += 10;
                scoreText.setText('Score: ' + score);

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
window.addEventListener('resize', () => {
    game.scale.resize(window.innerWidth, window.innerHeight);
});
