# ParticlesJS.js

### A lightweight library to simulate particles for beautiful backgrounds.

## Installation :-
##### Download the file from github and put it in the folder you want to use in.

## Features :-
* Simulate in background :- 
  * Particles
  * Images
  * Shapes
    * Circles
    * 5-Pointed Stars
    * 6-Pointed Stars
    * Pentagons
    * Hexagons
    * 2 Unknown Shapes That Were Made by Mistake but looked Good
    
* Choose to let the particles collide with the cursor when moved

* Add the connection between lines which change there opacity with the distance between particles

* Ability to change particle's :-
  * Speed
  * Color
  * Number
  * Size Variation
  * Connection
  
  ## Usage :-
  #### Add a canvas element
  ```html
  <canvas id="cv" ></canvas>
  ```
  
  #### Add some styling to the canvas and the page
  #### (Optional)
  ```css
  *{
	margin: 0;
	padding: 0;
  }

  #cv{
    display: block;
    position: absolute;
    top : 0;
    left: 0;
    z-index: 0;
  }
  ```
  #### The whole of javascript required
  #### Not all of it is required
  #### Just a selector is mandatory all others have default values
  
  ```javascript
  Particles.init({
			selector: "class or id of the last canvas",
			connectParticles: true,
			maxParticles: 150,
			minDistance: 120,
			speed: 0.5,
			color: "rgb(200,200,200)",
			background: "rgb(182,25,36)",
			sizeVariation: 5,
			opacity: "random",
			fullScreen: true,
			mouseCollide: true,
			mouseCollideRange: 150,
			shape: {
				name: "pentagons",
				length: 20
			},
			image: {
			 	src: "img", 
			 	sizeX: 20,
		 	sizeY: 20
			} 
		});
    ```
    #### To use the basic design just type
    
    ```javascript
    Particles.init({
    selector: ".cv",
    connectParticles: true,
    opacity: "random",
    fullScreen: true
    });
    
## Elements :-
Element           | Type                       | Required  | Default   | For
------------------|----------------------------|-----------|-----------|------------------------------------------------------------
selector          | string(id or class of the last canvas element on your page)| mandatory |           | To apply styles on that canvas
connnectParticles | boolean                    | optional  | false     | To connect the floating particles
maxParticles      | integer                    | optional  | 100       | The number of particles to be drawn
minDistance       | integer                    | optional  | 120       | The minDistance to connect the lines 
speed             | float                      | optional  | 0.5       | The speed of animation
color             | string("rgb(r,g,b)" only ) | optional  | "rbg(0,0,0)" | The color of the particles and the lines
background        | string("rgb(r,g,b)" only ) | optional  | "rgb(255,255,255)" | The background of the canvas
sizeVariation     | integer                    | optional  | 3 | For the size variation among the particles
opacity           | float / "random"           | optional  | 0.7 | To change the opacity of the particles and the lines 
fullScreen        | boolean                    | optional  | false | To let the canvas take the full Screen Width
mouseCollide      | boolean                    | opitonal  | false | To let the particles collide with the cursor when moved
mouseCollideRange | integer                    | optional  | 100 | The range for collision with the mouse 
shape             | object                     | optional  | false | The shape of the particles to be drawn
*shape.name*      | string - "circles","pentagons","hexagons","5-stars","6-stars","unknown","unknown2"| shape => mandatory | "particles" | The name of the shape of the particles
*shape.length*    | integer                    | shape => mandatory  | 20 | The length for the shape of the particles
image             | object                     | optional  | false | The image to be drawn instead of the particles
*image.src*       | string(path to the image)  | image => mandatory | The src for the image to be drawn
*image.sizeX*     | integer                    | image => mandatory  | image size | The size for the image in the X direction
*image.sizeY*     | integer                    | image => mandatory  | image size | The size for the image in the Y direction
