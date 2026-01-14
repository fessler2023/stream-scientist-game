const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#5DADE2', // light blue stream
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
let bugs = [];
let score = 0;
let scoreText;

function preload() {
    // Load your PNG for player and bug
    this.load.image('player', 'bug.png'); // reuse the bug.png for now
    this.load.image('bug', 'bug.png'); // bug sprite
    // Optional: simple bush/rock placeholders
    this.load.image('bush', 'https://i.imgur.com/3k0Q0KX.png'); // tiny placeholder
}

function create() {
    // Add some “bushes/rocks” as obstacles
    this.add.image(200, 150, 'bush');
    this.add.image(600, 400, 'bush');
    this.add.image(400, 300, 'bush');

    // Add player in center
    player = this.physics.add.sprite(400, 500, 'player');
    player.setCollideWorldBounds(true);

    // Add multiple bugs randomly
    for (let i = 0; i < 3; i++) {
        const x = Phaser.Math.Between(50, 750);
        const y = Phaser.Math.Between(50, 550);
        let bug = this.physics.add.sprite(x, y, 'bug').setInteractive();
        bugs.push(bug);

        // Click to catch bug
        bug.on('pointerdown', () => {
            score += 10;
            scoreText.setText('Score: ' + score);
            bug.destroy(); // remove bug
        });
    }

    // Add score display
    scoreText = this.add.text(10, 10, 'Score: 0', { font: '20px Arial', fill: '#fff' });

    // Enable arrow key movement
    cursors = this.input.keyboard.createCursorKeys();
}

function update() {
    // Reset velocity
    player.setVelocity(0);

    const speed = 200;

    if (cursors.left.isDown) {
        player.setVelocityX(-speed);
    } else if (cursors.right.isDown) {
        player.setVelocityX(speed);
    }

    if (cursors.up.isDown) {
        player.setVelocityY(-speed);
    } else if (cursors.down.isDown) {
        player.setVelocityY(speed);
    }
}


