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

        if (deltaX < 0) {
            penguin.src = 'img/pinguin-walking.png';
            penguin.style.transform = 'scaleX(1)';
        } else {
            penguin.src = 'img/pinguin-walking.png';
            penguin.style.transform = 'scaleX(-1)';
        }

        penguin.classList.remove('penguin-moving');
		
        if (!moving) return;

        const randomPause = Math.random() * 3000 + 3000;
        setTimeout(() => {
            if (Math.random() < 0.2) {
                penguin.classList.add('penguin-moving');
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
        moving = !moving;
        if (moving) {
            penguin.src = 'img/pinguin-walking.png';
            movePenguin();
        } else {
            penguin.src = 'img/pinguin-stop.png';
            penguin.classList.add('penguin-moving');

            setTimeout(() => {
                penguin.classList.remove('penguin-moving');
            }, 1000);
        }
    });

    startPenguinMovement();
});

