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
    // Placeholder images
    this.load.image('player', 'player.png'); // your little guy
    this.load.image('rock', 'rock.png');     // rock you flip
    this.load.image('species', 'bug.png');   // species hidden under rock
}

function create() {
    // Add player in center
    player = this.physics.add.sprite(400, 500, 'player').setScale(0.3);
    player.setCollideWorldBounds(true);

    // Add score display
    scoreText = this.add.text(10, 10, 'Score: 0', { font: '20px Arial', fill: '#fff' });

    cursors = this.input.keyboard.createCursorKeys();

    // Add rocks at specific positions
    const rockPositions = [
        {x: 200, y: 200},
        {x: 400, y: 300},
        {x: 600, y: 250},
    ];

    rockPositions.forEach((pos, index) => {
        const rock = this.physics.add.sprite(pos.x, pos.y, 'rock').setScale(.3).setInteractive();
        rocks.push(rock);

        rock.on('pointerdown', () => {
            // Only allow collection if player is close
            if (Phaser.Math.Distance.Between(player.x, player.y, rock.x, rock.y) < 60) {
                // spawn species on top of rock
                const species = this.add.sprite(rock.x, rock.y, 'species').setScale(0.2);
                collectedSpecies.push('species'+(index+1)); // store species key
                score += 10;
                scoreText.setText('Score: ' + score);
                rock.destroy();
            } else {
                // optional: show message “get closer to flip the rock”
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




