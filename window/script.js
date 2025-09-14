const projects = [
	{
		title: "Computational Chemistry",
		date: "Oct 2025",
		timestamp: "2025-10-12T20:07:00Z",
		github: "https://github.com/wartets/ComputationalChemistry",
		description: "This website is an interactive tool to explore molecular geometry.It shows how atoms and electrons arrange through simple forces like attraction and repulsion.",
		icon: "../img/ComputationalChemistry-card.png",
		link: "https://wartets.github.io/ComputationalChemistry/",
		keywords: ["chemistry", "simulation", "javascript", "css", "html", "molecular", "visualization", "educational", "interactive", "computational", "science", "atoms", "electrons", "bonds", "geometry"]
	},
	{
		title: "Match 3",
		date: "Sept 2025",
		timestamp: "2025-09-04T08:00:00Z",
		github: "https://github.com/wartets/Match3",
		description: "A classic gem-matching puzzle game with smooth animations and swap mechanics. Create lines of three or more matching colors to score points in this implementation.",
		icon: "../img/Match3-card.png",
		link: "https://wartets.github.io/Match3/",
		keywords: ["puzzle", "match-3", "game", "gem matching", "swap mechanics", "animations", "javascript", "css", "html"]
	},
	{
		title: "Labyrinthe",
		date: "Aug 2025",
		timestamp: "2025-08-19T08:00:00Z",
		github: "https://github.com/wartets/Labyrinthe",
		description: "This project explores maze solving through a highly customizable genetic/evolutionary algorithm approach. (fr)",
		icon: "../img/Labyrinthe-card.png",
		link: "https://wartets.github.io/Labyrinthe/",
		keywords: ["maze", "genetic algorithm", "evolutionary", "pathfinding", "simulation", "javascript", "css", "html"]
	},
	{
		title: "Autoroutes",
		date: "Aug 2025",
		timestamp: "2025-08-13T08:00:00Z",
		github: "https://github.com/wartets/Autoroutes",
		description: "A web simulation that procedurally generates a highway system. It uses simple rules to create a complex, winding road network, showcasing how basic algorithms can lead to intricate, emergent patterns. (fr)",
		icon: "../img/Autoroutes-card.png",
		link: "https://wartets.github.io/Autoroutes/",
		keywords: ["procedural generation", "highway", "road network", "simulation", "emergence", "javascript", "css", "html"]
	},
	{
		title: "Mercury-Redstone",
		date: "Jul 2025",
		timestamp: "2025-07-07T08:00:00Z",
		github: "https://github.com/wartets/Mercury",
		description: "Simulation of the May 5, 1961 Mercury-Redstone mission. (fr)",
		icon: "../img/Mercury-card.png",
		link: "https://wartets.github.io/Mercury/",
		keywords: ["space", "simulation", "historical", "physics", "rocket", "javascript", "css", "html"]
	},
	{
		title: "Caustiques",
		date: "Jul 2025",
		timestamp: "2025-07-08T08:00:00Z",
		github: "https://github.com/wartets/Caustiques",
		description: "Simulation of caustic lines due to refraction of a corrugated glass base. (fr)",
		icon: "../img/Caustiques-card.png",
		link: "https://wartets.github.io/Caustiques/",
		keywords: ["optics", "simulation", "refraction", "caustics", "light", "javascript", "css", "html"]
	},
	{
		title: "Fractals",
		date: "Jul 2025",
		timestamp: "2025-07-11T08:00:00Z",
		github: "https://github.com/wartets/Fractals",
		description: "Generating fractal plant structures with affine transformations. (fr)",
		icon: "../img/Fractals-card.png",
		link: "https://wartets.github.io/Fractals/",
		keywords: ["fractals", "generative", "plants", "affine transformations", "L-system", "javascript", "css", "html"]
	},
	{
		title: "Lenia Web",
		date: "Jul 2025",
		timestamp: "2025-07-01T08:00:00Z",
		github: "https://github.com/wartets/Lenia-Web",
		description: "A dynamic web implementation of the Lenia system, modeling artificial organisms evolving via parameterized growth fields.",
		icon: "../img/LeniaWeb-card.png",
		link: "https://wartets.github.io/Lenia-Web/",
		keywords: ["cellular automata", "simulation", "emergence", "patterns", "Lenia", "Python", "css", "html"]
	},
	{
		title: "Curve Fitting",
		date: "Jun 2025",
		timestamp: "2025-06-01T08:00:00Z",
		github: "https://github.com/wartets/Curve-Fitting",
		description: "This project illustrates thin-plate splines, a smooth surface interpolation technique used in geometry and machine learning.",
		icon: "../img/Curve-Fitting-card.png",
		link: "https://wartets.github.io/Curve-Fitting/",
		keywords: ["math", "interpolation", "splines", "visualization", "javascript", "css", "html"],
		show: false
	},
	{
		title: "Procedural Art Gen.",
		date: "May 2025",
		timestamp: "2025-05-01T08:00:00Z",
		github: "https://github.com/wartets/Procedural-Art",
		description: "A seed-based generative art system creating unique visual patterns. Explore geometric formations, organic fractals, and abstract compositions that remain reproducible.",
		icon: "../img/Procedural-Art-card.png",
		link: "https://wartets.github.io/Procedural-Art/",
		keywords: ["generative art", "procedural", "fractals", "patterns", "creative coding", "javascript", "css", "html"]
	},
	{
		title: "Space Trip Game 3D",
		date: "Apr 2025",
		timestamp: "2025-04-01T08:00:00Z",
		github: "https://github.com/wartets/Space-Trip-3D",
		description: "Survival game for a small ship in a swarm of asteroids, where you have to score as many points as possible by destroying them and staying alive as long as possible.",
		icon: "../img/Spaceship-card.png",
		link: "https://wartets.github.io/Space-Trip-3D/",
		keywords: ["3D", "game", "space", "asteroids", "three.js", "survival", "javascript", "css", "html"]
	},
	{
		title: "Space Trip Game 2D",
		date: "Mar 2025",
		timestamp: "2025-03-01T08:00:00Z",
		github: "https://github.com/wartets/Space-Trip-2D",
		description: "\"Simplified\" 2D version of the Space Trip game.",
		icon: "../img/Space-Trip-2D.png",
		link: "https://wartets.github.io/Space-Trip-2D/",
		keywords: ["2D", "game", "space", "asteroids", "canvas", "arcade", "javascript", "css", "html"]
	},
	{
		title: "Sudoku",
		date: "Feb 2025",
		timestamp: "2025-02-01T08:00:00Z",
		github: "https://github.com/wartets/Sudoku",
		description: "A customizable web-based Sudoku game that allows you to adjust both the grid size and difficulty level. It features real-time input validation, providing an interactive and engaging puzzle-solving experience.",
		icon: "../img/Sudoku-card.png",
		link: "https://wartets.github.io/Sudoku/",
		keywords: ["puzzle", "game", "logic", "interactive", "validation", "javascript", "css", "html"]
	},
	{
		title: "Chess Game",
		date: "Jan 2025",
		timestamp: "2025-01-01T08:00:00Z",
		github: "https://github.com/wartets/Chess-Game",
		description: "An Interactive chess game, offering classic and random board setups. It allows custom piece placement, and personalized size grid.",
		icon: "../img/Chess-card.png",
		link: "https://wartets.github.io/Chess-Game/",
		keywords: ["chess", "game", "strategy", "board game", "interactive", "javascript", "css", "html"]
	},
	{
		title: "Minesweeper",
		date: "Dec 2024",
		timestamp: "2024-12-01T08:00:00Z",
		github: "https://github.com/wartets/Demineur",
		description: "A simple mine-clearing game in javascript. Discover all the squares without touching a mine! Adjust the grid size and number of mines to personalize the experience.",
		icon: "../img/Demineur-card.png",
		link: "https://wartets.github.io/Demineur/",
		keywords: ["game", "puzzle", "grid", "mines", "classic", "javascript", "css", "html"]
	},
	{
		title: "Julia-Set",
		date: "Nov 2024",
		timestamp: "2024-11-01T12:00:00Z",
		github: "https://github.com/wartets/Julia-Set",
		description: "Explore the beauty of Julia sets with interactive controls to adjust equations and rendering settings. Create custom stunning fractal visuals in \"real-time\" with a simple interface.",
		icon: "../img/JuilaSet-card.png",
		link: "https://wartets.github.io/Julia-Set/",
		keywords: ["fractals", "math", "visualization", "interactive", "complex numbers", "javascript", "css", "html"]
	},
	{
		title: "Bird-cloud",
		date: "Nov 2024",
		timestamp: "2024-11-01T08:00:00Z",
		github: "https://github.com/wartets/Bird-cloud",
		description: "An interactive simulation of flocking behavior in birds, based on the Boids model. Adjust parameters like speed, vision radius, and randomness to see how individual rules create collective patterns.",
		icon: "../img/BirdCloud-card.png",
		link: "https://wartets.github.io/Bird-cloud/",
		keywords: ["simulation", "boids", "flocking", "emergence", "interactive", "javascript", "css", "html"]
	},
	{
		title: "N-Body-Problem",
		date: "Oct 2024",
		timestamp: "2024-10-01T08:00:00Z",
		github: "https://github.com/wartets/N-Body-Problem",
		description: "A physics simulation of an N-body system with gravity, collisions, and electromagnetism. Customize object properties like mass, charge, and position to observe how forces shape their motion.",
		icon: "../img/NBodyProblem-card.png",
		link: "https://wartets.github.io/N-Body-Problem/",
		keywords: ["physics", "simulation", "gravity", "electromagnetism", "n-body", "javascript", "css", "html"]
	},
	{
		title: "Lenia-Simulation",
		date: "Jun 2024",
		timestamp: "2024-06-01T08:00:00Z",
		github: "https://github.com/wartets/Lenia-Simulation",
		description: "Discover Lenia, a continuous cellular automaton that extends Conway's Game of Life. Explore lifelike, emergent patterns in a world of smooth transitions and endless complexity.",
		icon: "../img/LeniaSimulation-card.png",
		link: "https://wartets.github.io/Lenia-Simulation/",
		keywords: ["cellular automata", "simulation", "emergence", "patterns", "Lenia", "Python", "css", "html"]
	},
	{
		title: "Solar-System",
		date: "May 2023",
		timestamp: "2024-05-01T08:00:00Z",
		github: "https://github.com/wartets/SolarSystem",
		description: "A 3D solar system visualization. Interact with the planets and their orbits in a dynamic and immersive interface.",
		icon: "../img/SolarSystem-card.png",
		link: "https://wartets.github.io/SolarSystem/",
		keywords: ["3D", "space", "simulation", "planets", "orbits", "Java", "GeogebraScript", "GeoGebra", "css", "html"]
	},
	{
		title: "My Music (SoundCloud)",
		description: "I create electronic, ambient, funky, and drumcore music. I focus on improving my skills and exploring new sounds. Check out my tracks and enjoy the beats!",
		icon: "../img/Soundcloud-card.jpg",
		link: "https://soundcloud.com/wartets",
		keywords: ["music", "electronic", "ambient", "soundcloud", "creative"]
	},
	{
		title: "My Music (YouTube)",
		description: "Explore my music projects on YouTube.",
		link: "https://www.youtube.com/@Wartets",
		noicon: true,
		keywords: ["music", "youtube", "electronic", "drumcore", "creative"]
	}
];

