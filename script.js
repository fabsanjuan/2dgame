window.addEventListener('load', function(){
    const canvas = document.getElementById('canvas1');
    const ctx = canvas.getContext('2d');
    canvas.width = 1280;
    canvas.height = 720;

    //Optimization: Frequent changes to canvas state affects performance. Define canvas properties in code block running as little as possible.
    ctx.fillStyle = 'white';
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'black';
    ctx.font = '40px Bangers';
    ctx.textAlign = 'center';

    //object oriented to make game modular. Player and game class to manage game logic.
    class Player {
        constructor(game){
            this.game = game; //This gives the player access to the entire game class (prooperties and methods).
            this.collisionX = this.game.width * 0.5;
            this.collisionY = this.game.height * 0.5;
            this.collisionRadius = 40;
            this.speedX = 0;
            this.speedY = 0;
            this.dx = 0;
            this.dy = 0;
            this.speedModifier = 4;
            this.spriteWidth = 255;
            this.spriteHeight = 256;
            this.width = this.spriteWidth;
            this.height = this.spriteHeight;
            this.spriteX;
            this.spriteY;
            this.frameX = 0;
            this.frameY = 5;
            this.image = document.getElementById('bull');

        };
        restart(){
            this.collisionX = this.game.width * 0.5;
            this.collisionY = this.game.height * 0.5;
            this.spriteX = this.collisionX - this.width * 0.5;
            this.spriteY = this.collisionY - this.height * 0.5 - 100;
        };

        draw(context){  //draws and animates the player. Expects arg to specify which canvas to draw on.
            context.drawImage(this.image, this.frameX * this.spriteWidth, this.frameY * this.spriteHeight, this.spriteWidth, this.spriteHeight, this.spriteX, this.spriteY, this.width, this.height);
            //Debugging code to view hit box and player movement path. 
            if (this.game.debug){
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
                this.speedX = this.dx/distance || 0; //TODO:Logical OR operator????
                this.speedY = this.dy/distance || 0;
            } else {
                this.speedX = 0;
                this.speedY = 0;
            }
            this.collisionX += this.speedX * this.speedModifier;
            this.collisionY += this.speedY * this.speedModifier;
            this.spriteX = this.collisionX - this.width * 0.5;
            this.spriteY = this.collisionY - this.height * 0.5 - 100;
            //horizontal boundaries for player sprite.
            if (this.collisionX < this.collisionRadius){this.collisionX = this.collisionRadius}
            else if (this.collisionX > this.game.width - this.collisionRadius){this.collisionX = this.game.width - this.collisionRadius};
            //vertical boundaries for player sprite.
            if (this.collisionY < this.game.topMargin + this.collisionRadius){this.collisionY = this.game.topMargin + this.collisionRadius}
            else if (this.collisionY > this.game.height - this.collisionRadius){this.collisionY = this.game.height - this.collisionRadius};

            //collisions with obstacles
            this.game.obstacles.forEach(obstacle => {
                let [collision, distance, sumOfRadii, dx, dy] = this.game.checkCollision(this, obstacle); //JavaScript destructuring.
                if (collision){ //Technique to push player circle away from obstacle circle, simple physics sim.
                    const unit_x = dx / distance;
                    const unit_y = dy / distance;
                    this.collisionX = obstacle.collisionX + (sumOfRadii + 1) * unit_x;
                    this.collisionY = obstacle.collisionY + (sumOfRadii + 1) * unit_y;
                };
            });
        };

    };
    //create obstacles that appear at random locations on the canvas.
    class Obstacle {
        constructor(game){
            this.game = game;
            this.collisionX = Math.random() * this.game.width;
            this.collisionY = Math.random() * this.game.height;
            this.collisionRadius = 40;
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
            if (this.game.debug){
            context.beginPath();
            context.arc(this.collisionX,this.collisionY,this.collisionRadius,0,Math.PI * 2);
            context.save(); //save and restore methods allow us to apply specific drawing settings to selected shapes without affecting others (wrap).
            context.globalAlpha = 0.5;
            context.fill();
            context.restore();
            context.stroke();
            };            
        };
        update(){

        };
    };

    class Egg {
        constructor(game){ //Object for eggs spawning at random locations within game boundaries.
            this.game = game;
            this.collisionRadius = 40;
            this.margin = this.collisionRadius * 2;
            this.collisionX = this.margin + (Math.random() * (this.game.width - this.margin * 2));
            this.collisionY = this.game.topMargin + (Math.random() * (this.game.height - this.game.topMargin - this.margin));
            this.image = document.getElementById('egg');
            this.spriteWidth = 110;
            this.spriteHeight = 135;
            this.width = this.spriteWidth;
            this.height = this.spriteHeight;
            this.spriteX;
            this.spriteY;
            this.hatchTimer = 0;
            this.hatchInterval = 9000;
            this.markedForDeletion = false;
        };
        draw(context){
            context.drawImage(this.image, this.spriteX, this.spriteY);
            if (this.game.debug){
                context.beginPath();
                context.arc(this.collisionX,this.collisionY,this.collisionRadius,0,Math.PI * 2);
                context.save(); //save and restore methods allow us to apply specific drawing settings to selected shapes without affecting others (wrap).
                context.globalAlpha = 0.5;
                context.fill();
                context.restore();
                context.stroke();
                const displayTimer = (this.hatchTimer * 0.001).toFixed(0);
                context.fillText(displayTimer, this.collisionX, this.collisionY - this.collisionRadius * 2.5);
                };
        };
        update(deltaTime){
            this.spriteX = this.collisionX - this.width * 0.5;
            this.spriteY = this.collisionY - this.height * 0.5 - 30;
            //handles collisions
            let collisionObjects = [this.game.player, ...this.game.obstacles, ...this.game.enemies]; //spread operator ... 
            collisionObjects.forEach( object => {
                let [collision, distance, sumOfRadii, dx, dy] = this.game.checkCollision(this, object);
                if (collision){
                    const unit_x = dx / distance;
                    const unit_y = dy / distance;
                    this.collisionX = object.collisionX + (sumOfRadii + 1) * unit_x;
                    this.collisionY = object.collisionY + (sumOfRadii + 1) * unit_y;
                };
            });
            //handles hatching
            if (this.hatchTimer > this.hatchInterval || this.collisionY < this.game.topMargin){
                this.game.hatchlings.push(new Larva(this.game, this.collisionX, this.collisionY));
                this.markedForDeletion = true;
                this.game.removeGameObjects();
            } else {
                this.hatchTimer += deltaTime;
            };
        };
    };

    class Larva {
        constructor(game, x, y){
            this.game = game;
            this.collisionX = x;
            this.collisionY = y;
            this.collisionRadius = 30;
            this.image = document.getElementById('larva');
            this.spriteWidth = 150;
            this.spriteHeight = 150;
            this.width = this.spriteWidth;
            this.height = this.spriteHeight;
            this.spriteX;
            this.spriteY;
            this.speedY = 1 + Math.random();
            this.frameX = 0;
            this.frameY = Math.floor(Math.random() * 2);

        };
        draw(context){
            context.drawImage(this.image, this.frameX * this.spriteWidth, this.frameY * this.spriteHeight, this.spriteWidth, this.spriteHeight, this.spriteX, this.spriteY, this.width, this.height);
            if (this.game.debug){
                context.beginPath();
                context.arc(this.collisionX,this.collisionY,this.collisionRadius,0,Math.PI * 2);
                context.save(); //save and restore methods allow us to apply specific drawing settings to selected shapes without affecting others (wrap).
                context.globalAlpha = 0.5;
                context.fill();
                context.restore();
                context.stroke();
                };
        };
        update(){
            this.collisionY -= this.speedY;
            this.spriteX = this.collisionX - this.width * 0.5;
            this.spriteY = this.collisionY - this.height * 0.5 - 40;
            //larva beyond safety boundary
            if (this.collisionY < this.game.topMargin - this.collisionRadius * 2.5){
                this.markedForDeletion = true;
                this.game.removeGameObjects();
                if (!this.game.gameOver) {
                    this.game.score++;
                    for (let i = 0; i < 4; i++){
                        this.game.particles.push(new Firefly(this.game, this.collisionX, this.collisionY, 'yellow'));
                };
                };
            };
            //collisions with objects
            let collisionObjects = [this.game.player, ...this.game.obstacles, ...this.game.eggs]; //spread operator ... 
            collisionObjects.forEach( object => {
                let [collision, distance, sumOfRadii, dx, dy] = this.game.checkCollision(this, object);
                if (collision){
                    const unit_x = dx / distance;
                    const unit_y = dy / distance;
                    this.collisionX = object.collisionX + (sumOfRadii + 1) * unit_x;
                    this.collisionY = object.collisionY + (sumOfRadii + 1) * unit_y;
                };
            });
            //collision with enemies
            this.game.enemies.forEach(enemy => {
                if (this.game.checkCollision(this, enemy)[0]){
                    this.markedForDeletion = true;
                    this.game.removeGameObjects();
                    for (let i = 0; i < 5; i++){
                        this.game.particles.push(new Spark(this.game, this.collisionX, this.collisionY, 'red'));
                    };
                    if (!this.game.gameOver){
                        this.game.lostHatchlings++;
                    };
                };
            });
        };
    };

    class Enemy {
        constructor(game){
            this.game = game;
            this.collisionRadius = 40;
            this.speedX = Math.random() * 3 + 0.5;
            this.image = document.getElementById('toads');
            this.spriteWidth = 140;
            this.spriteHeight = 260;
            this.width = this.spriteWidth;
            this.height = this.spriteHeight;
            this.collisionX = this.game.width + Math.random() * this.game.width * 0.5;
            this.collisionY = this.game.topMargin + (Math.random() * (this.game.height - this.game.topMargin));
            this.spriteX;
            this.spriteY;
            this.frameX = 0;
            this.frameY = Math.floor(Math.random() * 4);
        };
        draw(context){
            context.drawImage(this.image, this.frameX, this.frameY * this.spriteHeight, this.spriteWidth, this.spriteHeight, this.spriteX, this.spriteY, this.width, this.height);
            if (this.game.debug){
                context.beginPath();
                context.arc(this.collisionX,this.collisionY,this.collisionRadius,0,Math.PI * 2);
                context.save(); //save and restore methods allow us to apply specific drawing settings to selected shapes without affecting others (wrap).
                context.globalAlpha = 0.5;
                context.fill();
                context.restore();
                context.stroke();
                };
        };
        update(){
            this.spriteX = this.collisionX - this.width * 0.5 + 10;
            this.spriteY = this.collisionY - this.height * 0.5 - 50;
            this.collisionX -= this.speedX;
            if (this.spriteX + this.width < 0 && !this.game.gameOver){ //reuse objects when they go off screen instead of destory and create new ones.
                this.collisionX = this.game.width + Math.random() * this.game.width * 0.5;
                this.collisionY = this.game.topMargin + (Math.random() * (this.game.height - this.game.topMargin));
                this.frameY = Math.floor(Math.random() * 4);
            };
            let collisionObjects = [this.game.player, ...this.game.obstacles]; //spread operator ... 
            collisionObjects.forEach( object => {
                let [collision, distance, sumOfRadii, dx, dy] = this.game.checkCollision(this, object);
                if (collision){
                    const unit_x = dx / distance;
                    const unit_y = dy / distance;
                    this.collisionX = object.collisionX + (sumOfRadii + 1) * unit_x;
                    this.collisionY = object.collisionY + (sumOfRadii + 1) * unit_y;
                }
            });
        };
    };
    //Use subclasses for all particle effects.
    class Particle {
        constructor(game, x, y, color){
            this.game = game;
            this.collisionX = x;
            this.collisionY = y;
            this.color = color;
            this.radius = Math.floor(Math.random() * 10 + 5); //One way to optimize is to use object pooling instead.
            this.speedX = Math.random() * 6 - 3;
            this.speedY = Math.random() * 2 + 0.5;
            this.angle = 0;
            this.va = Math.random() * 0.1 + 0.01;
            this.markedForDeletion = false;
        };
        draw(context){
            context.save();
            context.fillStyle = this.color;
            context.beginPath();
            context.arc(this.collisionX, this.collisionY, this.radius, 0, Math.PI * 2);
            context.fill();
            context.stroke();
            context.restore();
        };

    };

    class Firefly extends Particle {
        update(){ //describes the motion of the fireflies
            this.angle += this.va;
            this.collisionX += Math.cos(this.angle) * this.speedX;
            this.collisionY -= this.speedY;
            if (this.collisionY < 0 - this.radius){
                this.markedForDeletion = true;
                this.game.removeGameObjects();
            };
        };
    };

    class Spark extends Particle {
        update(){ // describes the motion of the sparks. 
            this.angle += this.va * 0.5;
            this.collisionX -= Math.sin(this.angle) * this.speedX;
            this.collisionY -= Math.cos(this.angle) * this.speedY;
            if (this.radius > 0.1) this.radius -= 0.05;
            if (this.radius < 0.2){
                this.markedForDeletion = true;
                this.game.removeGameObjects();
            };
        };
    };
    
    class Game {
        constructor(canvas){
            this.canvas = canvas;
            this.width = this.canvas.width; //takes reference to canvas element and sets height and width of the game to match canvas element.
            this.height = this.canvas.height;
            this.topMargin = 260;
            this.debug = false;
            this.player = new Player(this); //this auto creates player when creating an instance of game.
            this.fps = 70;
            this.timer = 0;
            this.interval = 1000/this.fps;
            this.eggTimer = 0;
            this.eggInterval = 1000;
            this.eggs = [];
            this.maxEggs = 10;
            this.obstacles = [];
            this.numberOfObstacles = 3;
            this.enemies = [];
            this.hatchlings = [];
            this.particles = [];
            this.gameObjects = [];
            this.score = 0;
            this.winningScore = 10;
            this.lives = 5;
            this.gameOver = false;
            this.reset = false;
            this.lostHatchlings = 0;
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
            window.addEventListener('keydown', e => {
                if (e.key == 'd'){
                    this.debug = !this.debug
                } else if (e.key == 'r'){
                    this.restart()
                };
            });
        };
        render(context, deltaTime){  //draws and update all objects in the game.
            if (this.timer > this.interval){
                ctx.clearRect(0, 0, this.width, this.height);
                this.gameObjects = [this.player, ...this.eggs, ...this.obstacles, ...this.enemies, ...this.hatchlings, ...this.particles];
                this.gameObjects.sort((a, b) => { //sorts drawn objects by vertial position. Objects in canvas are layered in order they are drawn.
                    return a.collisionY - b.collisionY;
                });
                this.gameObjects.forEach(object => {
                    object.draw(context);
                    object.update(deltaTime);
                });
                this.timer = 0;
            };
            this.timer += deltaTime;

            //periodically add eggs.
            if (this.eggTimer > this.eggInterval && this.eggs.length < this.maxEggs && !this.gameOver){
                this.addEgg();
                this.eggTimer = 0;
            } else {
                this.eggTimer += deltaTime;
            };

            //display game score and timer
            let livesLeft = this.lives - this.lostHatchlings;
            let gameSec = Math.floor((lastTime / 1000));
            let startTime = 150;
            let elapsedTime = startTime - gameSec;
            let displayMin = Math.floor(elapsedTime / 60);
            let displaySec = elapsedTime % 60;
            let twoDigits = (displaySec < 10 ? "0" : "");

            
            context.save();
            if(elapsedTime > 0 & livesLeft > 0){
                context.textAlign = 'left';
                context.fillText('Score ' + this.score, 25, 50);
                context.fillText('Lives ' + livesLeft, 25, 100); 
                context.fillText('Time ' + displayMin + " : " + twoDigits + displaySec, 1050, 50);
            }
            context.restore();

            //Win/lose message
            if (livesLeft <= 0 || elapsedTime <= 0){
                this.gameOver = true;
                context.save();
                context.fillStyle = 'rgba(0,0,0,0.5)';
                context.fillRect(0, 0, this.width, this.height);
                context.fillStyle = 'white';
                context.textAlign = 'center';
                context.shadowOffsetX = 4;
                context.shadowOffsetY = 4;
                context.shadowColor = 'black';
                let message1;
                let message2;
                if (elapsedTime <=0){
                    message1 = "Bullseye";
                    message2 = "You bullied the bullies";
                } else {
                    message1 = 'Oops';
                    message2 = 'You lost, try again?';
                };
                context.font = '130px Bangers'; //Fonts can be selected from Google fonts to change the style.
                context.fillText(message1, this.width * 0.5, this.height * 0.5 - 30);
                context.font = '40px Bangers';
                context.fillText(message2, this.width * 0.5, this.height * 0.5 + 60);
                context.fillText('Final Score ' + (this.score) + '. Press "F5" to try again', this.width * 0.5, this.height * 0.5 + 120); //TODO: add a new line after the score
                context.restore();
            };
        };
        checkCollision(a, b){ //Check the distance between 2 spheres and see if radii overlap.
            const dx = a.collisionX - b.collisionX;
            const dy = a.collisionY - b.collisionY;
            const distance = Math.hypot(dy, dx);
            const sumOfRadii = a.collisionRadius + b.collisionRadius;
            return [(distance < sumOfRadii), distance, sumOfRadii, dx, dy]; //returns useful information about collision physics between objects.    
        };
        addEgg(){
            this.eggs.push(new Egg(this));
        };
        addEnemy(){
            this.enemies.push(new Enemy(this));
        };
        removeGameObjects(){
            this.eggs = this.eggs.filter(object => !object.markedForDeletion);  //create new array with eggs marked for del filtered out.
            this.hatchlings = this.hatchlings.filter(object => !object.markedForDeletion);
            this.particles = this.particles.filter(object => !object.markedForDeletion);
        };
        restart(){
            this.player.restart();
            this.obstacles = [];
            this.eggs = [];
            this.enemies = [];
            this.hatchlings = [];
            this.particles = [];
            this.mouse = {
                x: this.width * 0.5,
                y: this.height * 0.5,
                pressed: false
            };
            this.score = 0;
            this.lostHatchlings = 0;
            this.gameOver = false;
            this.init();
        };
        init(){
            for (let i=0; i < 3; i++){
                this.addEnemy();
            };
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
                const margin =  testObstacle.collisionRadius * 3; //Adds margins to the edges of the game field for player navigation
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

    //To draw and update game over and over. 
    let lastTime = 0;
    function animate(timeStamp){
        let deltaTime = timeStamp - lastTime;
        lastTime = timeStamp;
        game.render(ctx, deltaTime);
        requestAnimationFrame(animate);
        //console.log(lastTime, timeStamp, deltaTime, game.reset);
    };
    animate(0);

});



//TODO: split classes into modules by using individual files and importing/exporting as needed. Note this requires server to run can't run straight from browser.