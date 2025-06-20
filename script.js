const projects = [
    {
        title: "Curve Fitting",
        date: "Jun 2025",
        description: "This project illustrates thin-plate splines, a smooth surface interpolation technique used in geometry and machine learning.",
        image: "img/Curve-Fitting-card.png",
        link: "https://wartets.github.io/Curve-Fitting/",
        reverse: false
    },
    {
        title: "Procedural Art Gen.",
        date: "May 2025",
        description: "A seed-based generative art system creating unique visual patterns. Explore geometric formations, organic fractals, and abstract compositions that remain reproducible.",
        image: "img/Procedural-Art-card.png",
        link: "https://wartets.github.io/Procedural-Art/",
        reverse: true
    },
    [
        {
            title: "Space Trip Game 3D",
            date: "Apr 2025",
            description: "Survival game for a small ship in a swarm of asteroids, where you have to score as many points as possible by destroying them and staying alive as long as possible.",
            image: "img/Spaceship-card.png",
            link: "https://wartets.github.io/Space-Trip-3D"
        },
        {
            title: "Space Trip Game 2D",
            date: "Mar 2025",
            description: "\"Simplified\" 2D version of the Space Trip game.",
            image: "img/Space-Trip-2D.png",
            link: "https://wartets.github.io/Space-Trip-2D",
            reverse: true
        }
    ],
    {
        title: "Sudoku",
        date: "Fev 2025",
        description: "A customizable web-based Sudoku game that allows you to adjust both the grid size and difficulty level. It features real-time input validation, providing an interactive and engaging puzzle-solving experience.",
        image: "img/Sudoku-card.png",
        link: "https://wartets.github.io/Sudoku/",
        reverse: false
    },
    {
        title: "Chess Game",
        date: "Jan 2025",
        description: "An Interactive chess game, offering classic and random board setups. It allows custom piece placement, and personalized size grid.",
        image: "img/Chess-card.png",
        link: "https://wartets.github.io/Chess-Game/",
        reverse: true
    },
    {
        title: "Minesweeper",
        date: "Dec 2024",
        description: "A simple mine-clearing game in JavaScript. Discover all the squares without touching a mine! Adjust the grid size and number of mines to personalize the experience.",
        image: "img/Demineur-card.png",
        link: "https://wartets.github.io/Demineur/",
        reverse: false
    },
    {
        title: "Julia-Set",
        date: "Nov 2024",
        description: "Explore the beauty of Julia sets with interactive controls to adjust equations and rendering settings. Create custom stunning fractal visuals in \"real-time\" with a simple interface.",
        image: "img/JuilaSet-card.png",
        link: "https://wartets.github.io/Julia-Set/",
        reverse: true
    },
    {
        title: "Bird-cloud",
        date: "Nov 2024",
        description: "An interactive simulation of flocking behavior in birds, based on the Boids model. Adjust parameters like speed, vision radius, and randomness to see how individual rules create collective patterns.",
        image: "img/BirdCloud-card.png",
        link: "https://wartets.github.io/Bird-cloud/",
        reverse: false
    },
    {
        title: "N-Body-Problem",
        date: "Oct 2024",
        description: "A physics simulation of an N-body system with gravity, collisions, and electromagnetism. Customize object properties like mass, charge, and position to observe how forces shape their motion.",
        image: "img/NBodyProblem-card.png",
        link: "https://wartets.github.io/N-Body-Problem/",
        reverse: true
    },
    {
        title: "Lenia-Simulation",
        date: "Jun 2024",
        description: "Discover Lenia, a continuous cellular automaton that extends Conway's Game of Life. Explore lifelike, emergent patterns in a world of smooth transitions and endless complexity.",
        image: "img/LeniaSimulation-card.png",
        link: "https://wartets.github.io/Lenia-Simulation/",
        reverse: false
    },
    {
        title: "Solar-System",
        date: "May 2023",
        description: "A 3D solar system visualization. Interact with the planets and their orbits in a dynamic and immersive interface.",
        image: "img/SolarSystem-card.png",
        link: "https://wartets.github.io/SolarSystem/",
        reverse: true
    },
    [
        {
            title: "My Music (SoundCloud)",
            description: "I create electronic, ambient, funky, and drumcore music. I focus on improving my skills and exploring new sounds. Check out my tracks and enjoy the beats!",
            image: "img/Soundcloud-card.jpg",
            link: "https://soundcloud.com/wartets"
        },
        {
            title: "My Music (YouTube)",
            description: "Explore my music projects on YouTube.",
            link: "https://www.youtube.com/@Wartets",
            noImage: true
        }
    ]
];

function renderProjects() {
    const main = document.querySelector('main');
    const linkDisplay = document.getElementById('link-display');
    
    projects.forEach(item => {
        if (Array.isArray(item)) {
            const doubleSection = document.createElement('div');
            doubleSection.className = 'double-section';
            
            item.forEach(project => {
                doubleSection.appendChild(createCard(project));
            });
            
            main.insertBefore(doubleSection, linkDisplay);
        } else {
            main.insertBefore(createCard(item), linkDisplay);
        }
    });
}