let openWindows = {};
let zIndexCounter = 100;
let activeWindow = null;
let selectedIcons = new Set();

document.addEventListener('DOMContentLoaded', () => {
    renderDesktopIcons(projects);
    setupStartButton();
    setupTaskbarClock();
    renderStartMenuCategories();
    setupDesktopContextMenu();
});

function renderDesktopIcons(projectsToRender) {
    const container = document.getElementById('project-icons-container');
    container.innerHTML = '';

    projectsToRender.forEach(project => {
        const icon = document.createElement('div');
        icon.className = 'project-icon';
        icon.dataset.projectId = project.title.replace(/\s/g, '-');

        const img = document.createElement('img');
        img.src = project.icon || 'https://img.icons8.com/fluency/48/file.png';
        img.alt = project.title;
        icon.appendChild(img);

        const span = document.createElement('span');
        span.textContent = project.title;
        icon.appendChild(span);

        icon.addEventListener('click', (e) => {
            handleIconClick(e, icon, project);
        });
        icon.addEventListener('dblclick', () => openProjectWindow(project));

        container.appendChild(icon);
    });
}

function handleIconClick(e, icon, project) {
    if (e.ctrlKey) {
        if (selectedIcons.has(project.title)) {
            selectedIcons.delete(project.title);
            icon.classList.remove('selected');
        } else {
            selectedIcons.add(project.title);
            icon.classList.add('selected');
        }
    } else {
        clearIconSelections();
        selectedIcons.add(project.title);
        icon.classList.add('selected');
    }
}

