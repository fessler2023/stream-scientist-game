const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
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
    // Your sprites
    this.load.image('player', 'player.png'); 
    this.load.image('rock', 'rock.png');     
    this.load.image('species', 'bug.png');   
    this.load.image('tree', 'tree.png');     
    this.load.image('bush', 'bush.png');     
}

function create() {
    // Add environment objects
    this.add.image(100, 100, 'tree').setScale(0.5);
    this.add.image(700, 150, 'bush').setScale(0.5);
    this.add.image(300, 400, 'tree').setScale(0.5);
    this.add.image(600, 500, 'bush').setScale(0.5);

    // Add player near bottom of screen
    player = this.physics.add.sprite(400, 500, 'player').setScale(0.5);
    player.setCollideWorldBounds(true);

    // Score display
    scoreText = this.add.text(10, 10, 'Score: 0', { font: '20px Arial', fill: '#fff' });

    cursors = this.input.keyboard.createCursorKeys();

    // Rock positions along a stream / shore
    const rockPositions = [
        {x: 200, y: 300},
        {x: 350, y: 250},
        {x: 500, y: 200},
        {x: 650, y: 300},
        {x: 400, y: 150},
    ];

    rockPositions.forEach((pos, index) => {
        const rock = this.physics.add.sprite(pos.x, pos.y, 'rock').setScale(0.5).setInteractive();
        rocks.push(rock);

        rock.on('pointerdown', () => {
            // Only allow collection if player is close
            if (Phaser.Math.Distance.Between(player.x, player.y, rock.x, rock.y) < 60) {
                // spawn species on top of rock
                const species = this.add.sprite(rock.x, rock.y, 'species').setScale(0.3);
                collectedSpecies.push('species'+(index+1)); // store species key
                score += 10;
                scoreText.setText('Score: ' + score);

                // Fade out rock for visual effect
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
    // Reset velocity
    player.setVelocity(0);
    const speed = 200;

    if (cursors.left.isDown) player.setVelocityX(-speed);
    else if (cursors.right.isDown) player.setVelocityX(speed);

    if (cursors.up.isDown) player.setVelocityY(-speed);
    else if (cursors.down.isDown) player.setVelocityY(speed);
}
