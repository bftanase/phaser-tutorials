// Initialize Phaser, and creates a 400x490px game
var game = new Phaser.Game(400, 490, Phaser.AUTO, 'game_div');

// Creates a new 'main' state that wil contain the game
var main_state = {

    preload: function() { 
        this.game.stage.backgroundColor = '#71c5cf';

        this.game.load.image('bird', 'assets/bird.png');
        this.game.load.image('pipe', 'assets/pipe.png');

        this.game.load.audio('jump', 'assets/jump.wav');
        this.game.load.audio('death', 'assets/death.wav');
    },

    create: function() {
        game.physics.startSystem(Phaser.Physics.ARCADE);
        game.physics.startSystem(Phaser.Physics.P2);
        this.bird = this.game.add.sprite(100, 245, 'bird');

        game.physics.enable(this.bird, Phaser.Physics.ARCADE);
        this.bird.body.gravity.y = 1000;

        this.bird.anchor.setTo(-0.2, 0.5);

        this.pipes = game.add.group();
//        this.pipes.enableBody = true;
        this.pipes.createMultiple(20, 'pipe');

        this.timer = this.game.time.events.loop(1500, this.add_rows_of_pipes, this);

        var space_key = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        space_key.onDown.add(this.jump, this);

        this.score = 0;
        var style = { font: "30px Arial", fill: "#ffffff" };
        this.label_score = this.game.add.text(20, 20, "0", style);

        this.jump_sound = this.game.add.audio('jump');
        this.death_sound = this.game.add.audio('death');
    },
    
    update: function() {
        if (this.bird.angle < 20) {
            this.bird.angle += 1;
        }

        if (this.bird.inWorld == false) {
            this.restart_game();
        }
        game.physics.arcade.collide(this.bird, this.pipes, this.hit_pipe, null, this);
    },
    jump: function() {
        if (this.bird.alive == false) {
            return;
        }

        this.bird.body.velocity.y = -350;
        this.jump_sound.play();

        var animation = this.game.add.tween(this.bird);

        animation.to({angle: -20}, 100);
        animation.start();
    },
    restart_game: function() {
        this.game.time.events.remove(this.timer);
        if (this.deathTimer) {
            clearTimeout(this.deathTimer);
            this.deathTimer = null;
        }
        this.game.state.start('main');
    },

    add_one_pipe: function(x, y) {
        var pipe = this.pipes.getFirstDead();
        pipe.checkWorldBounds = true;
        pipe.reset(x, y);

//        game.physics.enable(pipe, Phaser.Physics.P2);

//        pipe.body.immovable = true;
        pipe.body.velocity.x = -200;
        pipe.outOfBoundsKill = true;
    },

    add_rows_of_pipes: function() {
        var hole = Math.floor(Math.random()*5) + 1;
        for (var i = 0; i< 8; i++){
            if (i != hole && i != hole + 1){
                this.add_one_pipe(400, i*60+10)
            }
        }

        this.score += 1;
        this.label_score.setText(this.score);
    },
    die: function() {
        game.time.events.add(3000, function() {
            this.restart_game();
        }, this);
    },
    hit_pipe: function() {

        this.death_sound.play();

        if (this.bird.alive == false) {
            return;
        }

        this.bird.alive = false;

        this.game.time.events.remove(this.timer);

//        this.pipes.forEachAlive(function(p){
//            p.body.velocity.x = 0;
//        }, this)

        game.time.events.add(1000, function() {
            this.restart_game();
        }, this);
    }


};

// Add and start the 'main' state to start the game
game.state.add('main', main_state);  
game.state.start('main'); 