function clearIconSelections() {
    document.querySelectorAll('.project-icon.selected').forEach(selectedIcon => {
        selectedIcon.classList.remove('selected');
    });
    selectedIcons.clear();
}

function createXPWindow(id, title, contentHTML, initialWidth = 600, initialHeight = 400) {
    const windowArea = document.getElementById('window-area');
    const existingWindow = document.getElementById(id);
    if (existingWindow) {
        bringWindowToFront(existingWindow);
        if (existingWindow.classList.contains('minimized')) {
            unminimizeWindow(existingWindow);
        }
        return existingWindow;
    }

    const win = document.createElement('div');
    win.id = id;
    win.className = 'xp-window opening';
    win.style.width = `${initialWidth}px`;
    win.style.height = `${initialHeight}px`;
    win.style.left = `${Math.random() * (window.innerWidth - initialWidth)}px`;
    win.style.top = `${Math.random() * (window.innerHeight - initialHeight - 40)}px`;
    win.style.opacity = '0';
    win.style.zIndex = ++zIndexCounter;

    win.innerHTML = `
        <div class="xp-window-header">
            <span class="title">${title}</span>
            <div class="xp-window-buttons">
                <div class="xp-window-button minimize-btn" title="Minimize">_</div>
                <div class="xp-window-button maximize-btn" title="Maximize">□</div>
                <div class="xp-window-button close-btn" title="Close">X</div>
            </div>
        </div>
        <div class="xp-window-content">${contentHTML}</div>
    `;

    windowArea.appendChild(win);
    openWindows[id] = win;

    makeWindowDraggable(win);
    setupWindowButtons(win, id);

    setTimeout(() => {
        win.classList.remove('opening');
        win.classList.add('opened');
        win.style.opacity = '1';
    }, 50);

    win.addEventListener('mousedown', () => bringWindowToFront(win));
    setActiveWindow(win);
    addTaskbarButton(id, title);
    return win;
}