function createCard(project) {
    const card = document.createElement('div');
    card.className = 'project-card';
    card.dataset.link = project.link;
    if (project.reverse) card.classList.add('reverse');
    if (project.noImage) card.classList.add('no-image');
    
    card.onclick = () => window.open(project.link, '_blank');
    
    if (!project.noImage) {
        const imgContainer = document.createElement('div');
        imgContainer.className = 'image-container';
        const img = document.createElement('img');
        img.src = project.image;
        img.alt = `${project.title} preview`;
        imgContainer.appendChild(img);
        card.appendChild(imgContainer);
    }
    
    const content = document.createElement('div');
    content.className = 'content-container';
    
    const title = document.createElement('h2');
    title.textContent = project.date 
        ? `${project.title} (${project.date})` 
        : project.title;
    content.appendChild(title);
    
    const desc = document.createElement('p');
    desc.textContent = project.description;
    content.appendChild(desc);
    
    card.appendChild(content);
    return card;
}

const backToTopButton = document.getElementById("back-to-top");

window.addEventListener("scroll", () => {
	if (window.scrollY > 200) {
		backToTopButton.classList.remove("hidden");
	} else {
		backToTopButton.classList.add("hidden");
	}
});

function scrollToTop() {
	window.scrollTo({
		top: 0,
		behavior: "smooth"
	});
}

document.addEventListener('DOMContentLoaded', function () {
    setupThemeSelector();
	renderProjects();
	const title = document.querySelector('header h1');
	const letters = title.innerText.split('');
	title.innerHTML = '';
	letters.forEach(letter => {
		const span = document.createElement('span');
		span.innerText = letter;
		title.appendChild(span);
	});

	const linkDisplay = document.getElementById('link-display');

	document.addEventListener('mouseover', (e) => {
		const card = e.target.closest('.project-card');
		if (card) {
			const link = card.dataset.link;
			if (link) {
				linkDisplay.innerHTML = `&#x2197; ${link}`;
				linkDisplay.classList.add('visible');
			}
		}
	});

	document.addEventListener('mouseout', (e) => {
		if (!e.relatedTarget || !e.relatedTarget.closest('.project-card')) {
			linkDisplay.classList.remove('visible');
		}
	});
});

document.addEventListener('DOMContentLoaded', function () {
	const penguin = document.getElementById('penguin');
	const body = document.body;

	let maxX = (body.clientWidth * 0.8 - penguin.offsetWidth);
	let maxY = (body.clientHeight * 0.8 - penguin.offsetHeight);

	let currentX = parseFloat(penguin.style.left) || Math.random() * maxX;
	let currentY = parseFloat(penguin.style.top) || Math.random() * maxY;
	let moving = true;
	let clickCount = 0;

	window.addEventListener('resize', function () {
		let maxX = (body.clientWidth * 0.8 - penguin.offsetWidth);
		let maxY = (body.clientHeight * 0.8 - penguin.offsetHeight);
	});

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

function getCurrentSeason() {
    const now = new Date();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    
    if ((month === 12 && day >= 21) || month === 1 || month === 2 || (month === 3 && day < 20)) {
        return 'winter';
    } else if ((month === 3 && day >= 20) || month === 4 || month === 5 || (month === 6 && day < 21)) {
        return 'spring';
    } else if ((month === 6 && day >= 21) || month === 7 || month === 8 || (month === 9 && day < 23)) {
        return 'summer';
    } else {
        return 'autumn';
    }
}

function applySeasonTheme() {
    const season = getCurrentSeason();
    document.body.className = `theme-${season}`;
    localStorage.setItem('selectedTheme', season);
}

function setupThemeSelector() {
    const savedTheme = localStorage.getItem('selectedTheme');
    if (savedTheme) {
        document.body.className = `theme-${savedTheme}`;
    } else {
        applySeasonTheme();
    }

    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const theme = btn.classList[1];
            document.body.className = `theme-${theme}`;
            localStorage.setItem('selectedTheme', theme);
        });
    });
}

particlesJS("particles-js", {
	"particles": {
		"number": {
			"value": 200,
			"density": {
				"enable": true,
				"value_area": 800
			}
		},
		"color": {
			"value": "#a1a1b5"
		},
		"shape": {
			"type": "circle",
			"stroke": {
				"width": 0,
				"color": "#fff"
			}
		},
		"opacity": {
			"value": 0.5,
			"random": true,
			"anim": {
				"enable": true,
				"speed": 1,
				"opacity_min": 0.1,
				"sync": false
			}
		},
		"size": {
			"value": 3,
			"random": true,
			"anim": {
				"enable": true,
				"speed": 4,
				"size_min": 0.1,
				"sync": false
			}
		},
		"line_linked": {
				"enable": false
		},
		"move": {
			"enable": true,
			"speed": 2, 
			"direction": "none",
			"random": true,
			"straight": false,
			"out_mode": "out",
			"bounce": true
		}
	},
	"interactivity": {
		"events": {
			"onhover": {
				"enable": true,
				"mode": "repulse"
			},
			"onclick": {
					"enable": true,
					"mode": "push"
			}
		},
		"modes": {
			"repulse": {
				"distance": 150,
				"duration": 0.4
			},
			"push": {
				"particles_nb": 4
			}
		}
	},
	"retina_detect": true
});