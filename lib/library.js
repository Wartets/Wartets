import * as pdfjsLib from "https://mozilla.github.io/pdf.js/build/pdf.mjs";

gsap.registerPlugin(Flip);

document.addEventListener('DOMContentLoaded', () => {
	pdfjsLib.GlobalWorkerOptions.workerSrc = `https://mozilla.github.io/pdf.js/build/pdf.worker.mjs`;

	const grid = document.getElementById('document-grid');
	const searchInput = document.getElementById('searchInput');
	const categoryFilter = document.getElementById('categoryFilter');
	const filterDropdown = categoryFilter.querySelector('.filter-dropdown');
	const filterTrigger = categoryFilter.querySelector('.filter-trigger span');
	const modal = document.getElementById('pdf-viewer-modal');
	const closeModalBtn = modal.querySelector('.close-modal');
	const backToTopBtn = document.getElementById('backToTop');
	const pageIndicator = document.querySelector('.page-indicator');
	const viewSingleBtn = document.getElementById('view-single');
	const viewDoubleBtn = document.getElementById('view-double');
	const viewScrollBtn = document.getElementById('view-scroll');
	const sortFilter = document.getElementById('sortFilter');
	const sortDropdown = sortFilter.querySelector('.filter-dropdown');
	const sortTrigger = sortFilter.querySelector('.filter-trigger span');
	const sortOrderBtn = document.getElementById('sortOrderBtn');
	const gridBtn = document.getElementById('grid-view-btn');
	const listBtn = document.getElementById('list-view-btn');
	const listHeader = document.getElementById('list-header');
	
	let currentViewMode = localStorage.getItem('libraryViewMode') || 'grid';
	let currentSortField = localStorage.getItem('librarySortField') || 'date';
	let currentSortOrder = localStorage.getItem('librarySortOrder') || 'desc';

	if (currentViewMode === 'list') {
		gridBtn.classList.remove('active');
		listBtn.classList.add('active');
	} else {
		gridBtn.classList.add('active');
		listBtn.classList.remove('active');
	}

	if (currentSortOrder === 'asc') {
		sortOrderBtn.classList.add('ascending');
	}

	const initialSortOption = sortDropdown.querySelector(`[data-value="${currentSortField}"]`);
	if (initialSortOption) {
		sortDropdown.querySelectorAll('.filter-option').forEach(opt => opt.classList.remove('selected'));
		initialSortOption.classList.add('selected');
		sortTrigger.textContent = initialSortOption.textContent;
	}
	
	if (typeof libraryData === 'undefined') {
		grid.innerHTML = '<p class="loader-wrapper">Error: documents.js not found or failed to load.</p>';
		return;
	}

	const categoryMap = new Map(libraryData.categories.map(c => [c.id, c.name]));
	const authorMap = new Map(libraryData.authors.map(a => [a.id, a.name]));

	let processedDocs = libraryData.documents
		.map(doc => ({
			...doc,
			authorNames: doc.authorIds.map(id => authorMap.get(id) || 'Unknown').join(', '),
			categoryName: categoryMap.get(doc.categoryId) || 'Uncategorized',
			date: new Date(doc.timestamp).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
		}));

	const fuse = new Fuse(processedDocs, {
		keys: ['title', 'description', 'tags', 'authorNames'],
		threshold: 0.4,
		ignoreLocation: true
	});

	let currentFilter = 'all';

	function populateFilters() {
		libraryData.categories.forEach(category => {
			const option = document.createElement('div');
			option.className = 'filter-option';
			option.dataset.value = category.id;
			option.textContent = category.name;
			filterDropdown.appendChild(option);
		});
	}
	
	function sortDocuments() {
		const multiplier = currentSortOrder === 'asc' ? 1 : -1;
		
		processedDocs.sort((a, b) => {
			let valA, valB;

			switch (currentSortField) {
				case 'title':
					valA = a.title.toLowerCase();
					valB = b.title.toLowerCase();
					return valA.localeCompare(valB) * multiplier;
				
				case 'category':
					valA = a.categoryName.toLowerCase();
					valB = b.categoryName.toLowerCase();
					return valA.localeCompare(valB) * multiplier;
				
				case 'author':
					valA = a.authorNames.toLowerCase();
					valB = b.authorNames.toLowerCase();
					return valA.localeCompare(valB) * multiplier;

				case 'date':
				default:
					valA = new Date(a.timestamp);
					valB = new Date(b.timestamp);
					return (valA - valB) * multiplier;
			}
		});
	}

	function renderDocuments() {
		sortDocuments();
		grid.innerHTML = '';
		
		if (currentViewMode === 'list') {
			grid.classList.add('list-view');
			listHeader.style.display = 'grid';
			
			Array.from(listHeader.children).forEach(col => {
				col.classList.remove('active', 'asc', 'desc');
				if (col.dataset.sort === currentSortField) {
					col.classList.add('active', currentSortOrder);
				}
			});
		} else {
			grid.classList.remove('list-view');
			listHeader.style.display = 'none';
		}

		processedDocs.forEach(doc => {
			const card = document.createElement('div');
			card.dataset.id = doc.id;
			card.dataset.filePath = doc.filePath;
			card.dataset.title = doc.title;
			card.dataset.categoryId = doc.categoryId;
			card.addEventListener('click', () => openPdfViewer(doc));

			if (currentViewMode === 'grid') {
				card.className = 'doc-card';
				card.innerHTML = `
					<div class="card-preview-wrapper">
						<i class="fa-solid fa-circle-notch preview-loader"></i>
						<canvas></canvas>
					</div>
					<div class="card-content">
						<h2 class="card-title">${doc.title}</h2>
						<div class="card-meta">
							<span class="author">${doc.authorNames}</span>
							<span class="date">${doc.date}</span>
						</div>
					</div>
				`;
				grid.appendChild(card);
				cardObserver.observe(card);
			} else {
				card.className = 'doc-card list-view-item';
				card.innerHTML = `
					<div class="card-content">
						<div class="card-title" title="${doc.title}">${doc.title}</div>
						<div class="list-category">${doc.categoryName}</div>
						<div class="card-meta">
							<span class="author">${doc.authorNames}</span>
							<span class="date">${doc.date}</span>
						</div>
					</div>
				`;
				grid.appendChild(card);
			}
		});
		applyFilters();
	}

	const cardObserver = new IntersectionObserver((entries, observer) => {
		entries.forEach(entry => {
			if (entry.isIntersecting) {
				const card = entry.target;
				const canvas = card.querySelector('canvas');
				const filePath = card.dataset.filePath;
				renderPdfPreview(canvas, filePath);
				observer.unobserve(card);
			}
		});
	}, { rootMargin: '0px 0px 200px 0px' });

	async function renderPdfPreview(canvas, filePath) {
		try {
			const loadingTask = pdfjsLib.getDocument(filePath);
			const pdf = await loadingTask.promise;
			const page = await pdf.getPage(1);
			
			const viewport = page.getViewport({ scale: 1.5 });
			const context = canvas.getContext('2d', { alpha: false });
			canvas.height = viewport.height;
			canvas.width = viewport.width;

			const renderContext = { canvasContext: context, viewport: viewport };
			await page.render(renderContext).promise;
			
			const loader = canvas.parentElement.querySelector('.preview-loader');
			if(loader) loader.style.display = 'none';
			canvas.classList.add('loaded');
		} catch (error) {
			console.error(`Failed to render PDF preview for ${filePath}:`, error);
		}
	}

	function applyFilters() {
		const query = searchInput.value.toLowerCase().trim();
		const searchResults = query ? new Set(fuse.search(query).map(result => result.item.id)) : null;

		const state = Flip.getState(grid.children);
		
		Array.from(grid.children).forEach(card => {
			const matchesCategory = currentFilter === 'all' || card.dataset.categoryId == currentFilter;
			const matchesSearch = !searchResults || searchResults.has(card.dataset.id);

			if (matchesCategory && matchesSearch) {
				card.style.display = currentViewMode === 'grid' ? '' : 'flex';
			} else {
				card.style.display = 'none';
			}
		});

		Flip.from(state, {
			duration: 0.5,
			ease: "power2.out",
			scale: currentViewMode === 'grid',
			absolute: currentViewMode === 'grid',
			onEnter: elements => gsap.fromTo(elements, { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.4 }),
			onLeave: elements => gsap.to(elements, { opacity: 0, scale: 0.8, duration: 0.3, onComplete: () => elements.forEach(el => el.style.display = 'none') })
		});
	}

	searchInput.addEventListener('input', applyFilters);

	categoryFilter.addEventListener('click', (e) => {
		if (e.target.closest('.filter-trigger')) {
			categoryFilter.classList.toggle('open');
		} else if (e.target.classList.contains('filter-option')) {
			categoryFilter.classList.remove('open');
			filterDropdown.querySelectorAll('.filter-option').forEach(opt => opt.classList.remove('selected'));
			e.target.classList.add('selected');
			filterTrigger.textContent = e.target.textContent;
			currentFilter = e.target.dataset.value;
			applyFilters();
		}
	});

	document.addEventListener('click', e => {
		if (!categoryFilter.contains(e.target)) {
			categoryFilter.classList.remove('open');
		}
		if (!sortFilter.contains(e.target)) {
			sortFilter.classList.remove('open');
		}
	});
	
	let pdfDoc = null, pageNum = 1, pageRendering = false, pageNumPending = null, scale = 1.0, currentDoc = null, isWheelNavThrottled = false, activeRenderTask = null;
	let currentDisplayMode = 'single';
	let currentZoomMode = 'manual';
	let pdfPageObserver = null;
	let scrollPageTrackerObserver = null;
	let isProgrammaticScrolling = false;
	const renderArea = document.getElementById('pdf-render-area');
	const pageNumEl = document.getElementById('page-num');
	const pageCountEl = document.getElementById('page-count');
	const zoomLevelEl = document.getElementById('zoom-level');
	const zoomFitPageBtn = document.getElementById('zoom-fit-page');
	const zoomFitWidthBtn = document.getElementById('zoom-fit-width');
	
	function updateURL() {
		if (!currentDoc || !modal.classList.contains('show')) return;
		const hash = `#doc=${currentDoc.id}&page=${pageNum}&view=${currentDisplayMode}`;
		if (window.location.hash !== hash) {
			history.replaceState(null, null, hash);
		}
	}
	
	function handleInitialURL() {
		const hash = window.location.hash.substring(1);
		if (!hash) return;

		const params = new URLSearchParams(hash);
		const docId = params.get('doc');
		const page = parseInt(params.get('page'), 10) || 1;
		const view = params.get('view') || 'single';

		if (docId) {
			const docToOpen = processedDocs.find(d => d.id === docId);
			if (docToOpen) {
				setTimeout(() => openPdfViewer(docToOpen, page, view), 50);
			}
		}
	}
	
	function updatePageFromScroll() {
		if (currentDisplayMode !== 'scroll' || !renderArea.children.length || isProgrammaticScrolling) return;

		const placeholders = Array.from(renderArea.querySelectorAll('.pdf-page-placeholder'));
		const viewportRect = renderArea.getBoundingClientRect();
		const viewportCenter = viewportRect.top + (viewportRect.height / 2);
		
		let bestPage = pageNum;
		let minDistance = Infinity;

		for (const p of placeholders) {
			const rect = p.getBoundingClientRect();
			const pageCenter = rect.top + (rect.height / 2);
			const distance = Math.abs(viewportCenter - pageCenter);

			if (distance < minDistance) {
				minDistance = distance;
				bestPage = parseInt(p.dataset.pageNumber, 10);
			}
		}
		
		if (bestPage !== pageNum) {
			pageNum = bestPage;
			pageNumEl.value = pageNum;
		}
	}
	
	function switchDisplayMode(newMode) {
		if (currentDisplayMode === newMode && pdfDoc) return;

		if (currentDisplayMode === 'scroll') {
			updatePageFromScroll();
		}

		currentDisplayMode = newMode;

		document.querySelectorAll('.view-mode-btn').forEach(btn => btn.classList.remove('active'));
		document.getElementById(`view-${newMode}`).classList.add('active');

		renderPdf();
	}
	
	async function calculateAutoScale(targetPageNum) {
		if (currentZoomMode === 'manual') return scale;

		const page = await pdfDoc.getPage(targetPageNum);
		const viewport = page.getViewport({ scale: 1.0 });
		
		const containerWidth = renderArea.clientWidth - 64; 
		const containerHeight = renderArea.clientHeight - 64; 

		let computedScale = 1.0;

		if (currentDisplayMode === 'double') {
			const doubleWidth = viewport.width * 2 + 16; 
			const widthScale = containerWidth / doubleWidth;
			const heightScale = containerHeight / viewport.height;

			if (currentZoomMode === 'page-fit') {
				computedScale = Math.min(widthScale, heightScale);
			} else if (currentZoomMode === 'page-width') {
				computedScale = widthScale;
			}
		} else {
			const widthScale = containerWidth / viewport.width;
			const heightScale = containerHeight / viewport.height;

			if (currentZoomMode === 'page-fit') {
				computedScale = Math.min(widthScale, heightScale);
			} else if (currentZoomMode === 'page-width') {
				computedScale = widthScale;
			}
		}
		
		return Math.min(Math.max(computedScale, 0.1), 5.0);
	}
	
	async function renderSinglePageToCanvas(pageNumber, targetCanvas) {
		try {
			const page = await pdfDoc.getPage(pageNumber);
			const viewport = page.getViewport({ scale: scale });
			const context = targetCanvas.getContext('2d', { alpha: false });
			targetCanvas.height = viewport.height;
			targetCanvas.width = viewport.width;

			const renderContext = { canvasContext: context, viewport: viewport };
			
			const renderTask = page.render(renderContext);

			if (currentDisplayMode !== 'scroll') {
				activeRenderTask = renderTask;
			}

			await renderTask.promise;
			return targetCanvas;
		} catch (error) {
			if (error.name !== 'RenderingCancelledException') {
				console.error(`Failed to render page ${pageNumber}:`, error);
			}
			return null;
		}
	}

	async function renderPdf() {
		if (activeRenderTask) {
			activeRenderTask.cancel();
			activeRenderTask = null;
		}
		
		pageRendering = true;
		
		try {
			if (pdfPageObserver) {
				pdfPageObserver.disconnect();
				pdfPageObserver = null;
			}
			if (scrollPageTrackerObserver) {
				scrollPageTrackerObserver.disconnect();
				scrollPageTrackerObserver = null;
			}

			if (currentZoomMode !== 'manual') {
				scale = await calculateAutoScale(pageNum);
				const percent = Math.round(scale * 100);
				zoomLevelEl.textContent = currentZoomMode === 'page-fit' ? `Fit Page (${percent}%)` : `Fit Width (${percent}%)`;
			}

			renderArea.innerHTML = '';
			renderArea.className = `pdf-render-area ${currentDisplayMode}-view`;

			switch (currentDisplayMode) {
				case 'single':
					pageIndicator.style.display = '';
					document.getElementById('prev-page').style.display = '';
					document.getElementById('next-page').style.display = '';
					pageNumEl.value = pageNum;
					const canvasSingle = document.createElement('canvas');
					renderArea.appendChild(canvasSingle);
					await renderSinglePageToCanvas(pageNum, canvasSingle);
					updatePaginationButtons();
					break;

				case 'double':
					pageIndicator.style.display = '';
					document.getElementById('prev-page').style.display = '';
					document.getElementById('next-page').style.display = '';
					
					const pagesToRender = [];
					if (pageNum === 1) {
						pagesToRender.push(1);
					} else {
						let startPage = pageNum;
						if (startPage % 2 !== 0) {
						   startPage--;
						}
						pagesToRender.push(startPage);
						if (startPage + 1 <= pdfDoc.numPages) {
							pagesToRender.push(startPage + 1);
						}
					}
					pageNumEl.value = pageNum;

					const wrapper = document.createElement('div');
					wrapper.className = 'pdf-double-wrapper';
					renderArea.appendChild(wrapper);

					const renderPromises = pagesToRender.map(num => {
						const canvasDouble = document.createElement('canvas');
						wrapper.appendChild(canvasDouble);
						return renderSinglePageToCanvas(num, canvasDouble);
					});

					await Promise.all(renderPromises);
					updatePaginationButtons();
					break;
					
				case 'scroll':
					pageIndicator.style.display = '';
					document.getElementById('prev-page').style.display = 'none';
					document.getElementById('next-page').style.display = 'none';

					const firstPage = await pdfDoc.getPage(1);
					const viewport = firstPage.getViewport({ scale: scale });
					
					const placeholders = [];
					for (let i = 1; i <= pdfDoc.numPages; i++) {
						const placeholder = document.createElement('div');
						placeholder.className = 'pdf-page-placeholder';
						placeholder.id = `pdf-page-${i}`;
						placeholder.dataset.pageNumber = i;
						placeholder.style.width = `${viewport.width}px`;
						placeholder.style.height = `${viewport.height}px`;
						placeholder.innerHTML = `<i class="fa-solid fa-circle-notch"></i>`;
						renderArea.appendChild(placeholder);
						placeholders.push(placeholder);
					}

					if (pageNum > 1) {
						const targetPlaceholder = placeholders[pageNum - 1];
						if (targetPlaceholder) {
							isProgrammaticScrolling = true;
							requestAnimationFrame(() => {
								renderArea.scrollTop = targetPlaceholder.offsetTop;
								setTimeout(() => {
									isProgrammaticScrolling = false;
								}, 150);
							});
						}
					}

					pdfPageObserver = new IntersectionObserver(async (entries, observer) => {
						for (const entry of entries) {
							if (entry.isIntersecting) {
								const placeholder = entry.target;
								if (!placeholder.querySelector('canvas')) {
									const pageToRender = parseInt(placeholder.dataset.pageNumber, 10);
									observer.unobserve(placeholder);
									
									const canvas = document.createElement('canvas');
									placeholder.innerHTML = '';
									placeholder.appendChild(canvas);
									await renderSinglePageToCanvas(pageToRender, canvas);
								}
							}
						}
					}, { root: renderArea, rootMargin: '600px' });

					scrollPageTrackerObserver = new IntersectionObserver((entries) => {
						if (isProgrammaticScrolling) return;

						let mostVisiblePage = null;
						let maxRatio = 0;

						entries.forEach(entry => {
							if (entry.intersectionRatio > maxRatio) {
								maxRatio = entry.intersectionRatio;
								mostVisiblePage = entry;
							}
						});

						if (mostVisiblePage && mostVisiblePage.isIntersecting) {
							const newPageNum = parseInt(mostVisiblePage.target.dataset.pageNumber, 10);
							if (pageNum !== newPageNum) {
								pageNum = newPageNum;
								pageNumEl.value = pageNum;
								updateURL();
							}
						}
					}, { root: renderArea, threshold: [0, 0.1, 0.5, 0.9, 1.0] });

					placeholders.forEach(p => {
						pdfPageObserver.observe(p);
						scrollPageTrackerObserver.observe(p);
					});

					break;
			}
		} finally {
			pageRendering = false;
			updateURL();
		}
	}
	
	function updatePaginationButtons() {
		document.getElementById('prev-page').disabled = (pageNum <= 1);
		
		let isNextDisabled;
		if (currentDisplayMode === 'double') {
			if (pageNum === 1) {
				isNextDisabled = (pdfDoc.numPages <= 1);
			} else {
				let currentSpreadStart = (pageNum % 2 === 0) ? pageNum : pageNum - 1;
				isNextDisabled = (currentSpreadStart + 2 > pdfDoc.numPages);
			}
		} else {
			isNextDisabled = (pageNum >= pdfDoc.numPages);
		}
		document.getElementById('next-page').disabled = isNextDisabled;
	}
	
	function onPrevPage() {
		if (pageNum <= 1) return;
		if (currentDisplayMode === 'double') {
			pageNum = (pageNum === 2) ? 1 : pageNum - 2;
		} else {
			pageNum--;
		}
		renderPdf();
	}

	function onNextPage() {
		if (currentDisplayMode === 'double') {
			if (pageNum === 1) {
				if (pdfDoc.numPages > 1) {
					pageNum = 2;
				} else {
					return;
				}
			} else {
				let currentSpreadStart = (pageNum % 2 === 0) ? pageNum : pageNum - 1;
				if (currentSpreadStart + 2 <= pdfDoc.numPages) {
					pageNum = currentSpreadStart + 2;
				} else {
					return;
				}
			}
		} else if (pageNum < pdfDoc.numPages) {
			pageNum++;
		} else {
			return;
		}
		renderPdf();
	}

	function onZoomIn() {
		if (currentDisplayMode === 'scroll') updatePageFromScroll();
		currentZoomMode = 'manual';
		if (scale >= 3.0) return;
		scale += 0.25;
		zoomLevelEl.textContent = `${Math.round(scale * 100)}%`;
		renderPdf();
	}

	function onZoomOut() {
		if (currentDisplayMode === 'scroll') updatePageFromScroll();
		currentZoomMode = 'manual';
		if (scale <= 0.25) return;
		scale -= 0.25;
		zoomLevelEl.textContent = `${Math.round(scale * 100)}%`;
		renderPdf();
	}

	function onZoomFitPage() {
		if (currentDisplayMode === 'scroll') updatePageFromScroll();
		if (currentZoomMode === 'page-fit') return;
		currentZoomMode = 'page-fit';
		renderPdf();
	}

	function onZoomFitWidth() {
		if (currentDisplayMode === 'scroll') updatePageFromScroll();
		if (currentZoomMode === 'page-width') return;
		currentZoomMode = 'page-width';
		renderPdf();
	}
	
	document.getElementById('prev-page').addEventListener('click', onPrevPage);
	document.getElementById('next-page').addEventListener('click', onNextPage);
	document.getElementById('zoom-in').addEventListener('click', onZoomIn);
	document.getElementById('zoom-out').addEventListener('click', onZoomOut);
	
	viewSingleBtn.addEventListener('click', () => switchDisplayMode('single'));
	viewDoubleBtn.addEventListener('click', () => switchDisplayMode('double'));
	viewScrollBtn.addEventListener('click', () => switchDisplayMode('scroll'));

	let resizeTimeout;
	function handleWindowResize() {
		if (currentZoomMode === 'manual') {
			if (currentDisplayMode === 'scroll') {
				updatePageFromScroll();
			}
			return;
		}
		
		clearTimeout(resizeTimeout);
		resizeTimeout = setTimeout(() => {
			if (pdfDoc && modal.classList.contains('show')) {
				if (currentDisplayMode === 'scroll') {
					updatePageFromScroll();
				}
				renderPdf();
			}
		}, 200);
	}

	zoomFitPageBtn.addEventListener('click', onZoomFitPage);
	zoomFitWidthBtn.addEventListener('click', onZoomFitWidth);

	async function openPdfViewer(doc, startPage = 1, startView = 'single') {
		modal.classList.add('show');
		document.body.style.overflow = 'hidden';
		document.getElementById('modal-doc-title').textContent = doc.title;
		renderArea.innerHTML = '<i class="fa-solid fa-circle-notch preview-loader" style="font-size: 3rem;"></i>';
		currentDoc = doc;

		document.addEventListener('keydown', handleKeyNavigation);
		window.addEventListener('resize', handleWindowResize);

		try {
			pdfDoc = await pdfjsLib.getDocument(doc.filePath).promise;
			pageCountEl.textContent = pdfDoc.numPages;
			pageNumEl.max = pdfDoc.numPages;
			
			pageNum = Math.max(1, Math.min(startPage, pdfDoc.numPages));
			
			currentZoomMode = 'page-fit';
			
			currentDisplayMode = startView;
			document.querySelectorAll('.view-mode-btn').forEach(btn => btn.classList.remove('active'));
			const activeBtn = document.getElementById(`view-${currentDisplayMode}`);
			if(activeBtn) activeBtn.classList.add('active');
			
			await renderPdf();
		} catch (error) {
			renderArea.innerHTML = `<p style="color: #ff8a8a;">Failed to load PDF.</p>`;
			console.error('Error opening PDF:', error);
		}
	}
	
	function closePdfViewer() {
		if (activeRenderTask) {
			activeRenderTask.cancel();
			activeRenderTask = null;
		}

		modal.classList.remove('show');
		document.body.style.overflow = '';

		document.removeEventListener('keydown', handleKeyNavigation);
		window.removeEventListener('resize', handleWindowResize);
		
		if (pdfDoc) {
			pdfDoc.destroy();
			pdfDoc = null;
		}
		if (pdfPageObserver) {
			pdfPageObserver.disconnect();
			pdfPageObserver = null;
		}
		if (scrollPageTrackerObserver) {
			scrollPageTrackerObserver.disconnect();
			scrollPageTrackerObserver = null;
		}
		renderArea.innerHTML = '';
		pageCountEl.textContent = 0;
		pageNumEl.value = 0;
		pageNumEl.max = 1;
		currentDoc = null;
		if (window.location.hash) {
			history.pushState("", document.title, window.location.pathname + window.location.search);
		}
	}
	
	function handlePageInput(e) {
		if (!pdfDoc) return;
		let newPageNum = parseInt(e.target.value, 10);

		if (isNaN(newPageNum)) {
			e.target.value = pageNum;
			return;
		}

		newPageNum = Math.max(1, Math.min(newPageNum, pdfDoc.numPages));

		if (newPageNum !== pageNum) {
			pageNum = newPageNum;
			if (currentDisplayMode === 'scroll') {
				 const targetPlaceholder = renderArea.querySelector(`[data-page-number="${pageNum}"]`);
				 if (targetPlaceholder) {
					targetPlaceholder.scrollIntoView({ behavior: 'smooth', block: 'start' });
				 }
			} else {
				renderPdf();
			}
		}
		e.target.value = pageNum;
	}
	
	function handleWheelNavigation(e) {
		if (!modal.classList.contains('show') || (currentDisplayMode !== 'single' && currentDisplayMode !== 'double')) {
			return;
		}
	
		e.preventDefault();
	
		if (isWheelNavThrottled) return;
		isWheelNavThrottled = true;
		setTimeout(() => { isWheelNavThrottled = false; }, 400);
	
		if (e.deltaY > 0) {
			onNextPage();
		} else if (e.deltaY < 0) {
			onPrevPage();
		}
	}

	function handleKeyNavigation(e) {
		if (!modal.classList.contains('show')) return;
	
		if (e.key === 'Escape') {
			closePdfViewer();
			return;
		}
		if (e.key === ' ') {
			e.preventDefault();
			const scrollAmount = renderArea.clientHeight * 0.8;
			if (e.shiftKey) {
				renderArea.scrollBy({ top: -scrollAmount, behavior: 'smooth' });
			} else {
				renderArea.scrollBy({ top: scrollAmount, behavior: 'smooth' });
			}
			return;
		}
	
		if (currentDisplayMode === 'scroll') {
			const scrollAmount = renderArea.clientHeight * 0.8;
			let scrolled = false;
			switch (e.key) {
				case 'ArrowDown':
					renderArea.scrollBy({ top: scrollAmount, behavior: 'smooth' });
					scrolled = true;
					break;
				case 'ArrowUp':
					renderArea.scrollBy({ top: -scrollAmount, behavior: 'smooth' });
					scrolled = true;
					break;
			}
			if (scrolled) {
				e.preventDefault();
			}
		} else {
			switch (e.key) {
				case 'ArrowRight':
					e.preventDefault();
					onNextPage();
					break;
				case 'ArrowLeft':
					e.preventDefault();
					onPrevPage();
					break;
			}
		}
	}
	
	pageNumEl.addEventListener('change', handlePageInput);
	pageNumEl.addEventListener('keydown', (e) => {
		if (e.key === 'Enter') {
			handlePageInput(e);
			e.target.blur();
		}
	});
	
	closeModalBtn.addEventListener('click', closePdfViewer);
	
	listHeader.addEventListener('click', (e) => {
		const col = e.target.closest('.header-col');
		if (!col) return;

		const sortValue = col.dataset.sort;
		
		if (currentSortField === sortValue) {
			currentSortOrder = currentSortOrder === 'asc' ? 'desc' : 'asc';
		} else {
			currentSortField = sortValue;
			currentSortOrder = 'asc';
			
			const dropdownOption = sortDropdown.querySelector(`[data-value="${sortValue}"]`);
			if (dropdownOption) {
				sortDropdown.querySelectorAll('.filter-option').forEach(opt => opt.classList.remove('selected'));
				dropdownOption.classList.add('selected');
				sortTrigger.textContent = dropdownOption.textContent;
			}
		}

		localStorage.setItem('librarySortField', currentSortField);
		localStorage.setItem('librarySortOrder', currentSortOrder);

		if (currentSortOrder === 'asc') {
			sortOrderBtn.classList.add('ascending');
		} else {
			sortOrderBtn.classList.remove('ascending');
		}

		renderDocuments();
	});
	
	window.addEventListener('scroll', () => {
		backToTopBtn.classList.toggle('visible', window.scrollY > 500);
	});

	backToTopBtn.addEventListener('click', () => {
		gsap.to(window, { duration: 1.2, scrollTo: { y: 0 }, ease: "power3.inOut" });
	});
	
	sortFilter.addEventListener('click', (e) => {
		if (e.target.closest('.filter-trigger')) {
			sortFilter.classList.toggle('open');
			categoryFilter.classList.remove('open');
		} else if (e.target.classList.contains('filter-option')) {
			sortFilter.classList.remove('open');
			sortDropdown.querySelectorAll('.filter-option').forEach(opt => opt.classList.remove('selected'));
			e.target.classList.add('selected');
			sortTrigger.textContent = e.target.textContent;
			currentSortField = e.target.dataset.value;
			localStorage.setItem('librarySortField', currentSortField);
			renderDocuments();
		}
	});

	sortOrderBtn.addEventListener('click', () => {
		currentSortOrder = currentSortOrder === 'asc' ? 'desc' : 'asc';
		localStorage.setItem('librarySortOrder', currentSortOrder);
		sortOrderBtn.classList.toggle('ascending');
		renderDocuments();
	});

	gridBtn.addEventListener('click', () => {
		if (currentViewMode !== 'grid') {
			currentViewMode = 'grid';
			localStorage.setItem('libraryViewMode', 'grid');
			gridBtn.classList.add('active');
			listBtn.classList.remove('active');
			renderDocuments();
		}
	});

	listBtn.addEventListener('click', () => {
		if (currentViewMode !== 'list') {
			currentViewMode = 'list';
			localStorage.setItem('libraryViewMode', 'list');
			listBtn.classList.add('active');
			gridBtn.classList.remove('active');
			renderDocuments();
		}
	});
	
	populateFilters();
	renderDocuments();
	handleInitialURL();
});