function makeWindowDraggable(win) {
    const header = win.querySelector('.xp-window-header');
    let isDragging = false;
    let offsetX, offsetY;

    header.addEventListener('mousedown', (e) => {
        if (e.target.closest('.xp-window-buttons')) return;
        isDragging = true;
        win.style.cursor = 'grabbing';
        win.style.transition = 'none';

        const rect = win.getBoundingClientRect();
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;

        bringWindowToFront(win);
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;

        let newLeft = e.clientX - offsetX;
        let newTop = e.clientY - offsetY;

        const desktop = document.getElementById('desktop');
        const desktopRect = desktop.getBoundingClientRect();
        const winRect = win.getBoundingClientRect();

        newLeft = Math.max(desktopRect.left, Math.min(newLeft, desktopRect.right - winRect.width));
        newTop = Math.max(desktopRect.top, Math.min(newTop, desktopRect.bottom - winRect.height));

        win.style.left = `${newLeft}px`;
        win.style.top = `${newTop}px`;
        win.style.transform = 'none';
    });

    document.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            win.style.cursor = 'grab';
            win.style.transition = '';
        }
    });
}

function setupWindowButtons(win, id) {
    win.querySelector('.minimize-btn').addEventListener('click', () => minimizeWindow(win, id));
    win.querySelector('.maximize-btn').addEventListener('click', () => maximizeWindow(win));
    win.querySelector('.close-btn').addEventListener('click', () => closeWindow(win, id));
}

