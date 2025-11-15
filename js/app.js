const w = 800;
const h = 400;
const world = 4000;

const config = {
    type: Phaser.AUTO, // Phaser elige automáticamente entre WebGL o Canvas según el navegador
    parent: 'juego',
    width: w,
    height: h,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 900 },
            debug: false
        }
    },
    scene: { preload, create, update }
};

let player, plataformas, teclas, monedas, enemigos;
let puntos = 0;
let textPuntos;

let vidas = 2;
let textoVidas;

// texto de monedas
let textoMonedas;
let coins = 0;

// fondo
let fondo;
// sonidos
let sfx = {};
let bgm;
// plataformas moviles
let plataformasMoviles, pinchos, lava;


new Phaser.Game(config);

function preload() {
    const g = this.add.graphics();
    // jugador
    this.load.image('jugador', 'img/mario.png');
    // Plataforma (café)
    this.load.image('plataforma', 'img/plataforma.png');
    // Moneda (amarilla)
    this.load.image('moneda', 'img/moneda.png');
    // Enemigo (tortuga)
    this.load.image('enemigo', 'img/tortuga.png');
    // Fondo (nubes)
    this.load.image('fondo', 'img/nubes.jpeg');
    // sonidos esepciales de coins
    this.load.audio('coin', 'sfx/coin.wav');
    // sonido de salto
    this.load.audio('jump', 'sfx/jump.wav');
    // sonido de fondo
    this.load.audio('bgm', 'sfx/bgm.wav');
    // plataformas moviles
    // lavas
    this.load.image('lava', 'img/lava.png');
    this.load.image('pincho', 'img/pinchos.png');
}

