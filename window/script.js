let openWindows = {};
let zIndexCounter = 100;
let activeWindow = null;
let selectedIcons = new Set();
let copiedItem = null;
let cutItem = null;

document.addEventListener('DOMContentLoaded', () => {
	renderDesktopIcons(projects);
	setupStartButton();
	setupTaskbarClock();
	renderStartMenuCategories();
	setupDesktopContextMenu();
	setupQuickLaunchIcons();
	document.getElementById('show-desktop-icon').addEventListener('click', showDesktop);
});

function renderDesktopIcons(projectsToRender) {
	const container = document.getElementById('project-icons-container');
	container.innerHTML = '';

	projectsToRender.forEach(projectGroup => {
		const projectsInGroup = Array.isArray(projectGroup) ? projectGroup : [projectGroup];

		projectsInGroup.forEach(project => {
			if (typeof project === 'object' && project !== null && project.title) {
				const icon = document.createElement('div');
				icon.className = 'project-icon';
				icon.dataset.projectId = project.title.replace(/\s/g, '-');
				icon.dataset.iconData = JSON.stringify({
					id: project.title.replace(/\s/g, '-'),
					name: project.title,
					icon: project.icon,
					type: 'project',
					timestamp: project.timestamp
				});
				icon.dataset.type = 'project';

				const img = document.createElement('img');
				img.src = project.icon || 'https://img.icons8.com/fluency/48/file.png';
				img.alt = project.title;
				icon.appendChild(img);

				const span = document.createElement('span');
				span.textContent = project.title;
				icon.appendChild(span);

				icon.addEventListener('click', (e) => {
					handleIconClick(e, icon);
				});
				icon.addEventListener('dblclick', () => openProjectWindow(project));
				icon.addEventListener('contextmenu', (e) => {
					e.stopPropagation();
					handleIconContextMenu(e, icon);
				});

				container.appendChild(icon);
			}
		});
	});
	renderCustomIcons();
	arrangeIcons('none');
}

function handleIconContextMenu(e, icon, project) {
	e.preventDefault();
	clearIconSelections();
	icon.classList.add('selected');
	selectedIcons.add(icon);
	currentContextMenuTarget = icon;
	showContextMenu(e);
	updateContextMenuItems(icon);
}