function setActiveWindow(win) {
    if (activeWindow) {
        activeWindow.querySelector('.xp-window-header').classList.add('inactive');
    }
    activeWindow = win;
    win.querySelector('.xp-window-header').classList.remove('inactive');

    document.querySelectorAll('.taskbar-window-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    const taskbarBtn = document.querySelector(`.taskbar-window-btn[data-window-id="${win.id}"]`);
    if (taskbarBtn) {
        taskbarBtn.classList.add('active');
    }
}

function bringWindowToFront(win) {
    if (parseInt(win.style.zIndex) < zIndexCounter) {
        win.style.zIndex = ++zIndexCounter;
    }
    setActiveWindow(win);
}

function minimizeWindow(win, id) {
    win.classList.add('minimizing');
    win.dataset.originalLeft = win.style.left;
    win.dataset.originalTop = win.style.top;
    win.dataset.originalWidth = win.style.width;
    win.dataset.originalHeight = win.style.height;

    const taskbarBtn = document.querySelector(`.taskbar-window-btn[data-window-id="${id}"]`);
    const taskbarRect = taskbarBtn.getBoundingClientRect();

    win.style.left = `${taskbarRect.left + taskbarRect.width / 2}px`;
    win.style.top = `${taskbarRect.top + taskbarRect.height / 2}px`;
    win.style.width = '0px';
    win.style.height = '0px';
    win.style.opacity = '0';
    win.style.transform = 'scale(0.1)';

    win.addEventListener('transitionend', function handler() {
        win.classList.add('hidden');
        win.classList.remove('minimizing');
        win.classList.add('minimized');
        win.removeEventListener('transitionend', handler);
    });

    const taskbarBtnElement = document.querySelector(`#taskbar-windows .taskbar-window-btn[data-window-id="${id}"]`);
    if (taskbarBtnElement) {
        taskbarBtnElement.classList.remove('active');
    }
    if (activeWindow === win) {
        activeWindow = null;
    }
}

function unminimizeWindow(win) {
    win.classList.remove('hidden', 'minimized');
    win.classList.add('opening');

    win.style.left = win.dataset.originalLeft;
    win.style.top = win.dataset.originalTop;
    win.style.width = win.dataset.originalWidth;
    win.style.height = win.dataset.originalHeight;
    win.style.opacity = '1';
    win.style.transform = 'none';

    win.addEventListener('transitionend', function handler() {
        win.classList.remove('opening');
        win.removeEventListener('transitionend', handler);
    });
    bringWindowToFront(win);
}

function maximizeWindow(win) {
    if (win.classList.contains('maximized')) {
        win.style.top = win.dataset.restoreTop;
        win.style.left = win.dataset.restoreLeft;
        win.style.width = win.dataset.restoreWidth;
        win.style.height = win.dataset.restoreHeight;
        win.classList.remove('maximized');
    } else {
        win.dataset.restoreTop = win.style.top;
        win.dataset.restoreLeft = win.style.left;
        win.dataset.restoreWidth = win.style.width;
        win.dataset.restoreHeight = win.style.height;

        win.style.top = '0';
        win.style.left = '0';
        win.style.width = '100vw';
        win.style.height = 'calc(100vh - 40px)';
        win.style.transform = 'none';
        win.classList.add('maximized');
    }
}

function closeWindow(win, id) {
    win.classList.add('minimizing');
    win.style.opacity = '0';
    win.style.transform = 'scale(0.1)';

    win.addEventListener('transitionend', function handler() {
        win.remove();
        delete openWindows[id];
        removeTaskbarButton(id);
        if (activeWindow === win) {
            activeWindow = null;
        }
        win.removeEventListener('transitionend', handler);
    });
}

function addTaskbarButton(id, title) {
    const taskbarWindows = document.getElementById('taskbar-windows');
    const btn = document.createElement('div');
    btn.className = 'taskbar-window-btn';
    btn.dataset.windowId = id;
    btn.textContent = title;
    taskbarWindows.appendChild(btn);

    btn.addEventListener('click', () => {
        const win = document.getElementById(id);
        if (win) {
            if (win.classList.contains('minimized')) {
                unminimizeWindow(win);
            } else {
                if (activeWindow === win) {
                    minimizeWindow(win, id);
                } else {
                    bringWindowToFront(win);
                }
            }
        }
    });
}

function removeTaskbarButton(id) {
    const btn = document.querySelector(`#taskbar-windows .taskbar-window-btn[data-window-id="${id}"]`);
    if (btn) {
        btn.remove();
    }
}

function openProjectWindow(project) {
    const id = `window-${project.title.replace(/\s/g, '-')}`;
    const content = `
        <h3>${project.title}</h3>
        ${project.icon ? `<img src="${project.icon}" alt="${project.title} preview" class="project-image-preview" style="max-width: 300px; max-height: 200px;">` : ''}
        <p class="project-description">${project.description}</p>
        <div class="project-links">
            <a href="${project.link}" target="_blank" class="xp-button-small">Open Project</a>
            ${project.github ? `<a href="${project.github}" target="_blank" class="xp-button-small">GitHub</a>` : ''}
        </div>
    `;
    createXPWindow(id, project.title, content, 600, 450);
}

function setupStartButton() {
    const startButton = document.getElementById('start-button');
    const startMenu = document.getElementById('start-menu');
    const taskbarStartButton = document.getElementById('taskbar-start-button');

    function toggleStartMenu() {
        startMenu.classList.toggle('hidden');
        if (!startMenu.classList.contains('hidden')) {
            startMenu.style.zIndex = ++zIndexCounter;
            startButton.classList.add('active');
            taskbarStartButton.classList.add('active');
        } else {
            startButton.classList.remove('active');
            taskbarStartButton.classList.remove('active');
        }
    }

    startButton.addEventListener('click', toggleStartMenu);
    taskbarStartButton.addEventListener('click', toggleStartMenu);

    document.addEventListener('mousedown', (e) => {
        if (!startMenu.classList.contains('hidden') &&
            !startMenu.contains(e.target) &&
            !startButton.contains(e.target) &&
            !taskbarStartButton.contains(e.target)) {
            startMenu.classList.add('hidden');
            startButton.classList.remove('active');
            taskbarStartButton.classList.remove('active');
        }
    });

    document.getElementById('start-menu-links').addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (link && link.dataset.action === 'all-projects') {
            e.preventDefault();
            startMenu.classList.add('hidden');
            startButton.classList.remove('active');
            taskbarStartButton.classList.remove('active');
            openAllProjectsFolder();
        }
    });
}