function create() {
    // mundo y cámara
    this.physics.world.setBounds(0, 0, world, h);
    this.cameras.main.setBounds(0, 0, world, h);

    // Crear jugador
    player = this.physics.add.sprite(80, h - 200, 'jugador').setCollideWorldBounds(true);
    player.body.setSize(28, 28);
    player.inv = false; // bandera de invencibilidad

    // Crear plataformas
    plataformas = this.physics.add.staticGroup();
    plataformasMoviles = this.physics.add.group({ allowGravity: false, immovable: true });
    crearPlataformaMovH(this, 100, h - 300, 100, 300, 60);
    crearPlataformaMovV(this, 800, h - 100, h - 320, h - 100, 70);
    // fondo
    fondo = this.add.image(0, 0, 'fondo').setOrigin(0).setScrollFactor(0).setDepth(-20);

    // sonido
    this.sound.pauseOnBlur = false;
    sfx.coin = this.sound.add('coin', { volume: 0.3 });
    sfx.jump = this.sound.add('jump', { volume: 0.3 });
    //desbloquear y reproducir musica de fondo


    const STAR_AUDIO = () => {
        this.sound.context.resume();
        if (!bgm || !bgm.isPlaying) {
            bgm = this.sound.get('bgm') || this.sound.add('bgm', { loop: true, volume: 0.25 });
            bgm.play();
        }
    }
    // iniciar el audio cuando el usuario oprima cual quier tecla
    this.input.keyboard.once('keydown', STAR_AUDIO, this);

    // Suelo completo
    for (let x = 0; x < world; x += 64) {
        plataformas.create(x, h - 32, 'plataforma').setOrigin(0).refreshBody();
        plataformas.create(x, h - 16, 'plataforma').setOrigin(0).refreshBody();
    }

    // Plataformas elevadas

    plataformas.create(180, h - 120, 'plataforma').setOrigin(0).refreshBody();
    plataformas.create(400, h - 200, 'plataforma').setOrigin(0).refreshBody();
    plataformas.create(580, h - 260, 'plataforma').setOrigin(0).refreshBody();
    plataformas.create(580, h - 80, 'plataforma').setOrigin(0).refreshBody();
    plataformas.create(160, h - 230, 'plataforma').setOrigin(0).refreshBody();

    // Teclas de movimiento
    teclas = this.input.keyboard.createCursorKeys();

    // Monedas
    monedas = this.physics.add.group({ allowGravity: false });
    monedas.create(210, h - 140, 'moneda');
    monedas.create(430, h - 220, 'moneda');
    monedas.create(610, h - 280, 'moneda');
    monedas.create(630, h - 100, 'moneda');
    monedas.create(210, h - 246, 'moneda');

    enemigos = this.physics.add.group();
    // pinchos
    pinchos = this.physics.add.staticGroup();
    // pinchos sobre plataformas
    pinchos.create(260, h - 145, 'pincho').setOrigin(0).refreshBody();
    //pinchos en las misma plataforma
    pinchos.create(490, h - 225, 'pincho').setOrigin(0).refreshBody();
    pinchos.create(469, h - 225, 'pincho').setOrigin(0).refreshBody();
    pinchos.create(580, h - 103, 'pincho').setOrigin(0).refreshBody();
    //lava
    lava = this.physics.add.staticGroup();
    lava.create(200, h - 17, 'lava').setOrigin(0,1).setScale(4, 1).refreshBody();
    lava.create(200, h - 1, 'lava').setOrigin(0,1).setScale(4, 1).refreshBody();
    //crear enemigo en las tres plataformas y dar rango de movimiento sobre ellas
    crearEnemigo(this, 210, h - 130, 180, 240);
    crearEnemigo(this, 420, h - 230, 410, 450);
    crearEnemigo(this, 600, h - 290, 590, 680);
    crearEnemigo(this, 600, h - 100, 609, 670);
    crearEnemigo(this, 200, h - 240, 180, 270);

    // Colisiones
    this.physics.add.collider(player, plataformas);
    this.physics.add.collider(enemigos, plataformas);
    this.physics.add.overlap(player, monedas, tomarMoneda, null, this);
    this.physics.add.overlap(player, enemigos, tocarEnemigo, null, this);
    this.physics.add.collider(player, plataformasMoviles, (pl, plat) => {
        if (player.body.blocked.down && plat.body.touching.up) {
            pl.x += plat.body.deltaX();
        }
    });
    this.physics.add.overlap(player, pinchos, tocarPincho, null, this);
    this.physics.add.overlap(player, lava, tocarPeligro, null, this);
    // Cámara sigue al jugador
    const cam = this.cameras.main;
    cam.startFollow(player, true, 0.08, 0.08);

    textPuntos = this.add.text(16, 16, "Puntos: 0", {
        fontSize: '20px',
        fill: '#fff',
        fontFamily: 'Arial'
    });
    textPuntos.setScrollFactor(0);
    // texto de vidas
    textoVidas = this.add.text(650, 16, `Vidas: ${vidas}`, {
        fontSize: '20px',
        fill: '#fff',
        fontFamily: 'Arial'
    });
    textoVidas.setScrollFactor(0);
    // texto de las monedas
    textoMonedas = this.add.text(16, 38, `monedas: ${coins}`, {
        fontSize: '20px',
        fill: '#fff',
        fontFamily: 'Arial'
    });
    textoMonedas.setScrollFactor(0);

}

function update() {
    const speed = 180;


    // Movimiento izquierda / derecha
    if (teclas.left.isDown) {
        player.setVelocityX(-speed);
        player.flipX = true; // voltear sprite
    } else if (teclas.right.isDown) {
        player.setVelocityX(speed);
        player.flipX = false;
    } else {
        player.setVelocityX(0);
    }

    // Salto
    if ((teclas.up.isDown || teclas.space?.isDown) && player.body.blocked.down) {
        // reproducir sonido
        sfx.jump.play();
        player.setVelocityY(-500);
    } 
    plataformasMoviles.children.iterate(p => {
        if (!p) {
            return;
        }
        if (p.axis === 'x') {
            if (p.x <= p.minX) {
                p.dir = 1;
            } else if (p.x >= p.maxX) {
                p.dir = -1;
            }
            p.setVelocityX(p.dir * p.speed);
        } else if (p.axis === 'y') {
            if (p.y <= p.minY) {
                p.dir = 1;
            } else if (p.y >= p.maxY) {
                p.dir = -1;
            }
            p.setVelocityY(p.dir * p.speed);
        }
        });

    // Movimiento automático de enemigos
    enemigos.children.iterate(ene => {
        if (ene.x <= ene.minX) {
            ene.direction = 1;
            ene.flipX = false;
        } else if (ene.x >= ene.maxX) {
            ene.direction = -1;
            ene.flipX = true;
        }
        ene.setVelocityX(ene.direction * ene.speed);

    });
}

