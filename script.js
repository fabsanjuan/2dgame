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
            this.speedModifier = 4;
            this.spriteWidth = 255;
            this.spriteHeight = 255;
            this.width = this.spriteWidth;
            this.height = this.spriteHeight;
            this.spriteX;
            this.spriteY;
            this.frameX = 0;
            this.frameY = 5;
            this.image = document.getElementById('bull');

        };
        draw(context){  //draws and animates the player. Expects arg to specify which canvas to draw on.
            context.drawImage(this.image, this.frameX * this.spriteWidth, this.frameY * this.spriteHeight, this.spriteWidth, this.spriteHeight, this.spriteX, this.spriteY, this.width, this.height);
            context.beginPath();
            context.arc(this.collisionX, this.collisionY, this.collisionRadius, 0, Math.PI * 2);
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
            this.dx = this.game.mouse.x - this.collisionX; //Horizontal distance between mouse and sprite.
            this.dy = this.game.mouse.y - this.collisionY; //Veritcal distance between mouse and sprite.
            //sprite animation depending on angle between sprite and mouse.
            const angle = Math.atan2(this.dy, this.dx);
            if (angle < -2.74 || angle > 2.74){this.frameY = 6}
            else if (angle < -1.96){this.frameY = 7}
            else if (angle < -1.17){this.frameY = 0}
            else if (angle < -0.39){this.frameY = 1}
            else if (angle < 0.39){this.frameY = 2}
            else if (angle < 1.17){this.frameY = 3}
            else if (angle < 1.96){this.frameY = 4}
            else if (angle < 2.74){this.frameY = 5};

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
            this.spriteX = this.collisionX - this.width * 0.5;
            this.spriteY = this.collisionY - this.height * 0.5 - 100;
            //collisions with obstacles
            this.game.obstacles.forEach(obstacle => {
                let [collision, distance, sumOfRadii, dx, dy] = this.game.checkCollision(this, obstacle); //JavaScript destructuring.
                if (collision){ //Technique to push player circle away from obstacle circle, simple physics sim.
                    const unit_x = dx / distance;
                    const unit_y = dy / distance;
                    this.collisionX = obstacle.collisionX + (sumOfRadii + 1) * unit_x;
                    this.collisionY = obstacle.collisionY + (sumOfRadii + 1) * unit_y;
                }
            });
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
            this.frameX = Math.floor(Math.random() * 4);
            this.frameY = Math.floor(Math.random() * 3);
        };
        draw(context){
            context.drawImage(this.image, this.frameX * this.spriteWidth, this.frameY * this.spriteHeight, this.spriteWidth, this.spriteHeight, this.spriteX, this.spriteY, this.width, this.height);
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
            this.height = this.canvas.height;
            this.topMargin = 260;
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
            this.obstacles.forEach(obstacle => obstacle.draw(context));
            this.player.draw(context);
            this.player.update();
        };
        checkCollision(a, b){ //Check the distance between 2 spheres and see if radii overlap.
            const dx = a.collisionX - b.collisionX;
            const dy = a.collisionY - b.collisionY;
            const distance = Math.hypot(dy, dx);
            const sumOfRadii = a.collisionRadius + b.collisionRadius;
            return [(distance < sumOfRadii), distance, sumOfRadii, dx, dy]; //returns useful information about collision physics between objects.    
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
                    const distanceBuffer = 100; //Adds space between the obstacles for player navigation.
                    const sumOfRadii = testObstacle.collisionRadius + obstacle.collisionRadius + distanceBuffer;
                    if (distance < sumOfRadii){
                        overlap = true;
                    };
                });
                const margin =  testObstacle.collisionRadius * 2; //Adds margins to the edges of the game field for player navigation
                if (!overlap && testObstacle.spriteX > 0 && testObstacle.spriteX < this.width - testObstacle.width && testObstacle.collisionY > this.topMargin + margin && testObstacle.collisionY < this.height - margin){
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