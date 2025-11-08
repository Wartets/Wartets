class Element {
	constructor(name, parent = null) {
		if (typeof name !== 'string' || name.trim() === '') {
			throw new Error('Element name must be a non-empty string.');
		}
		this.name = name;
		this.parent = parent;
		this.createdAt = new Date();
		this.modifiedAt = new Date();
	}

	rename(newName) {
		if (typeof newName !== 'string' || newName.trim() === '') {
			throw new Error('New name must be a non-empty string.');
		}
		const parent = this.parent;
		if (parent) {
			if (parent.children.has(newName)) {
				throw new Error(`An element named "${newName}" already exists in this folder.`);
			}
			const oldName = this.name;
			parent.children.delete(oldName);
			this.name = newName;
			parent.children.set(this.name, this);
			parent.modifiedAt = new Date();
		} else {
			this.name = newName;
		}
		this.modifiedAt = new Date();
	}

	getFullPath() {
		if (!this.parent) {
			return '/';
		}
		let path = '';
		let current = this;
		while (current.parent) {
			path = `/${current.name}${path}`;
			current = current.parent;
		}
		return path;
	}

	toJSON() {
		return {
			name: this.name,
			createdAt: this.createdAt,
			modifiedAt: this.modifiedAt,
			type: this.constructor.name
		};
	}
}

class File extends Element {
	constructor(name, parent = null, content = '') {
		super(name, parent);
		this.content = content;
		this.size = new TextEncoder().encode(content).length;
		this.icon = 'https://img.icons8.com/color/48/txt.png';
	}

	read() {
		return this.content;
	}

	write(newContent) {
		this.content = newContent;
		this.size = new TextEncoder().encode(this.content).length;
		this.modifiedAt = new Date();
		if (this.parent) {
			this.parent.modifiedAt = new Date();
		}
	}

    copy() {
        const newFile = new File(this.name, null, this.content);
        newFile.createdAt = this.createdAt;
        newFile.modifiedAt = this.modifiedAt;
        return newFile;
    }

	toJSON() {
		return {
			...super.toJSON(),
			content: this.content,
			size: this.size,
			icon: this.icon,
		};
	}
}

class Folder extends Element {
	constructor(name, parent = null) {
		super(name, parent);
		this.children = new Map();
		this.icon = 'https://img.icons8.com/fluent/48/folder-invoices.png';
	}

	add(element) {
		if (this.children.has(element.name)) {
			throw new Error(`An element named "${element.name}" already exists.`);
		}
		element.parent = this;
		this.children.set(element.name, element);
		this.modifiedAt = new Date();
	}

	remove(elementName) {
		if (!this.children.has(elementName)) {
			throw new Error(`Element "${elementName}" not found.`);
		}
		const element = this.children.get(elementName);
		element.parent = null;
		this.children.delete(elementName);
		this.modifiedAt = new Date();
		return true;
	}

	getByName(name) {
		return this.children.get(name);
	}

	listContent() {
		return Array.from(this.children.values());
	}
    
    copy() {
        const newFolder = new Folder(this.name, null);
        newFolder.createdAt = this.createdAt;
        newFolder.modifiedAt = this.modifiedAt;
        for (const child of this.children.values()) {
            const childCopy = child.copy();
            newFolder.add(childCopy);
        }
        return newFolder;
    }

	toJSON() {
		return {
			...super.toJSON(),
			icon: this.icon,
			children: Array.from(this.children.values()).map(child => child.toJSON()),
		};
	}
}

class Shortcut extends Element {
	constructor(name, parent = null, targetPath, icon) {
		super(name, parent);
		this.targetPath = targetPath;
		this.icon = icon;
	}

	copy() {
		const newShortcut = new Shortcut(this.name, null, this.targetPath, this.icon);
		newShortcut.createdAt = this.createdAt;
		newShortcut.modifiedAt = this.modifiedAt;
		return newShortcut;
	}

	toJSON() {
		return {
			...super.toJSON(),
			targetPath: this.targetPath,
			icon: this.icon,
		};
	}
}

class FileSystemManager {
	constructor() {
		this.root = new Folder('Desktop');
		this.clipboard = {
			mode: null,
			element: null
		};
	}

	findByPath(path) {
		if (path === '/') {
			return this.root;
		}
		const parts = path.split('/').filter(p => p);
		let current = this.root;
		for (const part of parts) {
			if (!(current instanceof Folder) || !current.children.has(part)) {
				return null;
			}
			current = current.getByName(part);
		}
		return current;
	}

	create(type, path, name, options = {}) {
		const parentFolder = this.findByPath(path);
		if (!(parentFolder instanceof Folder)) {
			throw new Error(`Invalid path: ${path}`);
		}
		let finalName = name;
		let counter = 1;

		const getBaseNameAndExtension = (filename) => {
			const lastDot = filename.lastIndexOf('.');
			if (lastDot === -1) return [filename, ''];
			return [filename.substring(0, lastDot), filename.substring(lastDot)];
		};

		while (parentFolder.children.has(finalName)) {
			if (type === 'File' || type === 'Shortcut') {
				const [baseName, ext] = getBaseNameAndExtension(name);
				finalName = `${baseName} (${counter})${ext}`;
			} else {
				finalName = `${name} (${counter})`;
			}
			counter++;
		}

		const newElement = type === 'Folder' ? new Folder(finalName) :
			type === 'Shortcut' ? new Shortcut(finalName, null, options.targetPath, options.icon) :
			new File(finalName);
		parentFolder.add(newElement);
		this.save();
		return newElement;
	}

	delete(path) {
		const element = this.findByPath(path);
		if (!element || !element.parent) {
			throw new Error('Cannot delete root or non-existent element.');
		}
		element.parent.remove(element.name);
		this.save();
	}

