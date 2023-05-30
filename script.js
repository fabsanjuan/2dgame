window.addEventListener('load', function(){
    const canvas = document.getElementById('canvas1');
    const ctx = canvas.getContext('2d');
    canvas.width = 1280;
    canvas.height = 720;

    ctx.fillStyle = 'white';
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'white';

    //object oriented to make game modular. Player and game class to manage game logic.

    
    class Player {
        constructor(game){
            this.game = game; //This gives the player access to the entire game class (prooperties and methods).
            this.collisionX = this.game.width * 0.5;
            this.collisionY = this.game.height * 0.5;
            this.collisionRadius = 30;
            this.speedX = 0;
            this.speedY = 0;
            this.dx = 0;
            this.dy = 0;
            this.speedModifier = 15;

        };

        draw(context){  //draws and animates the player. Expects arg to specify which canvas to draw on.
            context.beginPath();
            context.arc(this.collisionX,this.collisionY,this.collisionRadius,0,Math.PI * 2);
            context.save(); //save and restore methods allow us to apply specific drawing settings to selected shapes without affecting others (wrap).
            context.globalAlpha = 0.5;
            context.fill();
            context.restore();
            context.stroke();
            context.beginPath(); //draws a new line between the player object and the mouse to indicate the direction of the movement of the player.
            context.moveTo(this.collisionX, this.collisionY);
            context.lineTo(this.game.mouse.x, this.game.mouse.y);
            context.stroke();

        };
        update(){
            this.dx = this.game.mouse.x - this.collisionX;
            this.dy = this.game.mouse.y - this.collisionY;
            const distance = Math.hypot(this.dy, this.dx);
            if (distance > this.speedModifier){ //only move the player if the distance is greater than speed mod.
                this.speedX = this.dx/distance || 0;
                this.speedY = this.dy/distance || 0;
            } else {
                this.speedX = 0;
                this.speedY = 0;
            }
            this.collisionX += this.speedX * this.speedModifier;
            this.collisionY += this.speedY * this.speedModifier;
        };

    };
    //create obstacles that appear at random locations on the canvas.
    class Obstacle {
        constructor(game){
            this.game = game;
            this.collisionX = Math.random() * this.game.width;
            this.collisionY = Math.random() * this.game.height;
            this.collisionRadius = 60;
            this.image = document.getElementById('obstacles');
            this.spriteWidth = 250;
            this.spriteHeight = 250;
            this.width = this.spriteWidth;
            this.height = this.spriteHeight;
            this.spriteX = this.collisionX - this.width * 0.5;
            this.spriteY = this.collisionY - this.height * 0.5 - 70;
        };
        draw(context){
            context.drawImage(this.image, 0, 0, this.spriteWidth, this.spriteHeight, this.spriteX, this.spriteY, this.width, this.height);
            context.beginPath();
            context.arc(this.collisionX,this.collisionY,this.collisionRadius,0,Math.PI * 2);
            context.save(); //save and restore methods allow us to apply specific drawing settings to selected shapes without affecting others (wrap).
            context.globalAlpha = 0.5;
            context.fill();
            context.restore();
            context.stroke();
        };
    };
    
    class Game {
        constructor(canvas){
            this.canvas = canvas;
            this.width = this.canvas.width; //takes reference to canvas element and sets height and width of the game to match canvas element.
            this.height = this.canvas.height; //
            this.player = new Player(this); //this auto creates player when creating an instance of game.
            this.obstacles = [];
            this.numberOfObstacles = 5;
            this.mouse = {
                x: this.width * 0.5,
                y: this.height * 0.5,
                pressed: false
            };

            //event listeners
            canvas.addEventListener('mousedown', e => {   //ES6 arrow funcions auto inherit 'this' ref. from parent scope.
                this.mouse.x = e.offsetX;
                this.mouse.y = e.offsetY;
                this.mouse.pressed = true;
            });
            canvas.addEventListener('mouseup', e => {   //ES6 arrow funcions auto inherit 'this' ref. from parent scope.
                this.mouse.x = e.offsetX;
                this.mouse.y = e.offsetY;
                this.mouse.pressed = false;
            });
            canvas.addEventListener('mousemove', e => {   //ES6 arrow funcions auto inherit 'this' ref. from parent scope.
                if (this.mouse.pressed){
                    this.mouse.x = e.offsetX;
                    this.mouse.y = e.offsetY;
                }
            });
        };
        render(context){  //draws and update all objects in the game.
            this.player.draw(context);
            this.player.update();
            this.obstacles.forEach(obstacle => obstacle.draw(context));
        };
        init(){
            let attempts = 0;
            while (this.obstacles.length < this.numberOfObstacles && attempts < 500){
                let testObstacle = new Obstacle(this);
                let overlap = false;
                this.obstacles.forEach(obstacle => {    //circle collision detection.
                    const dx = testObstacle.collisionX - obstacle.collisionX;
                    const dy = testObstacle.collisionY - obstacle.collisionY;
                    const distance = Math.hypot(dy, dx);
                    const sumOfRadii = testObstacle.collisionRadius + obstacle.collisionRadius;
                    if (distance < sumOfRadii){
                        overlap = true;
                    };
                });
                if (!overlap){
                    this.obstacles.push(testObstacle);
                };
                attempts++;
            };
        };

    };

    const game = new Game(canvas);
    game.init();
    console.log(game);

    //To draw and update game over and over to create illusion of movement. 
    function animate(){
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        game.render(ctx);
        requestAnimationFrame(animate);
    };
    animate();

});








//TODO: split classes into modules by using individual files and importing/exporting as needed. Note this requires server to run can't run straight from browser.