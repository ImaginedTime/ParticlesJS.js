const Particles = {
	init: (props) => {
		const Variables = {};
		const tempCnvses = document.querySelectorAll(props.selector);

		Variables.cv = tempCnvses[tempCnvses.length - 1];
		Variables.ct = Variables.cv.getContext("2d");

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

		if(Variables.opacity == "random")
			Variables.ops = Particles.randomOpacitygen(Variables.maxP);

		Particles.create(Variables);
	},

	create: (Variables) => {
		Particles.adjustCanvas(Variables);

		let PosList = [], DirList = [], SizeList = [];

		for (var i = 0; i < Variables.maxP; i++) 
		{
			PosList.push(Particles.randomPosGen(Variables.cv))
			DirList.push(Particles.randomDirGen())
			SizeList.push(Particles.randomSizeGen(2, Variables.sizeV))
		}

		if(Variables.image)
		{
			Variables.imageDraw = new Image();
			Variables.imageDraw.src = Variables.image.src;
		}
		setInterval(Particles.update, 20, Variables, PosList, DirList, SizeList);
	},

	update: (Variables, PosList, DirList, SizeList) => {
		Particles.adjustCanvas(Variables);

		for (var i = 0; i < PosList.length; i++) 
		{
			PosList[i].x += Variables.speed * DirList[i].x;
			PosList[i].y += Variables.speed * DirList[i].y;

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

		Variables.cv.onmousemove = (e) => {
			if(Variables.mouseCollide)
			{
				for (var i = 0; i < PosList.length; i++) 
				{
					if(Particles.distance(PosList[i].x, PosList[i].y, e.x, e.y) < Variables.mouseCollideRange)
					{
						while(Particles.distance(PosList[i].x, PosList[i].y, e.x, e.y) < Variables.mouseCollideRange)
						{
							if(PosList[i].x > 0 && PosList[i].y > 0 && PosList[i].x < Variables.cv.width && PosList[i].y < Variables.cv.height)
							{
								PosList[i].x += DirList[i].x;
								PosList[i].y += DirList[i].y;
							}
							else 
							{
								DirList[i] = Particles.randomDirGen()
								break;
							}
						}
					}
				}
			}
		};

        Particles.drawLines(particleSystem, positions);
        Particles.draw(particleSystem, positions, sizes);
    },
    collide: (positions, directions, minX, minY, maxX, maxY, index) => {
        if (positions[index].x < minX) {
            positions[index].x = minX;
            directions[index].x *= -1;
        }
        if (positions[index].y < minY) {
            positions[index].y = minY;
            directions[index].y *= -1;
        }
        if (positions[index].x > maxX) {
            positions[index].x = maxX;
            directions[index].x *= -1;
        }
        if (positions[index].y > maxY) {
            positions[index].y = maxY;
            directions[index].y *= -1;
        }

        return [positions[index], directions[index]];
    },
    draw: (particleSystem, positions, sizes) => {
        if (particleSystem.particleOpacity !== "random") {
            particleSystem.context.fillStyle = particleSystem.particleColor.replace("b", "ba").replace(")", "," + particleSystem.particleOpacity + ")");
        }
        for (let i = 0; i < particleSystem.maxParticles; i++) {
            if (particleSystem.particleOpacity === "random") {
                particleSystem.context.fillStyle = particleSystem.particleColor.replace("b", "ba").replace(")", "," + particleSystem.opacityValues[i] + ")");
            }
            if (particleSystem.image) {
                Particles.drawImage(particleSystem, positions, i);
            } else {
                Particles.drawShapes(particleSystem, positions, sizes, i);
            }
        }
    },
    drawLines: (particleSystem, positions) => {
        if (particleSystem.connectParticles) {
            for (const pos of positions) {
                for (const pos2 of positions) {
                    if (particleSystem.particleColor && Particles.distance(pos.x, pos.y, pos2.x, pos2.y) < particleSystem.minDistance) {
                        let opacity = 1 - Particles.distance(pos.x, pos.y, pos2.x, pos2.y) / particleSystem.minDistance;
                        opacity = Math.round((opacity + Number.EPSILON) * 100) / 100;
                        particleSystem.context.strokeStyle = particleSystem.particleColor.replace("b", "ba").replace(")", "," + opacity + ")");
                        particleSystem.context.beginPath();
                        particleSystem.context.moveTo(pos.x, pos.y);
                        particleSystem.context.lineTo(pos2.x, pos2.y);
                        particleSystem.context.stroke();
                    }
                }
            }
        }
    },
    drawImage: (particleSystem, positions, index) => {
        particleSystem.context.drawImage(
            particleSystem.imageDraw,
            positions[index].x - particleSystem.image.sizeX / 2,
            positions[index].y - particleSystem.image.sizeY / 2,
            particleSystem.image.sizeX,
            particleSystem.image.sizeY
        );
    },
    drawShapes: (particleSystem, positions, sizes, index) => {
        if (particleSystem.shape.name == "6-stars") {
            particleSystem.context.beginPath();
            let h = particleSystem.shape.length / 2 || 10;
            particleSystem.context.moveTo(positions[index].x, positions[index].y - 2 * h);
            particleSystem.context.lineTo(positions[index].x + 2 * h / 3, positions[index].y - h);
            particleSystem.context.lineTo(positions[index].x + 2 * h, positions[index].y - h);
            particleSystem.context.lineTo(positions[index].x + 4 * h / 3, positions[index].y);
            particleSystem.context.lineTo(positions[index].x + 2 * h, positions[index].y + h);
            particleSystem.context.lineTo(positions[index].x + 2 * h / 3, positions[index].y + h);
            particleSystem.context.lineTo(positions[index].x, positions[index].y + 2 * h);
            particleSystem.context.lineTo(positions[index].x - 2 * h / 3, positions[index].y + h);
            particleSystem.context.lineTo(positions[index].x - 2 * h, positions[index].y + h);
            particleSystem.context.lineTo(positions[index].x - 4 * h / 3, positions[index].y);
            particleSystem.context.lineTo(positions[index].x - 2 * h, positions[index].y - h);
            particleSystem.context.lineTo(positions[index].x - 2 * h / 3, positions[index].y - h);
            particleSystem.context.closePath();
            particleSystem.context.fill();
        } else if (particleSystem.shape.name == "5-stars") {
            particleSystem.context.beginPath();
            let l = particleSystem.shape.length || 20;
            let s = l / Math.sqrt(3);
            particleSystem.context.moveTo(positions[index].x, positions[index].y - l);
            particleSystem.context.lineTo(positions[index].x + l - s, positions[index].y - l / 2);
            particleSystem.context.lineTo(positions[index].x + l, positions[index].y - l / 3);
            particleSystem.context.lineTo(positions[index].x + l - s / 2, positions[index].y + l / 4);
            particleSystem.context.lineTo(positions[index].x + 2 * l / 3, positions[index].y + 4 * l / 5);
            particleSystem.context.lineTo(positions[index].x, positions[index].y + l / 2);
            particleSystem.context.lineTo(positions[index].x - 2 * l / 3, positions[index].y + 4 * l / 5);
            particleSystem.context.lineTo(positions[index].x - l + s / 2, positions[index].y + l / 4);
            particleSystem.context.lineTo(positions[index].x - l, positions[index].y - l / 3);
            particleSystem.context.lineTo(positions[index].x - l + s, positions[index].y - l / 2);
            particleSystem.context.closePath();
            particleSystem.context.fill();
        } else if (particleSystem.shape.name == "hexagons") {
            particleSystem.context.beginPath();
            let r = 2 * particleSystem.shape.length / Math.sqrt(3) || 20 / Math.sqrt(3);
            particleSystem.context.moveTo(positions[index].x - r, positions[index].y);
            particleSystem.context.lineTo(positions[index].x - r / 2, positions[index].y - r);
            particleSystem.context.lineTo(positions[index].x + r / 2, positions[index].y - r);
            particleSystem.context.lineTo(positions[index].x + r, positions[index].y);
            particleSystem.context.lineTo(positions[index].x + r / 2, positions[index].y + r);
            particleSystem.context.lineTo(positions[index].x - r / 2, positions[index].y + r);
            particleSystem.context.closePath();
            particleSystem.context.fill();
        } else if (particleSystem.shape.name == "pentagons") {
            particleSystem.context.beginPath();
            let l = particleSystem.shape.length || 20;
            particleSystem.context.moveTo(positions[index].x, positions[index].y - l);
            particleSystem.context.lineTo(positions[index].x + l * Math.sqrt(3) / 2, positions[index].y - l / 2);
            particleSystem.context.lineTo(positions[index].x + l / 2, positions[index].y + l / 2);
            particleSystem.context.lineTo(positions[index].x - l / 2, positions[index].y + l / 2);
            particleSystem.context.lineTo(positions[index].x - l * Math.sqrt(3) / 2, positions[index].y - l / 2);
            particleSystem.context.closePath();
            particleSystem.context.fill();
        } else if (particleSystem.shape.name == "circles") {
            particleSystem.context.beginPath();
            particleSystem.context.arc(positions[index].x, positions[index].y, particleSystem.shape.length || 20, 0, 2 * Math.PI, true);
            particleSystem.context.fill();
        } else if (particleSystem.shape.name == "unknown") {
            particleSystem.context.beginPath();
            let sr = 2 * particleSystem.shape.length / 3 || 60 / 3;
            let ps = 2 * sr / 2 * 0.5877852523;
            let s = Math.sqrt(4 * sr * sr + ps * ps) / 2;
            let h = Math.sqrt(sr * sr / 2 - ps * ps) / 2;
            particleSystem.context.moveTo(positions[index].x, positions[index].y - 3 * sr / 2);
            particleSystem.context.lineTo(positions[index].x - sr / 3, positions[index].y - sr / 2);
            particleSystem.context.lineTo(positions[index].x - sr / 3 + s, positions[index].y + sr / 2);
            particleSystem.context.lineTo(positions[index].x - s + sr / 6, positions[index].y - sr / 2 + h);
            particleSystem.context.lineTo(positions[index].x - s / 2 + sr / 6, positions[index].y - sr / 2 + 2 * h);
            particleSystem.context.lineTo(positions[index].x, positions[index].y - 3 * sr / 2 + 2 * h);
            particleSystem.context.lineTo(positions[index].x + s / 2 - sr / 6, positions[index].y - sr / 2 + 2 * h);
            particleSystem.context.lineTo(positions[index].x + s - sr / 6, positions[index].y - sr / 2 + h);
            particleSystem.context.lineTo(positions[index].x + sr / 3 - s, positions[index].y + sr / 2);
            particleSystem.context.lineTo(positions[index].x + sr / 3, positions[index].y - sr / 2);
            particleSystem.context.closePath();
            particleSystem.context.fill();
        } else if (particleSystem.shape.name == "unknown2") {
            particleSystem.context.beginPath();
            let l = particleSystem.shape.length || 20;
            let s = l / Math.sqrt(3);
            particleSystem.context.moveTo(positions[index].x, positions[index].y - l);
            particleSystem.context.lineTo(positions[index].x + l - s, positions[index].y - l + s);
            particleSystem.context.lineTo(positions[index].x + l, positions[index].y - l + s);
            particleSystem.context.lineTo(positions[index].x + l - s / 2, positions[index].y + l - s);
            particleSystem.context.lineTo(positions[index].x + l, positions[index].y - l);
            particleSystem.context.lineTo(positions[index].x, positions[index].y - l / 2);
            particleSystem.context.lineTo(positions[index].x - l, positions[index].y - l);
            particleSystem.context.lineTo(positions[index].x - l + s / 2, positions[index].y + l - s);
            particleSystem.context.lineTo(positions[index].x - l, positions[index].y - l + s);
            particleSystem.context.lineTo(positions[index].x - l + s, positions[index].y - l + s);
            particleSystem.context.closePath();
            particleSystem.context.fill();
        } else {
            particleSystem.context.beginPath();
            particleSystem.context.arc(positions[index].x, positions[index].y, sizes[index], 0, 2 * Math.PI, true);
            particleSystem.context.fill();
        }
    },
    adjustCanvas: (particleSystem) => {
        const canvas = particleSystem.canvas;
        if (particleSystem.fullScreen) {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        if (particleSystem.screenSize !== null) {
            canvas.width = particleSystem.screenSize.width;
            canvas.height = particleSystem.screenSize.height;
        }

        const ctx = particleSystem.context;
        ctx.fillStyle = particleSystem.backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    },
    randomPosGen: (canvas) => {
        return { x: Math.floor(Math.random() * canvas.width), y: Math.floor(Math.random() * canvas.height) };
    },
    randomDirGen: () => {
        return { x: Math.random() > 0.5 ? -1 : 1, y: Math.random() > 0.5 ? -1 : 1 };
    },
    randomSizeGen: (minSize, sizeV) => {
        return minSize + Math.floor(Math.random() * sizeV);
    },
    randomOpacitygen: (maxParticles) => {
        const ops = [];
        for (let i = 0; i < maxParticles; i++) {
            ops.push(0.1 + Math.random() * 0.7);
        }
        return ops;
    },
    distance: (x1, y1, x2, y2) => {
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    }
};

