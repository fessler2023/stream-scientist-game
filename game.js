const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: '#5DADE2', // light blue = stream/lake
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    },
    scene: {
        preload,
        create,
        update
    },
    scale: {
        mode: Phaser.Scale.RESIZE,        // canvas resizes with browser
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
    this.load.image('player', 'player.png'); 
    this.load.image('rock', 'rock.png');     
    this.load.image('species', 'bug.png');   
    this.load.image('tree', 'tree.png');     
    this.load.image('bush', 'bush.png');     
}

function create() {
    // Environment objects - positions now relative to screen size
    this.add.image(window.innerWidth * 0.1, window.innerHeight * 0.15, 'tree').setScale(0.5);
    this.add.image(window.innerWidth * 0.85, window.innerHeight * 0.2, 'bush').setScale(0.5);
    this.add.image(window.innerWidth * 0.35, window.innerHeight * 0.65, 'tree').setScale(0.5);
    this.add.image(window.innerWidth * 0.75, window.innerHeight * 0.85, 'bush').setScale(0.5);

    // Player starts near bottom center
    player = this.physics.add.sprite(window.innerWidth/2, window.innerHeight * 0.8, 'player').setScale(0.5);
    player.setCollideWorldBounds(true);

    // Score display
    scoreText = this.add.text(10, 10, 'Score: 0', { font: '20px Arial', fill: '#fff' });

    cursors = this.input.keyboard.createCursorKeys();

    // Rock positions along “stream” - scaled to screen
    const rockPositions = [
        {x: window.innerWidth * 0.25, y: window.innerHeight * 0.5},
        {x: window.innerWidth * 0.45, y: window.innerHeight * 0.4},
        {x: window.innerWidth * 0.65, y: window.innerHeight * 0.35},
        {x: window.innerWidth * 0.75, y: window.innerHeight * 0.55},
        {x: window.innerWidth * 0.5,  y: window.innerHeight * 0.25},
    ];

    rockPositions.forEach((pos, index) => {
        const rock = this.physics.add.sprite(pos.x, pos.y, 'rock').setScale(0.5).setInteractive();
        rocks.push(rock);

        rock.on('pointerdown', () => {
            if (Phaser.Math.Distance.Between(player.x, player.y, rock.x, rock.y) < 60) {
                const species = this.add.sprite(rock.x, rock.y, 'species').setScale(0.3);
                collectedSpecies.push('species'+(index+1));
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

// Optional: handle window resize dynamically
window.addEventListener('resize', () => {
    game.scale.resize(window.innerWidth, window.innerHeight);
});