function handleIconClick(e, icon) {
	if (e.ctrlKey) {
		if (icon.classList.contains('selected')) {
			icon.classList.remove('selected');
			selectedIcons.delete(icon);
		} else {
			icon.classList.add('selected');
			selectedIcons.add(icon);
		}
	} else {
		clearIconSelections();
		icon.classList.add('selected');
		selectedIcons.add(icon);
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

	win.addEventListener('mousedown', (e) => {
		if (!e.target.closest('.xp-window-header')) {
			bringWindowToFront(win);
		}
	});
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
		newTop = Math.max(desktopRect.top, Math.min(newTop, desktopRect.bottom - winRect.height - 40));

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
	if (activeWindow && activeWindow !== win) {
		activeWindow.querySelector('.xp-window-header').classList.add('inactive');
		const prevTaskbarBtn = document.querySelector(`.taskbar-window-btn[data-window-id="${activeWindow.id}"]`);
		if (prevTaskbarBtn) {
			prevTaskbarBtn.classList.remove('active');
		}
	}
	activeWindow = win;
	win.querySelector('.xp-window-header').classList.remove('inactive');

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
	let targetLeft = 0;
	let targetTop = window.innerHeight;
	let targetWidth = 0;
	let targetHeight = 0;

	if (taskbarBtn) {
		const taskbarRect = taskbarBtn.getBoundingClientRect();
		targetLeft = taskbarRect.left;
		targetTop = taskbarRect.top;
		targetWidth = taskbarRect.width;
		targetHeight = taskbarRect.height;
	}

	win.style.left = `${targetLeft}px`;
	win.style.top = `${targetTop}px`;
	win.style.width = `${targetWidth}px`;
	win.style.height = `${targetHeight}px`;
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
		win.querySelector('.maximize-btn').textContent = '□';
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
		win.querySelector('.maximize-btn').textContent = '❐';
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
		<p class="project-longDescrition">${project.longDescrition}</p>
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

	startButton.addEventListener('click', (e) => {
		e.stopPropagation();
		toggleStartMenu();
	});
	taskbarStartButton.addEventListener('click', (e) => {
		e.stopPropagation();
		toggleStartMenu();
	});

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
	
	projects.forEach(projectGroup => {
		const projectsInGroup = Array.isArray(projectGroup) ? projectGroup : [projectGroup];

		projectsInGroup.forEach(project => {
			if (typeof project === 'object' && project !== null && project.title) {
				const icon = document.createElement('div');
				icon.className = 'project-icon';
				icon.style.width = '60px';
				icon.style.height = '70px';
				icon.style.color = 'var(--xp-font-color)';
				icon.style.textShadow = 'none';
				icon.dataset.projectId = project.title.replace(/\s/g, '-');
				icon.dataset.iconData = JSON.stringify({
					id: project.title.replace(/\s/g, '-'),
					name: project.title,
					icon: project.icon,
					type: 'project',
					timestamp: project.timestamp
				});
				icon.dataset.type = 'project';

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
				icon.addEventListener('click', (e) => handleIconClick(e, icon));
				icon.addEventListener('contextmenu', (e) => {
					e.stopPropagation();
					handleIconContextMenu(e, icon);
				});
				folderContent.appendChild(icon);
			}
		});
	});
}

function setupTaskbarClock() {
	const clockElement = document.getElementById('taskbar-clock');

	function updateClock() {
		const now = new Date();
		const hours = String(now.getHours()).padStart(2, '0');
		const minutes = String(now.getMinutes()).padStart(2, '0');
		const secondes = String(now.getSeconds()).padStart(2, '0');
		clockElement.textContent = `${hours}:${minutes}:${secondes}`;
	}

	updateClock();
	setInterval(updateClock, 500);
}

function renderStartMenuCategories() {
	const categoriesList = document.getElementById('start-menu-categories');
	categoriesList.innerHTML = '';
	const allKeywords = new Set();

	projects.forEach(projectGroup => {
		const projectsInGroup = Array.isArray(projectGroup) ? projectGroup : [projectGroup];

		projectsInGroup.forEach(p => {
			if (typeof p === 'object' && p !== null && p.keywords) {
				p.keywords.forEach(kw => allKeywords.add(kw));
			}
		});
	});

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
	
	// Filtrer les projets en aplatissant d'abord le tableau
	const flattenedProjects = [];
	projects.forEach(projectGroup => {
		const projectsInGroup = Array.isArray(projectGroup) ? projectGroup : [projectGroup];
		projectsInGroup.forEach(p => {
			if (typeof p === 'object' && p !== null && p.keywords) {
				flattenedProjects.push(p);
			}
		});
	});

	const filteredProjects = flattenedProjects.filter(p => p.keywords.includes(category));

	filteredProjects.forEach(project => {
		const icon = document.createElement('div');
		icon.className = 'project-icon';
		icon.style.width = '60px';
		icon.style.height = '70px';
		icon.style.color = 'var(--xp-font-color)';
		icon.style.textShadow = 'none';
		icon.dataset.projectId = project.title.replace(/\s/g, '-');
		icon.dataset.iconData = JSON.stringify({
			id: project.title.replace(/\s/g, '-'),
			name: project.title,
			icon: project.icon,
			type: 'project',
			timestamp: project.timestamp
		});
		icon.dataset.type = 'project';

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
		icon.addEventListener('click', (e) => handleIconClick(e, icon));
		icon.addEventListener('contextmenu', (e) => {
			e.stopPropagation();
			handleIconContextMenu(e, icon);
		});
		folderContent.appendChild(icon);
	});
}

function setupDesktopContextMenu() {
	const desktop = document.getElementById('desktop');
	const contextMenu = document.getElementById('context-menu');

	document.addEventListener('contextmenu', (e) => {
		e.preventDefault();

		let targetIcon = e.target.closest('.project-icon');
		let targetFolderContent = e.target.closest('.folder-content');
		let targetWindowContent = e.target.closest('.xp-window-content'); // Ajouté

		if (targetIcon) {
			handleIconContextMenu(e, targetIcon);
		} else if (targetFolderContent) {
			clearIconSelections();
			currentContextMenuTarget = targetFolderContent;
			showContextMenu(e);
			updateContextMenuItems(null);
		} else if (targetWindowContent && !targetIcon && !targetFolderContent) { // Si clic droit dans une fenêtre mais pas sur un dossier/icône
			clearIconSelections();
			currentContextMenuTarget = targetWindowContent; // Le contenu de la fenêtre devient la cible
			showContextMenu(e);
			updateContextMenuItems(null);
		} else if (e.target === desktop || e.target.id === 'project-icons-container') {
			clearIconSelections();
			currentContextMenuTarget = desktop;
			showContextMenu(e);
			updateContextMenuItems(null);
		} else {
			contextMenu.classList.add('hidden');
		}
	});

	document.addEventListener('click', (e) => {
		if (!contextMenu.classList.contains('hidden') && !contextMenu.contains(e.target)) {
			contextMenu.classList.add('hidden');
		}
	});

	contextMenu.querySelectorAll('li:not(.has-submenu)').forEach(item => {
		item.addEventListener('click', (e) => {
			const action = e.target.dataset.action;
			if (action) {
				handleContextMenuAction(action);
			}
			contextMenu.classList.add('hidden');
		});
	});

	const newSubmenuTrigger = contextMenu.querySelector('.has-submenu');
	newSubmenuTrigger.addEventListener('mouseenter', () => {
		contextMenu.querySelector('.submenu').classList.remove('hidden');
	});
	newSubmenuTrigger.addEventListener('mouseleave', (event) => {
		if (!contextMenu.querySelector('.submenu').contains(event.relatedTarget)) {
			contextMenu.querySelector('.submenu').classList.add('hidden');
		}
	});

	contextMenu.querySelectorAll('.submenu li').forEach(item => {
		item.addEventListener('click', (e) => {
			const action = e.target.dataset.action;
			if (action) {
				handleContextMenuAction(action);
			}
			contextMenu.classList.add('hidden');
			contextMenu.querySelector('.submenu').classList.add('hidden');
		});
	});
}

function showContextMenu(e) {
	const contextMenu = document.getElementById('context-menu');
	let posX = e.clientX;
	let posY = e.clientY;

	const menuWidth = contextMenu.offsetWidth;
	const menuHeight = contextMenu.offsetHeight;
	const viewportWidth = window.innerWidth;
	const viewportHeight = window.innerHeight;

	if (posX + menuWidth > viewportWidth) {
		posX = viewportWidth - menuWidth;
	}
	if (posY + menuHeight > viewportHeight - 40) {
		posY = viewportHeight - 40 - menuHeight;
	}

	contextMenu.style.left = `${posX}px`;
	contextMenu.style.top = `${posY}px`;
	contextMenu.style.zIndex = ++zIndexCounter;
	contextMenu.classList.remove('hidden');
}

function handleIconContextMenu(e, icon) {
	e.preventDefault();
	icon.classList.add('selected');
	selectedIcons.add(icon);
	currentContextMenuTarget = icon;
	showContextMenu(e);
	updateContextMenuItems(icon);
}

function updateContextMenuItems(targetIcon) {
	const contextMenu = document.getElementById('context-menu');
	const openItem = contextMenu.querySelector('[data-action="open"]');
	const cutItemMenu = contextMenu.querySelector('[data-action="cut"]');
	const copyItemMenu = contextMenu.querySelector('[data-action="copy"]');
	const pasteItemMenu = contextMenu.querySelector('[data-action="paste"]');
	const deleteItemMenu = contextMenu.querySelector('[data-action="delete"]');
	const renameItemMenu = contextMenu.querySelector('[data-action="rename"]');
	const newSubmenuTrigger = contextMenu.querySelector('.has-submenu');
	const separatorAfterNew = newSubmenuTrigger.nextElementSibling;

	openItem.classList.add('hidden');
	cutItemMenu.classList.add('hidden');
	copyItemMenu.classList.add('hidden');
	pasteItemMenu.classList.add('hidden');
	deleteItemMenu.classList.add('hidden');
	renameItemMenu.classList.add('hidden');
	newSubmenuTrigger.classList.remove('hidden');
	separatorAfterNew.classList.remove('hidden');

	if (targetIcon) {
		openItem.classList.remove('hidden');
		cutItemMenu.classList.remove('hidden');
		copyItemMenu.classList.remove('hidden');
		deleteItemMenu.classList.remove('hidden');
		renameItemMenu.classList.remove('hidden');
		newSubmenuTrigger.classList.add('hidden');
		separatorAfterNew.classList.add('hidden');
	}

	if (window.copiedItem || window.cutItem) {
		pasteItemMenu.classList.remove('hidden');
	}
}

function handleContextMenuAction(action) {
	const selectedIcon = selectedIcons.values().next().value;
	switch (action) {
		case 'open':
			if (selectedIcon) {
				const iconData = JSON.parse(selectedIcon.dataset.iconData);
				if (iconData.type === 'project') {
					const project = projects.find(p => p.title.replace(/\s/g, '-') === iconData.id);
					if (project) {
						openProjectWindow(project);
					}
				} else if (iconData.type === 'folder') {
					createXPWindow(`folder-${iconData.id}`, iconData.name, `<div class="folder-content" data-folder-id="${iconData.id}" style="display: flex; flex-wrap: wrap; gap: 10px; padding: 5px;"></div>`, 500, 300);
					renderFolderContent(iconData.id);
				} else if (iconData.type === 'text-document') {
					createXPWindow(`text-doc-${iconData.id}`, iconData.name, `<textarea style="width: 100%; height: 100%; border: none; resize: none; font-family: 'Roboto Mono', monospace;"></textarea>`, 600, 400);
				}
			}
			break;
		case 'cut':
			if (selectedIcon) {
				window.cutItem = selectedIcon;
				window.copiedItem = null;
				selectedIcon.style.opacity = '0.5';
			}
			break;
		case 'copy':
			if (selectedIcon) {
				window.copiedItem = selectedIcon;
				window.cutItem = null;
			}
			break;
		case 'paste':
			let pasteTargetElement = document.getElementById('desktop');
			if (currentContextMenuTarget && currentContextMenuTarget.dataset.type === 'folder') {
				pasteTargetElement = currentContextMenuTarget.closest('.xp-window-content').querySelector('.folder-content');
			} else if (currentContextMenuTarget && currentContextMenuTarget.classList.contains('folder-content')) {
				pasteTargetElement = currentContextMenuTarget;
			}
			pasteItem(e.clientX, e.clientY, pasteTargetElement);
			break;
		case 'delete':
			deleteSelectedIcons();
			break;
		case 'rename':
			if (selectedIcon) {
				renameIcon(selectedIcon);
			}
			break;
		case 'refresh':
			renderDesktopIcons(projects);
			break;
		case 'arrange-icons-name':
			arrangeIcons('name');
			break;
		case 'arrange-icons-date':
			arrangeIcons('date');
			break;
		case 'line-up-icons':
			arrangeIcons('none');
			break;
		case 'new-folder':
			createNewFolder();
			break;
		case 'new-shortcut':
			alert('Feature not implemented yet: Create New Shortcut');
			break;
		case 'new-text-document':
			createNewTextDocument();
			break;
		case 'display-settings':
			openDisplaySettings();
			break;
		case 'personalize':
			openPersonalizeSettings();
			break;
		default:
			console.log(`Context menu action: ${action}`);
	}
	clearIconSelections();
}

function pasteItem(x, y, targetContainer) {
	const desktop = document.getElementById('desktop');
	const container = targetContainer || document.getElementById('project-icons-container');
	const isPastingToDesktop = (container === desktop);

	let pasteTarget = container;
	let targetFolderId = null;

	if (window.cutItem) {
		const currentContainer = window.cutItem.parentElement;

		const currentParentContainer = window.cutItem.closest('.folder-content') || document.getElementById('project-icons-container');
		const cutItemData = JSON.parse(window.cutItem.dataset.iconData);

		if (targetContainer && targetContainer.classList.contains('folder-content')) { 
			const targetFolderId = targetContainer.dataset.folderId;
			if (targetContainer && targetContainer.classList.contains('folder-content')) {
				const targetFolderId = targetContainer.dataset.folderId;
				if (currentParentContainer === targetContainer) {
					window.cutItem.style.opacity = '1';
				} else {
					window.cutItem.remove();
					targetContainer.appendChild(window.cutItem);
					window.cutItem.style.opacity = '1';
					window.cutItem.style.position = '';
					window.cutItem.style.left = '';
					window.cutItem.style.top = '';

					// Remove from previous location
					if (currentParentContainer.id === 'project-icons-container') {
						removeCustomIcon(cutItemData.id);
					} else if (currentParentContainer.classList.contains('folder-content')) {
						removeIconFromFolderData(currentParentContainer.dataset.folderId, cutItemData.id);
					}
					// Add to new location
					addIconToFolderData(targetFolderId, cutItemData);
					renderFolderContent(targetFolderId);
				}
			}
		} else { // Pasting to desktop
			if (currentParentContainer !== document.getElementById('project-icons-container')) {
				window.cutItem.remove();
				document.getElementById('project-icons-container').appendChild(window.cutItem);
				window.cutItem.style.opacity = '1';
				window.cutItem.style.position = '';
				window.cutItem.style.left = '';
				window.style.top = '';
				arrangeIcons('none');
				if (currentParentContainer.classList.contains('folder-content')) {
					removeIconFromFolderData(currentParentContainer.dataset.folderId, cutItemData.id);
				}
				saveCustomIcon(cutItemData); // Add back to top-level customIcons
			} else {
				window.cutItem.style.opacity = '1';
				arrangeIcons('none');
			}
		}
		window.cutItem = null;
	} else if (window.copiedItem) {
		const copiedItemData = JSON.parse(window.copiedItem.dataset.iconData);
		const clonedIcon = window.copiedItem.cloneNode(true);
		clonedIcon.style.opacity = '1';
		clonedIcon.style.position = '';
		clonedIcon.style.left = '';
		clonedIcon.style.top = '';

		let newIconData = { ...copiedItemData
		};
		let originalName = newIconData.name.replace(/\.txt$/, '');
		let copyNumber = 1;
		let newName = `${originalName} - Copy`;
		if (newIconData.type === 'text-document') newName += '.txt';

		while (document.querySelector(`[data-project-id="${newName.replace(/\s/g, '-')}-copy-${copyNumber}"]`)) {
			copyNumber++;
			newName = `${originalName} - Copy (${copyNumber})`;
			if (newIconData.type === 'text-document') newName += '.txt';
		}

		newIconData.name = newName;
		newIconData.id = newName.replace(/\s/g, '-');
		clonedIcon.querySelector('span').textContent = newIconData.name;
		clonedIcon.dataset.projectId = newIconData.id;
		clonedIcon.dataset.iconData = JSON.stringify(newIconData);

		clonedIcon.addEventListener('click', (e) => handleIconClick(e, clonedIcon));
		clonedIcon.addEventListener('dblclick', () => {
			if (newIconData.type === 'project') {
				const project = projects.find(p => p.title.replace(/\s/g, '-') === newIconData.id);
				if (project) {
					openProjectWindow(project);
				}
			} else if (newIconData.type === 'folder') {
				createXPWindow(`folder-${newIconData.id}`, newIconData.name, `<div class="folder-content" data-folder-id="${newIconData.id}" style="display: flex; flex-wrap: wrap; gap: 10px; padding: 5px;"></div>`, 500, 300);
				renderFolderContent(newIconData.id);
			} else if (newIconData.type === 'text-document') {
				createXPWindow(`text-doc-${newIconData.id}`, newIconData.name, `<textarea style="width: 100%; height: 100%; border: none; resize: none; font-family: 'Roboto Mono', monospace;"></textarea>`, 600, 400);
			}
		});
		clonedIcon.addEventListener('contextmenu', (e) => {
			e.stopPropagation();
			handleIconContextMenu(e, clonedIcon);
		});

		if (targetContainer && targetContainer.classList.contains('folder-content')) {
			const targetFolderId = targetContainer.dataset.folderId;
			targetContainer.appendChild(clonedIcon);
			addIconToFolderData(targetFolderId, newIconData);
			renderFolderContent(targetFolderId);
		} else {
			document.getElementById('project-icons-container').appendChild(clonedIcon);
			saveCustomIcon(newIconData);
			arrangeIcons('none');
		}
	}
	window.copiedItem = null;
	window.cutItem = null;
}

function addIconToFolderData(folderId, iconData) {
	let customIcons = JSON.parse(localStorage.getItem('customIcons')) || [];
	const folderIndex = customIcons.findIndex(icon => icon.id === folderId && icon.type === 'folder');

	if (folderIndex !== -1) {
		if (!customIcons[folderIndex].content) {
			customIcons[folderIndex].content = [];
		}
		customIcons[folderIndex].content.push(iconData);
		localStorage.setItem('customIcons', JSON.stringify(customIcons));
	}
}

function deleteSelectedIcons() {
	if (confirm(`Are you sure you want to delete ${selectedIcons.size} item(s)?`)) {
		selectedIcons.forEach(icon => {
			const iconData = JSON.parse(icon.dataset.iconData);
			const parentFolderContent = icon.closest('.folder-content');

			if (parentFolderContent) { // Icon is inside a folder
				removeIconFromFolderData(parentFolderContent.dataset.folderId, iconData.id);
				renderFolderContent(parentFolderContent.dataset.folderId);
			} else { // Icon is on the desktop
				icon.remove();
				removeCustomIcon(iconData.id);
			}
		});
		selectedIcons.clear();
	}
}

function renameIcon(icon) {
	const currentName = icon.querySelector('span').textContent;
	const newName = prompt('Enter new name:', currentName);
	if (newName && newName !== currentName) {
		icon.querySelector('span').textContent = newName;
		const oldProjectId = icon.dataset.projectId;
		const newProjectId = newName.replace(/\s/g, '-');
		icon.dataset.projectId = newProjectId;

		let customIcons = JSON.parse(localStorage.getItem('customIcons')) || [];
		const index = customIcons.findIndex(item => item.id === oldProjectId);
		if (index !== -1) {
			customIcons[index].id = newProjectId;
			customIcons[index].name = newName;
			localStorage.setItem('customIcons', JSON.stringify(customIcons));
		}

		const iconData = JSON.parse(icon.dataset.iconData);
		iconData.id = newProjectId;
		iconData.name = newName;
		icon.dataset.iconData = JSON.stringify(iconData);
	}
}

function arrangeIcons(sortBy) {
	const container = document.getElementById('project-icons-container');
	const icons = Array.from(container.children);

	icons.sort((a, b) => {
		const titleA = a.querySelector('span').textContent.toLowerCase();
		const titleB = b.querySelector('span').textContent.toLowerCase();

		if (sortBy === 'name') {
			return titleA.localeCompare(titleB);
		} else if (sortBy === 'date') {
			const iconDataA = JSON.parse(a.dataset.iconData);
			const iconDataB = JSON.parse(b.dataset.iconData);

			const dateA = iconDataA.timestamp ? new Date(iconDataA.timestamp) : new Date(0);
			const dateB = iconDataB.timestamp ? new Date(iconDataB.timestamp) : new Date(0);
			return dateB.getTime() - dateA.getTime();
		}
		return 0;
	});

	icons.forEach((icon, index) => {
		const iconHeight = 95;
		const iconWidth = 85;
		const desktopUsableHeight = window.innerHeight - 40 - 20;
		const iconsPerColumn = Math.floor(desktopUsableHeight / iconHeight);

		const col = Math.floor(index / iconsPerColumn);
		const row = index % iconsPerColumn;

		icon.style.position = 'absolute';
		icon.style.left = `${10 + col * iconWidth}px`;
		icon.style.top = `${10 + row * iconHeight}px`;
	});
}

let customIcons = JSON.parse(localStorage.getItem('customIcons')) || [];

function saveCustomIcon(iconData) {
	customIcons.push(iconData);
	localStorage.setItem('customIcons', JSON.stringify(customIcons));
}

function removeCustomIcon(id) {
	customIcons = customIcons.filter(icon => icon.id !== id);
	localStorage.setItem('customIcons', JSON.stringify(customIcons));
}

function renderCustomIcons() {
	const container = document.getElementById('project-icons-container');
	customIcons.forEach(iconData => {
		const icon = document.createElement('div');
		icon.className = 'project-icon';
		icon.dataset.projectId = iconData.id;
		icon.dataset.type = iconData.type;
		icon.dataset.iconData = JSON.stringify(iconData);
		icon.dataset.type = iconData.type;

		const img = document.createElement('img');
		img.src = iconData.icon;
		img.alt = iconData.name;
		icon.appendChild(img);

		const span = document.createElement('span');
		span.textContent = iconData.name;
		icon.appendChild(span);

		icon.addEventListener('click', (e) => handleIconClick(e, icon));
		icon.addEventListener('dblclick', () => {
			if (iconData.type === 'folder') {
				createXPWindow(`folder-${iconData.id}`, iconData.name, `<p>This folder is empty.</p>`, 500, 300);
			} else if (iconData.type === 'text-document') {
				createXPWindow(`text-doc-${iconData.id}`, iconData.name, `<textarea style="width: 100%; height: 100%; border: none; resize: none; font-family: 'Roboto Mono', monospace;"></textarea>`, 600, 400);
			}
		});
		icon.addEventListener('contextmenu', (e) => {
			e.stopPropagation();
			handleIconContextMenu(e, icon);
			const folderContentParent = icon.closest('.folder-content');
			if (folderContentParent) {
				currentContextMenuTarget = folderContentParent;
			} else {
				currentContextMenuTarget = icon;
			}
		});

		container.appendChild(icon);
	});
}

function renderFolderContent(folderId) {
	const folderWindowContent = document.querySelector(`.folder-content[data-folder-id="${folderId}"]`);
	if (!folderWindowContent) return;

	folderWindowContent.innerHTML = '';
	const folderData = customIcons.find(icon => icon.id === folderId && icon.type === 'folder');

	if (folderData && folderData.content) {
		folderData.content.forEach(itemData => {
			const icon = document.createElement('div');
			icon.className = 'project-icon';
			icon.style.width = '60px';
			icon.style.height = '70px';
			icon.style.color = 'var(--xp-font-color)';
			icon.style.textShadow = 'none';
			icon.dataset.projectId = itemData.id;
			icon.dataset.type = itemData.type;
			icon.dataset.iconData = JSON.stringify(itemData);

			const img = document.createElement('img');
			img.src = itemData.icon || 'https://img.icons8.com/fluency/48/file.png';
			img.alt = itemData.name;
			img.style.width = '40px';
			img.style.height = '40px';
			icon.appendChild(img);

			const span = document.createElement('span');
			span.textContent = itemData.name;
			span.style.fontSize = '10px';
			icon.appendChild(span);

			icon.addEventListener('dblclick', () => {
				if (itemData.type === 'project') {
					const project = projects.find(p => p.title.replace(/\s/g, '-') === itemData.id);
					if (project) {
						openProjectWindow(project);
					}
				} else if (itemData.type === 'folder') {
					createXPWindow(`folder-${itemData.id}`, itemData.name, `<div class="folder-content" data-folder-id="${itemData.id}" style="display: flex; flex-wrap: wrap; gap: 10px; padding: 5px;"></div>`, 500, 300);
					renderFolderContent(itemData.id);
				} else if (itemData.type === 'text-document') {
					createXPWindow(`text-doc-${itemData.id}`, itemData.name, `<textarea style="width: 100%; height: 100%; border: none; resize: none; font-family: 'Roboto Mono', monospace;"></textarea>`, 600, 400);
				}
			});
			icon.addEventListener('click', (e) => handleIconClick(e, icon));
			icon.addEventListener('contextmenu', (e) => {
				e.stopPropagation();
				handleIconContextMenu(e, icon);
			});
			folderWindowContent.appendChild(icon);
		});
	}
}

function createNewFolder() {
	const folderName = prompt('Enter folder name:', 'New Folder');
	if (!folderName) return;

	const id = folderName.replace(/\s/g, '-');
	saveCustomIcon({ id: id, name: folderName, icon: 'https://img.icons8.com/fluent/48/folder-invoices.png', type: 'folder', content: [] });
	renderDesktopIcons(projects);
}

function removeIconFromFolderData(folderId, iconIdToRemove) {
	let customIcons = JSON.parse(localStorage.getItem('customIcons')) || [];
	const folderIndex = customIcons.findIndex(icon => icon.id === folderId && icon.type === 'folder');

	if (folderIndex !== -1) {
		let folderContent = customIcons[folderIndex].content || [];
		customIcons[folderIndex].content = folderContent.filter(item => item.id !== iconIdToRemove);
		localStorage.setItem('customIcons', JSON.stringify(customIcons));
	}
}

function createNewTextDocument() {
	const docName = prompt('Enter document name:', 'New Text Document');
	if (!docName) return;

	const id = docName.replace(/\s/g, '-');
	saveCustomIcon({ id: id, name: docName + '.txt', icon: 'https://img.icons8.com/color/48/txt.png', type: 'text-document' });
	renderDesktopIcons(projects);
}

function openDisplaySettings() {
	const id = 'window-display-settings';
	const title = 'Display Properties';
	const contentHTML = `
		<div style="padding: 10px;">
			<h4>Background</h4>
			<div style="display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 20px;">
				<img src="../img/windows_xp_original-wallpaper-1920x1080.jpg" data-wallpaper="../img/windows_xp_original-wallpaper-1920x1080.jpg" style="width: 100px; height: 75px; border: 1px solid var(--xp-border-dark); cursor: pointer;" class="wallpaper-thumbnail">
				<img src="https://images7.alphacoders.com/115/thumb-1920-1158141.jpg" data-wallpaper="https://images7.alphacoders.com/115/thumb-1920-1158141.jpg" style="width: 100px; height: 75px; border: 1px solid var(--xp-border-dark); cursor: pointer;" class="wallpaper-thumbnail">
				<img src="https://e1.pxfuel.com/desktop-wallpaper/347/445/desktop-wallpaper-classic-windows-xp-1920x1080-old-windows.jpg" data-wallpaper="https://e1.pxfuel.com/desktop-wallpaper/347/445/desktop-wallpaper-classic-windows-xp-1920x1080-old-windows.jpg" style="width: 100px; height: 75px; border: 1px solid var(--xp-border-dark); cursor: pointer;" class="wallpaper-thumbnail">
				<img src="https://e1.pxfuel.com/desktop-wallpaper/594/212/desktop-wallpaper-the-13-best-takes-on-the-windows-xp-bliss-bliss.jpg" data-wallpaper="https://e1.pxfuel.com/desktop-wallpaper/594/212/desktop-wallpaper-the-13-best-takes-on-the-windows-xp-bliss-bliss.jpg" style="width: 100px; height: 75px; border: 1px solid var(--xp-border-dark); cursor: pointer;" class="wallpaper-thumbnail">
				<img src="https://i.pinimg.com/736x/ea/ca/a0/eacaa04139f9524891edc3a7449bdf9f.jpg" data-wallpaper="https://i.pinimg.com/736x/ea/ca/a0/eacaa04139f9524891edc3a7449bdf9f.jpg" style="width: 100px; height: 75px; border: 1px solid var(--xp-border-dark); cursor: pointer;" class="wallpaper-thumbnail">
				<img src="https://wallpapers.com/images/hd/hd-windows-xp-wallpaper-for-free-hd-wallpaper-5p5b68b2u7pamkc9.jpg" data-wallpaper="https://wallpapers.com/images/hd/hd-windows-xp-wallpaper-for-free-hd-wallpaper-5p5b68b2u7pamkc9.jpg" style="width: 100px; height: 75px; border: 1px solid var(--xp-border-dark); cursor: pointer;" class="wallpaper-thumbnail">
			</div>
			<button id="apply-wallpaper-btn" class="xp-button">Apply</button>
		</div>
	`;
	const displayWindow = createXPWindow(id, title, contentHTML, 400, 350);

	let selectedWallpaper = localStorage.getItem('desktopBackground') || './img/windows_xp_original-wallpaper-1920x1080.jpg';
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
		localStorage.setItem('desktopBackground', selectedWallpaper);
	});
	document.getElementById('desktop').style.backgroundImage = `url('${selectedWallpaper}')`;
}

function openPersonalizeSettings() {
	alert('Personalize settings not implemented yet.');
}

function setupQuickLaunchIcons() {
	const showDesktopIcon = document.getElementById('show-desktop-icon');
	if (showDesktopIcon) {
		showDesktopIcon.addEventListener('click', () => {
			Object.values(openWindows).forEach(win => {
				if (!win.classList.contains('minimized')) {
					minimizeWindow(win, win.id);
				}
			});
		});
	}
	document.querySelector('.quick-launch-icon[alt="Internet Explorer"]').addEventListener('click', () => {
		openProjectWindow({
			title: "Internet Explorer",
			longDescrition: "A classic web browser.",
			icon: "https://img.icons8.com/color/48/000000/internet-explorer.png",
			link: "https://www.google.com"
		});
	});
}

function showDesktop() {
	Object.values(openWindows).forEach(win => {
		if (!win.classList.contains('minimized')) {
			minimizeWindow(win, win.id);
		}
	});
}