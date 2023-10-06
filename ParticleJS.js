const Particles = {
    init: (config) => {
        const particleSystem = {};

        // Canvas setup
        particleSystem.canvas = document.querySelector(config.selector);
        particleSystem.context = particleSystem.canvas.getContext("2d");

        // Particle system configuration
        particleSystem.maxParticles = config.maxParticles || 200;
        particleSystem.minDistance = config.minDistance || 120;
        particleSystem.particleColor = config.color || "rgb(230, 230, 230)";
        particleSystem.particleSpeed = config.speed || 0.5;
        particleSystem.sizeVariation = config.sizeVariation || 5;
        particleSystem.connectParticles = config.connectParticles || true;
        particleSystem.particleOpacity = config.opacity || "random";
        particleSystem.backgroundColor = config.background || "rgb(220, 10, 20)";
        particleSystem.fullScreen = config.fullScreen || true;
        particleSystem.screenSize = config.screenSize || (particleSystem.fullScreen ? null : { width: window.innerWidth, height: window.innerHeight });
        particleSystem.mouseCollide = config.mouseCollide || true;
        particleSystem.mouseCollideRange = config.mouseCollideRange || 75;
        particleSystem.image = config.image || false;
        particleSystem.shape = config.shape || false;
        particleSystem.opacityValues = [];

        if (particleSystem.particleOpacity === "random") {
            particleSystem.opacityValues = Particles.randomOpacitygen(particleSystem.maxParticles);
        }

        Particles.create(particleSystem);
    },
    create: (particleSystem) => {
        Particles.adjustCanvas(particleSystem);

        const positions = [];
        const directions = [];
        const sizes = [];

        for (let i = 0; i < particleSystem.maxParticles; i++) {
            positions.push(Particles.randomPosGen(particleSystem.canvas));
            directions.push(Particles.randomDirGen());
            sizes.push(Particles.randomSizeGen(2, particleSystem.sizeVariation));
        }

        if (particleSystem.image) {
            particleSystem.imageDraw = new Image();
            particleSystem.imageDraw.src = particleSystem.image.src;
        }
        setInterval(Particles.update, 20, particleSystem, positions, directions, sizes);
    },
    update: (particleSystem, positions, directions, sizes) => {
        Particles.adjustCanvas(particleSystem);

        for (let i = 0; i < positions.length; i++) {
            positions[i].x += particleSystem.particleSpeed * directions[i].x;
            positions[i].y += particleSystem.particleSpeed * directions[i].y;

            if (particleSystem.shape) {
                [positions[i], directions[i]] = Particles.collide(
                    positions,
                    directions,
                    particleSystem.shape.length,
                    particleSystem.shape.length,
                    particleSystem.canvas.width - particleSystem.shape.length,
                    particleSystem.canvas.height - particleSystem.shape.length / 2,
                    i
                );
            } else if (particleSystem.image) {
                [positions[i], directions[i]] = Particles.collide(
                    positions,
                    directions,
                    particleSystem.image.sizeX / 2,
                    particleSystem.image.sizeY / 2,
                    particleSystem.canvas.width - particleSystem.image.sizeX / 2,
                    particleSystem.canvas.height - particleSystem.image.sizeY / 2,
                    i
                );
            } else {
                [positions[i], directions[i]] = Particles.collide(
                    positions,
                    directions,
                    sizes[i],
                    sizes[i],
                    particleSystem.canvas.width - sizes[i],
                    particleSystem.canvas.height - sizes[i],
                    i
                );
            }
        }

        particleSystem.canvas.onmousemove = (e) => {
            console.log("Mouse moved:", e.clientX, e.clientY);

            if (particleSystem.mouseCollide) {
                for (let i = 0; i < positions.length; i++) {
                    const mouseX = e.clientX; // Update mouse cursor position
                    const mouseY = e.clientY;

                    // Check if a particle (positions[i]) is within the range of the mouse cursor (mouseX, mouseY)
                    if (Particles.distance(positions[i].x, positions[i].y, mouseX, mouseY) < particleSystem.mouseCollideRange) {
                        console.log("Collision detected for particle", i);

                        // Handle collision here
                        while (Particles.distance(positions[i].x, positions[i].y, mouseX, mouseY) < particleSystem.mouseCollideRange) {
                            if (positions[i].x > 0 && positions[i].y > 0 && positions[i].x < particleSystem.canvas.width && positions[i].y < particleSystem.canvas.height) {
                                positions[i].x += directions[i].x;
                                positions[i].y += directions[i].y;
                            } else {
                                directions[i] = Particles.randomDirGen();
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
        const shape = particleSystem.shape;

        if (shape.name === "6-stars") {
            particleSystem.context.beginPath();
            let h = shape.length / 2 || 10;
            particleSystem.context.moveTo(positions[index].x, positions[index].y - 2 * h);
            particleSystem.context.lineTo(positions[index].x + (2 * h) / 3, positions[index].y - h);
            // ... (remaining lines for the star shape)
            particleSystem.context.closePath();
            particleSystem.context.fill();
        } else if (shape.name === "5-stars") {
            // Handle drawing for 5-stars shape
        } else if (shape.name === "hexagons") {
            // Handle drawing for hexagons shape
        } else if (shape.name === "pentagons") {
            // Handle drawing for pentagons shape
        } else if (shape.name === "circles") {
            // Handle drawing for circles shape
        } else if (shape.name === "unknown") {
            // Handle drawing for unknown shape
        } else if (shape.name === "unknown2") {
            // Handle drawing for unknown2 shape
        } else {
            particleSystem.context.beginPath();
            particleSystem.context.arc(
                positions[index].x,
                positions[index].y,
                sizes[index],
                0,
                2 * Math.PI,
                true
            );
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
