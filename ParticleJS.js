const Particles = {
	// Initialization method for the particle system
	init: (props) => {
		// Variables object to store properties and canvas context
		const Variables = {};
		// Selector targeting the canvas element
		const tempCnvses = document.querySelectorAll(props.selector);

		// Select the last canvas element from the list
		Variables.cv = tempCnvses[tempCnvses.length - 1];
		Variables.ct = Variables.cv.getContext("2d");

		// Assign properties to Variables object or give default values
		Variables.maxP = props.maxParticles || 200;
		Variables.minD = props.minDistance || 120;
		Variables.color = props.color || "#000";
		Variables.speed = props.speed || 0.5;
		Variables.sizeV = props.sizeVariation || 5;
		Variables.connectP = props.connectParticles || true;
		Variables.opacity = props.opacity || 0.7;
		Variables.background = props.background || "white";
		Variables.fullScreen = props.fullScreen || false;
		Variables.screenSize = props.screenSize || (Variables.fullScreen ? null : {width: 200, height: 200});
		Variables.mouseCollide = props.mouseCollide || false;
		Variables.mouseCollideRange = props.mouseCollideRange || 100;
		Variables.image = props.image || false;
		Variables.shape = props.shape || false;
		Variables.ops = [];

		// Generate random opacity values if opacity is set to "random"
		if(Variables.opacity == "random")
			Variables.ops = Particles.randomOpacitygen(Variables.maxP);

		// Create particles with given values
		Particles.create(Variables);
	},

	// Method to create particles with given positions
	create: (Variables) => {
		Particles.adjustCanvas(Variables);

		// Arrays to store particle properties
		let PosList = [], DirList = [], SizeList = [];

		// Initialize particle properties based on the value of maxP
		for (var i = 0; i < Variables.maxP; i++) {
			PosList.push(Particles.randomPosGen(Variables.cv))
			DirList.push(Particles.randomDirGen())
			SizeList.push(Particles.randomSizeGen(2, Variables.sizeV))
		}

		// Load image if specified
		if(Variables.image)	{
			Variables.imageDraw = new Image();
			Variables.imageDraw.src = Variables.image.src;
		}

		// Update particles' positions at regular intervals
		setInterval(Particles.update, 20, Variables, PosList, DirList, SizeList);
	},

	// Method to update particles positions
	update: (Variables, PosList, DirList, SizeList) => {
		// Adjust canvas size and background
		Particles.adjustCanvas(Variables);

		// Update positions and handle collisions
		for (var i = 0; i < PosList.length; i++) {
			// Update particle position based on its direction and speed
			PosList[i].x += Variables.speed * DirList[i].x;
			PosList[i].y += Variables.speed * DirList[i].y;

			// Handle collisions based on particle shape or image
			if(Variables.shape)
				[PosList[i], DirList[i]] = 
					Particles.collide(PosList, DirList, Variables.shape.length, Variables.shape.length, 
						Variables.cv.width - Variables.shape.length, Variables.cv.height - Variables.shape.length/2, i)
			else if(Variables.image)
				[PosList[i], DirList[i]] =
					Particles.collide(PosList, DirList, Variables.image.sizeX/2, Variables.image.sizeY/2, 
						Variables.cv.width - Variables.image.sizeX/2, Variables.cv.height - Variables.image.sizeY/2, i);
			else
				[PosList[i], DirList[i]] =
					Particles.collide(PosList, DirList, SizeList[i], SizeList[i], 
						Variables.cv.width - SizeList[i], Variables.cv.height - SizeList[i], i)
		}

		// Handle mouse collision if enabled
		Variables.cv.onmousemove = (e) => {
			if(Variables.mouseCollide) {
				// Iterate through particles and adjust position if colliding with the mouse
				for (var i = 0; i < PosList.length; i++) {
					if(Particles.distance(PosList[i].x, PosList[i].y, e.x, e.y) < Variables.mouseCollideRange) {
						while(Particles.distance(PosList[i].x, PosList[i].y, e.x, e.y) < Variables.mouseCollideRange) {
							// Move particle away from mouse until collision is resolved
							if(PosList[i].x > 0 && PosList[i].y > 0 && PosList[i].x < Variables.cv.width && PosList[i].y < Variables.cv.height) {
								PosList[i].x += DirList[i].x;
								PosList[i].y += DirList[i].y;
							} else {
								// Change particle direction upon hitting canvas edges
								DirList[i] = Particles.randomDirGen()
								break;
							}
						}
					}
				}
			}
		};

		// Draw lines and particles
		Particles.drawLines(Variables, PosList);
		Particles.draw(Variables, PosList, SizeList);
	},

	// Method to handle collisions with canvas edges or shapes
	collide: (PosList, DirList, x1, y1, x2, y2, i) => {
		if(PosList[i].x < x1) {
			PosList[i].x = x1;
			DirList[i].x *= -1;
		}
		if(PosList[i].y < y1) {
			PosList[i].y = y1;
			DirList[i].y *= -1;
		}
		if(PosList[i].x > x2) {
			PosList[i].x = x2;
			DirList[i].x *= -1;
		}
		if(PosList[i].y > y2) {
			PosList[i].y = y2;
			DirList[i].y *= -1;
		}

		return [PosList[i], DirList[i]];
	},

	// Method to draw particles and shapes
	draw: (Variables, PosList, SizeList) => {
		// Set particle color and draw particles or shapes
		if(Variables.opacity != "random")
			Variables.ct.fillStyle = Variables.color.replace("b", "ba").replace(")", "," + Variables.opacity + ")");
		for(let i = 0; i < Variables.maxP; i++) {
			if(Variables.opacity == "random")
				Variables.ct.fillStyle = Variables.color.replace("b", "ba").replace(")", "," + Variables.ops[i] + ")");
			
			// Draw particles or specified shapes
			if(Variables.image)
				Particles.drawImage(Variables, PosList, i);
			else
				Particles.drawShapes(Variables, PosList, SizeList, i);
		}
	},

	// Method to draw connecting lines between particles
	drawLines : (Variables, PosList) => {
		// Draw lines between particles if connectParticles is enabled
		if(Variables.connectP) {
			for(pos of PosList) {
				for(pos2 of PosList) {
					if(Particles.distance(pos.x, pos.y, pos2.x, pos2.y) < Variables.minD) {
						let opacity = 1 - Particles.distance(pos.x, pos.y, pos2.x, pos2.y) / Variables.minD;
						opacity = Math.round((opacity + Number.EPSILON) * 100) / 100;
						Variables.ct.strokeStyle = Variables.color.replace("b", "ba").replace(")", "," + opacity + ")");
						Variables.ct.beginPath();
						Variables.ct.moveTo(pos.x, pos.y);
						Variables.ct.lineTo(pos2.x, pos2.y);
						Variables.ct.stroke();
					}
				}
			}

		}
	},

	// Method to draw images as particles
	drawImage: (Variables, PosList, i) => {
		// Draw images at specified positions
		Variables.ct.drawImage(Variables.imageDraw, 
			PosList[i].x - Variables.image.sizeX/2, 
			PosList[i].y - Variables.image.sizeY/2, 
			Variables.image.sizeX, 
			Variables.image.sizeY);
	},

	// Method to draw specified shapes as particles
	drawShapes: (Variables, PosList, SizeList, i) => {
		// check specified shapes and draw (hexagons, pentagons, circles, etc.)
		if(Variables.shape.name == "6-stars") {
			Variables.ct.beginPath();
			let h = Variables.shape.length / 2 || 10;
			Variables.ct.moveTo( PosList[i].x         , PosList[i].y - 2 * h );
			Variables.ct.lineTo( PosList[i].x + 2*h/3 , PosList[i].y - h     );
			Variables.ct.lineTo( PosList[i].x + 2*h   , PosList[i].y - h     );
			Variables.ct.lineTo( PosList[i].x + 4*h/3 , PosList[i].y         );
			Variables.ct.lineTo( PosList[i].x + 2*h   , PosList[i].y + h     );
			Variables.ct.lineTo( PosList[i].x + 2*h/3 , PosList[i].y + h     );
			Variables.ct.lineTo( PosList[i].x         , PosList[i].y + 2*h   );
			Variables.ct.lineTo( PosList[i].x - 2*h/3 , PosList[i].y + h     );
			Variables.ct.lineTo( PosList[i].x - 2*h   , PosList[i].y + h     );
			Variables.ct.lineTo( PosList[i].x - 4*h/3 , PosList[i].y         );
			Variables.ct.lineTo( PosList[i].x - 2*h   , PosList[i].y - h     );
			Variables.ct.lineTo( PosList[i].x - 2*h/3 , PosList[i].y - h     );
			Variables.ct.closePath();
			Variables.ct.fill()
		} else if(Variables.shape.name == "5-stars") {
			Variables.ct.beginPath();
			let l = Variables.shape.length || 20;
			let s = l / Math.sqrt(3);
			Variables.ct.moveTo(PosList[i].x           , PosList[i].y - l);
			Variables.ct.lineTo(PosList[i].x + l - s   , PosList[i].y - l/2);
			Variables.ct.lineTo(PosList[i].x + l       , PosList[i].y - l/3);
			Variables.ct.lineTo(PosList[i].x + l - s/2 , PosList[i].y + l/4);
			Variables.ct.lineTo(PosList[i].x + 2*l/3   , PosList[i].y + 4*l/5);
			Variables.ct.lineTo(PosList[i].x           , PosList[i].y + l/2);
			Variables.ct.lineTo(PosList[i].x - 2*l/3   , PosList[i].y + 4*l/5);
			Variables.ct.lineTo(PosList[i].x -l + s/2  , PosList[i].y + l/4);
			Variables.ct.lineTo(PosList[i].x - l       , PosList[i].y - l/3);
			Variables.ct.lineTo(PosList[i].x - l + s   , PosList[i].y - l/2);
			Variables.ct.closePath();
			Variables.ct.fill();
		} else if(Variables.shape.name == "hexagons") {
			Variables.ct.beginPath();
			let r = 2 * Variables.shape.length / Math.sqrt(3) || 20 / Math.sqrt(3);
			Variables.ct.moveTo(PosList[i].x - r   , PosList[i].y);
			Variables.ct.lineTo(PosList[i].x - r/2 , PosList[i].y - r);
			Variables.ct.lineTo(PosList[i].x + r/2 , PosList[i].y - r);
			Variables.ct.lineTo(PosList[i].x + r   , PosList[i].y);
			Variables.ct.lineTo(PosList[i].x + r/2 , PosList[i].y + r);
			Variables.ct.lineTo(PosList[i].x - r/2 , PosList[i].y + r);
			Variables.ct.closePath();
			Variables.ct.fill();
		} else if(Variables.shape.name == "pentagons") {
			Variables.ct.beginPath();
			let l = Variables.shape.length || 20;
			Variables.ct.moveTo(PosList[i].x                    , PosList[i].y - l);
			Variables.ct.lineTo(PosList[i].x + l*Math.sqrt(3)/2 , PosList[i].y - l/2);
			Variables.ct.lineTo(PosList[i].x + l/2              , PosList[i].y + l/2);
			Variables.ct.lineTo(PosList[i].x - l/2              , PosList[i].y + l/2);
			Variables.ct.lineTo(PosList[i].x - l*Math.sqrt(3)/2 , PosList[i].y - l/2);
			Variables.ct.closePath();
			Variables.ct.fill();
		} else if(Variables.shape.name == "circles") {
			Variables.ct.beginPath();
			Variables.ct.arc(PosList[i].x, PosList[i].y, Variables.shape.length || 20, 0, 2*Math.PI, true);
			Variables.ct.fill();
		} else if(Variables.shape.name == "unknown") {
			Variables.ct.beginPath();
			let sr = 2 * Variables.shape.length / 3 || 60 / 3;
			let ps = 2 * sr/2 * 0.5877852523;
			let s = Math.sqrt(4 * sr*sr + ps*ps) / 2;
			let h = Math.sqrt(sr*sr / 2 - ps*ps) / 2;
			Variables.ct.moveTo(PosList[i].x              , PosList[i].y - 3*sr/2);
			Variables.ct.lineTo(PosList[i].x - sr/3       , PosList[i].y - sr/2);
			Variables.ct.lineTo(PosList[i].x - sr/3 + s   , PosList[i].y + sr/2);
			Variables.ct.lineTo(PosList[i].x - s + sr/6   , PosList[i].y - sr/2 + h);
			Variables.ct.lineTo(PosList[i].x - s/2 + sr/6 , PosList[i].y - sr/2 + 2*h);
			Variables.ct.lineTo(PosList[i].x              , PosList[i].y - 3*sr/2 + 2*h);
			Variables.ct.lineTo(PosList[i].x + s/2 - sr/6 , PosList[i].y - sr/2 + 2*h);
			Variables.ct.lineTo(PosList[i].x + s - sr/6   , PosList[i].y - sr/2 + h);
			Variables.ct.lineTo(PosList[i].x + sr/3 - s   , PosList[i].y + sr/2);
			Variables.ct.lineTo(PosList[i].x + sr/3       , PosList[i].y - sr/2);
			Variables.ct.closePath();
			Variables.ct.fill();
		} else if(Variables.shape.name == "unknown2") {
			Variables.ct.beginPath();
			let l = Variables.shape.length || 20;
			let s = l / Math.sqrt(3);
			Variables.ct.moveTo(PosList[i].x           , PosList[i].y - l);
			Variables.ct.lineTo(PosList[i].x + l - s   , PosList[i].y - l + s);
			Variables.ct.lineTo(PosList[i].x + l       , PosList[i].y - l + s);
			Variables.ct.lineTo(PosList[i].x + l - s/2 , PosList[i].y + l - s);
			Variables.ct.lineTo(PosList[i].x + l       , PosList[i].y - l);
			Variables.ct.lineTo(PosList[i].x           , PosList[i].y - l/2);
			Variables.ct.lineTo(PosList[i].x - l       , PosList[i].y - l);
			Variables.ct.lineTo(PosList[i].x -l + s/2  , PosList[i].y + l - s);
			Variables.ct.lineTo(PosList[i].x - l       , PosList[i].y - l + s);
			Variables.ct.lineTo(PosList[i].x - l + s   , PosList[i].y - l + s);
			Variables.ct.closePath();
			Variables.ct.fill();
		} else {
			Variables.ct.beginPath();
			Variables.ct.arc(PosList[i].x, PosList[i].y, SizeList[i], 0, 2*Math.PI, true);
			Variables.ct.fill();
		}
	},

	// Method to adjust canvas size and background
	adjustCanvas: (Variables) => {
		// Set canvas size based on fullScreen or screenSize properties
		if(Variables.fullScreen){
			Variables.cv.width = window.innerWidth;
			Variables.cv.height = window.innerHeight;
		}
		if(Variables.screenSize != null){
			Variables.cv.width = Variables.screenSize.width;
			Variables.cv.height = Variables.screenSize.height;
		}

        // Fill canvas with specified background color
		Variables.ct.fillStyle = Variables.background;
		Variables.ct.fillRect(0,0, Variables.cv.width, Variables.cv.height);
	},

	 // Method to generate random particle positions
	randomPosGen: (cv) => {
		// Generate random positions within canvas boundaries
		return {x: Math.floor(Math.random() * cv.width), y: Math.floor(Math.random() * cv.height)};
	},

	// Method to generate random particle directions
	randomDirGen: () => {
		// Generate random directions (-1 or 1) for particles
		return {x: Math.random() > 0.5 ? -1: 1, y: Math.random() > 0.5 ? -1: 1};
	},

	// Method to generate random particle sizes within a range
	randomSizeGen: (minSize, sizeV) => {
		// Generate random sizes based on minSize and sizeV
		return minSize + Math.floor(Math.random() * sizeV);
	},

	// Method to generate random opacity values for particles
	randomOpacitygen: (maxP) => {
		// Generate an array of random opacity values for particles
		ops = [];
		for (var i = 0; i < maxP; i++) 
			ops.push(0.1 + Math.random() * 0.7);
		return ops;
	},

	// Method to calculate distance between two points
	distance: (x1, y1, x2, y2) => {
		// Calculate Euclidean distance between two points
		return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
	}
}
