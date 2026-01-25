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
let rocks = [], envSprites = [];
let score = 0, scoreText;
let titleText, titleBg;
let rockFlipSound, ambientSound, trashSound;

let clickedCount = 0;
let totalRocks = 12; // only rocks count for level completion
let collectedBugs = [];
let flippedTrash = []; // tracks trash actually flipped

// -------------------------
// Insects Data
// -------------------------
const macroinvertebrates = [
    { key: 'caddisfly', sprite: 'caddisfly.png', name: 'Caddisfly Larva', blurb: 'Caddisfly larvae often build protective cases from sand and twigs. They indicate clean water and help stabilize streambeds.' },
    { key: 'hellgrammite', sprite: 'hellgrammite.png', name: 'Hellgrammite', blurb: 'Hellgrammites are fierce predators found in fast-moving, oxygen-rich streams. They feed on other invertebrates, helping maintain balance in aquatic ecosystems.' },
    { key: 'mayfly', sprite: 'mayfly.png', name: 'Mayfly Nymph', blurb: 'Mayfly nymphs are very sensitive to pollution and signal excellent water quality. Their presence supports fish like trout and bass.' },
    { key: 'crayfish', sprite: 'crayfish.png', name: 'Crayfish', blurb: 'Crayfish are scavengers that help clean streams by eating dead plants and animals. They are an important food source for fish and birds.' },
    { key: 'stonefly', sprite: 'stonefly.png', name: 'Stonefly Nymph', blurb: 'Stonefly nymphs require high oxygen levels and fast-flowing water, making them excellent indicators of clean streams. They help control populations of other aquatic insects.' },
    { key: 'dragonfly', sprite: 'dragonfly.png', name: 'Dragonfly Nymph', blurb: 'Dragonfly nymphs are predatory insects that help control mosquito populations in freshwater habitats. They are an important part of the food web.' },
    { key: 'aquaticworm', sprite: 'aquaticworm.png', name: 'Aquatic Worm', blurb: 'Aquatic worms are detritivores, breaking down organic matter and recycling nutrients in streams. They improve water quality and provide food for fish.' }
];

// -------------------------
// Trash Data
// -------------------------
const trashItems = [
    { key: 'plastic', sprite: 'plastic.png', name: 'Plastic Bottle', blurb: 'Plastic trash harms aquatic life, pollutes streams, and can break down into microplastics that enter the food chain.', points: -5 },
    { key: 'can', sprite: 'can.png', name: 'Aluminum Can', blurb: 'Litter left on land often ends up in waterways. Recycling cans helps conserve resources and protect wildlife.', points: -5 },
    { key: 'glass', sprite: 'glass.png', name: 'Broken Glass', blurb: 'Broken glass can injure wildlife and people exploring the stream. Glass does not degrade quickly and can stay in the environment for decades.', points: -4 },
    { key: 'tire', sprite: 'tire.png', name: 'Tire', blurb: 'Tires leach chemicals into water, block natural stream flow, and create hazards for fish and other aquatic life.', points: -8 },
    { key: 'cigarette', sprite: 'cigarette.png', name: 'Cigarette Butt', blurb: 'Cigarette butts leach toxic chemicals and are harmful to fish and wildlife. Even one butt can contaminate a liter of water.', points: -3 },
    { key: 'styrofoam', sprite: 'styrofoam.png', name: 'Styrofoam', blurb: 'Styrofoam breaks into tiny pieces that are ingested by wildlife and never fully biodegrade, persisting in the environment for centuries.', points: -6 },
    { key: 'fishingLine', sprite: 'fishingLine.png', name: 'Fishing Line', blurb: 'Discarded fishing line can entangle fish, birds, and other wildlife, causing injury or death.', points: -7 }
];

// -------------------------
// Environment Data (bushes only)
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
    trashItems.forEach(t => this.load.image(t.key, t.sprite));

    // Sounds
    this.load.audio('rockFlip', 'rockFlip.wav');
    this.load.audio('ambientWater', 'ambientWater.wav'); // looping background
    this.load.audio('trashSound', 'trash.wav'); // new trash sound
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

    // Sounds
    rockFlipSound = this.sound.add('rockFlip', { volume: 0.5 });
    ambientSound = this.sound.add('ambientWater', { loop: true, volume: 0.3 });
    ambientSound.play();
    trashSound = this.sound.add('trashSound', { volume: 0.5 });

    // Rocks
    for (let i = 0; i < totalRocks; i++) {
        const randX = Phaser.Math.FloatBetween(0.1, 0.9);
        const randY = Phaser.Math.FloatBetween(0.3, 0.8);
        const rock = this.physics.add.sprite(w * randX, h * randY, 'rock')
            .setScale(Phaser.Math.FloatBetween(0.4, 0.5))
            .setInteractive()
            .setDepth(2);

        rocks.push(rock);

        rock.on('pointerdown', () => {
            if (Phaser.Math.Distance.Between(player.x, player.y, rock.x, rock.y) < 60) {
                // Randomly determine if it's a bug or trash
                let isTrash = Phaser.Math.Between(1, 100) <= 20; // 20% chance trash
                let content;
                if(isTrash) {
                    content = Phaser.Utils.Array.GetRandom(trashItems);
                    trashSound.play();
                    score += content.points; // negative points
                    flippedTrash.push(content.name); // track trash actually flipped
                } else {
                    content = Phaser.Utils.Array.GetRandom(macroinvertebrates);
                    rockFlipSound.play();
                    score += 10;
                    collectedBugs.push(content.name);
                }

                rock.destroy();
                scoreText.setText('Score: ' + score);
                updateExplorer(content);
                clickedCount++;
                if(clickedCount >= totalRocks) showLevelSummary();
            } else console.log('Move closer to flip the rock!');
        });
    }

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
    rocks.forEach(r => { if(r.active) r.setPosition(r.x/w * w, r.y/h * h); });
    player.setPosition(w/2,h*0.8);
}

// -------------------------
// Explorer Panel Update
// -------------------------
function updateExplorer(item) {
    document.getElementById("explorerImage").src = item.sprite;
    document.getElementById("explorerName").innerText = item.name;
    document.getElementById("explorerText").innerText = item.blurb;
}

// -------------------------
// Level Summary
// -------------------------
function showLevelSummary() {
    let summary = `Level Complete!\nScore: ${score}\n\nBugs Collected:\n`;

    const bugCounts = collectedBugs.reduce((acc, name) => { acc[name] = (acc[name] || 0) + 1; return acc; }, {});
    for (let bug in bugCounts) summary += `- ${bug} x${bugCounts[bug]}\n`;

    summary += `\nTrash Collected:\n`;
    const trashCounts = flippedTrash.reduce((acc, name) => { acc[name] = (acc[name] || 0) + 1; return acc; }, {});
    for (let t in trashCounts) summary += `- ${t} x${trashCounts[t]}\n`;

    alert(summary);
}
