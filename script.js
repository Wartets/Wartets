const projects = [
	{
		title: "Curve Fitting",
		date: "Jun 2025",
		description: "This project illustrates thin-plate splines, a smooth surface interpolation technique used in geometry and machine learning.",
		image: "img/Curve-Fitting-card.png",
		link: "https://wartets.github.io/Curve-Fitting/",
		reverse: false,
		keywords: ["math", "interpolation", "splines", "visualization", "JavaScript", "CSS", "HTML"]
	},
	{
		title: "Procedural Art Gen.",
		date: "May 2025",
		description: "A seed-based generative art system creating unique visual patterns. Explore geometric formations, organic fractals, and abstract compositions that remain reproducible.",
		image: "img/Procedural-Art-card.png",
		link: "https://wartets.github.io/Procedural-Art/",
		reverse: true,
		keywords: ["generative art", "procedural", "fractals", "patterns", "creative coding", "JavaScript", "CSS", "HTML"]
	},
	[
		{
			title: "Space Trip Game 3D",
			date: "Apr 2025",
			description: "Survival game for a small ship in a swarm of asteroids, where you have to score as many points as possible by destroying them and staying alive as long as possible.",
			image: "img/Spaceship-card.png",
			link: "https://wartets.github.io/Space-Trip-3D/",
			reverse: false,
			keywords: ["3D", "game", "space", "asteroids", "three.js", "survival", "JavaScript", "CSS", "HTML"]
		},
		{
			title: "Space Trip Game 2D",
			date: "Mar 2025",
			description: "\"Simplified\" 2D version of the Space Trip game.",
			image: "img/Space-Trip-2D.png",
			link: "https://wartets.github.io/Space-Trip-2D/",
			reverse: true,
			keywords: ["2D", "game", "space", "asteroids", "canvas", "arcade", "JavaScript", "CSS", "HTML"]
		}
	],
	{
		title: "Sudoku",
		date: "Feb 2025",
		description: "A customizable web-based Sudoku game that allows you to adjust both the grid size and difficulty level. It features real-time input validation, providing an interactive and engaging puzzle-solving experience.",
		image: "img/Sudoku-card.png",
		link: "https://wartets.github.io/Sudoku/",
		reverse: false,
		keywords: ["puzzle", "game", "logic", "interactive", "validation", "JavaScript", "CSS", "HTML"]
	},
	{
		title: "Chess Game",
		date: "Jan 2025",
		description: "An Interactive chess game, offering classic and random board setups. It allows custom piece placement, and personalized size grid.",
		image: "img/Chess-card.png",
		link: "https://wartets.github.io/Chess-Game/",
		reverse: true,
		keywords: ["chess", "game", "strategy", "board game", "interactive", "JavaScript", "CSS", "HTML"]
	},
	{
		title: "Minesweeper",
		date: "Dec 2024",
		description: "A simple mine-clearing game in JavaScript. Discover all the squares without touching a mine! Adjust the grid size and number of mines to personalize the experience.",
		image: "img/Demineur-card.png",
		link: "https://wartets.github.io/Demineur/",
		reverse: false,
		keywords: ["game", "puzzle", "grid", "mines", "classic", "JavaScript", "CSS", "HTML"]
	},
	{
		title: "Julia-Set",
		date: "Nov 2024",
		description: "Explore the beauty of Julia sets with interactive controls to adjust equations and rendering settings. Create custom stunning fractal visuals in \"real-time\" with a simple interface.",
		image: "img/JuilaSet-card.png",
		link: "https://wartets.github.io/Julia-Set/",
		reverse: true,
		keywords: ["fractals", "math", "visualization", "interactive", "complex numbers", "JavaScript", "CSS", "HTML"]
	},
	{
		title: "Bird-cloud",
		date: "Nov 2024",
		description: "An interactive simulation of flocking behavior in birds, based on the Boids model. Adjust parameters like speed, vision radius, and randomness to see how individual rules create collective patterns.",
		image: "img/BirdCloud-card.png",
		link: "https://wartets.github.io/Bird-cloud/",
		reverse: false,
		keywords: ["simulation", "boids", "flocking", "emergence", "interactive", "JavaScript", "CSS", "HTML"]
	},
	{
		title: "N-Body-Problem",
		date: "Oct 2024",
		description: "A physics simulation of an N-body system with gravity, collisions, and electromagnetism. Customize object properties like mass, charge, and position to observe how forces shape their motion.",
		image: "img/NBodyProblem-card.png",
		link: "https://wartets.github.io/N-Body-Problem/",
		reverse: true,
		keywords: ["physics", "simulation", "gravity", "electromagnetism", "n-body", "JavaScript", "CSS", "HTML"]
	},
	{
		title: "Lenia-Simulation",
		date: "Jun 2024",
		description: "Discover Lenia, a continuous cellular automaton that extends Conway's Game of Life. Explore lifelike, emergent patterns in a world of smooth transitions and endless complexity.",
		image: "img/LeniaSimulation-card.png",
		link: "https://wartets.github.io/Lenia-Simulation/",
		reverse: false,
		keywords: ["cellular automata", "simulation", "emergence", "patterns", "Lenia", "Python", "CSS", "HTML"]
	},
	{
		title: "Solar-System",
		date: "May 2023",
		description: "A 3D solar system visualization. Interact with the planets and their orbits in a dynamic and immersive interface.",
		image: "img/SolarSystem-card.png",
		link: "https://wartets.github.io/SolarSystem/",
		reverse: true,
		keywords: ["3D", "space", "simulation", "planets", "orbits", "Java", "GeogebraScript", "GeoGebra", "CSS", "HTML"]
	},
	[
		{
			title: "My Music (SoundCloud)",
			description: "I create electronic, ambient, funky, and drumcore music. I focus on improving my skills and exploring new sounds. Check out my tracks and enjoy the beats!",
			image: "img/Soundcloud-card.jpg",
			link: "https://soundcloud.com/wartets",
			reverse: false,
			keywords: ["music", "electronic", "ambient", "soundcloud", "creative"]
		},
		{
			title: "My Music (YouTube)",
			description: "Explore my music projects on YouTube.",
			link: "https://www.youtube.com/@Wartets",
			noImage: true,
			keywords: ["music", "youtube", "electronic", "drumcore", "creative"]
		}
	]
];