function openAllProjectsFolder() {
    const id = 'window-all-projects-folder';
    const title = 'My Projects';
    const contentHTML = `
        <div id="all-projects-folder-content" style="display: flex; flex-wrap: wrap; gap: 10px; padding: 5px;">
        </div>
    `;
    const folderWindow = createXPWindow(id, title, contentHTML, 700, 500);

    const folderContent = folderWindow.querySelector('#all-projects-folder-content');
    projects.forEach(project => {
        const icon = document.createElement('div');
        icon.className = 'project-icon';
        icon.style.width = '60px';
        icon.style.height = '70px';
        icon.style.color = 'var(--xp-font-color)';
        icon.style.textShadow = 'none';

        const img = document.createElement('img');
        img.src = project.icon || 'https://img.icons8.com/fluency/48/file.png';
        img.alt = project.title;
        img.style.width = '40px';
        img.style.height = '40px';
        icon.appendChild(img);

        const span = document.createElement('span');
        span.textContent = project.title;
        span.style.fontSize = '10px';
        icon.appendChild(span);

        icon.addEventListener('dblclick', () => openProjectWindow(project));
        folderContent.appendChild(icon);
    });
}

function setupTaskbarClock() {
    const clockElement = document.getElementById('taskbar-clock');

    function updateClock() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        clockElement.textContent = `${hours}:${minutes}`;
    }

    updateClock();
    setInterval(updateClock, 1000);
}

