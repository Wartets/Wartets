const backToTopButton = document.getElementById("back-to-top");

// Show/Hide the button based on scroll position
window.addEventListener("scroll", () => {
	if (window.scrollY > 200) {
		backToTopButton.classList.remove("hidden");
	} else {
		backToTopButton.classList.add("hidden");
	}
});

// Smooth scroll to the top
function scrollToTop() {
	window.scrollTo({
		top: 0,
		behavior: "smooth"
	});
}

document.addEventListener('DOMContentLoaded', function () {
    const title = document.querySelector('header h1');
    const letters = title.innerText.split('');
    title.innerHTML = '';
    letters.forEach(letter => {
        const span = document.createElement('span');
        span.innerText = letter;
        title.appendChild(span);
    });
});

document.addEventListener('DOMContentLoaded', function () {
    const penguin = document.getElementById('penguin');
    const body = document.body;

    const maxX = (body.clientWidth * 0.8 - penguin.offsetWidth);
    const maxY = (body.clientHeight * 0.8 - penguin.offsetHeight);

    let currentX = parseFloat(penguin.style.left) || Math.random() * maxX;
    let currentY = parseFloat(penguin.style.top) || Math.random() * maxY;
    let moving = true;
    let clickCount = 0;

    function gaussianRandom(mean, stdDev) {
        let u1 = Math.random();
        let u2 = Math.random();
        let randStdNormal = Math.sqrt(-2.0 * Math.log(u1)) * Math.sin(2.0 * Math.PI * u2);
        return mean + stdDev * randStdNormal;
    }

    function getRandomPosition() {
        let currentX = parseFloat(penguin.style.left) || Math.random() * maxX;
        let currentY = parseFloat(penguin.style.top) || Math.random() * maxY;

        const stdDevX = 100;
        const stdDevY = 100;

        const newX = Math.max(0, Math.min(maxX, gaussianRandom(currentX, stdDevX)));
        const newY = Math.max(0, Math.min(maxY, gaussianRandom(currentY, stdDevY)));

        return { x: newX, y: newY };
    }

    function movePenguin() {
        if (!moving) return;

        const currentX = parseFloat(penguin.style.left);
        const currentY = parseFloat(penguin.style.top);
        const newPosition = getRandomPosition();

        const deltaX = newPosition.x - currentX;
        const deltaY = newPosition.y - currentY;
        const angle = Math.atan2(deltaY, deltaX);

        penguin.style.transition = 'left 2s ease, top 2s ease';
        penguin.style.left = `${newPosition.x}px`;
        penguin.style.top = `${newPosition.y}px`;
		
        penguin.style.transform = 'scaleX(1) rotate(0)';

        if (deltaX < 0) {
            penguin.src = 'img/pinguin-walking.png';
            penguin.style.transform = 'scaleX(1) rotate(10deg)';
        } else {
            penguin.src = 'img/pinguin-walking.png';
            penguin.style.transform = 'scaleX(-1) rotate(10deg)';
        }

        penguin.classList.remove('penguin-moving');
		
        if (!moving) return;

        const randomPause = Math.random() * 3000 + 3000;
        setTimeout(() => {
            if (Math.random() < 0.2) {
                penguin.classList.add('penguin-moving');
            }
			penguin.style.transform = 'scaleX(1) rotate(0)';
			if (Math.random() < 0.5) {
				penguin.style.transform = 'scaleX(-1)';
			}
            penguin.src = 'img/pinguin-stop.png';
            setTimeout(() => {
                movePenguin();
            }, 1000);
        }, randomPause);
    }

    function startPenguinMovement() {
        const initialPosition = getRandomPosition();
        penguin.style.left = `${initialPosition.x}px`;
        penguin.style.top = `${initialPosition.y}px`;

        movePenguin();
    }

    penguin.addEventListener('click', function() {
        clickCount++;

        if (clickCount >= 5) {
			const hueValue = 270 + 20 * clickCount;
			const satValue = clickCount - 2;
			const brightValue = Math.sin(1.1 * (clickCount - 4)) ** 2 + 0.5;
			penguin.style.filter = `hue-rotate(${hueValue}deg) brightness(${brightValue}) saturate(${satValue})`;
        } else {
            moving = !moving;
            if (moving) {
                penguin.src = 'img/pinguin-walking.png';
                movePenguin();
            } else {
				penguin.style.transform = 'scaleX(1) rotate(0)';
                penguin.src = 'img/pinguin-stop.png';
				if (Math.random() < 0.5) {
					penguin.style.transform = 'scaleX(-1)';
				}
            }
        }
    });

    startPenguinMovement();
});

document.addEventListener('DOMContentLoaded', function () {
    const bushContainer = document.getElementById('background-bushes');
    const snowContainer = document.getElementById('background-snowflakes');
    const numBushes = Math.floor(Math.random() * 20) + 5;
    const bodyWidth = document.body.clientWidth;
    const bodyHeight = document.body.clientHeight;

    function generateBushes() {
        bushContainer.innerHTML = '';
        const bodyWidth = document.body.clientWidth;
        const bodyHeight = document.body.clientHeight;
        for (let i = 0; i < numBushes; i++) {
            const bush = document.createElement('div');
            bush.classList.add('bush');

            const randomX = bodyWidth / 2 * (1 + 0.8 * (Math.random() * 2 - 1));
            const randomY = bodyHeight / 2 * (1 + 0.8 * (Math.random() * 2 - 1));
            const randomScale = Math.random() < 0.5 ? 1 : -1;
            const randomSize = Math.random() * 0.5 + 0.5;
            const randomRot = Math.random() * 360;

            bush.style.left = `${randomX}px`;
            bush.style.top = `${randomY}px`;
            bush.style.transform = `scaleX(${randomScale}) scale(${randomSize}) rotate(${randomRot}deg)`;

            addHoverEffect(bush);

            bushContainer.appendChild(bush);
        }
    }

    function generateSnow() {
        snowContainer.innerHTML = '';
        const bodyWidth = document.body.clientWidth;
        const bodyHeight = document.body.clientHeight;
        for (let i = 0; i < numBushes; i++) {
            const snow = document.createElement('div');
            snow.classList.add('snow');

            const randomX = bodyWidth / 2 * (1 + 0.9 * (Math.random() * 2 - 1));
            const randomY = bodyHeight / 2 * (1.1 + 0.8 * (Math.random() * 2 - 1));
            const randomScale = Math.random() < 0.5 ? 1 : -1;
            const randomSize = Math.random() * 0.5 + 0.5;
            const randomRot = Math.random() * 360;

            snow.style.left = `${randomX}px`;
            snow.style.top = `${randomY}px`;
            snow.style.transform = `scaleX(${randomScale}) scale(${randomSize}) rotate(${randomRot}deg)`;

            addHoverEffect(snow);

            snowContainer.appendChild(snow);
        }
    }

    function addHoverEffect(element) {
        let lastRotation = parseFloat(element.style.transform.match(/rotate\(([-\d.]+)deg\)/)?.[1] || 0);

        element.addEventListener('mouseover', function () {
            element.style.transition = 'transform 0.5s ease';
            const newRotation = lastRotation;
            element.style.transform += ` rotate(${newRotation}deg)`;
            lastRotation = newRotation % 360;
        });
    }

    generateBushes();
    generateSnow();

    window.addEventListener('resize', function () {
        generateBushes();
        generateSnow();
    });
});