// --- FUNCIONES AUXILIARES ---

function crearEnemigo(scene, x, y, minX, maxX) {
    const ene = scene.physics.add.sprite(x, y, 'enemigo');
    ene.body.setAllowGravity(true);
    ene.body.setCollideWorldBounds(true);
    ene.direction = -1;
    ene.speed = 60; // velocidad moderada
    ene.setVelocityX(ene.direction * ene.speed);
    ene.minX = minX;
    ene.maxX = maxX;
    enemigos.add(ene);
    return ene;
}



function tomarMoneda(player, monedas) {
    console.log(player);
    monedas.disableBody(true, true);
    coins += 10;
    textoMonedas.setText(`monedas: ${coins}`);
    // reproducir sonido
    sfx.coin.play();
}

function tocarEnemigo(player, enemigo) {
    if (player.body.velocity.y > 120) {
        enemigo.disableBody(true, true);
        puntos += 50;
        textPuntos.setText(`Puntos: ${puntos}`);
    }
    const dir = player.x < enemigo.x ? -1 : 1;
    player.setVelocityX(-dir * 200);
    player.setVelocityY(-300);
    player.inv = true;
    player.setTint(0xff8080);
    //parpadeo visual
    const blink = this.time.addEvent({
        delay: 100,
        callback: () => player.visible = (!player.visible),
        repeat: 5
    });
    this.time.delayedCall(1000, () => {
        player.clearTint();1
        player.inv = false;
        player.visible = true;
        blink.remove();
    })
    vidas--;
    textoVidas.setText(`Vidas: ${vidas}`);
}

function crearPlataformaMovH(scene, x, y, minX, maxX, speed) {
    const p = scene.physics.add.image(x, y, 'plataforma');
    p.setImmovable(true);
    p.body.allowGravity = false;
    p.axis = 'x';
    p.minX = minX;
    p.maxX = maxX;
    p.speed = speed;
    p.dir = 1;
    p.setVelocityX(p.dir * p.speed);
    plataformasMoviles.add(p);
    return p;
}
function crearPlataformaMovV(scene, x, y, minY, maxY, speed) {
    const p = scene.physics.add.image(x, y, 'plataforma');
    p.setImmovable(true);
    p.body.allowGravity = false;
    p.axis = 'y';
    p.minY = minY;
    p.maxY = maxY;
    p.speed = speed;
    p.dir = 1;
    p.setVelocityY(p.dir * p.speed);
    plataformasMoviles.add(p);
    return p;
}
function tocarPeligro(player, peligro){
    const dir = player.x < peligro.x ? -1 : 1;
    player.setVelocityX(-dir * 200);
    player.setVelocityY(-300);
    player.inv = true;
    player.setTint(0xff8080);
    //parpadeo visual
    const blink = this.time.addEvent({
        delay: 100,
        callback: () => player.visible = (!player.visible),
        repeat: 5
    });
    this.time.delayedCall(1000, () => {
        player.clearTint();
        player.inv = false;
        player.visible = true;
        blink.remove();
    })
    vidas--;
    textoVidas.setText(`Vidas: ${vidas}`);
}

function tocarPincho(player, pincho){
    const dir = player.x < pincho.x ? -1 : 1;
    player.setVelocityX(-dir * 200);
    player.setVelocityY(-300);
    player.inv = true;
    player.setTint(0xff8080);
    //parpadeo visual
    const blink = this.time.addEvent({
        delay: 100,
        callback: () => player.visible = (!player.visible),
        repeat: 5
    });
    this.time.delayedCall(1000, () => {
        player.clearTint();
        player.inv = false;
        player.visible = true;
        blink.remove();
    })
    vidas--;
    textoVidas.setText(`Vidas: ${vidas}`);
}
