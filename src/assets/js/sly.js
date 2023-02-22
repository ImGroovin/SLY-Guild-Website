let canvas = null;
let ctx = null;
let textCoordinates = null;
const png = new Image();
let particleArray = [];
let percent = 0;
let animationActive = true;

const mouse = {
	x: null,
	y: null,
	radius: 50
}

png.src = "data:image/png;base64,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";

function startLaunchAnimation() {
	canvas = document.getElementById('logo-canvas');
	logocontainer = document.getElementById('landing');
	ctx = canvas.getContext('2d');
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	
	textCanvas = document.getElementById('popup-canvas');
	textCtx = textCanvas.getContext('2d');
	textCtx.fillStyle = 'black';
	textCtx.font = '30px Orbitron';
	textCtx.shadowColor = "white";
	textCtx.shadowBlur = 10;
	textCtx.fillText('Research and Development', 0, 30);
	
	popupCanvas = document.getElementById('popup-canvas-target');
	popupCtx = popupCanvas.getContext('2d');
	let fadeDirection = 1;
		
	let start = Date.now();
	let idx = 0;
	let textArr = ['Open Knowledge','Problem Solving','Research and Development']
	function animatePix(){
		let runningTime = Date.now() - start;
		if (runningTime > 5000) {
			fadeDirection = 0;
		}
		if (runningTime > 7000) {
			idx = (idx > 1) ? 0 : idx+1;
			textCtx.clearRect(0, 0, textCanvas.width, textCanvas.height);
			textCtx.fillText(textArr[idx], 0, 30);
			start = Date.now();
			fadeDirection = 1;
			const xPos = Math.random() * 50;
			const yPos = Math.random() * 80;
			popupCanvas.style.left = xPos + '%';
			popupCanvas.style.top = yPos + '%';
		}
		let { width, height} = textCanvas.getBoundingClientRect();
		drawImagePix(fadeDirection);
		
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		for (let i = 0; i < particleArray.length; i++) {
			particleArray[i].draw();
			particleArray[i].update();
		}
		
		if (animationActive) {
			setTimeout(() => {
				requestAnimationFrame(animatePix);
			}, 1000 / 60)
		}
	}
	this.animatePix = animatePix;
	
	ctx.drawImage(png, 0, 0);
	textCoordinates = ctx.getImageData(0, 0, 100, 100);
	
	
	
	init();
	animatePix();
	
	logocontainer.addEventListener('mousemove', function(event) {
		mouse.x = event.x;
		mouse.y = event.y;
	});
	
	window.addEventListener('resize', function() {
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
		init();
	});
} 

class Particle {
	constructor(x, y) {
		this.x = x;
		this.y = y;
		this.size = 3;
		this.baseX = this.x;
		this.baseY = this.y;
		this.density = (Math.random() * 30) + 1;
	}
	draw() {
		ctx.fillStyle = 'rgb(0,0,0,0.1)';
		ctx.beginPath();
		ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
		ctx.closePath();
		ctx.fill();
	}
	update() {
		let dx = mouse.x - this.x;
		let dy = mouse.y - this.y;
		let distance = Math.sqrt(dx * dx + dy * dy);
		let forceDirectionX = dx / distance;
		let forceDirectionY = dy / distance;
		let maxDistance = mouse.radius;
		let force = (maxDistance - distance) / maxDistance;
		let directionX = forceDirectionX * force * this.density;
		let directionY = forceDirectionY * force * this.density;

		if (distance < mouse.radius) {
			this.x -= directionX;
			this.y -= directionY;
		} else {
			if (this.x !== this.baseX) {
				let dx = this.x - this.baseX;
				this.x -= dx/10;
			}
			if (this.y !== this.baseY) {
				let dy = this.y - this.baseY;
				this.y -= dy/10;
			}
		}
	}
}

function init() {
	particleArray = [];
	let adjustX = (50 * (canvas.width / textCoordinates.width)) / 7 - 50;
	let adjustY = (25 * (canvas.height / textCoordinates.height)) / 7 - 25;
	for (let y=0, y2=textCoordinates.height; y < y2; y++) {
		for (let x=0, x2=textCoordinates.width; x < x2; x++) {
			if (textCoordinates.data[(y * 4 * textCoordinates.width) + (x * 4) + 3] > 128) {
				let positionX = x + adjustX;
				let positionY = y + adjustY;
				particleArray.push(new Particle(positionX * 7, positionY * 7));
			}
		}
	}
}

function drawImagePix(fadeDirection){
	let {width, height} = textCanvas.getBoundingClientRect();

	popupCanvas.width = width * window.devicePixelRatio;
	popupCanvas.height = height * window.devicePixelRatio;
	popupCanvas.style.width = `${width}px`;
	popupCanvas.style.height = `${height}px`;

	// pixelate by diabling the smoothing
	popupCtx.webkitImageSmoothingEnabled = false;
	popupCtx.mozImageSmoothingEnabled = false;
	popupCtx.msSmoothingEnabled = false;
	popupCtx.imageSmoothingEnabled = false;

	if(fadeDirection === 1){
		if(percent < 0.2){
			percent += .01;
		}else if(percent < 1){
			percent += .1;
		}
	}else if(fadeDirection === 0){
		if(percent > 0.2){
			percent -= .3
		}else if( percent > 0){
			percent -= .01;
		}
	}

	let scaledWidth = width * percent;
	let scaledHeight = height * percent;

	if(percent >= 1){
		popupCtx.scale(window.devicePixelRatio, window.devicePixelRatio);
		popupCtx.drawImage(textCanvas, 0, 0, width, height);
	}else{
		popupCtx.drawImage(textCanvas, 0, 0, scaledWidth, scaledHeight);
		popupCtx.scale(window.devicePixelRatio, window.devicePixelRatio);
		if(popupCanvas.width !== 0 && popupCanvas.height !== 0){
			popupCtx.drawImage(popupCanvas, 0, 0, scaledWidth, scaledHeight, 0, 0, width, height)
		}
	}
}

function animate() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	for (let i = 0; i < particleArray.length; i++) {
		particleArray[i].draw();
		particleArray[i].update();
	}
	requestAnimationFrame(animate);
}