const particlesConfig = {
	winter: {
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
					"distance": 100,
					"duration": 1
				},
				"push": {
					"particles_nb": 4
				}
			}
		}
	},
	summer: {
		"particles": {
			"number": { "value": 150, "density": { "enable": true, "value_area": 800 } },
			"color": { "value": "#ff8a8a" },
			"opacity": { "value": 0.6, "random": true },
			"size": { "value": 4, "random": true },
			"move": { "speed": 3, "direction": "none" }
		},
		"interactivity": {
			"events": {
				"onhover": { "enable": true, "mode": "bubble" },
				"onclick": { "enable": true, "mode": "grab" }
			},
			"modes": {
				"bubble": { "distance": 250, "size": 6, "duration": 2 }
			}
		}
	},
	spring: {
		"particles": {
			"number": {
			"value": 250,
			"density": {
				"enable": true,
				"value_area": 1200
			}
			},
			"color": {
			"value": "#ff9ef2"
			},
			"shape": {
			"type": "circle",
			"stroke": {
				"width": 0,
				"color": "#fff"
			}
			},
			"opacity": {
			"value": 0.6,
			"random": true,
			"anim": {
				"enable": true,
				"speed": 2,
				"opacity_min": 0.2,
				"sync": false
			}
			},
			"size": {
			"value": 2.5,
			"random": true,
			"anim": {
				"enable": true,
				"speed": 5,
				"size_min": 0.3,
				"sync": false
			}
			},
			"line_linked": {
				"enable": true,
				"distance": 120,
				"color": "#ffd0f9",
				"opacity": 0.3,
				"width": 1
			},
			"move": {
				"enable": true,
				"speed": 1.8, 
				"direction": "top-right",
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
					"mode": "grab"
				},
				"onclick": {
					"enable": true,
					"mode": "bubble"
				}
			},
			"modes": {
				"grab": {
					"distance": 200,
					"line_linked": {
					"opacity": 0.8
					}
				},
				"bubble": {
					"size": 8,
					"distance": 150,
					"duration": 2
				}
			}
		}
	},
	autumn: {
		"particles": {
			"number": {
			"value": 120,
			"density": {
				"enable": true,
				"value_area": 600
			}
			},
			"color": {
			"value": "#e67e22"
			},
			"shape": {
			"type": "circle",
			"stroke": {
				"width": 0,
				"color": "#d35400"
			}
			},
			"opacity": {
			"value": 0.8,
			"random": false,
			"anim": {
				"enable": true,
				"speed": 0.5,
				"opacity_min": 0.1,
				"sync": false
			}
			},
			"size": {
			"value": 8,
			"random": true,
			"anim": {
				"enable": true,
				"speed": 1,
				"size_min": 3,
				"sync": false
			}
			},
			"line_linked": {
			"enable": false
			},
			"move": {
			"enable": true,
			"speed": 0.8,
			"direction": "bottom",
			"random": false,
			"straight": false,
			"out_mode": "destroy",
			"bounce": false
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
					"mode": "remove"
				}
			},
			"modes": {
				"repulse": {
					"distance": 50,
					"duration": 1
				},
				"remove": {
					"particles_nb": 15
				}
			}
		}
	}
};

