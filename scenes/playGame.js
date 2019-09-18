class playGame extends Phaser.Scene{
	constructor(){
		super("PlayGame");
	}

	create(){
		//Variables
		this.running = false;
		this.gameOver = false;
		this.speed = 1;
		this.moveable = true;
		this.score = 0;
		

		//Add Background
		var backgorund = this.add.image(0,0,"background").setOrigin(0,0);

		//Add panel for UI elements
		var panel = this.add.image(0,0,"panel").setOrigin(0,0);
		panel.depth = 999;

		//Add fonts
		this.cache.bitmapFont.add("font", Phaser.GameObjects.RetroFont.Parse(this, {
			image: "font",
			width: 5,
			height: 5,
			charsPerRow: 10,
			chars: "1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ ",
			spacing: {x:1, y:1},
			offset: {x:1, y:1},
		}));

		//Create start text
		this.startText = this.add.container(0, 0);
		this.startText.add(this.add.rectangle(95, 85, 70, 25, 0x000000).setOrigin(0,0));
		this.startText.add(this.add.bitmapText(112,90,"font", "RACE 00").setOrigin(0,0));
		this.startText.add(this.add.bitmapText(100,100,"font", "TAP TO START").setOrigin(0,0));
		this.startText.depth = 1000;
		this.startTextAnim = this.tweens.add({
			targets: this.startText,
			alpha: 0,
			duration: 500,
			repeat: -1,
			yoyo: true
		});

		//Create game over text
		this.gameOverText = this.add.container(0, 0);
		this.gameOverText.add(this.add.rectangle(95, 85, 80, 25, 0x000000).setOrigin(0,0));
		this.gameOverText.add(this.add.bitmapText(112,90,"font", "GAME OVER").setOrigin(0,0));
		this.gameOverText.add(this.add.bitmapText(100,100,"font", "TAP TO RESTART").setOrigin(0,0));
		this.gameOverText.depth = 1000;
		this.gameOverText.alpha = 0;
		this.gameOverAnim = this.tweens.add({
			targets: this.gameOverText,
			alpha: 1,
			duration: 500,
			repeat: -1,
			yoyo: true
		}).stop();

		//Environments
		this.roads = this.createRoad();
		this.roadLength = this.roads.length;

		this.trees = this.createTree();
		this.treeLength = this.trees.length;

		//Player
		this.player = this.add.sprite(112, 140, "player").setOrigin(0.5, 0);

		//Enemies
		this.enemies = [];
		this.lastLocation = 0;
		this.createEnemies();

		//User Inputs
		this.input.keyboard.on("keydown", this.handleKey, this);
		this.input.on("pointerdown", this.handleTouch, this);
		this.input.on("pointerdownoutside", this.handleTouch, this);
	}

	handleTouch(e){
		if(!this.running){
			if(this.gameOver){
				this.scene.restart();
			} else {
				this.startTextAnim.stop();
				this.gameOverAnim.stop();
				this.startText.alpha = 0;
				this.gameOverText.alpha = 0;
				this.running = true;
			}
		} else {
			var touchX = e.downX;
			if(touchX < 160){
				this.makeMove("left");
			} else {
				this.makeMove("right");
			}
		}
	}

	handleKey(e){
		if(this.running){
			switch(e.code){
				case "KeyD":
				case "ArrowRight":
					this.makeMove("right");
					break;
				case "KeyA":
				case "ArrowLeft":
					this.makeMove("left");
					break;
			}
		}
	}

	createRoad(){
		var roads = [];
		for(var i=0; i<3; i++){
			var road = this.add.image(61,(i*108)-108,"road").setOrigin(0, 0);
			roads.push(road);
		}

		return roads;
	}

	moveRoad(){
		for(var i=0; i<this.roadLength; i++){
			this.roads[i].y += this.speed;
			if(this.roads[i].y > 190){
				this.roads[i].y = -124;
			}
		}
	}

	createTree(){
		var trees = [];
		for(var i=0; i<5; i++){
			var decide = Math.random();
			var positionH = Math.random()*30;
			if(decide > 0.5){
				positionH += 200;
			}
			var tree = this.add.image(positionH, decide*180, "tree").setOrigin(0,0);
			trees.push(tree);
		}

		return trees;
	}

	moveTree(){
		for(var i=0; i<this.treeLength; i++){
			this.trees[i].y += this.speed;
			if(this.trees[i].y > 200){
				var decide = Math.random();
				var positionH = Math.random()*30;
				if(decide > 0.5){
					positionH += 200;
				}

				this.trees[i].x = positionH;
				this.trees[i].y = decide*-100;
			}
		}
	}

	makeMove(target){
		if(this.moveable){
			this.moveable = false;
			let curX = this.player.x;
			let targetX = curX;

			if(target == "right"){
				if(curX < 180){
					targetX = curX+34;
				}
			}
			if(target == "left"){
				if(curX > 78){
					targetX = curX-34;
				}
			}

			this.tweens.add({
				targets: [this.player],
				x: targetX,
				duration:100,
				callbackScope: this,
				onComplete: function(){
					this.moveable = true;
				}
			});
		}
	}

	checkEnemyOverlap(locationX, locationY, enemies){
		for(var i=0; i<enemies.length; i++){
			if(locationX == enemies[i].x){
				if(locationY < enemies[i].y+40 && locationY > enemies[i].y-40){
					return true;
				}
			}
		}

		return false;
	}

	locateEnemy(){
		var targetLocation;
		var locationX;
		var locationY;
		var skin;

		switch(this.lastLocation){
			case 0:
				this.lastLocation = 1;
				locationX = 112;
				skin = "enemy2";
				break;
			case 1:
				this.lastLocation = 2;
				locationX = 146;
				skin = "enemy";
				break;
			case 2:
				this.lastLocation = 3;
				locationX = 180;
				skin = "enemy";
				break;
			case 3:
				this.lastLocation = 0;
				locationX = 78;
				skin = "enemy2";
				break;
		}

		locationY = (Math.random()*200) - 220;

		while(this.checkEnemyOverlap(locationX, locationY, this.enemies)){
			locationY = (Math.random() * 200) - 220;
		}

		return [locationX, locationY, skin];
	}

	createEnemies(){
		for(var i=0; i<8; i++){
			var enemyInfo = this.locateEnemy();
			this.enemies.push(this.add.sprite(enemyInfo[0], enemyInfo[1], enemyInfo[2]).setOrigin(0.5, 0));
		}
	}

	moveEnemies(){
		var speed;
		var length = this.enemies.length;

		for(var i=0; i<length; i++){
			var curEnemy = this.enemies[i];

			switch(curEnemy.x){
				case 78:
					speed = this.speed*1.5;
					break;
				case 112:
					speed = this.speed*1.5;
					break;
				case 146:
					speed = this.speed/1.5;
					break;
				case 180:
					speed = this.speed/1.5;
					break;
				
			}

			curEnemy.y += speed;

			if(curEnemy.y > 200){
				var enemyLocation = this.locateEnemy();

				curEnemy.x = enemyLocation[0];
				curEnemy.y = enemyLocation[1];
				curEnemy.setTexture(enemyLocation[2]);
			}
		}
	}

	checkCollision(){
		for(var i=0; i<this.enemies.length; i++){
			var boundA = this.player.getBounds();
			var boundB = this.enemies[i].getBounds();
			if(Phaser.Geom.Rectangle.Intersection(boundA, boundB).width){
				this.running = false;
				this.gameOver = true;
				this.gameOverAnim.play();
			}
		}
	}

	update(){
		if(this.running){
			this.moveRoad();
			this.moveTree();
			this.moveEnemies();
			this.checkCollision();
		}
	}
}