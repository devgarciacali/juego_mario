const w = 800;
const h = 480;

const config = {
    type: Phaser.AUTO, //que es Phaser.AUTO para que funciona
    parent: 'juego',
    width: w,
    height: h,
    physics: {
        default: 'arcade', arcade: {
            gravity: {
                y: 900
            },
            debug: false
        }
    },

    scene: { preload, create, update }
};

let player, plataformas, teclas, monedas, enemigos;
let puntos = 0;
let textoPuntos;

new Phaser.Game(config);

function preload() {
    const g = this.add.graphics();
    // JUGADOR NARANJA
    g.fillStyle(0xff9800, 1);
    g.fillRect(0, 0, 28, 28);
    g.generateTexture('jugador', 28, 28);
    g.clear();

    // Plataforma
    g.fillStyle(0x6d4c41, 1);
    g.fillRect(0, 0, 64, 16);
    g.generateTexture('plataforma', 64, 16);
    g.clear();

    // moneda
    g.fillStyle(0xffd54f, 1);
    g.fillCircle(10, 10, 10);
    g.lineStyle(2, 0xffb300, 1);
    g.strokeCircle(10, 10, 10);
    g.generateTexture('moneda', 20, 20);
    g.clear();

    // enemigos
    g.fillStyle(0x53935, 1);
    g.fillRect(0, 0, 28, 28);
    g.generateTexture('enemigo', 28, 28);
    g.clear();
}

function create() {
    player = this.physics.add.sprite(80, h - 200, 'jugador').setCollideWorldBounds(true);
    player.body.setSize(28, 28);

    plataformas = this.physics.add.staticGroup();

    for (let x = 0; x < w; x += 64) {
        plataformas.create(x, h - 32, 'plataforma').setOrigin(0).refreshBody();
    }

    plataformas.create(200, h - 120, 'plataforma').setOrigin(0).refreshBody();
    plataformas.create(400, h - 200, 'plataforma').setOrigin(0).refreshBody();
    plataformas.create(580, h - 260, 'plataforma').setOrigin(0).refreshBody();

    teclas = this.input.keyboard.createCursorKeys();

    //dibujar moneda
    monedas = this.physics.add.group({ allowGravity: false });
    monedas.create(210, h - 140, 'moneda');
    monedas.create(430, h - 220, 'moneda');
    monedas.create(610, h - 280, 'moneda');

    //dibujar enemigos
    enemigos = this.physics.add.sprite(500, h - 50, 'enemigo');
    enemigos.body.setSize(28, 28);

    this.physics.add.collider(player, plataformas);
    this.physics.add.collider(enemigos, plataformas);
    this.physics.add.overlap(player, monedas, tomarmoneda, null, this);
    // se muestra el texto de puntos
   textoPuntos = this.add.text(16, 16, 'Puntos: 0', {
        fontSize: '24px',
        fill: '#ffffff',
        fontFamily: 'Arial'
    });
}

function update() {
    const speed = 180;
    // Para mover de izquierda a derecha
    if (teclas.left.isDown) {
        player.setVelocityX(-speed);
    } else if (teclas.right.isDown) {
        player.setVelocityX(speed);
    } else {
        player.setVelocityX(0);
    }
    // Para saltar nuestro jugador
    if ((teclas.up.isDown || teclas.space?.isDown) && player.body.blocked.down) {
        player.setVelocityY(-500);
    }
    
}


function tomarmoneda (player, moneda) {
    moneda.disableBody(true, true);
    puntos += 10;
    // se actualiza el texto de puntos
    textoPuntos.setText('Puntos: ' + puntos);
}