	move(sourcePath, destPath) {
		const element = this.findByPath(sourcePath);
		const destFolder = this.findByPath(destPath);

		if (!element || !element.parent) throw new Error('Source not found or is root.');
		if (!(destFolder instanceof Folder)) throw new Error('Destination is not a folder.');

		let checkParent = destFolder;
		while (checkParent) {
			if (checkParent === element) {
				throw new Error('Cannot move a folder into itself or one of its children.');
			}
			checkParent = checkParent.parent;
		}

		let finalName = element.name;
		let counter = 2;
		const getBaseNameAndExtension = (filename) => {
			const lastDot = filename.lastIndexOf('.');
			if (lastDot === -1) return [filename, ''];
			return [filename.substring(0, lastDot), filename.substring(lastDot)];
		};

		const originalElementName = element.name;
		while (destFolder.children.has(finalName)) {
			if (element instanceof File) {
				const [baseName, ext] = getBaseNameAndExtension(originalElementName);
				finalName = `${baseName} (${counter})${ext}`;
			} else {
				finalName = `${originalElementName} (${counter})`;
			}
			counter++;
		}
		
		const originalName = element.name;
		element.parent.remove(originalName);
		
		element.name = finalName;
		destFolder.add(element);
		
		this.save();
	}
    
    copy(sourcePath, destPath) {
        const elementToCopy = this.findByPath(sourcePath);
        const destFolder = this.findByPath(destPath);

        if (!elementToCopy) throw new Error('Source element not found.');
        if (!(destFolder instanceof Folder)) throw new Error('Destination is not a folder.');

        const getBaseNameAndExtension = (filename) => {
            const lastDot = filename.lastIndexOf('.');
            if (lastDot === -1) return [filename, ''];
            return [filename.substring(0, lastDot), filename.substring(lastDot)];
        };

        let finalName = elementToCopy.name;
        let counter = 1;
        let baseNameForCopy, extForCopy;

        if (elementToCopy instanceof File) {
            [baseNameForCopy, extForCopy] = getBaseNameAndExtension(elementToCopy.name);
        } else {
            baseNameForCopy = elementToCopy.name;
            extForCopy = '';
        }

        while (destFolder.children.has(finalName)) {
            if (counter === 1) {
                finalName = `Copy of ${baseNameForCopy}${extForCopy}`;
            } else {
                finalName = `Copy of ${baseNameForCopy} (${counter - 1})${extForCopy}`;
            }
            if (!destFolder.children.has(finalName)) break;

            finalName = `${baseNameForCopy} (${counter})${extForCopy}`;
             if (destFolder.children.has(finalName)) {
                 let copyCounter = 2;
                 finalName = `Copy of ${baseNameForCopy} (${copyCounter})${extForCopy}`;
                 while(destFolder.children.has(finalName)) {
                     copyCounter++;
                     finalName = `Copy of ${baseNameForCopy} (${copyCounter})${extForCopy}`;
                 }
             }
            counter++;
        }
        
        const newElement = elementToCopy.copy();
        newElement.name = finalName;
        destFolder.add(newElement);
        this.save();
        return newElement;
    }

	save() {
		localStorage.setItem('fileSystem', JSON.stringify(this.root.toJSON()));
	}

	load() {
		const savedData = localStorage.getItem('fileSystem');
		if (savedData) {
			const data = JSON.parse(savedData);
			this.root = this.rehydrate(data, null);
		}
	}

	rehydrate(data, parent) {
		let element;
		if (data.type === 'Folder') {
			element = new Folder(data.name, parent);
			if (data.children) {
				data.children.forEach(childData => {
					const childElement = this.rehydrate(childData, element);
					element.add(childElement);
				});
			}
		} else if (data.type === 'Shortcut') {
			element = new Shortcut(data.name, parent, data.targetPath, data.icon);
		} else {
			element = new File(data.name, parent, data.content || '');
		}
		element.createdAt = new Date(data.createdAt);
		element.modifiedAt = new Date(data.modifiedAt);
		return element;
	}
}

let openWindows = {};
let zIndexCounter = 100;
let activeWindow = null;
let selectedIcons = new Set();
let fs; // File System Manager instance
let currentContextMenuTarget = null;
let currentCalendarDate = new Date();
let isContextMenuVisible = false;

document.addEventListener('DOMContentLoaded', () => {
	initializeFileSystem();
	renderDesktopIcons();
	setupStartButton();
	setupTaskbarClock();
	renderStartMenuCategories();
	setupDesktopContextMenu();
	setupQuickLaunchIcons();
	document.getElementById('show-desktop-icon').addEventListener('click', showDesktop);
	setupCalendar();
	setupDesktopDropzone();
});

