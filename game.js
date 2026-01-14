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
    this.load.image('player', 'bug.png'); // reuse your PNG for now
    this.load.image('bug', 'bug.png');    // bug sprite
    // Simple bush placeholder (any small image URL works)
    this.load.image('bush', 'https://i.imgur.com/3k0Q0KX.png');
}

function create() {
    // Add some “bushes/rocks” as obstacles
    this.add.image(200, 150, 'bush').setScale(0.5);
    this.add.image(600, 400, 'bush').setScale(0.5);
    this.add.image(400, 300, 'bush').setScale(0.5);

    // Add player in center, scale down
    player = this.physics.add.sprite(400, 500, 'player').setScale(0.3);
    player.setCollideWorldBounds(true);

    // Add multiple bugs randomly, scaled smaller
    for (let i = 0; i < 5; i++) {
        const x = Phaser.Math.Between(50, 750);
        const y = Phaser.Math.Between(50, 550);
        let bug = this.physics.add.sprite(x, y, 'bug').setInteractive().setScale(0.15);
        bugs.push(bug);

        // Click to catch bug
        bug.on('pointerdown', () => {
            score += 10;
            scoreText.setText('Score: ' + score);
            bug.destroy(); // bug disappears after catch
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

