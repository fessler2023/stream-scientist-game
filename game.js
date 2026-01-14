const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#5DADE2', // light blue water
  scene: {
    preload,
    create
  }
};

const game = new Phaser.Game(config);

function preload() {
  // Load a bug sprite - replace 'bug.png' with your actual file name
  this.load.image('bug', 'bug.png');
}

function create() {
  // Add bug sprite in center
  const bug = this.add.sprite(400, 300, 'bug').setInteractive();

  // When bug is clicked, show a simple message
  bug.on('pointerdown', () => {
    alert('You caught a Mayfly! +10 points');
  });

  // Add simple text instruction
  this.add.text(10, 10, 'Click the bug to catch it!', { font: '20px Arial', fill: '#fff' });
}