function renderStartMenuCategories() {
    const categoriesList = document.getElementById('start-menu-categories');
    categoriesList.innerHTML = '';
    const allKeywords = new Set();
    projects.forEach(p => p.keywords.forEach(kw => allKeywords.add(kw)));

    const sortedKeywords = [...allKeywords].sort();
    sortedKeywords.forEach(keyword => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = '#';
        a.textContent = keyword.charAt(0).toUpperCase() + keyword.slice(1);
        a.dataset.category = keyword;
        a.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('start-menu').classList.add('hidden');
            document.getElementById('start-button').classList.remove('active');
            document.getElementById('taskbar-start-button').classList.remove('active');
            openFilteredProjectsFolder(keyword);
        });
        li.appendChild(a);
        categoriesList.appendChild(li);
    });
}

function openFilteredProjectsFolder(category) {
    const id = `window-category-${category.replace(/\s/g, '-')}`;
    const title = `${category.charAt(0).toUpperCase() + category.slice(1)} Projects`;
    const contentHTML = `
        <div id="filtered-projects-folder-content" style="display: flex; flex-wrap: wrap; gap: 10px; padding: 5px;">
        </div>
    `;
    const folderWindow = createXPWindow(id, title, contentHTML, 700, 500);

    const folderContent = folderWindow.querySelector('#filtered-projects-folder-content');
    const filteredProjects = projects.filter(p => p.keywords.includes(category));

    filteredProjects.forEach(project => {
        const icon = document.createElement('div');
        icon.className = 'project-icon';
        icon.style.width = '60px';
        icon.style.height = '70px';
        icon.style.color = 'var(--xp-font-color)';
        icon.style.textShadow = 'none';

        const img = document.createElement('img');
        img.src = project.icon || 'https://img.icons8.com/fluency/48/file.png';
        img.alt = project.title;
        img.style.width = '40px';
        img.style.height = '40px';
        icon.appendChild(img);

        const span = document.createElement('span');
        span.textContent = project.title;
        span.style.fontSize = '10px';
        icon.appendChild(span);

        icon.addEventListener('dblclick', () => openProjectWindow(project));
        folderContent.appendChild(icon);
    });
}

function setupDesktopContextMenu() {
    const desktop = document.getElementById('desktop');
    const contextMenu = document.getElementById('context-menu');

    desktop.addEventListener('contextmenu', (e) => {
        e.preventDefault();

        clearIconSelections();

        contextMenu.style.left = `${e.clientX}px`;
        contextMenu.style.top = `${e.clientY}px`;
        contextMenu.classList.remove('hidden');
        contextMenu.style.zIndex = ++zIndexCounter;
    });

    document.addEventListener('click', (e) => {
        if (!contextMenu.contains(e.target)) {
            contextMenu.classList.add('hidden');
        }
    });

    contextMenu.addEventListener('click', (e) => {
        const action = e.target.dataset.action;
        if (action) {
            handleContextMenuAction(action);
            contextMenu.classList.add('hidden');
        }
    });
}

