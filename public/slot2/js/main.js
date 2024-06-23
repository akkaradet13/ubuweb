// the game itself
var game;
var dataReward

var gameOptions = {

    // slices (prizes) placed in the wheel
    slices: 6,

    // prize names, starting from 12 o'clock going clockwise
    slicePrizes: [
        "🎉 0 5% OFF",
        "🎉 1 10% OFF",
        "🎉 2 15% OFF",
        "🎉 3 25% OFF",
        "🎉 4 50% OFF",
        "🎉 5 FREE PASTRY 🍰"
    ],

    // wheel rotation duration, in milliseconds
    rotationTime: 3000
}
// once the window loads...
window.onload = function () {
    // game configuration object
    var gameConfig = {

        // render type
        type: Phaser.CANVAS,

        // game width, in pixels
        width: 1050,

        // game height, in pixels
        height: 1500,

        // game background color
        backgroundColor: "#ffffff",

        // scenes used by the game
        scene: [playGame]
    };

    // game constructor
    game = new Phaser.Game(gameConfig);

    // pure javascript to give focus to the page/frame and scale the game
    window.focus()
    resize();
    window.addEventListener("resize", resize, false);
}

// PlayGame scene
class playGame extends Phaser.Scene {

    // constructor
    constructor() {
        super("PlayGame");
    }

    // method to be executed when the scene preloads
    preload() { // loading assets

        this.load.image("wheel", window.location.href + "images/wheel.png");
        this.load.image("pin", window.location.href + "images/pin.png");
    }

    // method to be executed once the scene has been created
    create() {

        // adding the wheel in the middle of the canvas
        this.wheel = this.add.sprite(game.config.width / 2, game.config.height / 2, "wheel");

        // adding the pin in the middle of the canvas
        this.pin = this.add.sprite(game.config.width / 2, game.config.height / 2, "pin");

        this.prizeTitleText = this.add.text(game.config.width / 2, game.config.height - 1300, "กองบริการการศึกษา \n มหาวิทยาลัยอุบลราชธานี", {
            font: "bold 60px Prompt",
            align: "center",
            color: "#091337"
        });

        // adding the text field
        this.prizeText = this.add.text(game.config.width / 2, game.config.height - 230, "สุ่มของรางวัล", {
            font: "bold 50px Prompt",
            align: "center",
            color: "#091337"
        });

        // center the text
        this.prizeText.setOrigin(0.5);
        this.prizeTitleText.setOrigin(0.5);

        // the game has just started = we can spin the wheel
        this.canSpin = true;

        // waiting for your input, then calling "spinWheel" function
        this.input.on("pointerdown", this.spinWheel, this);
    }

    // function to spin the wheel
    spinWheel() {

        // can we spin the wheel?
        if (this.canSpin) {

            // resetting text field
            this.prizeText.setText("");

            // the wheel will spin round from 2 to 4 times. This is just coreography
            var rounds = Phaser.Math.Between(4, 6);

            // then will rotate by a random number from 0 to 360 degrees. This is the actual spin
            // var degrees = Phaser.Math.Between(0, 360);
            var degrees = Math.floor(Math.random() * 361);
            // var degrees = 0
            console.log(degrees);
            // before the wheel ends spinning, we already know the prize according to "degrees" rotation and the number of slices
            var prize = gameOptions.slices - 1 - Math.floor(degrees / (360 / gameOptions.slices));
            console.log(prize);
            prize = ""
            if ([359,360,0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27].includes(degrees)) {
                var databaseRef = firebase.database().ref('slot2');
                databaseRef.on('value', (snapshot) => {
                    const data = snapshot.val();
                    let textStatus = data[degrees]
                    if (textStatus) {
                        if (textStatus == "ok") {
                            prize = `😫 ช่างน่าเสียดาย 😫 \nคุณดวงดีแล้วแต่!!!มีคนดวงดีกว่า\n🙏 ขอบคุณที่ร่วมสนุก 🙏`;
                        } else {
                            firebase.database().ref('slot2/' + degrees).set("ok");
                            prize = `🎉 ยินดีด้วยค่ะ 🎉 \nคุณได้รับรางวัล\nแสดงรหัส\n !!! ${textStatus} !!!\nเพื่อรับของรางวัล`;
                        }
                    } else {
                        this.redirect
                        prize = `😞 เกือบแล้ว 😞\nอีกนิดเดียว\n🙏 ขอบคุณที่ร่วมสนุก 🙏`
                    }
                })
            } else {
                this.redirect
                prize = `😞 น่าเสียดาย 😞\nวันนี้ดวงยังไม่มา\n🙏 ขอบคุณที่ร่วมสนุก 🙏`
            }



            // now the wheel cannot spin because it's already spinning
            // default = false
            this.canSpin = false;

            // animation tweeen for the spin: duration 3s, will rotate by (360 * rounds + degrees) degrees
            // the quadratic easing will simulate friction
            this.tweens.add({

                // adding the wheel to tween targets
                targets: [this.wheel],

                // angle destination
                angle: 360 * rounds + degrees,

                // tween duration
                duration: gameOptions.rotationTime,

                // tween easing
                ease: "Cubic.easeOut",

                // callback scope
                callbackScope: this,

                // function to be executed once the tween has been completed
                onComplete: function (tween) {
                    // displaying prize text
                    this.prizeText.setText(prize);

                    // player can spin again
                    this.canSpin = false;
                }
            });
        }
    }
}

// pure javascript to scale the game
function resize() {
    var canvas = document.querySelector("canvas");
    var windowWidth = window.innerWidth;
    var windowHeight = window.innerHeight;
    var windowRatio = windowWidth / windowHeight;
    var gameRatio = game.config.width / game.config.height;
    if (windowRatio < gameRatio) {
        canvas.style.width = windowWidth + "px";
        canvas.style.height = (windowWidth / gameRatio) + "px";
    }
    else {
        canvas.style.width = (windowHeight * gameRatio) + "px";
        canvas.style.height = windowHeight + "px";
    }
}
