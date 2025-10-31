const particlesConfig = {
	winter: {
		"particles": {
			"number": {
				"value": 150,
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
			"value": 150,
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
	const now = new Date();
	
	document.querySelectorAll('.project-card, .double-section').forEach(el => el.remove());
	
	const projectsToRender = filteredProjects || projects;
	let globalIndex = 0;

	projectsToRender.forEach(item => {
		const now = new Date();
		if (Array.isArray(item)) {
			const doubleSection = document.createElement('div');
			doubleSection.className = 'double-section';

			item.forEach(project => {
				const projectDate = new Date(project.timestamp || project.date);

				if (project.show == false || projectDate > now) return;

				if (project.visible !== false) {
					const card = createCard(project, globalIndex % 2 === 1);
					doubleSection.appendChild(card);
					globalIndex++;
				}
			});

			if (doubleSection.children.length > 0) {
				main.insertBefore(doubleSection, linkDisplay);
			}
		} else {
			const projectDate = new Date(item.timestamp || item.date);

			if (item.show == false || projectDate > now) return;

			if (item.visible !== false) {
				const card = createCard(item, globalIndex % 2 === 1);
				main.insertBefore(card, linkDisplay);
				globalIndex++;
			}
		}
	});
}

function createCard(project, isReversed) {
	const card = document.createElement('div');
	card.className = 'project-card';
	card.dataset.link = project.link;
	if (isReversed) card.classList.add('reverse');
	if (project.noImage) card.classList.add('no-image');

	if (project.timestamp) {
		const now = new Date();
		const projectDate = new Date(project.timestamp);
		const diffTime = Math.abs(now - projectDate);
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
		
		if (diffDays <= 30.4375 * 3/4) {
			const newLabel = document.createElement('div');
			newLabel.className = 'new-label';
			newLabel.textContent = 'NEW';
			card.appendChild(newLabel);
		}
	}
	
	if (project.github) {
	  const githubMatch = project.github.match(/github\.com\/([^/]+)\/([^/]+)/);
	  if (githubMatch) {
		const [, owner, repo] = githubMatch;
		fetch(`https://api.github.com/repos/${owner}/${repo}`)
		  .then(response => response.json())
		  .then(data => {
			const pushedAt = new Date(data.pushed_at);
			const postedAt = new Date(project.timestamp);
			const now = new Date();
			const msIn30Days = 30.4375 * 24 * 60 * 60 * 1000;

			const ageSincePosted = now - postedAt;
			const ageSinceUpdate = now - pushedAt;

			if (ageSincePosted > msIn30Days && ageSinceUpdate < msIn30Days) {
			  const updatedLabel = document.createElement('div');
			  updatedLabel.className = 'updated-label';
			  updatedLabel.textContent = 'UPDATED';
			  card.appendChild(updatedLabel);
			}
		  })
		  .catch(err => {
			console.warn(`GitHub recovery failed for ${project.title}`, err);
		  });
	  }
	}

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

function updateScrollbarColors() {
	const thumbColor = getComputedStyle(document.documentElement).getPropertyValue('--scrollbar-thumb').trim();
	const trackColor = getComputedStyle(document.documentElement).getPropertyValue('--scrollbar-track').trim();
	
	document.documentElement.style.scrollbarColor = `${thumbColor} ${trackColor}`;
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
			updateScrollbarColors();
		});
	});
}

function processProjects({ searchTerm = '', category = 'all', sortValue = 'date-desc' } = {}) {
	const cloned = projects.map(item => 
		Array.isArray(item) 
			? item.map(p => ({ ...p })) 
			: { ...item }
	);

	const term = searchTerm.toLowerCase().trim();
	const isSearching = term.length > 0;
	const isCategorized = category !== 'all';

	let filtered = cloned.filter(item => {
		const matchText = p => (
			(p.title + ' ' + p.description + ' ' + (p.keywords || []).join(' '))
				.toLowerCase()
				.includes(term)
		);
		const matchCategory = p =>
			category === 'all' || (p.keywords || []).includes(category);

		if (Array.isArray(item)) {
			const kept = item.filter(p => {
				return (
					(!isSearching || matchText(p)) &&
					(!isCategorized || matchCategory(p))
				);
			});
			if (kept.length) {
				kept.forEach(p => (p.visible = true));
				return true;
			}
			return false;
		} else {
			const ok = 
				(!isSearching || matchText(item)) &&
				(!isCategorized || matchCategory(item));
			if (ok) item.visible = true;
			return ok;
		}
	});

	const getMaxTimestamp = el => {
		if (Array.isArray(el)) {
			return Math.max(
				...el.map(p => (p.timestamp ? new Date(p.timestamp).getTime() : 0))
			);
		}
		return el.timestamp ? new Date(el.timestamp).getTime() : 0;
	};
	const getTitle = el =>
		(Array.isArray(el) ? el[0].title : el.title).toLowerCase();

	filtered.sort((a, b) => {
		switch (sortValue) {
			case 'date-asc':
				return getMaxTimestamp(a) - getMaxTimestamp(b);
			case 'date-desc':
				return getMaxTimestamp(b) - getMaxTimestamp(a);
			case 'title-asc':
				return getTitle(a).localeCompare(getTitle(b));
			case 'title-desc':
				return getTitle(b).localeCompare(getTitle(a));
			default:
				return 0;
		}
	});

	filtered.forEach(item => {
		if (Array.isArray(item)) {
			item.sort((a, b) => {
				if (sortValue.startsWith('date')) {
					const ta = a.timestamp ? new Date(a.timestamp).getTime() : 0;
					const tb = b.timestamp ? new Date(b.timestamp).getTime() : 0;
					return sortValue === 'date-asc' ? ta - tb : tb - ta;
				} else {
					return sortValue === 'title-asc'
						? a.title.toLowerCase().localeCompare(b.title.toLowerCase())
						: b.title.toLowerCase().localeCompare(a.title.toLowerCase());
				}
			});
		}
	});

	return filtered;
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
	updateScrollbarColors();
	
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
	
	const sortContainer = document.createElement('div');
	sortContainer.id = 'sort-container';
	document.querySelector('header').appendChild(sortContainer);

	searchInput.addEventListener('input', function() {
		categoryFilter.value = 'all';
		const toRender = processProjects({
			searchTerm: this.value,
			category:   'all',
			sortValue:  sortSelect.value
		});
		document.body.classList.toggle('search-active', this.value.length > 0);
		renderProjects(toRender);
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
		const toRender = processProjects({
			searchTerm: '',
			category:   this.value,
			sortValue:  sortSelect.value
		});
		document.body.classList.toggle('search-active', this.value !== 'all');
		renderProjects(toRender);
		adjustContainerHeight();
	});

	const sortSelect = document.createElement('select');
	sortSelect.id = 'sort-select';

	const sortOptions = [
		{ value: 'date-desc', text: 'Newest first' },
		{ value: 'date-asc', text: 'Oldest first' },
		{ value: 'title-asc', text: 'A → Z' },
		{ value: 'title-desc', text: 'Z → A' }
	];

	sortOptions.forEach(opt => {
		const option = document.createElement('option');
		option.value = opt.value;
		option.textContent = opt.text;
		sortSelect.appendChild(option);
	});
	
	searchContainer.appendChild(sortSelect);
	
	sortSelect.addEventListener('change', function() {
		const toRender = processProjects({
			searchTerm: searchInput.value,
			category:   categoryFilter.value,
			sortValue:  this.value
		});
		renderProjects(toRender);
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