function handleContextMenuAction(action) {
    switch (action) {
        case 'refresh':
            renderDesktopIcons(projects);
            break;
        case 'arrange-icons':
            arrangeIconsAlphabetically();
            break;
        case 'display-settings':
            openDisplaySettings();
            break;
        default:
            console.log(`Context menu action: ${action}`);
    }
}

function arrangeIconsAlphabetically() {
    const container = document.getElementById('project-icons-container');
    const icons = Array.from(container.children);

    icons.sort((a, b) => {
        const titleA = a.querySelector('span').textContent.toLowerCase();
        const titleB = b.querySelector('span').textContent.toLowerCase();
        return titleA.localeCompare(titleB);
    });

    icons.forEach((icon, index) => {
        const col = Math.floor(index / (Math.floor((window.innerHeight - 40 - 20) / 95)));
        const row = index % (Math.floor((window.innerHeight - 40 - 20) / 95));

        icon.style.position = 'absolute';
        icon.style.left = `${10 + col * 85}px`;
        icon.style.top = `${10 + row * 95}px`;
    });
}

function openDisplaySettings() {
    const id = 'window-display-settings';
    const title = 'Display Properties';
    const contentHTML = `
        <div style="padding: 10px;">
            <h4>Background</h4>
            <div style="display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 20px;">
                <img src="../img/windows_xp_original-wallpaper-1920x1080.jpg" data-wallpaper="../img/windows_xp_original-wallpaper-1920x1080.jpg" style="width: 100px; height: 75px; border: 1px solid var(--xp-border-dark); cursor: pointer;" class="wallpaper-thumbnail active">
                <img src="https://wallpapers.com/images/high/windows-xp-bliss-field-desktop-926w6i3z9f8r0p8k.webp" data-wallpaper="https://wallpapers.com/images/high/windows-xp-bliss-field-desktop-926w6i3z9f8r0p8k.webp" style="width: 100px; height: 75px; border: 1px solid var(--xp-border-dark); cursor: pointer;" class="wallpaper-thumbnail">
                <img src="https://i.pinimg.com/originals/a0/0b/4f/a00b4f05c3b1e3b6d0c4d4f8f4a76c66.jpg" data-wallpaper="https://i.pinimg.com/originals/a0/0b/4f/a00b4f05c3b1e3b6d0c4d4f8f4a76c66.jpg" style="width: 100px; height: 75px; border: 1px solid var(--xp-border-dark); cursor: pointer;" class="wallpaper-thumbnail">
            </div>
            <button id="apply-wallpaper-btn" class="xp-button">Apply</button>
        </div>
    `;
    const displayWindow = createXPWindow(id, title, contentHTML, 400, 350);

    let selectedWallpaper = document.getElementById('desktop').style.backgroundImage.slice(5, -2);
    const wallpaperThumbnails = displayWindow.querySelectorAll('.wallpaper-thumbnail');

    wallpaperThumbnails.forEach(thumbnail => {
        if (thumbnail.dataset.wallpaper === selectedWallpaper) {
            thumbnail.classList.add('active');
        }
        thumbnail.addEventListener('click', () => {
            wallpaperThumbnails.forEach(t => t.classList.remove('active'));
            thumbnail.classList.add('active');
            selectedWallpaper = thumbnail.dataset.wallpaper;
        });
    });

    displayWindow.querySelector('#apply-wallpaper-btn').addEventListener('click', () => {
        document.getElementById('desktop').style.backgroundImage = `url('${selectedWallpaper}')`;
    });
}