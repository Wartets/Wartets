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
		this.icon = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSfYBdqM_UJgzAsG1A17GxeHVikpX0e5k_N5g&s';
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
		} else if (data.type === 'ProjectFile') {
			element = new ProjectFile(data.name, parent, data.projectData);
		} else {
			element = new File(data.name, parent, data.content || '');
		}
		element.createdAt = new Date(data.createdAt);
		element.modifiedAt = new Date(data.modifiedAt);
		if (data.icon) {
			element.icon = data.icon;
		}
		return element;
	}
}

class ProjectFile extends Element {
	constructor(name, parent = null, projectData = {}) {
		super(name, parent);
		this.projectData = projectData;
		this.icon = projectData.icon;
	}

	copy() {
		const newProject = new ProjectFile(this.name, null, this.projectData);
		newProject.createdAt = this.createdAt;
		newProject.modifiedAt = this.modifiedAt;
		return newProject;
	}

	toJSON() {
		return {
			...super.toJSON(),
			projectData: this.projectData,
			icon: this.icon,
		};
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
let customIcons = JSON.parse(localStorage.getItem('customIcons')) || [];
let webampInstance = null;

document.addEventListener('DOMContentLoaded', () => {
	initializeFileSystem();
	initDocuments();
	renderDesktopIcons();
	setupStartButton();
	setupTaskbarClock();
	renderAllProgramsMenu();
	setupDesktopContextMenu();
	setupTaskbarContextMenu();
	setupQuickLaunchIcons();
	const showDesktopIcon = document.getElementById('show-desktop-icon');
	if (showDesktopIcon) {
		showDesktopIcon.addEventListener('click', showDesktop);
	}
	setupCalendar();
	setupDesktopDropzone();
	setupDesktopSelection();
	setupKeyboardNavigation();

	const bootScreen = document.getElementById('boot-screen');
	const welcomeScreen = document.getElementById('welcome-screen');
	const loginUser = document.getElementById('login-user');
	const bootLogo = document.querySelector('.boot-logo');

	let bootTimeout;
	let loginTimeout;

	function skipStartup() {
		if (bootTimeout) clearTimeout(bootTimeout);
		if (loginTimeout) clearTimeout(loginTimeout);
		
		if (bootScreen) bootScreen.style.display = 'none';
		if (welcomeScreen) welcomeScreen.style.display = 'none';
	}

	if (bootLogo) {
		bootLogo.style.cursor = 'pointer';
		bootLogo.title = 'Click to skip startup';
		bootLogo.addEventListener('click', skipStartup);
	}
	
	bootTimeout = setTimeout(() => {
		if (bootScreen.style.display !== 'none') {
			bootScreen.style.display = 'none';
			welcomeScreen.classList.remove('hidden');
			
			loginTimeout = setTimeout(() => {
				if (loginUser && welcomeScreen.style.display !== 'none') loginUser.click();
			}, 1500);
		}
	}, 3000);

	if (loginUser) {
		loginUser.addEventListener('click', () => {
			loginUser.classList.add('logging-in');
			setTimeout(() => {
				welcomeScreen.style.opacity = '0';
				welcomeScreen.style.transition = 'opacity 0.5s';
				setTimeout(() => {
					welcomeScreen.style.display = 'none';
				}, 500);
			}, 1000);
		});
	}
});

function initDocuments() {
	if (typeof window.libraryData === 'undefined' || !window.libraryData.documents) return;

	const folderName = "PDFs";
	let docFolder = fs.root.getByName(folderName);

	if (!docFolder) {
		docFolder = new Folder(folderName);
		docFolder.icon = "https://img.icons8.com/color/48/folder-invoices--v1.png";
		fs.root.add(docFolder);
	}

	window.libraryData.documents.forEach(doc => {
		const fileName = doc.filePath.split('/').pop();
		let file;

		if (docFolder.children.has(fileName)) {
			file = docFolder.getByName(fileName);
			file.write(doc.filePath);
		} else {
			file = new File(fileName, null, doc.filePath);
			file.icon = "https://img.icons8.com/color/48/pdf.png";
			docFolder.add(file);
		}

		file.createdAt = new Date(doc.timestamp);
		file.modifiedAt = new Date(doc.timestamp);
	});
	fs.save();
}

function setupDesktopSelection() {
	let isSelecting = false;
	let startX, startY;
	let selectionBox = null;
	let initialSelection = new Set();
	let activeContainer = null;
	let containerRect = null;
	let scrollStartX = 0;
	let scrollStartY = 0;

	document.addEventListener('mousedown', (e) => {
		const boot = document.getElementById('boot-screen');
		const welcome = document.getElementById('welcome-screen');
		if ((boot && boot.style.display !== 'none') || (welcome && welcome.style.display !== 'none' && !welcome.classList.contains('hidden'))) {
			return;
		}

		const desktop = document.getElementById('desktop');
		const iconsContainer = document.getElementById('project-icons-container');
		const folderWrapper = e.target.closest('.folder-content-wrapper');

		if (e.target === desktop || e.target === iconsContainer) {
			activeContainer = iconsContainer;
		} else if (folderWrapper && !e.target.closest('.project-icon')) {
			activeContainer = folderWrapper;
		} else {
			return;
		}
		
		if (e.target === activeContainer && e.offsetX > e.target.clientWidth) {
			return;
		}

		if (e.button !== 0) return;

		isSelecting = true;
		containerRect = activeContainer.getBoundingClientRect();
		scrollStartX = activeContainer.scrollLeft || 0;
		scrollStartY = activeContainer.scrollTop || 0;
		
		startX = e.clientX - containerRect.left + scrollStartX;
		startY = e.clientY - containerRect.top + scrollStartY;

		if (!e.ctrlKey) {
			clearIconSelections();
		}

		initialSelection = new Set(selectedIcons);

		selectionBox = document.createElement('div');
		selectionBox.className = 'selection-box';
		selectionBox.style.position = 'absolute';
		selectionBox.style.left = `${startX}px`;
		selectionBox.style.top = `${startY}px`;
		selectionBox.style.width = '0px';
		selectionBox.style.height = '0px';
		
		activeContainer.appendChild(selectionBox);
	});

	document.addEventListener('mousemove', (e) => {
		if (!isSelecting || !selectionBox || !activeContainer) return;

		const currentScrollX = activeContainer.scrollLeft || 0;
		const currentScrollY = activeContainer.scrollTop || 0;
		const currentX = e.clientX - containerRect.left + currentScrollX;
		const currentY = e.clientY - containerRect.top + currentScrollY;

		const left = Math.min(startX, currentX);
		const top = Math.min(startY, currentY);
		const width = Math.abs(currentX - startX);
		const height = Math.abs(currentY - startY);

		selectionBox.style.left = `${left}px`;
		selectionBox.style.top = `${top}px`;
		selectionBox.style.width = `${width}px`;
		selectionBox.style.height = `${height}px`;

		const icons = activeContainer.querySelectorAll('.project-icon');
		
		icons.forEach(icon => {
			const iconRect = icon.getBoundingClientRect();
			const iconLeft = iconRect.left - containerRect.left + currentScrollX;
			const iconTop = iconRect.top - containerRect.top + currentScrollY;
			const iconRight = iconLeft + iconRect.width;
			const iconBottom = iconTop + iconRect.height;

			const boxLeft = left;
			const boxTop = top;
			const boxRight = left + width;
			const boxBottom = top + height;

			const isIntersecting = !(iconLeft > boxRight ||
				iconRight < boxLeft ||
				iconTop > boxBottom ||
				iconBottom < boxTop);

			if (isIntersecting) {
				if (!icon.classList.contains('selected')) {
					icon.classList.add('selected');
					selectedIcons.add(icon);
				}
			} else {
				if (!initialSelection.has(icon)) {
					if (icon.classList.contains('selected')) {
						icon.classList.remove('selected');
						selectedIcons.delete(icon);
					}
				}
			}
		});
	});

	document.addEventListener('mouseup', () => {
		if (isSelecting) {
			isSelecting = false;
			if (selectionBox) {
				selectionBox.remove();
				selectionBox = null;
			}
			activeContainer = null;
			containerRect = null;
			initialSelection.clear();
		}
	});
}

function openPDFWindow(file) {
	const id = `window-pdf-${file.name.replace(/[^\w-]/g, '_')}`;
	const existingWindow = document.getElementById(id);
	if (existingWindow) {
		bringWindowToFront(existingWindow);
		return;
	}

	const contentHTML = `
		<div style="width: 100%; height: 100%; overflow: hidden; display: flex; flex-direction: column;">
			<iframe src="${file.content}" style="width: 100%; height: 100%; border: none; flex-grow: 1;" allow="fullscreen"></iframe>
		</div>
	`;

	const win = createXPWindow(id, file.name, contentHTML, 800, 600, {
		iconSrc: file.icon
	});
	
	const content = win.querySelector('.xp-window-content');
	content.style.padding = '0';
	content.style.overflow = 'hidden';
	content.style.display = 'flex';
	content.style.flexDirection = 'column';
	win.classList.add('pdf-window');
}

function createConfirmationDialog(message, onConfirm) {
	showXPDialog('Confirm Action', message, 'question', {
		buttons: ['Yes', 'No'],
		callback: (result) => {
			if (result === 'Yes') {
				onConfirm();
			}
		}
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
					showXPDialog('Error Renaming File', e.message, 'error');
					input.focus();
					input.select();
				}
			} else {
				success = true;
			}
		} else {
			success = true;
		}

		if (success) {
			input.remove();
			span.style.display = '-webkit-box';
			iconElement.title = element.name;
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

	const existingNames = new Set(fs.root.listContent().map(el => el.name));
	
	projects.flat().forEach(project => {
		if (typeof project === 'object' && project !== null && project.title) {
			if (!existingNames.has(project.title)) {
				const projectFile = new ProjectFile(project.title, null, project);
				projectFile.createdAt = new Date(project.timestamp || Date.now());
				fs.root.add(projectFile);
			}
		}
	});
	fs.save();
}

function renderDesktopIcons() {
	const container = document.getElementById('project-icons-container');
	container.innerHTML = '';

	const appIcons = [{
		name: "My Computer",
		icon: "XPIcon.png",
		action: () => showXPDialog('Error', 'Feature not implemented yet.', 'error'),
		type: "system"
	}, {
		name: "Recycle Bin",
		icon: "trash.png",
		action: () => showXPDialog(
			'Error',
			'Recycle Bin is empty. (feature not implemented yet)',
			'error'
		),
		type: "system"
	}];


	appIcons.forEach(app => {
		const icon = createIconElement({
			name: app.name,
			icon: app.icon,
			path: `app://${app.name.toLowerCase().replace(/\s/g, '-')}`,
			type: 'application',
			element: null
		}, app.action);
		container.appendChild(icon);
	});

	fs.root.listContent().forEach(element => {
		let type = 'file';
		if (element instanceof Folder) type = 'folder';
		else if (element instanceof Shortcut) type = 'shortcut';
		else if (element instanceof ProjectFile) type = 'project';

		const icon = createIconElement({
			name: element.name,
			icon: element.icon,
			path: element.getFullPath(),
			type: type,
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
	icon.title = data.name;

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
	
	if (options.isModal) {
		win.style.width = `${initialWidth}px`;
		win.style.height = 'auto';
		win.style.position = 'relative';
		win.style.boxShadow = '4px 4px 15px rgba(0,0,0,0.5)';
	} else if (!options.isMenu) {
		win.style.width = `${initialWidth}px`;
		win.style.height = `${initialHeight}px`;
		win.style.left = `${Math.random() * (window.innerWidth - initialWidth)}px`;
		win.style.top = `${Math.random() * (window.innerHeight - initialHeight - 40)}px`;
	}
	
	win.style.opacity = '0';
	win.style.zIndex = ++zIndexCounter;

	const minimizeBtnHTML = options.isModal ? '<div class="xp-window-button minimize-btn" style="visibility: hidden;">_</div>' : '<div class="xp-window-button minimize-btn" title="Minimize">_</div>';
	const maximizeBtnHTML = (options.resizable === false || options.isModal) ? '<div class="xp-window-button maximize-btn" style="visibility: hidden;">□</div>' : '<div class="xp-window-button maximize-btn" title="Maximize">□</div>';

	win.innerHTML = `
		<div class="xp-window-header">
			<div style="display: flex; align-items: center; overflow: hidden;">
				${options.iconSrc ? `<img src="${options.iconSrc}" style="width: 16px; height: 16px; margin-right: 4px; pointer-events: none;">` : ''}
				<span class="title">${title}</span>
			</div>
			<div class="xp-window-buttons">
				${minimizeBtnHTML}
				${maximizeBtnHTML}
				<div class="xp-window-button close-btn" title="Close">X</div>
			</div>
		</div>
		<div class="xp-window-content">${contentHTML}</div>
	`;

	if (options.isModal) {
		const overlay = document.createElement('div');
		overlay.className = 'xp-modal-overlay';
		overlay.id = `overlay-${id}`;
		overlay.appendChild(win);
		document.body.appendChild(overlay);
		openWindows[id] = win;
	} else {
		windowArea.appendChild(win);
		openWindows[id] = win;
		makeWindowDraggable(win);
	}
	
	if (options.resizable !== false && !options.isModal) {
		makeWindowResizable(win);
	}

	setupWindowButtons(win, id);

	setTimeout(() => {
		win.classList.remove('opening');
		win.classList.add('opened');
		win.style.opacity = '1';
	}, 50);

	if (!options.isModal) {
		win.addEventListener('mousedown', (e) => {
			if (!e.target.closest('.xp-window-buttons')) {
				bringWindowToFront(win);
			}
		});
		setActiveWindow(win);
		addTaskbarButton(id, title, options.iconSrc);
	}

	return win;
}

function showXPDialog(title, message, type = 'info', options = {}) {
	const id = `dialog-${Date.now()}`;
	let iconSrc = '';
	
	switch (type) {
		case 'error':
			iconSrc = 'https://api.iconify.design/mdi/close-circle.svg?color=red';
			break;
		case 'warning':
			iconSrc = 'https://api.iconify.design/mdi/alert.svg?color=orange';
			break;
		case 'question':
			iconSrc = 'https://api.iconify.design/mdi/help-circle.svg?color=blue';
			break;
		default:
			iconSrc = 'https://api.iconify.design/mdi/information.svg?color=blue';
	}

	const buttons = options.buttons || ['OK'];
	const buttonsHTML = buttons.map(btn => `<button class="xp-button" data-result="${btn}">${btn}</button>`).join('');

	const contentHTML = `
		<div class="xp-dialog-content">
			<img src="${iconSrc}" class="xp-dialog-icon" alt="${type}">
			<div style="font-size: 11px; line-height: 1.5; align-self: center;">${message}</div>
		</div>
		<div class="xp-dialog-buttons">
			${buttonsHTML}
		</div>
	`;

	const dialog = createXPWindow(id, title, contentHTML, 350, 150, { 
		resizable: false, 
		isModal: true
	});
	
	dialog.querySelector('.xp-window-content').style.padding = '0';
	dialog.querySelector('.xp-window-content').style.display = 'flex';
	dialog.querySelector('.xp-window-content').style.flexDirection = 'column';

	const btnElements = dialog.querySelectorAll('.xp-dialog-buttons .xp-button');
	btnElements.forEach(btn => {
		btn.addEventListener('click', () => {
			const result = btn.dataset.result;
			closeWindow(dialog, id);
			if (options.callback) options.callback(result);
		});
		
		if (buttons.length === 1 || btn.dataset.result === 'Yes' || btn.dataset.result === 'OK') {
			btn.focus();
		}
	});
	
	return dialog;
}

function makeWindowDraggable(win) {
	const header = win.querySelector('.xp-window-header');
	const overlay = document.getElementById('iframe-drag-overlay');
	let isDragging = false;
	let offsetX, offsetY;

	header.addEventListener('mousedown', (e) => {
		bringWindowToFront(win);
		if (e.target.closest('.xp-window-buttons')) return;

		isDragging = true;
		if (overlay) overlay.style.display = 'block';
		document.body.classList.add('iframe-overlay-active');
		
		win.style.cursor = 'grabbing';
		win.style.transition = 'none';

		const rect = win.getBoundingClientRect();
		offsetX = e.clientX - rect.left;
		offsetY = e.clientY - rect.top;
	});

	document.addEventListener('mousemove', (e) => {
		if (!isDragging) return;

		let newLeft = e.clientX - offsetX;
		let newTop = e.clientY - offsetY;

		const desktop = document.getElementById('desktop');
		const desktopRect = desktop.getBoundingClientRect();
		const winRect = win.getBoundingClientRect();

		newLeft = Math.max(desktopRect.left - winRect.width + 30, Math.min(newLeft, desktopRect.right - 30));
		newTop = Math.max(desktopRect.top, Math.min(newTop, desktopRect.bottom - 30));

		win.style.left = `${newLeft}px`;
		win.style.top = `${newTop}px`;
		win.style.transform = 'none';
	});

	document.addEventListener('mouseup', () => {
		if (isDragging) {
			isDragging = false;
			if (overlay) overlay.style.display = 'none';
			document.body.classList.remove('iframe-overlay-active');
			win.style.cursor = 'default';
			win.style.transition = '';
		}
	});
}

function makeWindowResizable(win) {
	const BORDER_SIZE = 6;
	const overlay = document.getElementById('iframe-drag-overlay');
	let isResizing = false;
	let resizeDir = '';

	win.addEventListener('mousemove', (e) => {
		if (win.classList.contains('maximized') || isResizing) {
			win.style.cursor = '';
			return;
		}

		const rect = win.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;

		const onRight = x >= rect.width - BORDER_SIZE;
		const onLeft = x <= BORDER_SIZE;
		const onBottom = y >= rect.height - BORDER_SIZE;
		const onTop = y <= BORDER_SIZE;

		if (onRight && onBottom) win.style.cursor = 'nwse-resize';
		else if (onLeft && onBottom) win.style.cursor = 'nesw-resize';
		else if (onLeft && onTop) win.style.cursor = 'nwse-resize';
		else if (onRight && onTop) win.style.cursor = 'nesw-resize';
		else if (onRight) win.style.cursor = 'ew-resize';
		else if (onLeft) win.style.cursor = 'ew-resize';
		else if (onBottom) win.style.cursor = 'ns-resize';
		else if (onTop) win.style.cursor = 'ns-resize';
		else win.style.cursor = '';
	});

	win.addEventListener('mousedown', (e) => {
		if (win.classList.contains('maximized')) return;

		const rect = win.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;

		const onRight = x >= rect.width - BORDER_SIZE;
		const onLeft = x <= BORDER_SIZE;
		const onBottom = y >= rect.height - BORDER_SIZE;
		const onTop = y <= BORDER_SIZE;

		if (!onRight && !onLeft && !onBottom && !onTop) return;

		isResizing = true;
		if (overlay) overlay.style.display = 'block';
		document.body.classList.add('iframe-overlay-active');
		document.body.style.userSelect = 'none';
		
		resizeDir = '';
		if (onTop) resizeDir += 'n';
		if (onBottom) resizeDir += 's';
		if (onLeft) resizeDir += 'w';
		if (onRight) resizeDir += 'e';

		const startX = e.clientX;
		const startY = e.clientY;
		const startWidth = rect.width;
		const startHeight = rect.height;
		const startLeft = rect.left;
		const startTop = rect.top;

		const handleResize = (e) => {
			if (!isResizing) return;

			if (resizeDir.includes('e')) {
				win.style.width = `${Math.max(200, startWidth + e.clientX - startX)}px`;
			}
			if (resizeDir.includes('s')) {
				win.style.height = `${Math.max(100, startHeight + e.clientY - startY)}px`;
			}
			if (resizeDir.includes('w')) {
				const width = Math.max(200, startWidth - (e.clientX - startX));
				win.style.width = `${width}px`;
				win.style.left = `${startLeft + (startWidth - width)}px`;
			}
			if (resizeDir.includes('n')) {
				const height = Math.max(100, startHeight - (e.clientY - startY));
				win.style.height = `${height}px`;
				win.style.top = `${startTop + (startHeight - height)}px`;
			}
		};

		const stopResize = () => {
			isResizing = false;
			if (overlay) overlay.style.display = 'none';
			document.body.classList.remove('iframe-overlay-active');
			document.body.style.userSelect = '';
			document.removeEventListener('mousemove', handleResize);
			document.removeEventListener('mouseup', stopResize);
		};

		document.addEventListener('mousemove', handleResize);
		document.addEventListener('mouseup', stopResize);
	});
}

function setupWindowButtons(win, id) {
	win.querySelector('.minimize-btn').addEventListener('click', () => minimizeWindow(win, id));
	win.querySelector('.maximize-btn').addEventListener('click', () => maximizeWindow(win));
	win.querySelector('.close-btn').addEventListener('click', () => closeWindow(win, id));
}

function setupKeyboardNavigation() {
	document.addEventListener('keydown', (e) => {
		if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
			return;
		}

		let container;
		let icons;
		
		if (activeWindow && activeWindow.classList.contains('project-window')) {
			container = activeWindow.querySelector('.folder-content');
		} else if (!activeWindow) {
			container = document.getElementById('project-icons-container');
		}

		if (!container) return;

		icons = Array.from(container.querySelectorAll('.project-icon'));
		if (icons.length === 0) return;

		const selected = container.querySelector('.project-icon.selected');
		
		if (e.key === 'Enter') {
			if (selected) {
				const dblClickEvent = new MouseEvent('dblclick', {
					'view': window,
					'bubbles': true,
					'cancelable': true
				});
				selected.dispatchEvent(dblClickEvent);
			}
			return;
		}

		if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) return;

		e.preventDefault();

		if (!selected) {
			icons[0].classList.add('selected');
			selectedIcons.add(icons[0]);
			return;
		}

		const currentRect = selected.getBoundingClientRect();
		const currentX = currentRect.left + currentRect.width / 2;
		const currentY = currentRect.top + currentRect.height / 2;

		let bestCandidate = null;
		let minDistance = Infinity;

		icons.forEach(icon => {
			if (icon === selected) return;

			const rect = icon.getBoundingClientRect();
			const x = rect.left + rect.width / 2;
			const y = rect.top + rect.height / 2;

			let dx = x - currentX;
			let dy = y - currentY;
			let dist = Math.sqrt(dx*dx + dy*dy);

			let isValid = false;

			if (e.key === 'ArrowRight') isValid = dx > 0 && Math.abs(dy) < rect.height;
			if (e.key === 'ArrowLeft') isValid = dx < 0 && Math.abs(dy) < rect.height;
			if (e.key === 'ArrowDown') isValid = dy > 0 && Math.abs(dx) < rect.width;
			if (e.key === 'ArrowUp') isValid = dy < 0 && Math.abs(dx) < rect.width;

			if (isValid && dist < minDistance) {
				minDistance = dist;
				bestCandidate = icon;
			}
		});

		if (bestCandidate) {
			clearIconSelections();
			bestCandidate.classList.add('selected');
			selectedIcons.add(bestCandidate);
			
			if (activeWindow) {
				updateFolderUISelection(activeWindow);
			}
		}
	});
}

function setActiveWindow(win) {
	const allWindows = document.querySelectorAll('.xp-window');
	allWindows.forEach(w => {
		const header = w.querySelector('.xp-window-header');
		if (header) header.classList.add('inactive');
	});

	const allTaskbarBtns = document.querySelectorAll('.taskbar-window-btn');
	allTaskbarBtns.forEach(btn => btn.classList.remove('active'));

	activeWindow = win;
	const currentHeader = win.querySelector('.xp-window-header');
	if (currentHeader) currentHeader.classList.remove('inactive');

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
	const maxBtn = win.querySelector('.maximize-btn');

	if (win.classList.contains('maximized')) {
		win.style.transition = 'none';
		win.style.top = win.dataset.restoreTop;
		win.style.left = win.dataset.restoreLeft;
		win.style.width = win.dataset.restoreWidth;
		win.style.height = win.dataset.restoreHeight;
		win.classList.remove('maximized');
		maxBtn.textContent = '□';
		maxBtn.title = "Maximize";
		setTimeout(() => {
			win.style.transition = '';
		}, 50);
	} else {
		win.dataset.restoreTop = win.style.top;
		win.dataset.restoreLeft = win.style.left;
		win.dataset.restoreWidth = win.style.width;
		win.dataset.restoreHeight = win.style.height;

		win.style.transition = 'none';
		win.style.top = '0';
		win.style.left = '0';
		win.style.width = '100vw';
		win.style.height = 'calc(100vh - 40px)';
		win.style.transform = 'none';
		win.classList.add('maximized');
		maxBtn.textContent = '❐';
		maxBtn.title = "Restore Down";
		setTimeout(() => {
			win.style.transition = '';
		}, 50);
	}
}

function closeWindow(win, id) {
	win.classList.add('minimizing');
	win.style.opacity = '0';
	win.style.transform = 'scale(0.1)';

	win.addEventListener('transitionend', function handler() {
		const overlay = document.getElementById(`overlay-${id}`);
		if (overlay) {
			overlay.remove();
		} else {
			win.remove();
		}
		
		delete openWindows[id];
		removeTaskbarButton(id);
		if (activeWindow === win) {
			activeWindow = null;
		}
		win.removeEventListener('transitionend', handler);
	});
}

function addTaskbarButton(id, title, iconSrc) {
	const taskbarWindows = document.getElementById('taskbar-windows');
	const btn = document.createElement('div');
	btn.className = 'taskbar-window-btn';
	btn.dataset.windowId = id;

	const iconHTML = iconSrc ? `<img src="${iconSrc}" class="taskbar-btn-icon" alt="">` : '';
	btn.innerHTML = `${iconHTML}<span>${title}</span>`;
	
	taskbarWindows.appendChild(btn);

	btn.addEventListener('click', () => {
		const win = document.getElementById(id);
		if (win) {
			if (win.classList.contains('minimized')) {
				unminimizeWindow(win);
				bringWindowToFront(win);
			} else {
				if (activeWindow === win) {
					minimizeWindow(win, id);
				} else {
					bringWindowToFront(win);
				}
			}
		}
	});

	btn.addEventListener('contextmenu', (e) => {
		e.preventDefault();
		const menu = document.getElementById('taskbar-context-menu');
		const win = document.getElementById(id);
		
		if (!menu || !win) return;

		menu.dataset.targetId = id;
		
		const restoreBtn = menu.querySelector('[data-action="restore"]');
		const minimizeBtn = menu.querySelector('[data-action="minimize"]');
		const maximizeBtn = menu.querySelector('[data-action="maximize"]');

		restoreBtn.classList.remove('disabled');
		minimizeBtn.classList.remove('disabled');
		maximizeBtn.classList.remove('disabled');

		if (win.classList.contains('minimized')) {
			minimizeBtn.classList.add('disabled');
		} else if (win.classList.contains('maximized')) {
			maximizeBtn.classList.add('disabled');
		} else {
			restoreBtn.classList.add('disabled');
		}

		menu.classList.remove('hidden');
		menu.style.bottom = '40px';
		menu.style.left = `${e.clientX}px`;
		menu.style.top = 'auto'; 
		
		const rect = menu.getBoundingClientRect();
		if (rect.right > window.innerWidth) {
			menu.style.left = `${window.innerWidth - rect.width}px`;
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

	const languageNames = {
		en: 'English',
		fr: 'French',
		de: 'German',
		es: 'Spanish',
		it: 'Italian',
		pt: 'Portuguese',
		la: 'Latin',
		zh: 'Chinese',
		ja: 'Japanese',
		ko: 'Korean',
		ru: 'Russian',
		ar: 'Arabic',
		nl: 'Dutch',
		pl: 'Polish',
		sv: 'Swedish'
	};

	const projectLangs = project.languages || [];
	let languagesHtml = '';
	if (projectLangs.length > 0) {
		const langList = projectLangs.map(l => languageNames[l] || l).join(', ');
		languagesHtml = `<p><strong>Languages:</strong> ${langList}</p>`;
	}

	const githubLink = project.github ? `
		<a href="${project.github}" target="_blank" class="xp-button project-link-button">
			<img src="https://img.icons8.com/fluent/24/000000/github.png" alt="GitHub">
			<span>GitHub</span>
		</a>` : '';

	const projectLink = `
		<a href="${project.link}" target="_blank" class="xp-button project-link-button">
			<img src="https://www.svgrepo.com/show/326731/open-outline.svg" alt="Open">
			<span>Open in New Tab</span>
		</a>`;

	const runLink = `
		<button class="xp-button project-link-button run-project-btn">
			<img src="https://api.iconify.design/mdi/play-box-outline.svg" alt="Run">
			<span>Run Application</span>
		</button>`;

	const content = `
		<div class="project-view-layout">
			<div class="project-view-sidebar">
				<div class="project-view-image-container">
					<img src="${project.icon}" alt="${project.title}" class="project-view-image">
				</div>
				<h4>Quick Links</h4>
				<div class="project-view-links">
					${runLink}
					${projectLink}
					${githubLink}
				</div>
				 <div class="project-details">
					<h4>Details</h4>
					<p><strong>Category:</strong> ${project.keywords ? project.keywords.join(', ') : 'N/A'}</p>
					${languagesHtml}
				</div>
			</div>
			<div class="project-view-main">
				<h2>${project.title}</h2>
				<p class="project-long-description">${project.longDescription || project.longDescrition || project.description || 'No description available.'}</p>
			</div>
			<div class="project-view-statusbar">
				<span>Ready</span>
				<span class="status-separator"></span>
				<span>${project.title}</span>
			</div>
		</div>
	`;

	const projectWindow = createXPWindow(id, project.title, content, 700, 500, { iconSrc: project.icon });
	projectWindow.querySelector('.xp-window-content').style.padding = '0';
	projectWindow.classList.add('project-window');

	const runBtn = projectWindow.querySelector('.run-project-btn');
	if (runBtn) {
		runBtn.addEventListener('click', () => {
			const appId = `app-running-${project.title.replace(/\s/g, '-')}-${Date.now()}`;
			const appContent = `<iframe src="${project.link}" style="width: 100%; height: 100%; border: none;"></iframe>`;
			const appWindow = createXPWindow(appId, project.title, appContent, 800, 600, { iconSrc: project.icon });
			appWindow.querySelector('.xp-window-content').style.padding = '0';
			appWindow.querySelector('.xp-window-content').style.overflow = 'hidden';
		});
	}
}

function setupStartButton() {
	const startButton = document.getElementById('start-button');
	const startMenu = document.getElementById('start-menu');
	const taskbarStartButton = document.getElementById('taskbar-start-button');
	const calendarPopup = document.getElementById('calendar-popup');
	const clockElement = document.getElementById('taskbar-clock');
	const allProgramsBtn = document.querySelector('.all-programs-btn');
	const allProgramsSubmenu = document.getElementById('all-programs-submenu');

	function toggleStartMenu(forceClose = false) {
		const isHidden = startMenu.classList.contains('hidden');
		if (forceClose || !isHidden) {
			startMenu.classList.add('hidden');
			allProgramsSubmenu.classList.add('hidden');
			startButton.classList.remove('active');
			taskbarStartButton.classList.remove('active');
		} else {
			startMenu.classList.remove('hidden');
			startButton.classList.add('active');
			taskbarStartButton.classList.add('active');
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
			toggleStartMenu(true);
		}
		if (!calendarPopup.classList.contains('hidden') && !calendarPopup.contains(e.target) && e.target !== clockElement) {
			calendarPopup.classList.add('hidden');
		}
	});

	allProgramsBtn.addEventListener('click', (e) => {
		e.stopPropagation();
		allProgramsSubmenu.classList.toggle('hidden');
	});

	startMenu.addEventListener('click', (e) => {
		const targetItem = e.target.closest('[data-action]');
		if (targetItem) {
			const action = targetItem.dataset.action;
			if (action === 'all-projects') {
				e.preventDefault();
				toggleStartMenu(true);
				openAllProjectsFolder();
			} else if (action === 'open-ie') {
				toggleStartMenu(true);
				openInternetExplorer();
			} else if (action === 'open-outlook') {
				toggleStartMenu(true);
				openOutlookExpress();
			} else if (action === 'open-winamp') {
				toggleStartMenu(true);
				openWinamp();
			} else if (action === 'open-minesweeper') {
				toggleStartMenu(true);
				openMinesweeper();
			} else if (action === 'run') {
				toggleStartMenu(true);
				openRunDialog();
			} else if (action === 'turn-off') {
				toggleStartMenu(true);
				openShutdownDialog();
			} else if (action === 'log-off') {
				toggleStartMenu(true);
				alert('Log Off is not available in the guest session.');
			} else if (action === 'help') {
				toggleStartMenu(true);
				window.open('https://github.com/wartets/Wartets', '_blank');
			}
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

function openWinamp() {
	if (webampInstance) {
		webampInstance.reopen();
		return;
	}

	const Webamp = window.Webamp;
	if (!Webamp) {
		showXPDialog('Error', 'Winamp library failed to load.', 'error');
		return;
	}

	webampInstance = new Webamp({
		initialTracks: [{
			metaData: {
				artist: "Wartets",
				title: "Projet 8.4"
			},
			url: "Projet_8.4.mp3",
			duration: 4.333
		}],
		zIndex: 9000
	});

	webampInstance.onClose(() => {
		webampInstance.dispose();
		webampInstance = null;
	});

	webampInstance.onMinimize(() => {
		webampInstance.dispose(); 
		webampInstance = null;
	});

	webampInstance.renderWhenReady(document.getElementById('window-area'));
}

function openMinesweeper() {
	const id = 'window-minesweeper';
	if (document.getElementById(id)) {
		bringWindowToFront(document.getElementById(id));
		return;
	}

	const rows = 9;
	const cols = 9;
	const minesCount = 10;
	let gameOver = false;
	let grid = [];
	let minesFound = 0;
	let timer = 0;
	let timerInterval;

	const contentHTML = `
		<div class="minesweeper-container">
			<div class="minesweeper-header">
				<div class="minesweeper-counter" id="mine-counter">010</div>
				<button class="minesweeper-face" id="minesweeper-reset">🙂</button>
				<div class="minesweeper-counter" id="time-counter">000</div>
			</div>
			<div class="minesweeper-grid" id="minesweeper-grid"></div>
		</div>
	`;

	const win = createXPWindow(id, 'Minesweeper', contentHTML, 200, 280, { 
		resizable: false,
		iconSrc: 'https://api.iconify.design/mdi/mine.svg' 
	});

	const gridEl = win.querySelector('#minesweeper-grid');
	const resetBtn = win.querySelector('#minesweeper-reset');
	const mineCounter = win.querySelector('#mine-counter');
	const timeCounter = win.querySelector('#time-counter');

	function initGame() {
		gameOver = false;
		minesFound = 0;
		timer = 0;
		clearInterval(timerInterval);
		timeCounter.textContent = '000';
		mineCounter.textContent = String(minesCount).padStart(3, '0');
		resetBtn.textContent = '🙂';
		gridEl.innerHTML = '';
		grid = [];
		
		gridEl.style.gridTemplateColumns = `repeat(${cols}, 20px)`;

		for (let r = 0; r < rows; r++) {
			const row = [];
			for (let c = 0; c < cols; c++) {
				const cell = document.createElement('div');
				cell.className = 'minesweeper-cell';
				cell.dataset.r = r;
				cell.dataset.c = c;
				
				cell.addEventListener('mousedown', (e) => {
					if (gameOver) return;
					if (e.button === 0) resetBtn.textContent = '😮';
				});

				cell.addEventListener('mouseup', () => {
					if (gameOver) return;
					resetBtn.textContent = '🙂';
				});

				cell.addEventListener('click', () => reveal(r, c));
				cell.addEventListener('contextmenu', (e) => {
					e.preventDefault();
					toggleFlag(r, c);
				});

				gridEl.appendChild(cell);
				row.push({ 
					element: cell, 
					isMine: false, 
					revealed: false, 
					flagged: false, 
					neighborMines: 0 
				});
			}
			grid.push(row);
		}

		placeMines();
		calculateNeighbors();
	}

	function placeMines() {
		let placed = 0;
		while (placed < minesCount) {
			const r = Math.floor(Math.random() * rows);
			const c = Math.floor(Math.random() * cols);
			if (!grid[r][c].isMine) {
				grid[r][c].isMine = true;
				placed++;
			}
		}
	}

	function calculateNeighbors() {
		for (let r = 0; r < rows; r++) {
			for (let c = 0; c < cols; c++) {
				if (grid[r][c].isMine) continue;
				let count = 0;
				for (let dr = -1; dr <= 1; dr++) {
					for (let dc = -1; dc <= 1; dc++) {
						const nr = r + dr;
						const nc = c + dc;
						if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc].isMine) {
							count++;
						}
					}
				}
				grid[r][c].neighborMines = count;
			}
		}
	}

	function startTimer() {
		if (timerInterval) return;
		timerInterval = setInterval(() => {
			timer++;
			if (timer > 999) timer = 999;
			timeCounter.textContent = String(timer).padStart(3, '0');
		}, 1000);
	}

	function reveal(r, c) {
		if (gameOver || grid[r][c].revealed || grid[r][c].flagged) return;
		
		startTimer();
		const cell = grid[r][c];
		cell.revealed = true;
		cell.element.classList.add('revealed');

		if (cell.isMine) {
			cell.element.classList.add('mine');
			cell.element.textContent = '💣';
			cell.element.style.backgroundColor = 'red';
			gameOver = true;
			resetBtn.textContent = '😵';
			clearInterval(timerInterval);
			revealAllMines();
		} else {
			if (cell.neighborMines > 0) {
				cell.element.textContent = cell.neighborMines;
				cell.element.dataset.num = cell.neighborMines;
			} else {
				for (let dr = -1; dr <= 1; dr++) {
					for (let dc = -1; dc <= 1; dc++) {
						const nr = r + dr;
						const nc = c + dc;
						if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
							reveal(nr, nc);
						}
					}
				}
			}
			checkWin();
		}
	}

	function toggleFlag(r, c) {
		if (gameOver || grid[r][c].revealed) return;
		startTimer();
		const cell = grid[r][c];
		cell.flagged = !cell.flagged;
		if (cell.flagged) {
			cell.element.textContent = '🚩';
			cell.element.classList.add('flagged');
			minesFound++;
		} else {
			cell.element.textContent = '';
			cell.element.classList.remove('flagged');
			minesFound--;
		}
		mineCounter.textContent = String(Math.max(0, minesCount - minesFound)).padStart(3, '0');
	}

	function revealAllMines() {
		for (let r = 0; r < rows; r++) {
			for (let c = 0; c < cols; c++) {
				if (grid[r][c].isMine) {
					grid[r][c].element.classList.add('revealed', 'mine');
					grid[r][c].element.textContent = '💣';
				}
			}
		}
	}

	function checkWin() {
		let revealedCount = 0;
		for (let r = 0; r < rows; r++) {
			for (let c = 0; c < cols; c++) {
				if (grid[r][c].revealed) revealedCount++;
			}
		}
		if (revealedCount === (rows * cols) - minesCount) {
			gameOver = true;
			resetBtn.textContent = '😎';
			clearInterval(timerInterval);
			mineCounter.textContent = '000';
		}
	}

	resetBtn.addEventListener('click', initGame);
	initGame();
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
	const projectsFolder = new Folder("My Projects");
	const projectsShortcuts = new Folder("All Project Shortcuts");

	const findProjects = (folder) => {
		folder.children.forEach(child => {
			if (child instanceof ProjectFile) {
				const shortcut = new Shortcut(
					child.name,
					null,
					child.getFullPath(),
					child.icon
				);
				shortcut.createdAt = child.createdAt;
				projectsShortcuts.add(shortcut);
			} else if (child instanceof Folder) {
				findProjects(child);
			}
		});
	};

	findProjects(fs.root);

	projectsFolder.add(projectsShortcuts);
	openFolderWindow(projectsFolder);
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
		
		const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
		clockElement.title = now.toLocaleDateString('en-US', options);
	}

	clockElement.addEventListener('click', (e) => {
		e.stopPropagation();
		const isHidden = calendarPopup.classList.contains('hidden');
		if (isHidden) {
			renderCalendar(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth());
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

function renderAllProgramsMenu() {
	const categoriesList = document.getElementById('all-programs-submenu');
	categoriesList.innerHTML = '';
	const allKeywords = new Set();
	const projectIcons = {};

	projects.flat().forEach(p => {
		if (typeof p === 'object' && p !== null && p.keywords) {
			p.keywords.forEach(kw => {
				allKeywords.add(kw);
				if (!projectIcons[kw]) {
					projectIcons[kw] = p.icon;
				}
			});
		}
	});

	const sortedKeywords = [...allKeywords].sort();
	sortedKeywords.forEach(keyword => {
		const li = document.createElement('li');
		const a = document.createElement('a');
		a.href = '#';
		a.dataset.category = keyword;

		const img = document.createElement('img');
		img.src = projectIcons[keyword] || 'https://img.icons8.com/fluent/48/folder-invoices.png';
		a.appendChild(img);

		const span = document.createElement('span');
		span.textContent = keyword.charAt(0).toUpperCase() + keyword.slice(1);
		a.appendChild(span);

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
		<div id="filtered-projects-folder-content" class="folder-content" style="display: flex; flex-wrap: wrap; gap: 10px; padding: 5px;">
		</div>
	`;
	const folderWindow = createXPWindow(id, title, contentHTML, 700, 500);

	const folderContent = folderWindow.querySelector('#filtered-projects-folder-content');
	
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

function setupTaskbarContextMenu() {
	const menu = document.getElementById('taskbar-context-menu');
	
	document.addEventListener('mousedown', (e) => {
		if (!menu.classList.contains('hidden') && !menu.contains(e.target)) {
			menu.classList.add('hidden');
		}
	});

	menu.addEventListener('click', (e) => {
		const action = e.target.dataset.action;
		const targetId = menu.dataset.targetId;
		const win = document.getElementById(targetId);

		if (!action || !win || e.target.classList.contains('disabled')) return;

		switch (action) {
			case 'restore':
				if (win.classList.contains('minimized')) unminimizeWindow(win);
				else if (win.classList.contains('maximized')) maximizeWindow(win);
				bringWindowToFront(win);
				break;
			case 'minimize':
				minimizeWindow(win, targetId);
				break;
			case 'maximize':
				if (!win.classList.contains('maximized')) maximizeWindow(win);
				bringWindowToFront(win);
				break;
			case 'close':
				closeWindow(win, targetId);
				break;
		}
		menu.classList.add('hidden');
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
		showXPDialog('Error', error.message, 'error');
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
		const target = fs.findByPath(element.targetPath);
		if (target) {
			openFileSystemElement(target);
		} else if (element.targetPath.startsWith('project://')) {
			showXPDialog('Shortcut Error', 'Legacy project shortcut format is no longer supported.', 'error');
		} else {
			showXPDialog('Shortcut Error', 'The item that this shortcut refers to has been changed or moved.', 'error');
		}
	} else if (element instanceof ProjectFile) {
		openProjectWindow(element.projectData);
	} else if (element instanceof File) {
		const lowerName = element.name.toLowerCase();
		if (lowerName.endsWith('.pdf')) {
			openPDFWindow(element);
		} else if (lowerName.endsWith('.html') || lowerName.endsWith('.htm')) {
			openInternetExplorer();
			const ieWindow = document.getElementById('window-internet-explorer');
			if (ieWindow) {
				const iframe = ieWindow.querySelector('iframe');
				const addressBar = ieWindow.querySelector('#ie-address-bar');
				const homePage = ieWindow.querySelector('#ie-homepage');
				
				homePage.style.display = 'none';
				iframe.style.display = 'block';
				
				let contentUrl = element.content; 
				if (!contentUrl.startsWith('http') && !contentUrl.startsWith('data:')) {
					contentUrl = 'data:text/html;charset=utf-8,' + encodeURIComponent(element.content);
				}
				
				iframe.src = contentUrl;
				addressBar.value = element.name;
			}
		} else {
			openTextEditorWindow(element);
		}
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
					<input type="text" class="folder-address-bar">
					<button class="xp-button-small" style="height: 20px; margin-left: 2px;">Go</button>
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
							<li><a href="#" data-place="/My Projects">My Projects</a></li>
							<li><a href="#" data-place="/My Documents">My Documents</a></li>
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
						<div class="folder-content" data-path="${folder.getFullPath()}"></div>
					</div>
					<div class="folder-status-bar">
						<div class="status-bar-left"></div>
						<div class="status-bar-right"></div>
					</div>
				</div>
			</div>
		</div>
	`;

	const folderWindow = createXPWindow(id, title, contentHTML, 700, 500, { iconSrc: folder.icon });
	folderWindow.classList.add('project-window');
	folderWindow.querySelector('.xp-window-content').style.padding = '0';
	folderWindow.navigationHistory = {
		history: [],
		currentIndex: -1
	};
	folderWindow.dataset.viewMode = 'icons';

	const contentArea = folderWindow.querySelector('.folder-content');
	const addressBar = folderWindow.querySelector('.folder-address-bar');
	
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

	contentArea.addEventListener('click', (e) => {
		if (e.target === contentArea) {
			clearIconSelections();
			updateFolderUISelection(folderWindow);
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
			if (targetFolder) navigateToFolder(targetFolder, folderWindow, false);
		}
	});

	folderWindow.querySelector('.forward-btn').addEventListener('click', () => {
		const nav = folderWindow.navigationHistory;
		if (nav.currentIndex < nav.history.length - 1) {
			nav.currentIndex++;
			const folderPath = nav.history[nav.currentIndex];
			const targetFolder = fs.findByPath(folderPath);
			if (targetFolder) navigateToFolder(targetFolder, folderWindow, false);
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

	const handleNavigation = () => {
		const path = addressBar.value;
		const targetFolder = fs.findByPath(path);
		if (targetFolder instanceof Folder) {
			navigateToFolder(targetFolder, folderWindow);
		} else {
			showXPDialog('Address Bar', `Cannot find '${path}'. Check the spelling and try again.`, 'error');
		}
	};

	addressBar.addEventListener('keydown', (e) => {
		if (e.key === 'Enter') handleNavigation();
	});
	
	folderWindow.querySelector('.folder-address-bar-container button').addEventListener('click', handleNavigation);

	navigateToFolder(folder, folderWindow);
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

			let type = 'File';
			if (element instanceof Folder) type = 'Folder';
			else if (element instanceof Shortcut) type = 'Shortcut';
			else if (element instanceof ProjectFile) type = 'Project';

			const iconData = {
				name: element.name,
				icon: element.icon,
				path: element.getFullPath(),
				type: type.toLowerCase(),
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
			typeDiv.textContent = type;
			row.appendChild(typeDiv);

			const modifiedDiv = document.createElement('div');
			modifiedDiv.className = 'col-modified';
			modifiedDiv.textContent = element.modifiedAt.toLocaleString();
			row.appendChild(modifiedDiv);

			container.appendChild(row);
		});
	} else {
		items.forEach(element => {
			let type = 'file';
			if (element instanceof Folder) type = 'folder';
			else if (element instanceof Shortcut) type = 'shortcut';
			else if (element instanceof ProjectFile) type = 'project';

			const icon = createIconElement({
				name: element.name,
				icon: element.icon,
				path: element.getFullPath(),
				type: type,
				element: element
			}, (el) => openFileSystemElement(el, win));

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

	updateFolderView(folder, win, false);
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

	if (!folderContent) return;

	const folder = fs.findByPath(folderContent.dataset.path);

	const totalItems = folder ? folder.listContent().length : 0;

	if (selectedItems.length === 0) {
		if (fileTasksSection) fileTasksSection.querySelectorAll('a').forEach(a => a.classList.add('disabled'));
		if (detailsSection && folder) detailsSection.innerHTML = `<b>${folder.name}</b><br>${folder.constructor.name}`;
		if (statusBarLeft) statusBarLeft.textContent = `${totalItems} object(s)`;
	} else if (selectedItems.length === 1) {
		if (fileTasksSection) fileTasksSection.querySelectorAll('a').forEach(a => a.classList.remove('disabled'));
		const icon = selectedItems[0];
		const element = fs.findByPath(icon.dataset.path);
		if (element && detailsSection) {
			detailsSection.innerHTML = `
				<b>${element.name}</b>
				${element.constructor.name}<br>
				Modified: ${element.modifiedAt.toLocaleDateString()}
				${element.size ? `<br>Size: ${Math.ceil(element.size / 1024)} KB` : ''}
			`;
		}
		if (statusBarLeft) statusBarLeft.textContent = `1 object(s) selected`;
	} else {
		if (fileTasksSection) {
			fileTasksSection.querySelectorAll('a').forEach(a => {
				const task = a.dataset.task;
				if (task === 'rename') {
					a.classList.add('disabled');
				} else {
					a.classList.remove('disabled');
				}
			});
		}
		if (detailsSection) detailsSection.innerHTML = `${selectedItems.length} items selected.`;
		if (statusBarLeft) statusBarLeft.textContent = `${selectedItems.length} object(s) selected`;
	}
}

function arrangeIcons(sortBy) {
	const container = document.getElementById('project-icons-container');
	const icons = Array.from(container.children);
	
	const getElement = (icon) => {
		const path = icon.dataset.path;
		if (path.startsWith('app://')) {
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

	const iconWidth = 75;
	const iconHeight = 100;
	const startX = 10;
	const startY = 10;
	
	const desktopHeight = window.innerHeight - 40;
	const iconsPerColumn = Math.floor((desktopHeight - startY) / iconHeight);
	
	container.innerHTML = '';
	icons.forEach((icon, index) => {
		const col = Math.floor(index / iconsPerColumn);
		const row = index % iconsPerColumn;

		icon.style.position = 'absolute';
		icon.style.left = `${startX + col * (iconWidth + 10)}px`;
		icon.style.top = `${startY + row * iconHeight}px`;
		container.appendChild(icon);
	});
}

function handleDragStart(e) {
	if (e.target.classList.contains('project-icon')) {
		const path = e.target.dataset.path;
		
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
	} else if ((destElement instanceof File || destElement instanceof Shortcut || destElement instanceof ProjectFile) && destElement.parent) {
		finalDestPath = destElement.parent.getFullPath();
	} else if (target.id === 'desktop') {
		finalDestPath = '/';
	} else {
		return;
	}

	if (pathsData) {
		const sourcePaths = JSON.parse(pathsData);
		sourcePaths.forEach(sourcePath => {
			try {
				if (sourcePath && sourcePath !== finalDestPath) fs.move(sourcePath, finalDestPath);
			} catch (error) {
				showXPDialog('Error', `Error moving item: ${error.message}`, 'error');
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

function openTextEditorWindow(file) {
	const id = `window-file-${file.getFullPath().replace(/[^\w-]/g, '_')}`;
	const existingWindow = document.getElementById(id);
	if (existingWindow) {
		bringWindowToFront(existingWindow);
		return;
	}

	const uniqueId = `editor-${Date.now()}`;
	const content = `
		<div class="notepad-layout">
			<div id="toolbar-${uniqueId}" class="notepad-toolbar">
				<span class="ql-formats">
					<select class="ql-font"></select>
					<select class="ql-size"></select>
				</span>
				<span class="ql-formats">
					<button class="ql-bold"></button>
					<button class="ql-italic"></button>
					<button class="ql-underline"></button>
					<button class="ql-strike"></button>
				</span>
				<span class="ql-formats">
					<select class="ql-color"></select>
					<select class="ql-background"></select>
				</span>
				<span class="ql-formats">
					<button class="ql-script" value="sub"></button>
					<button class="ql-script" value="super"></button>
				</span>
				<span class="ql-formats">
					<button class="ql-header" value="1"></button>
					<button class="ql-header" value="2"></button>
					<button class="ql-blockquote"></button>
					<button class="ql-code-block"></button>
				</span>
				<span class="ql-formats">
					<button class="ql-list" value="ordered"></button>
					<button class="ql-list" value="bullet"></button>
					<button class="ql-indent" value="-1"></button>
					<button class="ql-indent" value="+1"></button>
				</span>
				<span class="ql-formats">
					<select class="ql-align"></select>
				</span>
				<span class="ql-formats">
					<button class="ql-link"></button>
					<button class="ql-image"></button>
				</span>
				<span class="ql-formats">
					<button class="ql-clean"></button>
				</span>
			</div>
			<div class="notepad-editor-container">
				 <div id="${uniqueId}"></div>
			</div>
		</div>
	`;
	const win = createXPWindow(id, `${file.name} - Notepad`, content, 700, 500, {
		iconSrc: file.icon
	});
	win.querySelector('.xp-window-content').style.padding = '0';

	const quill = new Quill(`#${uniqueId}`, {
		modules: {
			toolbar: `#toolbar-${uniqueId}`
		},
		theme: 'snow'
	});

	const initialContent = file.read();
	if (initialContent) {
		quill.clipboard.dangerouslyPasteHTML(0, initialContent);
	}

	let saveTimeout;
	quill.on('text-change', () => {
		clearTimeout(saveTimeout);
		saveTimeout = setTimeout(() => {
			file.write(quill.root.innerHTML);
			fs.save();
		}, 500);
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
	const displayWindow = createXPWindow(id, title, contentHTML, 400, 350, { iconSrc: 'https://api.iconify.design/mdi/monitor-screenshot.svg' });

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
	document.querySelector('.quick-launch-icon[alt="Internet Explorer"]').addEventListener('click', openInternetExplorer);
	document.querySelector('.quick-launch-icon[alt="Outlook Express"]').addEventListener('click', openOutlookExpress);
	document.querySelector('.quick-launch-icon[alt="Winamp"]').addEventListener('click', openWinamp);
	document.querySelector('.quick-launch-icon[alt="Minesweeper"]').addEventListener('click', openMinesweeper);
}

function openRunDialog() {
	const id = 'window-run-dialog';
	const title = 'Run';
	const existingWindow = document.getElementById(id);
	if (existingWindow) {
		bringWindowToFront(existingWindow);
		const input = existingWindow.querySelector('input');
		if(input) {
			input.focus();
			input.select();
		}
		return;
	}

	const contentHTML = `
		<div style="display: flex; flex-direction: column; padding: 15px; gap: 15px;">
			<div style="display: flex; gap: 15px; align-items: flex-start;">
				<img src="https://api.iconify.design/mdi/console-line.svg" style="width: 32px; height: 32px;" alt="Run">
				<div>
					<p style="margin: 0 0 10px 0;">Type the name of a program, folder, document, or Internet resource, and Windows will open it for you.</p>
					<div style="display: flex; align-items: center; gap: 10px;">
						<label for="run-input">Open:</label>
						<input type="text" id="run-input" style="flex-grow: 1; padding: 3px;" list="run-history">
						<datalist id="run-history">
							<option value="cmd">
							<option value="explorer">
							<option value="shutdown">
							<option value="www.google.com">
						</datalist>
					</div>
				</div>
			</div>
			<div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 10px;">
				<button class="xp-button" id="run-ok">OK</button>
				<button class="xp-button" id="run-cancel">Cancel</button>
				<button class="xp-button" id="run-browse">Browse...</button>
			</div>
		</div>
	`;

	const runWindow = createXPWindow(id, title, contentHTML, 400, 180, { resizable: false, iconSrc: 'https://api.iconify.design/mdi/console-line.svg' });
	
	const input = runWindow.querySelector('#run-input');
	const okBtn = runWindow.querySelector('#run-ok');
	const cancelBtn = runWindow.querySelector('#run-cancel');
	const browseBtn = runWindow.querySelector('#run-browse');

	input.focus();

	function execute() {
		const command = input.value.trim();
		if (command) {
			processRunCommand(command);
			closeWindow(runWindow, id);
		}
	}

	okBtn.addEventListener('click', execute);
	cancelBtn.addEventListener('click', () => closeWindow(runWindow, id));
	browseBtn.addEventListener('click', () => alert('Browse feature is not implemented.'));
	
	input.addEventListener('keydown', (e) => {
		if (e.key === 'Enter') execute();
	});
}

function processRunCommand(command) {
	const cmd = command.trim();
	const lowerCmd = cmd.toLowerCase();
	
	if (lowerCmd === 'cmd' || lowerCmd === 'command') {
		const id = `window-cmd-${Date.now()}`;
		const content = `
			<div style="background-color: black; color: white; font-family: 'Consolas', 'Lucida Console', monospace; height: 100%; padding: 5px; overflow-y: auto;">
				<div>Microsoft Windows XP [Version 5.1.2600]</div>
				<div>(C) Copyright 1985-2001 Microsoft Corp.</div>
				<br>
				<div>C:\\Documents and Settings\\Wartets>${command}</div>
				<br>
				<div>'${command}' is not recognized as an internal or external command,<br>operable program or batch file.</div>
				<br>
				<div>C:\\Documents and Settings\\Wartets><span class="cursor">_</span></div>
			</div>
		`;
		createXPWindow(id, 'C:\\WINDOWS\\system32\\cmd.exe', content, 600, 350, { iconSrc: 'https://api.iconify.design/mdi/console.svg' });
	} else if (lowerCmd === 'explorer') {
		openFileSystemElement(fs.root);
	} else if (lowerCmd === 'shutdown') {
		openShutdownDialog();
	} else if (lowerCmd === 'calc') {
		showXPDialog('Run', 'Calculator is not installed.', 'warning');
	} else if (lowerCmd === 'bsod') {
		triggerBSOD();
	} else if (lowerCmd.startsWith('www.') || lowerCmd.startsWith('http://') || lowerCmd.startsWith('https://') || lowerCmd.endsWith('.com') || lowerCmd.endsWith('.org') || lowerCmd.endsWith('.net')) {
		openInternetExplorer();
		const ieWindow = document.getElementById('window-internet-explorer');
		if (ieWindow) {
			const iframe = ieWindow.querySelector('iframe');
			const addressBar = ieWindow.querySelector('#ie-address-bar');
			const homePage = ieWindow.querySelector('#ie-homepage');
			if (iframe && addressBar) {
				homePage.style.display = 'none';
				iframe.style.display = 'block';
				let url = cmd;
				if (!url.startsWith('http://') && !url.startsWith('https://')) {
					url = 'https://' + url;
				}
				iframe.src = url;
				addressBar.value = url;
			}
		}
	} else {
		showXPDialog(command, `Cannot find '${command}'. Make sure you typed the name correctly, and then try again.`, 'error');
	}
}

function openShutdownDialog() {
	if (document.getElementById('xp-shutdown-overlay')) return;

	const desktop = document.getElementById('desktop');
	const taskbar = document.getElementById('taskbar');
	
	const overlay = document.createElement('div');
	overlay.id = 'xp-shutdown-overlay';
	overlay.style.position = 'fixed';
	overlay.style.top = '0';
	overlay.style.left = '0';
	overlay.style.width = '100vw';
	overlay.style.height = '100vh';
	overlay.style.zIndex = '99999';
	overlay.style.display = 'flex';
	overlay.style.alignItems = 'center';
	overlay.style.justifyContent = 'center';
	
	desktop.style.filter = 'grayscale(100%)';
	taskbar.style.filter = 'grayscale(100%)';

	overlay.innerHTML = `
		<div style="background-color: #003399; width: 100%; height: 100%; position: absolute; opacity: 0.3;"></div>
		<div style="width: 410px; height: 200px; background: linear-gradient(to bottom, #003399 0%, #003399 15%, #ece9d8 15%, #ece9d8 100%); position: relative; border: 2px solid white; border-radius: 3px; box-shadow: 10px 10px 20px rgba(0,0,0,0.5); display: flex; flex-direction: column; overflow: hidden;">
			<div style="display: flex; justify-content: space-between; align-items: center; padding: 5px 10px; color: white; font-weight: bold; font-family: sans-serif; height: 30px;">
				<span>Turn off computer</span>
				<img src="Unofficial_Windows_logo_variant_-_2002–2012_(Multicolored).svg.png" style="height: 20px; opacity: 0.8;">
			</div>
			<div style="flex-grow: 1; display: flex; justify-content: center; align-items: center; gap: 20px; padding: 20px;">
				<div class="shutdown-option" style="text-align: center; cursor: pointer; opacity: 0.7;">
					<div style="width: 35px; height: 35px; background-color: #eebb00; border-radius: 50%; border: 2px solid white; margin: 0 auto 5px; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 5px rgba(0,0,0,0.3);">
						<img src="https://api.iconify.design/mdi/sleep.svg?color=white" style="width: 20px;">
					</div>
					<span style="font-size: 11px;">Standby</span>
				</div>
				<div class="shutdown-option" id="btn-shutdown-action" style="text-align: center; cursor: pointer;">
					<div style="width: 35px; height: 35px; background-color: #cc3333; border-radius: 50%; border: 2px solid white; margin: 0 auto 5px; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 5px rgba(0,0,0,0.3);">
						<img src="https://api.iconify.design/mdi/power.svg?color=white" style="width: 20px;">
					</div>
					<span style="font-size: 11px;">Turn Off</span>
				</div>
				<div class="shutdown-option" id="btn-restart-action" style="text-align: center; cursor: pointer;">
					<div style="width: 35px; height: 35px; background-color: #33cc33; border-radius: 50%; border: 2px solid white; margin: 0 auto 5px; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 5px rgba(0,0,0,0.3);">
						<img src="https://api.iconify.design/mdi/restart.svg?color=white" style="width: 20px;">
					</div>
					<span style="font-size: 11px;">Restart</span>
				</div>
			</div>
			<div style="padding: 10px; display: flex; justify-content: flex-end;">
				<button class="xp-button" id="btn-shutdown-cancel" style="padding: 3px 15px;">Cancel</button>
			</div>
		</div>
	`;

	document.body.appendChild(overlay);

	const closeOverlay = () => {
		overlay.remove();
		desktop.style.filter = 'none';
		taskbar.style.filter = 'none';
	};

	overlay.querySelector('#btn-shutdown-cancel').addEventListener('click', closeOverlay);
	
	overlay.querySelector('#btn-restart-action').addEventListener('click', () => {
		closeOverlay();
		location.reload();
	});

	overlay.querySelector('#btn-shutdown-action').addEventListener('click', () => {
		overlay.innerHTML = '<div style="background-color: black; width: 100%; height: 100%;"></div>';
		setTimeout(() => {
			document.body.innerHTML = '';
			document.body.style.backgroundColor = 'black';
			document.body.style.cursor = 'none';
		}, 1000);
	});
}

function triggerBSOD() {
	const bsod = document.createElement('div');
	bsod.style.position = 'fixed';
	bsod.style.top = '0';
	bsod.style.left = '0';
	bsod.style.width = '100vw';
	bsod.style.height = '100vh';
	bsod.style.backgroundColor = '#000082';
	bsod.style.color = 'white';
	bsod.style.fontFamily = "'Lucida Console', monospace";
	bsod.style.fontSize = '14px';
	bsod.style.zIndex = '9999999';
	bsod.style.padding = '50px';
	bsod.style.boxSizing = 'border-box';
	bsod.style.cursor = 'none';

	bsod.innerHTML = `
		<p>A problem has been detected and Windows has been shut down to prevent damage to your computer.</p>
		<p>PROCESS_HAS_LOCKED_PAGES</p>
		<br>
		<p>If this is the first time you've seen this Stop error screen, restart your computer. If this screen appears again, follow these steps:</p>
		<p>Check to make sure any new hardware or software is properly installed. If this is a new installation, ask your hardware or software manufacturer for any Windows updates you might need.</p>
		<p>If problems continue, disable or remove any newly installed hardware or software. Disable BIOS memory options such as caching or shadowing. If you need to use Safe Mode to remove or disable components, restart your computer, press F8 to select Advanced Startup Options, and then select Safe Mode.</p>
		<br>
		<p>Technical information:</p>
		<p>*** STOP: 0x00000076 (0x00000000, 0x00000000, 0x00000000, 0x00000000)</p>
		<br>
		<p>Beginning dump of physical memory</p>
		<p>Physical memory dump complete.</p>
		<p>Contact your system administrator or technical support group for further assistance.</p>
	`;

	document.body.appendChild(bsod);
	
	document.addEventListener('keydown', () => location.reload());
	document.addEventListener('click', () => location.reload());
}

function showDesktop() {
	Object.values(openWindows).forEach(win => {
		if (!win.classList.contains('minimized')) {
			minimizeWindow(win, win.id);
		}
	});
}

function openInternetExplorer() {
	const id = 'window-internet-explorer';
	if (document.getElementById(id)) {
		bringWindowToFront(document.getElementById(id));
		return;
	}

	const contentHTML = `
		<div class="ie-window-layout">
			<div class="ie-toolbar">
				<button class="ie-nav-btn" id="ie-back" title="Back" disabled><img src="https://api.iconify.design/mdi/arrow-left.svg?color=%23888888" alt="Back"></button>
				<button class="ie-nav-btn" id="ie-forward" title="Forward" disabled><img src="https://api.iconify.design/mdi/arrow-right.svg?color=%23888888" alt="Forward"></button>
				<button class="ie-nav-btn" id="ie-stop" title="Stop"><img src="https://api.iconify.design/mdi/close.svg" alt="Stop"></button>
				<button class="ie-nav-btn" id="ie-refresh" title="Refresh"><img src="https://api.iconify.design/mdi/refresh.svg" alt="Refresh"></button>
				<button class="ie-nav-btn" id="ie-home" title="Home"><img src="https://api.iconify.design/mdi/home.svg" alt="Home"></button>
			</div>
			<div class="ie-address-bar-container">
				<span>Address</span>
				<input type="text" id="ie-address-bar" value="about:home">
				<button id="ie-go-btn">Go</button>
			</div>
			<div class="ie-content-area">
				<iframe id="ie-iframe" src="about:blank" sandbox="allow-scripts allow-same-origin allow-forms"></iframe>
				<div id="ie-homepage" class="ie-homepage-content">
					<img src="internet-explorer.png" alt="Internet Explorer">
					<h1>Welcome to Internet Explorer</h1>
					<p>Type a web address in the Address bar and click Go.</p>
				</div>
			</div>
		</div>
	`;

	const ieWindow = createXPWindow(id, 'Internet Explorer', contentHTML, 600, 400, { iconSrc: 'internet-explorer.png' });
	ieWindow.querySelector('.xp-window-content').style.padding = '0';

	const iframe = ieWindow.querySelector('#ie-iframe');
	const addressBar = ieWindow.querySelector('#ie-address-bar');
	const goBtn = ieWindow.querySelector('#ie-go-btn');
	const homePage = ieWindow.querySelector('#ie-homepage');

	const backBtn = ieWindow.querySelector('#ie-back');
	const forwardBtn = ieWindow.querySelector('#ie-forward');
	const stopBtn = ieWindow.querySelector('#ie-stop');
	const refreshBtn = ieWindow.querySelector('#ie-refresh');
	const homeBtn = ieWindow.querySelector('#ie-home');

	function navigateTo(url) {
		homePage.style.display = 'none';
		iframe.style.display = 'block';
		if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('about:')) {
			url = 'https://' + url;
		}
		try {
			iframe.src = url;
			addressBar.value = url;
		} catch (e) {
			iframe.src = `data:text/html, <h1>Navigation blocked</h1><p>Could not navigate to the specified page due to security restrictions.</p>`;
		}
	}

	function showHome() {
		iframe.src = 'about:blank';
		iframe.style.display = 'none';
		homePage.style.display = 'flex';
		addressBar.value = 'about:home';
	}

	goBtn.addEventListener('click', () => navigateTo(addressBar.value));
	addressBar.addEventListener('keydown', (e) => {
		if (e.key === 'Enter') navigateTo(addressBar.value);
	});

	backBtn.addEventListener('click', () => iframe.contentWindow.history.back());
	forwardBtn.addEventListener('click', () => iframe.contentWindow.history.forward());
	stopBtn.addEventListener('click', () => iframe.contentWindow.stop());
	refreshBtn.addEventListener('click', () => {
		if (iframe.style.display !== 'none') iframe.contentWindow.location.reload();
	});
	homeBtn.addEventListener('click', showHome);

	iframe.addEventListener('load', () => {
		try {
			addressBar.value = iframe.contentWindow.location.href;
			if (iframe.contentWindow.history.length > 1) {
				backBtn.disabled = false;
				backBtn.querySelector('img').src = "https://api.iconify.design/mdi/arrow-left.svg";
			} else {
				backBtn.disabled = true;
				backBtn.querySelector('img').src = "https://api.iconify.design/mdi/arrow-left.svg?color=%23888888";
			}
		} catch (e) {
		}
	});

	showHome();
}

function openOutlookExpress() {
	const id = 'window-outlook-express';
	if (document.getElementById(id)) {
		bringWindowToFront(document.getElementById(id));
		return;
	}

	const fakeEmails = [{
		id: 1,
		from: 'GitHub',
		subject: 'Welcome to your portfolio!',
		date: '2024-05-20 10:00',
		body: `
			<p>Hello Wartets,</p>
			<p>Welcome to your interactive Windows XP portfolio. This is a demonstration of the Outlook Express application.</p>
			<p>You can click on different emails in the list to see their content displayed here in the preview pane.</p>
			<p>Best regards,<br>The Developer</p>
		`
	}, {
		id: 2,
		from: 'System Administrator',
		subject: 'Security Alert: New Login',
		date: '2024-05-19 15:30',
		body: '<p>A new device has logged into your account. If this was not you, please secure your account immediately.</p>'
	}, {
		id: 3,
		from: 'SoundCloud',
		subject: 'Your weekly stats are here',
		date: '2024-05-18 08:45',
		body: '<p>You got 1,234 plays this week! Keep up the great work.</p>'
	}, ];

	const contentHTML = `
		<div class="outlook-window-layout">
			<div class="outlook-toolbar">
				<button class="outlook-tool-btn"><img src="https://api.iconify.design/mdi/email-plus-outline.svg" alt="New"><span>New Mail</span></button>
				<div class="outlook-separator"></div>
				<button class="outlook-tool-btn"><img src="https://api.iconify.design/mdi/reply-outline.svg" alt="Reply"><span>Reply</span></button>
				<button class="outlook-tool-btn"><img src="https://api.iconify.design/mdi/share-outline.svg" alt="Forward"><span>Forward</span></button>
				<div class="outlook-separator"></div>
				<button class="outlook-tool-btn"><img src="https://api.iconify.design/mdi/delete-outline.svg" alt="Delete"><span>Delete</span></button>
			</div>
			<div class="outlook-main-content">
				<div class="outlook-folder-pane">
					<h4>Folders</h4>
					<ul>
						<li class="active"><img src="https://staging.svgrepo.com/show/76102/inbox.svg"> Inbox</li>
						<li><img src="https://api.iconify.design/mdi/folder-outline.svg"> Outbox</li>
						<li><img src="https://api.iconify.design/mdi/folder-arrow-up-outline.svg"> Sent Items</li>
						<li><img src="https://api.iconify.design/mdi/folder-edit-outline.svg"> Drafts</li>
						<li><img src="https://api.iconify.design/mdi/folder-remove-outline.svg"> Deleted Items</li>
					</ul>
				</div>
				<div class="outlook-right-section">
					<div class="outlook-message-pane">
						<div class="outlook-message-header">
							<div>From</div>
							<div>Subject</div>
							<div>Received</div>
						</div>
						<ul class="outlook-message-list"></ul>
					</div>
					<div class="outlook-preview-pane">
						<div class="outlook-preview-header">
							<div><b>From:</b> <span id="preview-from"></span></div>
							<div><b>Date:</b> <span id="preview-date"></span></div>
							<div><b>Subject:</b> <span id="preview-subject"></span></div>
						</div>
						<div class="outlook-preview-body" id="preview-body"></div>
					</div>
				</div>
			</div>
		</div>
	`;
	const outlookWindow = createXPWindow(id, 'Outlook Express', contentHTML, 600, 400, { iconSrc: 'OE2001.webp' });
	outlookWindow.querySelector('.xp-window-content').style.padding = '0';

	const messageList = outlookWindow.querySelector('.outlook-message-list');
	const previewFrom = outlookWindow.querySelector('#preview-from');
	const previewDate = outlookWindow.querySelector('#preview-date');
	const previewSubject = outlookWindow.querySelector('#preview-subject');
	const previewBody = outlookWindow.querySelector('#preview-body');

	function renderMessageList() {
		messageList.innerHTML = '';
		fakeEmails.forEach(email => {
			const li = document.createElement('li');
			li.dataset.emailId = email.id;
			li.innerHTML = `
				<div>${email.from}</div>
				<div>${email.subject}</div>
				<div>${email.date}</div>
			`;
			li.addEventListener('click', () => {
				messageList.querySelectorAll('li').forEach(item => item.classList.remove('selected'));
				li.classList.add('selected');
				renderPreview(email.id);
			});
			messageList.appendChild(li);
		});
	}

	function renderPreview(emailId) {
		const email = fakeEmails.find(e => e.id === emailId);
		if (email) {
			previewFrom.textContent = email.from;
			previewDate.textContent = email.date;
			previewSubject.textContent = email.subject;
			previewBody.innerHTML = email.body;
		}
	}

	outlookWindow.querySelectorAll('.outlook-tool-btn').forEach(btn => {
		btn.addEventListener('click', () => {
			showXPDialog('Outlook Express', 'This feature is for demonstration purposes only. Sorry...', 'info');
		});
	});

	renderMessageList();
	if (fakeEmails.length > 0) {
		messageList.children[0].classList.add('selected');
		renderPreview(fakeEmails[0].id);
	}
}