function createXPWindow(id, title, contentHTML, initialWidth = 600, initialHeight = 400, options = {}) {
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

	if (options.resizable === false) {
		win.style.resize = 'none';
	}

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

function createConfirmationDialog(message, onConfirm) {
	const id = `confirm-dialog-${Date.now()}`;
	const title = 'Confirm Action';
	const contentHTML = `
		<div style="display: flex; flex-direction: column; height: 100%; padding: 10px; box-sizing: border-box;">
			<div style="flex-grow: 1; display: flex; align-items: center; justify-content: center; text-align: center;">
				<p style="margin: 0;">${message}</p>
			</div>
			<div style="flex-shrink: 0; display: flex; justify-content: flex-end; gap: 10px; padding-top: 10px;">
				<button class="xp-button" id="confirm-yes-${id}">Yes</button>
				<button class="xp-button" id="confirm-no-${id}">No</button>
			</div>
		</div>
	`;

	const dialog = createXPWindow(id, title, contentHTML, 350, 150, { resizable: false });
	bringWindowToFront(dialog);

	const yesButton = document.getElementById(`confirm-yes-${id}`);
	const noButton = document.getElementById(`confirm-no-${id}`);

	yesButton.addEventListener('click', () => {
		onConfirm();
		closeWindow(dialog, id);
	});

	noButton.addEventListener('click', () => {
		closeWindow(dialog, id);
	});
}

function startInlineRename(iconElement) {
	const span = iconElement.querySelector('span');
	const path = iconElement.dataset.path;
	const element = fs.findByPath(path);
	if (!element || !span) return;

	span.style.display = 'none';

	const input = document.createElement('input');
	input.type = 'text';
	input.value = element.name;
	iconElement.appendChild(input);
	input.focus();
	input.select();

	const endRename = (commit) => {
		let success = false;
		if (commit) {
			const newName = input.value;
			if (newName && newName.trim() !== '' && newName !== element.name) {
				try {
					element.rename(newName);
					fs.save();
					span.textContent = newName;
					success = true;
				} catch (e) {
					alert(`Error: ${e.message}`);
					input.focus();
					input.select();
				}
			} else {
				success = true; // No change is considered a success
			}
		} else {
			success = true; // Cancellation is a success
		}

		if (success) {
			input.remove();
			span.style.display = '';
			clearIconSelections();
		}
	};

	input.addEventListener('blur', () => endRename(true));
	input.addEventListener('keydown', (e) => {
		if (e.key === 'Enter') {
			e.preventDefault();
			endRename(true);
		} else if (e.key === 'Escape') {
			e.preventDefault();
			endRename(false);
		}
	});
}

function initializeFileSystem() {
	fs = new FileSystemManager();
	fs.load();
}

function renderDesktopIcons() {
	const container = document.getElementById('project-icons-container');
	container.innerHTML = '';

	projects.flat().forEach(project => {
		if (typeof project === 'object' && project !== null && project.title) {
			const icon = createIconElement({
				name: project.title,
				icon: project.icon,
				path: `project://${project.title.replace(/\s/g, '-')}`,
				type: 'project',
				element: project
			}, openProjectWindow);
			container.appendChild(icon);
		}
	});

	fs.root.listContent().forEach(element => {
		const icon = createIconElement({
			name: element.name,
			icon: element.icon,
			path: element.getFullPath(),
			type: element instanceof Folder ? 'folder' : 'file',
			element: element
		}, openFileSystemElement);
		container.appendChild(icon);
	});

	arrangeIcons('none');
}

function createIconElement(data, dblClickHandler) {
	const icon = document.createElement('div');
	icon.className = 'project-icon';
	icon.dataset.path = data.path;
	icon.dataset.type = data.type;
	icon.draggable = true;

	const img = document.createElement('img');
	img.src = data.icon || 'https://img.icons8.com/fluency/48/file.png';
	img.alt = data.name;
	icon.appendChild(img);

	const span = document.createElement('span');
	span.textContent = data.name;
	icon.appendChild(span);

	icon.addEventListener('click', (e) => handleIconClick(e, icon));
	icon.addEventListener('dblclick', () => dblClickHandler(data.element));
	icon.addEventListener('contextmenu', (e) => {
		e.preventDefault();
		e.stopPropagation();

		if (!e.ctrlKey && !icon.classList.contains('selected')) {
			clearIconSelections();
		}

		if (!icon.classList.contains('selected')) {
			icon.classList.add('selected');
			selectedIcons.add(icon);
		}

		currentContextMenuTarget = icon;
		showContextMenu(e);
		updateContextMenuItems();
	});

	icon.addEventListener('dragstart', handleDragStart);
	icon.addEventListener('dragover', handleDragOver);
	icon.addEventListener('dragleave', handleDragLeave);
	icon.addEventListener('drop', handleDrop);
	icon.addEventListener('dragend', handleDragEnd);

	return icon;
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
	const win = icon.closest('.xp-window');
	const isCtrl = e.ctrlKey;
	const isSelected = icon.classList.contains('selected');

	if (!isCtrl) {
		const container = icon.parentElement;
		container.querySelectorAll('.project-icon.selected').forEach(i => i.classList.remove('selected'));
		clearIconSelections();
	}

	if (isSelected && isCtrl) {
		icon.classList.remove('selected');
		selectedIcons.delete(icon);
	} else {
		icon.classList.add('selected');
		selectedIcons.add(icon);
	}

	if (win && win.classList.contains('project-window')) {
		updateFolderUISelection(win);
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
	const calendarPopup = document.getElementById('calendar-popup');
	const clockElement = document.getElementById('taskbar-clock');

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
		if (!calendarPopup.classList.contains('hidden') && !calendarPopup.contains(e.target) && e.target !== clockElement) {
			calendarPopup.classList.add('hidden');
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

function setupCalendar() {
	const prevButton = document.getElementById('calendar-prev');
	const nextButton = document.getElementById('calendar-next');
	const todayFooter = document.getElementById('calendar-footer');

	prevButton.addEventListener('click', () => {
		currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
		renderCalendar(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth());
	});

	nextButton.addEventListener('click', () => {
		currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
		renderCalendar(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth());
	});
	
	todayFooter.addEventListener('click', () => {
		currentCalendarDate = new Date();
		renderCalendar(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth());
	});
}

function renderCalendar(year, month) {
	const monthYearEl = document.getElementById('calendar-month-year');
	const gridEl = document.getElementById('calendar-grid');
	const todayDateEl = document.getElementById('calendar-today-date');

	gridEl.innerHTML = '';

	const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
	monthYearEl.textContent = `${monthNames[month]} ${year}`;

	const today = new Date();
	todayDateEl.textContent = `Today: ${today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`;


	const firstDayOfMonth = new Date(year, month, 1);
	const daysInMonth = new Date(year, month + 1, 0).getDate();
	const startDayOfWeek = firstDayOfMonth.getDay();

	for (let i = 0; i < startDayOfWeek; i++) {
		const emptyCell = document.createElement('div');
		gridEl.appendChild(emptyCell);
	}

	for (let day = 1; day <= daysInMonth; day++) {
		const dayCell = document.createElement('div');
		dayCell.className = 'calendar-day';
		dayCell.textContent = day;

		if (year === today.getFullYear() && month === today.getMonth() && day === today.getDate()) {
			dayCell.classList.add('today');
		}
		
		gridEl.appendChild(dayCell);
	}
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
	const calendarPopup = document.getElementById('calendar-popup');

	function updateClock() {
		const now = new Date();
		const hours = String(now.getHours()).padStart(2, '0');
		const minutes = String(now.getMinutes()).padStart(2, '0');
		const seconds = String(now.getSeconds()).padStart(2, '0');
		clockElement.textContent = `${hours}:${minutes}:${seconds}`;
	}

	clockElement.addEventListener('click', (e) => {
		e.stopPropagation();
		const isHidden = calendarPopup.classList.contains('hidden');
		if (isHidden) {
			renderCalendar(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth());
			calendarPopup.style.zIndex = ++zIndexCounter;
		}
		calendarPopup.classList.toggle('hidden');
	});

	document.addEventListener('click', (e) => {
		if (!calendarPopup.classList.contains('hidden') && !calendarPopup.contains(e.target) && e.target !== clockElement) {
			calendarPopup.classList.add('hidden');
		}
	});

	updateClock();
	setInterval(updateClock, 1000);
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

	desktop.addEventListener('contextmenu', (e) => {
		if (e.target === desktop || e.target.id === 'project-icons-container') {
			e.preventDefault();
			clearIconSelections();
			currentContextMenuTarget = desktop;
			showContextMenu(e);
			updateContextMenuItems();
		}
	});

	document.addEventListener('mousedown', (e) => {
		if (isContextMenuVisible) {
			if (!contextMenu.contains(e.target)) {
				contextMenu.classList.add('hidden');
				isContextMenuVisible = false;
			}
		}
		
		if (!e.target.closest('.project-icon') && !contextMenu.contains(e.target)) {
			clearIconSelections();
		}
	});

	contextMenu.addEventListener('click', (e) => {
		const targetItem = e.target.closest('li[data-action]');
		if (targetItem && !targetItem.classList.contains('hidden')) {
			e.stopPropagation();
			const action = targetItem.dataset.action;
			
			handleContextMenuAction(action);
			
			contextMenu.classList.add('hidden');
			isContextMenuVisible = false;
		}
	});

	const submenuTrigger = contextMenu.querySelector('.has-submenu');
	const submenu = submenuTrigger.querySelector('.submenu');
	submenuTrigger.addEventListener('mouseenter', () => submenu.classList.remove('hidden'));
	submenuTrigger.addEventListener('mouseleave', (e) => {
		if (!submenuTrigger.contains(e.relatedTarget)) {
			submenu.classList.add('hidden');
		}
	});
	submenu.addEventListener('mouseleave', (e) => {
		if (e.relatedTarget !== submenuTrigger) {
			submenu.classList.add('hidden');
		}
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
	isContextMenuVisible = true;
}

function handleIconContextMenu(e, icon) {
	e.preventDefault();
	icon.classList.add('selected');
	selectedIcons.add(icon);
	currentContextMenuTarget = icon;
	showContextMenu(e);
	updateContextMenuItems(icon);
}

function updateContextMenuItems() {
	const contextMenu = document.getElementById('context-menu');
	const isIconTargeted = currentContextMenuTarget && currentContextMenuTarget.classList.contains('project-icon');
	const isContainerTargeted = currentContextMenuTarget && (currentContextMenuTarget.id === 'desktop' || currentContextMenuTarget.classList.contains('folder-content'));
	
    let anyFileSystemElementSelected = false;
    if (selectedIcons.size > 0) {
        anyFileSystemElementSelected = Array.from(selectedIcons).some(icon => icon.dataset.path && !icon.dataset.path.startsWith('project://'));
    }

	contextMenu.querySelector('[data-action="open"]').classList.toggle('hidden', selectedIcons.size !== 1);
	contextMenu.querySelector('[data-action="cut"]').classList.toggle('hidden', !anyFileSystemElementSelected);
	contextMenu.querySelector('[data-action="copy"]').classList.toggle('hidden', !anyFileSystemElementSelected);
	contextMenu.querySelector('[data-action="delete"]').classList.toggle('hidden', !anyFileSystemElementSelected);
	contextMenu.querySelector('[data-action="rename"]').classList.toggle('hidden', !(anyFileSystemElementSelected && selectedIcons.size === 1));

	const hasClipboardContent = fs.clipboard.mode && fs.clipboard.element;
	let canPaste = false;
	if (hasClipboardContent && (isContainerTargeted || isIconTargeted)) {
        let destPath = '/';
        if (currentContextMenuTarget.id === 'desktop') {
            destPath = '/';
        } else {
             destPath = currentContextMenuTarget.dataset.path;
        }

        const destElement = fs.findByPath(destPath);
        const sourceElement = fs.clipboard.element;
        
        let targetFolder = (destElement instanceof Folder) ? destElement : destElement.parent;
        
		canPaste = true;
        if (sourceElement.getFullPath() === targetFolder.getFullPath()) {
            if (fs.clipboard.mode === 'cut') {
                canPaste = false;
            }
        }
        
        let checkParent = targetFolder;
        while(checkParent) {
            if (checkParent === sourceElement) {
                canPaste = false;
                break;
            }
            checkParent = checkParent.parent;
        }
	}
	contextMenu.querySelector('[data-action="paste"]').classList.toggle('hidden', !canPaste);

	const newItems = contextMenu.querySelector('.has-submenu');
	newItems.classList.toggle('hidden', !isContainerTargeted);
	newItems.previousElementSibling.classList.toggle('hidden', !isContainerTargeted);
}

function handleContextMenuAction(action) {
	let targetElement = null;
	if (selectedIcons.size > 0) {
		targetElement = selectedIcons.values().next().value;
	}

	let destPath = '/';
	if (currentContextMenuTarget) {
		const targetPath = currentContextMenuTarget.dataset.path;
		if (currentContextMenuTarget.id === 'desktop') {
			destPath = '/';
		} else if (targetPath) {
			const element = fs.findByPath(targetPath);
			if (element instanceof Folder) {
				destPath = element.getFullPath();
			} else if (element && element.parent) {
				destPath = element.parent.getFullPath();
			}
		}
	}

	try {
		switch (action) {
			case 'open':
				if (targetElement) {
					const path = targetElement.dataset.path;
					if (path.startsWith('project://')) {
						const projectTitle = path.substring(10);
						const project = projects.flat().find(p => p.title.replace(/\s/g, '-') === projectTitle);
						if (project) openProjectWindow(project);
					} else {
						const element = fs.findByPath(path);
						if (element) openFileSystemElement(element);
					}
				}
				break;
			case 'cut':
			case 'copy':
				if (targetElement) {
					const path = targetElement.dataset.path;
					if (path && !path.startsWith('project://')) {
						fs.clipboard.mode = action;
						fs.clipboard.element = fs.findByPath(path);
					}
				}
				break;
			case 'paste':
				if (fs.clipboard.element) {
					const sourcePath = fs.clipboard.element.getFullPath();
					if (fs.clipboard.mode === 'cut') {
						fs.move(sourcePath, destPath);
						fs.clipboard.mode = null;
						fs.clipboard.element = null;
					} else if (fs.clipboard.mode === 'copy') {
						fs.copy(sourcePath, destPath);
					}
					refreshUI();
				}
				break;
			case 'delete':
				const iconsToDelete = Array.from(selectedIcons).filter(icon => {
					const path = icon.dataset.path;
					return path && !path.startsWith('project://');
				});

				if (iconsToDelete.length > 0) {
					const message = `Are you sure you want to delete ${iconsToDelete.length} item(s)?`;
					createConfirmationDialog(message, () => {
						iconsToDelete.forEach(icon => {
							const path = icon.dataset.path;
							try {
								fs.delete(path);
							} catch (e) {
								console.error(`Failed to delete ${path}:`, e.message);
							}
						});
						refreshUI();
					});
				}
				break;
			case 'rename':
				if (targetElement) {
					const path = targetElement.dataset.path;
					if (!path.startsWith('project://')) {
						startInlineRename(targetElement);
					}
				}
				break;
			case 'refresh':
				refreshUI();
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
				fs.create('Folder', destPath, 'New Folder');
				refreshUI();
				break;
			case 'new-text-document':
				fs.create('File', destPath, 'New Document.txt');
				refreshUI();
				break;
			case 'display-settings':
				openDisplaySettings();
				break;
		}
	} catch (error) {
		alert(`Error: ${error.message}`);
	}

	if (action !== 'delete' && action !== 'rename') {
		clearIconSelections();
	}
}

function openFileSystemElement(element, windowContext = null) {
	if (element instanceof Folder) {
		if (windowContext && windowContext.classList.contains('project-window')) {
			navigateToFolder(element, windowContext);
		} else {
			openFolderWindow(element);
		}
	} else if (element instanceof Shortcut) {
		const projectPath = element.targetPath;
		const projectTitleSlug = projectPath.substring(10);
		const project = projects.flat().find(p => p.title.replace(/\s/g, '-') === projectTitleSlug);
		if (project) {
			openProjectWindow(project);
		} else {
			alert('Could not find the target for this shortcut.');
		}
	} else if (element instanceof File) {
		openTextEditorWindow(element);
	}
}

function openFolderWindow(folder) {
	const id = `window-folder-${folder.getFullPath().replace(/[^\w-]/g, '_')}`;
	const existingWindow = document.getElementById(id);
	if (existingWindow) {
		bringWindowToFront(existingWindow);
		return;
	}

	const title = folder.name;
	const contentHTML = `
		<div class="folder-window-layout">
			<div class="folder-menu-bar">
				<ul><li><u>F</u>ile</li><li><u>E</u>dit</li><li><u>V</u>iew</li><li><u>F</u>avorites</li><li><u>T</u>ools</li><li><u>H</u>elp</li></ul>
			</div>
			<div class="folder-toolbar">
				<div class="folder-nav-buttons">
					<button class="folder-nav-btn back-btn" title="Back" disabled><img src="data:image/svg+xml;charset=UTF-8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%232c63c3'><path d='M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z'/></svg>" alt="Back"></button>
					<button class="folder-nav-btn forward-btn" title="Forward" disabled><img src="data:image/svg+xml;charset=UTF-8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%232c63c3'><path d='M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z'/></svg>" alt="Forward"></button>
					<button class="folder-nav-btn up-btn" title="Up"><img src="data:image/svg+xml;charset=UTF-8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%232c63c3'><path d='M4 12l1.41 1.41L11 7.83V20h2V7.83l5.58 5.59L20 12l-8-8-8 8z'/></svg>" alt="Up"></button>
				</div>
				<div class="folder-toolbar-separator"></div>
				<div class="folder-nav-buttons">
					<button class="folder-nav-btn search-btn" title="Search"><img src="data:image/svg+xml;charset=UTF-8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%232c63c3'><path d='M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z'/></svg>" alt="Search"></button>
					<button class="folder-nav-btn folders-btn" title="Folders"><img src="data:image/svg+xml;charset=UTF-8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23ffb300'><path d='M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z'/></svg>" alt="Folders"></button>
				</div>
				<div class="folder-toolbar-separator"></div>
				<div class="folder-address-bar-container">
					<span>Address</span>
					<input type="text" class="folder-address-bar" readonly>
				</div>
			</div>
			<div class="folder-main-layout">
				<div class="folder-sidebar">
					<div class="sidebar-section file-tasks">
						<h3>File and Folder Tasks</h3>
						<ul>
							<li><a href="#" data-task="rename" class="disabled">Rename this file</a></li>
							<li><a href="#" data-task="move" class="disabled">Move this file</a></li>
							<li><a href="#" data-task="copy" class="disabled">Copy this file</a></li>
							<li><a href="#" data-task="delete" class="disabled">Delete this file</a></li>
						</ul>
					</div>
					<div class="sidebar-section other-places">
						<h3>Other Places</h3>
						<ul>
							<li><a href="#" data-place="/">Desktop</a></li>
						</ul>
					</div>
					<div class="sidebar-section details">
						<h3>Details</h3>
						<div class="details-content">
							Select an item to view its details.
						</div>
					</div>
				</div>
				<div class="folder-main-content">
					<div class="folder-content-wrapper">
						<div class="folder-content" data-path="\${folder.getFullPath()}"></div>
					</div>
					<div class="folder-status-bar">
						<div class="status-bar-left"></div>
						<div class="status-bar-right"></div>
					</div>
				</div>
			</div>
		</div>
	`;

	const folderWindow = createXPWindow(id, title, contentHTML, 700, 500);
	folderWindow.classList.add('project-window');
	folderWindow.querySelector('.xp-window-content').style.padding = '0';
	folderWindow.navigationHistory = {
		history: [],
		currentIndex: -1
	};
	folderWindow.dataset.viewMode = 'icons';

	const contentArea = folderWindow.querySelector('.folder-content');
	contentArea.addEventListener('contextmenu', (e) => {
		e.preventDefault();
		e.stopPropagation();
		if (e.target === contentArea || e.target === contentArea.parentElement) {
			clearIconSelections();
			currentContextMenuTarget = contentArea;
			showContextMenu(e);
			updateContextMenuItems();
		}
	});

	contentArea.addEventListener('dragover', handleDragOver);
	contentArea.addEventListener('dragleave', handleDragLeave);
	contentArea.addEventListener('drop', handleDrop);

	folderWindow.querySelector('.back-btn').addEventListener('click', () => {
		const nav = folderWindow.navigationHistory;
		if (nav.currentIndex > 0) {
			nav.currentIndex--;
			const folderPath = nav.history[nav.currentIndex];
			const targetFolder = fs.findByPath(folderPath);
			if (targetFolder) updateFolderView(targetFolder, folderWindow, false);
		}
	});

	folderWindow.querySelector('.forward-btn').addEventListener('click', () => {
		const nav = folderWindow.navigationHistory;
		if (nav.currentIndex < nav.history.length - 1) {
			nav.currentIndex++;
			const folderPath = nav.history[nav.currentIndex];
			const targetFolder = fs.findByPath(folderPath);
			if (targetFolder) updateFolderView(targetFolder, folderWindow, false);
		}
	});

	folderWindow.querySelector('.up-btn').addEventListener('click', () => {
		const currentPath = folderWindow.querySelector('.folder-content').dataset.path;
		const currentFolder = fs.findByPath(currentPath);
		if (currentFolder && currentFolder.parent) {
			navigateToFolder(currentFolder.parent, folderWindow);
		}
	});

	folderWindow.querySelector('.folders-btn').addEventListener('click', (e) => {
		folderWindow.querySelector('.folder-sidebar').classList.toggle('hidden');
	});

	folderWindow.querySelector('.sidebar-section.other-places').addEventListener('click', (e) => {
		e.preventDefault();
		const placePath = e.target.closest('a')?.dataset.place;
		if (placePath) {
			const targetFolder = fs.findByPath(placePath);
			if (targetFolder) navigateToFolder(targetFolder, folderWindow);
		}
	});

	navigateToFolder(folder, folderWindow);
}

function navigateToFolder(folder, win, recordHistory = true) {
	const nav = win.navigationHistory;
	const newPath = folder.getFullPath();

	if (recordHistory) {
		if (nav.currentIndex < nav.history.length - 1) {
			nav.history = nav.history.slice(0, nav.currentIndex + 1);
		}
		if (nav.history[nav.currentIndex] !== newPath) {
			nav.history.push(newPath);
			nav.currentIndex++;
		}
	}
	updateFolderView(folder, win);
}

function updateFolderView(folder, win) {
	const contentArea = win.querySelector('.folder-content');
	const nav = win.navigationHistory;

	win.querySelector('.title').textContent = folder.name;
	win.querySelector('.folder-address-bar').value = folder.getFullPath();
	contentArea.dataset.path = folder.getFullPath();

	renderFolderContent(folder, contentArea, win);
	updateFolderUISelection(win);

	win.querySelector('.back-btn').disabled = nav.currentIndex <= 0;
	win.querySelector('.forward-btn').disabled = nav.currentIndex >= nav.history.length - 1;
	win.querySelector('.up-btn').disabled = !folder.parent;
}

function renderFolderContent(folder, container, win) {
	container.innerHTML = '';
	if (!folder || !(folder instanceof Folder)) return;

	container.className = 'folder-content';
	const viewMode = win.dataset.viewMode || 'icons';
	container.classList.add(`view-${viewMode}`);

	const items = folder.listContent();

	if (viewMode === 'details') {
		const header = document.createElement('div');
		header.className = 'details-header';
		header.innerHTML = `
			<div class="col-name">Name</div>
			<div class="col-size">Size</div>
			<div class="col-type">Type</div>
			<div class="col-modified">Date Modified</div>
		`;
		container.appendChild(header);

		items.forEach(element => {
			const row = document.createElement('div');
			row.className = 'details-row';

			const iconData = {
				name: element.name,
				icon: element.icon,
				path: element.getFullPath(),
				type: element instanceof Folder ? 'folder' : (element instanceof Shortcut ? 'shortcut' : 'file'),
				element: element
			};
			const icon = createIconElement(iconData, (el) => openFileSystemElement(el, win));
			row.appendChild(icon);

			const sizeDiv = document.createElement('div');
			sizeDiv.className = 'col-size';
			sizeDiv.textContent = (element.size !== undefined) ? `${Math.ceil(element.size / 1024)} KB` : '';
			row.appendChild(sizeDiv);

			const typeDiv = document.createElement('div');
			typeDiv.className = 'col-type';
			typeDiv.textContent = element.constructor.name;
			row.appendChild(typeDiv);

			const modifiedDiv = document.createElement('div');
			modifiedDiv.className = 'col-modified';
			modifiedDiv.textContent = element.modifiedAt.toLocaleString();
			row.appendChild(modifiedDiv);

			container.appendChild(row);
		});
	} else {
		items.forEach(element => {
			const icon = createIconElement({
				name: element.name,
				icon: element.icon,
				path: element.getFullPath(),
				type: element instanceof Folder ? 'folder' : (element instanceof Shortcut ? 'shortcut' : 'file'),
				element: element
			}, (el) => openFileSystemElement(el, win));

			icon.style.width = '60px';
			icon.style.height = '70px';
			icon.style.color = 'var(--xp-font-color)';
			icon.style.textShadow = 'none';
			icon.style.position = 'relative';
			icon.querySelector('img').style.width = '40px';
			icon.querySelector('img').style.height = '40px';
			icon.querySelector('span').style.fontSize = '10px';

			container.appendChild(icon);
		});
	}
}

function navigateToFolder(folder, win, recordHistory = true) {
	const nav = win.navigationHistory;
	const newPath = folder.getFullPath();

	if (recordHistory) {
		if (nav.currentIndex < nav.history.length - 1) {
			nav.history = nav.history.slice(0, nav.currentIndex + 1);
		}
		if (nav.history[nav.currentIndex] !== newPath) {
			nav.history.push(newPath);
			nav.currentIndex++;
		}
	}
	updateFolderView(folder, win);
}

function updateFolderView(folder, win, recordHistory = true) {
	const contentArea = win.querySelector('.folder-content');
	const nav = win.navigationHistory;

	if (recordHistory) {
		const newPath = folder.getFullPath();
		if (nav.currentIndex < nav.history.length - 1) {
			nav.history = nav.history.slice(0, nav.currentIndex + 1);
		}
		if (nav.history[nav.currentIndex] !== newPath) {
			nav.history.push(newPath);
			nav.currentIndex++;
		}
	}

	win.querySelector('.title').textContent = folder.name;
	win.querySelector('.folder-address-bar').value = folder.getFullPath();
	contentArea.dataset.path = folder.getFullPath();

	renderFolderContent(folder, contentArea, win);

	const itemCount = folder.listContent().length;
	win.querySelector('.folder-status-bar').textContent = `${itemCount} item(s)`;

	win.querySelector('.back-btn').disabled = nav.currentIndex <= 0;
	win.querySelector('.forward-btn').disabled = nav.currentIndex >= nav.history.length - 1;
	win.querySelector('.up-btn').disabled = !folder.parent;
}

function refreshUI() {
	renderDesktopIcons();
	Object.values(openWindows).forEach(win => {
		if (win.classList.contains('project-window')) {
			const folderContent = win.querySelector('.folder-content');
			if (folderContent) {
				const path = folderContent.dataset.path;
				const folder = fs.findByPath(path);
				if (folder) {
					renderFolderContent(folder, folderContent, win);
					updateFolderUISelection(win);
				} else {
					closeWindow(win, win.id);
				}
			}
		}
	});
}

function updateFolderUISelection(win) {
	const selectedItems = Array.from(win.querySelectorAll('.project-icon.selected'));
	const fileTasksSection = win.querySelector('.sidebar-section.file-tasks');
	const detailsSection = win.querySelector('.sidebar-section.details .details-content');
	const statusBarLeft = win.querySelector('.status-bar-left');
	const folderContent = win.querySelector('.folder-content');
	const folder = fs.findByPath(folderContent.dataset.path);

	const totalItems = folder ? folder.listContent().length : 0;

	if (selectedItems.length === 0) {
		fileTasksSection.querySelectorAll('a').forEach(a => a.classList.add('disabled'));
		detailsSection.innerHTML = `<b>${folder.name}</b><br>${folder.constructor.name}`;
		statusBarLeft.textContent = `${totalItems} object(s)`;
	} else if (selectedItems.length === 1) {
		fileTasksSection.querySelectorAll('a').forEach(a => a.classList.remove('disabled'));
		const icon = selectedItems[0];
		const element = fs.findByPath(icon.dataset.path);
		if (element) {
			detailsSection.innerHTML = `
				<b>${element.name}</b>
				${element.constructor.name}<br>
				Modified: ${element.modifiedAt.toLocaleDateString()}
				${element.size ? `<br>Size: ${Math.ceil(element.size / 1024)} KB` : ''}
			`;
		}
		statusBarLeft.textContent = `1 object(s) selected`;
	} else {
		fileTasksSection.querySelectorAll('a').forEach(a => {
			const task = a.dataset.task;
			if (task === 'rename') {
				a.classList.add('disabled');
			} else {
				a.classList.remove('disabled');
			}
		});
		detailsSection.innerHTML = `${selectedItems.length} items selected.`;
		statusBarLeft.textContent = `${selectedItems.length} object(s) selected`;
	}
}

function arrangeIcons(sortBy) {
	const container = document.getElementById('project-icons-container');
	const icons = Array.from(container.children);
	
	const getElement = (icon) => {
		const path = icon.dataset.path;
		if (path.startsWith('project://')) {
			return { name: icon.querySelector('span').textContent, createdAt: new Date(0) };
		}
		return fs.findByPath(path);
	};

	icons.sort((a, b) => {
		const elementA = getElement(a);
		const elementB = getElement(b);

		if (!elementA || !elementB) return 0;

		if (sortBy === 'name') {
			return elementA.name.localeCompare(elementB.name);
		} else if (sortBy === 'date') {
			return new Date(elementB.createdAt) - new Date(elementA.createdAt);
		}
		return 0;
	});

	const iconHeight = 95;
	const iconWidth = 85;
	const desktopUsableHeight = window.innerHeight - 40 - 20;
	const iconsPerColumn = Math.floor(desktopUsableHeight / iconHeight);
    
    container.innerHTML = '';
	icons.forEach((icon, index) => {
		const col = Math.floor(index / iconsPerColumn);
		const row = index % iconsPerColumn;

		icon.style.position = 'absolute';
		icon.style.left = `${10 + col * iconWidth}px`;
		icon.style.top = `${10 + row * iconHeight}px`;
        container.appendChild(icon);
	});
}

function handleDragStart(e) {
	if (e.target.classList.contains('project-icon')) {
		const path = e.target.dataset.path;
		if (path.startsWith('project://')) {
			const projectTitle = e.target.querySelector('span').textContent;
			const projectIconSrc = e.target.querySelector('img').src;
			const projectData = {
				title: projectTitle,
				icon: projectIconSrc,
				path: path
			};
			e.dataTransfer.setData('application/json-project', JSON.stringify(projectData));
			e.dataTransfer.effectAllowed = 'copy';
			e.target.style.opacity = '0.5';
		} else {
			let pathsToDrag = [];
			if (selectedIcons.has(e.target)) {
				pathsToDrag = Array.from(selectedIcons).map(icon => icon.dataset.path);
				selectedIcons.forEach(icon => icon.style.opacity = '0.5');
			} else {
				pathsToDrag = [path];
				e.target.style.opacity = '0.5';
			}
			e.dataTransfer.setData('application/json-paths', JSON.stringify(pathsToDrag));
			e.dataTransfer.effectAllowed = 'move';
		}
	}
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    let target = e.currentTarget;
    if (target.classList.contains('project-icon') && target.dataset.type !== 'folder') {
        return;
    }
    target.classList.add('drop-target');
}

function handleDragLeave(e) {
    e.currentTarget.classList.remove('drop-target');
}

function handleDragEnd(e) {
    e.target.style.opacity = '1';
    selectedIcons.forEach(icon => {
        icon.style.opacity = '1';
    });
}

function handleDrop(e) {
	e.preventDefault();
	e.stopPropagation();
	e.currentTarget.classList.remove('drop-target');

	const pathsData = e.dataTransfer.getData('application/json-paths');
	const projectDataJSON = e.dataTransfer.getData('application/json-project');

	let destPath;
	const target = e.currentTarget;

	if (target.id === 'desktop' || target.id === 'project-icons-container') {
		destPath = '/';
	} else {
		destPath = target.dataset.path;
	}

	if (typeof destPath === 'undefined') {
		return;
	}

	const destElement = fs.findByPath(destPath);
	let finalDestPath;

	if (destElement instanceof Folder) {
		finalDestPath = destElement.getFullPath();
	} else if ((destElement instanceof File || destElement instanceof Shortcut) && destElement.parent) {
		finalDestPath = destElement.parent.getFullPath();
	} else if (target.id === 'desktop') {
		finalDestPath = '/';
	} else {
		return;
	}

	if (projectDataJSON) {
		const projectData = JSON.parse(projectDataJSON);
		try {
			fs.create('Shortcut', finalDestPath, projectData.title, {
				targetPath: projectData.path,
				icon: projectData.icon
			});
		} catch (error) {
			alert(`Error creating shortcut: ${error.message}`);
		}
	} else if (pathsData) {
		const sourcePaths = JSON.parse(pathsData);
		sourcePaths.forEach(sourcePath => {
			try {
				if (sourcePath) fs.move(sourcePath, finalDestPath);
			} catch (error) {
				alert(`Error moving item: ${error.message}`);
			}
		});
	}

	refreshUI();
}

function setupDesktopDropzone() {
    const desktop = document.getElementById('desktop');
    desktop.addEventListener('dragover', handleDragOver);
    desktop.addEventListener('dragleave', (e) => {
        if (e.target.id === 'desktop') {
            e.currentTarget.classList.remove('drop-target');
        }
    });
    desktop.addEventListener('drop', handleDrop);
}

let customIcons = JSON.parse(localStorage.getItem('customIcons')) || [];

function openTextEditorWindow(file) {
	const id = `window-file-${file.getFullPath().replace(/\//g, '-')}`;
	const content = `
        <textarea style="width: 100%; height: 100%; border: none; resize: none; font-family: 'Roboto Mono', monospace;">${file.read()}</textarea>
    `;
	const win = createXPWindow(id, file.name, content, 600, 400);
	const textarea = win.querySelector('textarea');
	textarea.addEventListener('input', () => {
		file.write(textarea.value);
		fs.save();
	});
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