function renderProjects(filteredProjects = null) {
	const main = document.querySelector('main');
	const linkDisplay = document.getElementById('link-display');
	
	document.querySelectorAll('.project-card, .double-section').forEach(el => el.remove());
	
	const projectsToRender = filteredProjects || projects;
	
	projectsToRender.forEach(item => {
		if (Array.isArray(item)) {
			const doubleSection = document.createElement('div');
			doubleSection.className = 'double-section';
			
			item.forEach(project => {
				if (project.visible !== false) {
					doubleSection.appendChild(createCard(project));
				}
			});
			
			if (doubleSection.children.length > 0) {
				main.insertBefore(doubleSection, linkDisplay);
			}
		} else {
			if (item.visible !== false) {
				main.insertBefore(createCard(item), linkDisplay);
			}
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

function scrollToTop() {
	window.scrollTo({
		top: 0,
		behavior: "smooth"
	});
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

function generateSeasonalElements(season) {
	const containerMap = {
		summer: 'background-bushes',
		spring: 'background-flowers',
		autumn: 'background-leaves',
		winter: 'background-snowflakes'
	};
	
	const containerId = containerMap[season];
	if (!containerId) return;
	
	const container = document.getElementById(containerId);
	container.innerHTML = '';
	
	const numElements = Math.floor(Math.random() * 40) + 10;
	
	const bodyWidth = document.body.clientWidth;
	const bodyHeight = document.body.clientHeight;
	
	for (let i = 0; i < numElements; i++) {
		const element = document.createElement('img');
		element.draggable = false;
		
		if (season === 'summer') {
			element.src = 'img/bush.png';
			element.classList.add('bush');
		} else if (season === 'spring') {
			element.src = 'img/flower.png';
			element.classList.add('flower');
		} else if (season === 'autumn') {
			element.src = 'img/leaf.png';
			element.classList.add('leaf');
		} else if (season === 'winter') {
			element.src = 'img/snowflake.png';
			element.classList.add('snowflake');
		}
		
		const randomX = bodyWidth / 2 * (1 + 0.8 * (Math.random() * 2 - 1));
		const randomY = bodyHeight / 2 * (1 + 0.8 * (Math.random() * 2 - 1));
		const randomScale = Math.random() < 0.5 ? 1 : -1;
		const randomSize = Math.random() * 0.5 + 0.5;
		const randomRot = Math.random() * 360;

		element.style.left = `${randomX}px`;
		element.style.top = `${randomY}px`;
		element.style.transform = `scaleX(${randomScale}) scale(${randomSize}) rotate(${randomRot}deg)`;

		container.appendChild(element);
		
		addHoverEffect(element);
	}
}

function applySeasonalElements(season) {
	['bushes', 'snowflakes', 'flowers', 'leaves'].forEach(type => {
		const container = document.getElementById(`background-${type}`);
		if (container) container.classList.add('hidden');
	});
	
	const activeContainers = {
		summer: 'bushes',
		spring: 'flowers',
		autumn: 'leaves',
		winter: 'snowflakes'
	};
	
	const activeType = activeContainers[season];
	if (activeType) {
		const activeContainer = document.getElementById(`background-${activeType}`);
		if (activeContainer) {
			activeContainer.classList.remove('hidden');
		}
		generateSeasonalElements(season)
	}
}

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

function initParticles(theme) {
	const container = document.getElementById('particles-js');
	while (container.firstChild) {
		container.removeChild(container.firstChild);
	}
	
	window.pJSDom = [];
	
	particlesJS("particles-js", particlesConfig[theme]);
}

function setupThemeSelector() {
	const savedTheme = localStorage.getItem('selectedTheme');
	const currentTheme = savedTheme || getCurrentSeason();
	
	document.body.className = `theme-${currentTheme}`;
	initParticles(currentTheme);
	applySeasonalElements(currentTheme);
	
	window.addEventListener('resize', () => {
		adjustContainerHeight();
		applySeasonalElements(
			localStorage.getItem('selectedTheme') || getCurrentSeason()
		);
	});
	
	document.querySelectorAll('.theme-btn').forEach(btn => {
		btn.addEventListener('click', () => {
			const theme = btn.classList[1];
			document.body.className = `theme-${theme}`;
			localStorage.setItem('selectedTheme', theme);
			initParticles(theme);
			applySeasonalElements(theme);
		});
	});
}

function filterProjects(searchTerm) {
	const normalizedTerm = searchTerm.toLowerCase().trim();
	
	projects.forEach(item => {
		if (Array.isArray(item)) {
			item.forEach(project => {
				const text = (project.title + ' ' + project.description + ' ' + project.keywords.join(' ')).toLowerCase();
				project.visible = text.includes(normalizedTerm);
			});
		} else {
			const text = (item.title + ' ' + item.description + ' ' + item.keywords.join(' ')).toLowerCase();
			item.visible = text.includes(normalizedTerm);
		}
	});
	
	return projects.filter(item => {
		if (Array.isArray(item)) {
			return item.some(project => project.visible);
		}
		return item.visible;
	});
}

function adjustContainerHeight() {
    const main = document.querySelector('main');
    const body = document.body;
    const html = document.documentElement;
    
    const contentHeight = main.scrollHeight;
    const windowHeight = window.innerHeight;
    
    if (document.body.classList.contains('search-active')) {
        main.style.minHeight = 'auto';
        body.style.minHeight = '100vh';
        html.style.minHeight = '100vh';
    } 
    else if (contentHeight < windowHeight) {
        main.style.minHeight = `${windowHeight}px`;
        body.style.minHeight = `${windowHeight}px`;
        html.style.minHeight = `${windowHeight}px`;
    } else {
        main.style.minHeight = '';
        body.style.minHeight = '';
        html.style.minHeight = '';
    }
}

document.addEventListener('DOMContentLoaded', function () {
	renderProjects();
	
	setupThemeSelector();
	
	const title = document.querySelector('header h1');
	const letters = title.innerText.split('');
	const linkDisplay = document.getElementById('link-display');
	const backToTopButton = document.getElementById("back-to-top");

	title.innerHTML = '';
	letters.forEach(letter => {
		const span = document.createElement('span');
		span.innerText = letter;
		title.appendChild(span);
	});

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

	window.addEventListener("scroll", () => {
		if (window.scrollY > 200) {
			backToTopButton.classList.remove("hidden");
		} else {
			backToTopButton.classList.add("hidden");
		}
	});

	const searchContainer = document.createElement('div');
	searchContainer.id = 'search-container';
	const searchInput = document.createElement('input');
	searchInput.type = 'text';
	searchInput.id = 'search-input';
	searchInput.placeholder = 'Search for a project...';
	searchContainer.appendChild(searchInput);
	document.querySelector('header').appendChild(searchContainer);

	searchInput.addEventListener('input', function() {
		categoryFilter.value = 'all';
		const term = this.value;
		
		if (term.length > 0) {
			document.body.classList.add('search-active');
			
			const filtered = filterProjects(term);
			renderProjects(filtered);
			
			const firstCard = document.querySelector('.project-card');
			if (firstCard) {
				firstCard.scrollIntoView({ 
					behavior: 'smooth', 
					block: 'start' 
				});
			}
		} else {
			document.body.classList.remove('search-active');
			
			projects.forEach(item => {
				if (Array.isArray(item)) {
					item.forEach(p => delete p.visible);
				} else {
					delete item.visible;
				}
			});
			renderProjects();
		}
		adjustContainerHeight();
	});

	const categoryFilter = document.createElement('select');
	categoryFilter.id = 'category-filter';

	const defaultOption = document.createElement('option');
	defaultOption.value = 'all';
	defaultOption.textContent = 'All categories';
	categoryFilter.appendChild(defaultOption);

	const allKeywords = new Set();
	projects.forEach(item => {
		if (Array.isArray(item)) {
			item.forEach(project => {
				project.keywords.forEach(kw => allKeywords.add(kw));
			});
		} else {
			item.keywords.forEach(kw => allKeywords.add(kw));
		}
	});

	const sortedKeywords = [...allKeywords].sort();
	sortedKeywords.forEach(keyword => {
		const option = document.createElement('option');
		option.value = keyword;
		option.textContent = keyword;
		categoryFilter.appendChild(option);
	});

	searchContainer.appendChild(categoryFilter);

	categoryFilter.addEventListener('change', function() {
		searchInput.value = '';
		const selectedCategory = this.value;
		const filteredProjects = filterProjectsByCategory(selectedCategory);
		renderProjects(filteredProjects);
		adjustContainerHeight();
	});

	function filterProjectsByCategory(category) {
		if (category === 'all') {
			document.body.classList.remove('search-active');
			return projects;
		}
		document.body.classList.add('search-active');
		
		return projects.filter(item => {
			if (Array.isArray(item)) {
				return item.some(project => project.keywords.includes(category));
			}
			return item.keywords.includes(category);
		});
	}
});
