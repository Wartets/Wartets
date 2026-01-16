gsap.registerPlugin(Flip);

function initLibrary() {
	if (!window.libraryData) {
		if (!initLibrary.retries) initLibrary.retries = 0;
		if (initLibrary.retries < 50) {
			initLibrary.retries++;
			setTimeout(initLibrary, 100);
			return;
		}
	}

	const grid = document.getElementById('document-grid');
	if (!grid) return;
	
	const debounce = (func, wait) => {
		let timeout;
		return function executedFunction(...args) {
			const later = () => {
				clearTimeout(timeout);
				func(...args);
			};
			clearTimeout(timeout);
			timeout = setTimeout(later, wait);
		};
	};

	const throttle = (func, limit) => {
		let inThrottle;
		return function(...args) {
			if (!inThrottle) {
				func(...args);
				inThrottle = true;
				setTimeout(() => inThrottle = false, limit);
			}
		};
	};
	
	const searchInput = document.getElementById('searchInput');
	const categoryFilter = document.getElementById('categoryFilter');
	let filterDropdown = null;
	let filterTrigger = null;

	if (categoryFilter) {
		filterDropdown = categoryFilter.querySelector('.filter-dropdown');
		const triggerSpan = categoryFilter.querySelector('.filter-trigger span');
		if (triggerSpan) filterTrigger = triggerSpan;
	}

	const modal = document.getElementById('pdf-viewer-modal');
	let closeModalBtn = null;
	if (modal) {
		closeModalBtn = modal.querySelector('.close-modal');
	}

	const backToTopBtn = document.getElementById('backToTop');
	const sortFilter = document.getElementById('sortFilter');
	let sortDropdown = null;
	let sortTrigger = null;
	let currentFilter = 'all';

	if (sortFilter) {
		sortDropdown = sortFilter.querySelector('.filter-dropdown');
		const sortTriggerSpan = sortFilter.querySelector('.filter-trigger span');
		if (sortTriggerSpan) sortTrigger = sortTriggerSpan;
	}

	const sortOrderBtn = document.getElementById('sortOrderBtn');
	const gridBtn = document.getElementById('grid-view-btn');
	const listBtn = document.getElementById('list-view-btn');
	const listHeader = document.getElementById('list-header');
	const renderArea = document.getElementById('content-render-area');
	const siteFooter = document.querySelector('.site-footer');

	const documentCardsCache = new Map();
	const loadedTextContent = new Map();

	let currentViewMode = localStorage.getItem('libraryViewMode') || 'list';
	let currentSortField = localStorage.getItem('librarySortField') || 'date';
	let currentSortOrder = localStorage.getItem('librarySortOrder') || 'desc';
	
	let currentDoc = null;
	const clearSearchBtn = document.getElementById('clearSearchBtn');
	const tagFilter = document.getElementById('tagFilter');
	let tagDropdown = null;
	let tagTrigger = null;
	
	if (tagFilter) {
		tagDropdown = tagFilter.querySelector('.filter-dropdown');
		const tagTriggerSpan = tagFilter.querySelector('.filter-trigger span');
		if (tagTriggerSpan) tagTrigger = tagTriggerSpan;
	}

	const modalDownloadBtn = document.getElementById('modal-download-btn');
	const modalExternalBtn = document.getElementById('modal-external-btn');
	const modalShareBtn = document.getElementById('modal-share-btn');
	
	let currentTagFilter = 'all';
	let fuse = null;
	let processedDocs = [];

	if (gridBtn && listBtn) {
		if (currentViewMode === 'list') {
			gridBtn.classList.remove('active');
			listBtn.classList.add('active');
		} else {
			gridBtn.classList.add('active');
			listBtn.classList.remove('active');
		}
	}

	if (sortOrderBtn && currentSortOrder === 'asc') {
		sortOrderBtn.classList.add('ascending');
	}

	if (sortDropdown) {
		const initialSortOption = sortDropdown.querySelector(`[data-value="${currentSortField}"]`);
		if (initialSortOption) {
			sortDropdown.querySelectorAll('.filter-option').forEach(opt => opt.classList.remove('selected'));
			initialSortOption.classList.add('selected');
			if (sortTrigger) sortTrigger.textContent = initialSortOption.textContent;
		}
	}

	const libraryData = window.libraryData;

	if (!libraryData || !libraryData.documents) {
		grid.innerHTML = '<div class="loader-wrapper"><p>Error: Library data could not be loaded.</p></div>';
		return;
	}

	const categoryMap = new Map((libraryData.categories || []).map(c => [c.id, c.name]));
	const authorMap = new Map((libraryData.authors || []).map(a => [a.id, a.name]));

	function parseDate(dateStr) {
		if (!dateStr) return 0;
		const parts = dateStr.trim().split('/');
		if (parts.length === 3) {
			return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`).getTime();
		}
		return 0;
	}

	async function fetchAndParseDoc(doc) {
		try {
			const response = await fetch(doc.filePath);
			if (!response.ok) throw new Error('Network response was not ok');
			const text = await response.text();
			loadedTextContent.set(doc.filePath, text);
			
			const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
			
			let parsedTitle = doc.title;
			let parsedDateStr = null;
			let timestamp = doc.timestamp;

			if (!parsedTitle && lines.length > 0) {
				parsedTitle = lines[0];
			}

			if (lines.length > 1) {
				const lastLine = lines[lines.length - 1];
				if (lastLine.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)) {
					parsedDateStr = lastLine;
					timestamp = parseDate(parsedDateStr);
				}
			}

			return {
				...doc,
				title: parsedTitle || "Untitled",
				timestamp: timestamp,
				dateStr: parsedDateStr || "Unknown Date",
				authorNames: doc.authorIds.map(id => authorMap.get(id) || 'Unknown').join(', '),
				categoryName: categoryMap.get(doc.categoryId) || 'Uncategorized',
				formattedDate: parsedDateStr || (timestamp ? new Date(timestamp).toLocaleDateString('en-GB') : '')
			};

		} catch (error) {
			console.error("Error fetching doc:", doc.id, error);
			return {
				...doc,
				title: doc.title || "Error Loading",
				authorNames: doc.authorIds.map(id => authorMap.get(id) || 'Unknown').join(', '),
				categoryName: categoryMap.get(doc.categoryId) || 'Uncategorized',
				timestamp: 0,
				formattedDate: ''
			};
		}
	}

	async function prepareLibrary() {
		const docPromises = (libraryData.documents || []).map(doc => fetchAndParseDoc(doc));
		processedDocs = await Promise.all(docPromises);
		
		fuse = typeof Fuse !== 'undefined' ? new Fuse(processedDocs, {
			keys: ['title', 'description', 'tags', 'authorNames'],
			threshold: 0.4,
			ignoreLocation: true
		}) : null;

		initializeFromURL();
		populateFilters();
		renderDocuments();
	}

	const cardObserver = new IntersectionObserver((entries, observer) => {
		entries.forEach(entry => {
			if (entry.isIntersecting) {
				const card = entry.target;
				const previewContainer = card.querySelector('.card-preview-text');
				const filePath = card.dataset.filePath;
				if (previewContainer && filePath) renderTextPreview(previewContainer, filePath);
				observer.unobserve(card);
			}
		});
	}, { rootMargin: '0px 0px 200px 0px' });

	function populateFilters() {
		if (filterDropdown && libraryData.categories) {
			filterDropdown.innerHTML = '<div class="filter-option selected" data-value="all">All Categories</div>';
			libraryData.categories.forEach(category => {
				const option = document.createElement('div');
				option.className = 'filter-option';
				option.dataset.value = category.id;
				option.textContent = category.name;
				filterDropdown.appendChild(option);
			});
		}

		if (tagDropdown && processedDocs.length > 0) {
			tagDropdown.innerHTML = '<div class="filter-option selected" data-value="all">All Tags</div>';
			const allTags = new Set();
			processedDocs.forEach(doc => {
				if (doc.tags && Array.isArray(doc.tags)) {
					doc.tags.forEach(tag => allTags.add(tag.toLowerCase()));
				}
			});

			const sortedTags = Array.from(allTags).sort();
			sortedTags.forEach(tag => {
				const option = document.createElement('div');
				option.className = 'filter-option';
				option.dataset.value = tag;
				option.textContent = tag.charAt(0).toUpperCase() + tag.slice(1);
				tagDropdown.appendChild(option);
			});
		}
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
					valA = a.timestamp || 0;
					valB = b.timestamp || 0;
					return (valA - valB) * multiplier;
			}
		});
	}

	function renderDocuments() {
		sortDocuments();

		if (listHeader) {
			listHeader.classList.remove('list-mode', 'grid-mode');
			if (currentViewMode === 'list') {
				grid.classList.add('list-view');
				listHeader.classList.add('list-mode');
			} else {
				grid.classList.remove('list-view');
				listHeader.classList.add('grid-mode');
			}

			Array.from(listHeader.children).forEach(col => {
				col.classList.remove('active', 'asc', 'desc');
				if (col.dataset.sort === currentSortField) {
					col.classList.add('active', currentSortOrder);
				}
			});
		}

		const fragment = document.createDocumentFragment();

		processedDocs.forEach(doc => {
			let card = documentCardsCache.get(doc.id);
			if (!card) {
				card = document.createElement('div');
				card.dataset.id = doc.id;
				card.dataset.filePath = doc.filePath;
				card.dataset.categoryId = doc.categoryId;
				card.dataset.title = doc.title;
				card.dataset.tags = (doc.tags || []).join(',');
				
				card.setAttribute('tabindex', '0');
				card.setAttribute('role', 'button');
				card.setAttribute('aria-label', `Open ${doc.title}`);
				
				card.addEventListener('click', () => openDocumentViewer(doc));
				card.addEventListener('keydown', (e) => {
					if (e.key === 'Enter' || e.key === ' ') {
						e.preventDefault();
						openDocumentViewer(doc);
					}
				});
				
				card.addEventListener('mousemove', (e) => {
					const rect = card.getBoundingClientRect();
					const x = e.clientX - rect.left;
					const y = e.clientY - rect.top;
					card.style.setProperty('--mouse-x', `${x}px`);
					card.style.setProperty('--mouse-y', `${y}px`);
				});
				
				documentCardsCache.set(doc.id, card);
			}

			if (card.dataset.viewMode !== currentViewMode) {
				card.dataset.viewMode = currentViewMode;
				
				const tagsHtml = (doc.tags || []).slice(0, 3).map(tag => 
					`<span class="doc-tag">${tag}</span>`
				).join('');

				if (currentViewMode === 'grid') {
					card.className = 'doc-card';
					card.innerHTML = `
						<div class="card-preview-wrapper">
							<i class="fa-solid fa-circle-notch preview-loader"></i>
							<div class="card-preview-text"></div>
						</div>
						<div class="card-content">
							<div class="doc-tags">${tagsHtml}</div>
							<h2 class="card-title">${doc.title}</h2>
							<div class="card-meta">
								<span class="author">${doc.authorNames}</span>
								<span class="date">${doc.formattedDate}</span>
							</div>
						</div>
					`;
					cardObserver.observe(card);
				} else {
					card.className = 'doc-card list-view-item';
					card.innerHTML = `
						<div class="card-content">
							<div class="card-title" title="${doc.title}">${doc.title}</div>
							<div class="list-category">${doc.categoryName}</div>
							<div class="card-meta">
								<span class="author">${doc.authorNames}</span>
								<span class="date">${doc.formattedDate}</span>
							</div>
						</div>
					`;
				}
			}
			fragment.appendChild(card);
		});

		const loader = grid.querySelector('.loader-wrapper');
		if (loader) {
			loader.remove();
		}
		
		const noResults = document.getElementById('no-results-message');
		if(noResults) grid.appendChild(noResults);

		const existingCards = Array.from(grid.children).filter(c => c.classList.contains('doc-card'));
		existingCards.forEach(c => c.remove());
		
		grid.insertBefore(fragment, noResults);
		applyFilters();
	}

	async function renderTextPreview(container, filePath) {
		if (container.classList.contains('loaded')) return;

		let text = loadedTextContent.get(filePath);
		
		if (!text) {
			try {
				const response = await fetch(filePath);
				text = await response.text();
				loadedTextContent.set(filePath, text);
			} catch (e) {
				console.error("Failed to load text preview", e);
				const loader = container.parentElement ? container.parentElement.querySelector('.preview-loader') : null;
				if (loader) {
					loader.classList.remove('fa-spin', 'fa-circle-notch');
					loader.classList.add('fa-triangle-exclamation');
				}
				return;
			}
		}

		const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
		
		let previewLines = [];
		let startIndex = 0;
		if (lines.length > 0 && lines[0].length < 100) startIndex = 1;
		
		for (let i = startIndex; i < Math.min(lines.length, startIndex + 8); i++) {
			if (lines[i].match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)) continue; 
			previewLines.push(lines[i]);
		}

		container.textContent = previewLines.join('\n');
		
		const loader = container.parentElement ? container.parentElement.querySelector('.preview-loader') : null;
		if (loader) loader.style.display = 'none';
		
		container.classList.add('loaded');
		
		gsap.fromTo(container, 
			{ opacity: 0 }, 
			{ opacity: 0.7, duration: 0.5 }
		);
	}
	
	function updateURLState() {
		const params = new URLSearchParams();
		
		if (currentFilter !== 'all') params.set('category', currentFilter);
		if (currentTagFilter !== 'all') params.set('tag', currentTagFilter);
		if (searchInput && searchInput.value.trim()) params.set('q', searchInput.value.trim());
		if (currentSortField !== 'date') params.set('sort', currentSortField);
		if (currentSortOrder !== 'desc') params.set('order', currentSortOrder);
		if (currentViewMode !== 'list') params.set('view', currentViewMode);
		
		const newRelativePathQuery = window.location.pathname + '?' + params.toString() + window.location.hash;
		history.replaceState(null, '', newRelativePathQuery);
	}
	
	function applyFilters() {
		const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
		if (clearSearchBtn) {
			clearSearchBtn.classList.toggle('visible', query.length > 0);
		}

		const searchResults = (query && fuse) ? new Set(fuse.search(query).map(result => result.item.id)) : null;
		
		const state = (typeof Flip !== 'undefined') ? Flip.getState(grid.querySelectorAll('.doc-card')) : null;

		let visibleCount = 0;
		const cards = grid.querySelectorAll('.doc-card');
		
		cards.forEach(card => {
			const docTags = card.dataset.tags ? card.dataset.tags.split(',') : [];
			const matchesCategory = currentFilter === 'all' || card.dataset.categoryId == currentFilter;
			const matchesTag = currentTagFilter === 'all' || docTags.includes(currentTagFilter);
			const matchesSearch = !searchResults || searchResults.has(card.dataset.id);

			if (matchesCategory && matchesTag && matchesSearch) {
				card.style.display = currentViewMode === 'grid' ? '' : 'flex';
				card.classList.remove('hidden');
				visibleCount++;
			} else {
				card.style.display = 'none';
				card.classList.add('hidden');
			}
		});

		const noResultsMsg = document.getElementById('no-results-message');
		if (noResultsMsg) {
			if (visibleCount === 0 && processedDocs.length > 0) {
				noResultsMsg.classList.remove('hidden');
				const resetBtn = document.getElementById('reset-filters-btn');
				if (resetBtn) {
					resetBtn.onclick = () => {
						searchInput.value = '';
						currentFilter = 'all';
						currentTagFilter = 'all';
						
						if (filterTrigger) filterTrigger.textContent = 'All Categories';
						if (tagTrigger) tagTrigger.textContent = 'All Tags';
						if (filterDropdown) filterDropdown.querySelectorAll('.selected').forEach(el => el.classList.remove('selected'));
						if (tagDropdown) tagDropdown.querySelectorAll('.selected').forEach(el => el.classList.remove('selected'));
						
						applyFilters();
					};
				}
			} else {
				noResultsMsg.classList.add('hidden');
			}
		}

		if (state && typeof Flip !== 'undefined') {
			Flip.from(state, {
				targets: grid.querySelectorAll('.doc-card:not(.hidden)'),
				duration: 0.6,
				stagger: 0.03,
				ease: "power3.out",
				scale: true,
				absolute: true,
				onEnter: elements => gsap.fromTo(elements, 
					{ opacity: 0, scale: 0.9, y: 20 }, 
					{ opacity: 1, scale: 1, y: 0, duration: 0.4, stagger: 0.05, ease: "back.out(1.2)" }
				),
				onLeave: elements => gsap.to(elements, 
					{ opacity: 0, scale: 0.9, duration: 0.3, onComplete: () => elements.forEach(el => el.style.display = 'none') }
				)
			});
		}
		
		updateURLState();
	}
	
	if (searchInput) {
		searchInput.addEventListener('input', debounce(() => {
			applyFilters();
		}, 300));
	}

	if (categoryFilter) {
		categoryFilter.addEventListener('click', (e) => {
			if (e.target.closest('.filter-trigger')) {
				categoryFilter.classList.toggle('open');
			} else if (e.target.classList.contains('filter-option')) {
				categoryFilter.classList.remove('open');
				if (filterDropdown) filterDropdown.querySelectorAll('.filter-option').forEach(opt => opt.classList.remove('selected'));
				e.target.classList.add('selected');
				if (filterTrigger) filterTrigger.textContent = e.target.textContent;
				currentFilter = e.target.dataset.value;
				applyFilters();
			}
		});
	}

	document.addEventListener('click', e => {
		if (categoryFilter && !categoryFilter.contains(e.target)) {
			categoryFilter.classList.remove('open');
		}
		if (sortFilter && !sortFilter.contains(e.target)) {
			sortFilter.classList.remove('open');
		}
	});

	function initializeFromURL() {
		const urlParams = new URLSearchParams(window.location.search);
		
		const categoryParam = urlParams.get('category');
		if (categoryParam && libraryData.categories.some(c => c.id == categoryParam)) {
			currentFilter = categoryParam;
			if (filterTrigger) {
				const catName = libraryData.categories.find(c => c.id == categoryParam).name;
				filterTrigger.textContent = catName;
			}
			setTimeout(() => {
				if (filterDropdown) {
					filterDropdown.querySelectorAll('.filter-option').forEach(opt => {
						if (opt.dataset.value == currentFilter) opt.classList.add('selected');
						else opt.classList.remove('selected');
					});
				}
			}, 0);
		}

		const tagParam = urlParams.get('tag');
		if (tagParam) {
			currentTagFilter = tagParam;
			if (tagTrigger) tagTrigger.textContent = tagParam.charAt(0).toUpperCase() + tagParam.slice(1);
			setTimeout(() => {
				if (tagDropdown) {
					tagDropdown.querySelectorAll('.filter-option').forEach(opt => {
						if (opt.dataset.value === currentTagFilter) opt.classList.add('selected');
						else opt.classList.remove('selected');
					});
				}
			}, 0);
		}

		const searchParam = urlParams.get('q');
		if (searchParam && searchInput) {
			searchInput.value = searchParam;
		}

		const sortParam = urlParams.get('sort');
		if (sortParam) {
			currentSortField = sortParam;
			if (sortDropdown) {
				sortDropdown.querySelectorAll('.filter-option').forEach(opt => {
					if (opt.dataset.value === currentSortField) opt.classList.add('selected');
					else opt.classList.remove('selected');
				});
				const selectedSort = sortDropdown.querySelector(`[data-value="${currentSortField}"]`);
				if (selectedSort && sortTrigger) sortTrigger.textContent = selectedSort.textContent;
			}
		}
		
		const orderParam = urlParams.get('order');
		if (orderParam && (orderParam === 'asc' || orderParam === 'desc')) {
			currentSortOrder = orderParam;
			if (sortOrderBtn) {
				if (currentSortOrder === 'asc') sortOrderBtn.classList.add('ascending');
				else sortOrderBtn.classList.remove('ascending');
			}
		}

		const viewParam = urlParams.get('view');
		if (viewParam && (viewParam === 'grid' || viewParam === 'list')) {
			currentViewMode = viewParam;
			if (viewParam === 'grid') {
				gridBtn.classList.add('active');
				listBtn.classList.remove('active');
			} else {
				gridBtn.classList.remove('active');
				listBtn.classList.add('active');
			}
		}

		const hash = window.location.hash.substring(1);
		if (hash) {
			try {
				const hashParams = new URLSearchParams(hash);
				const docId = hashParams.get('doc');
				
				if (docId) {
					const docToOpen = processedDocs.find(d => d.id === docId);
					if (docToOpen) {
						setTimeout(() => openDocumentViewer(docToOpen), 500);
					}
				}
			} catch (e) {
				console.error(e);
			}
		}
	}

	async function openDocumentViewer(doc) {
		if (!modal) return;
		
		modal.classList.add('show');
		document.body.style.overflow = 'hidden';
		
		const titleEl = document.getElementById('modal-doc-title');
		if (titleEl) titleEl.textContent = doc.title;

		if (modalDownloadBtn) {
			modalDownloadBtn.onclick = (e) => {
				e.stopPropagation();
				const link = document.createElement('a');
				link.href = doc.filePath;
				link.download = doc.title + '.txt';
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);
			};
		}

		if (modalExternalBtn) {
			modalExternalBtn.onclick = (e) => {
				e.stopPropagation();
				window.open(doc.filePath, '_blank');
			};
		}

		if (modalShareBtn) {
			modalShareBtn.onclick = async (e) => {
				e.stopPropagation();
				const url = new URL(window.location.href);
				url.hash = `doc=${doc.id}`;
				try {
					await navigator.clipboard.writeText(url.toString());
					const originalIcon = modalShareBtn.innerHTML;
					modalShareBtn.innerHTML = '<i class="fa-solid fa-check"></i>';
					setTimeout(() => {
						modalShareBtn.innerHTML = originalIcon;
					}, 2000);
				} catch (err) {
					console.error('Failed to copy: ', err);
				}
			};
		}

		const params = new URLSearchParams();
		params.set('doc', doc.id);
		history.replaceState(null, '', `#${params.toString()}`);
		
		if (renderArea) {
			renderArea.innerHTML = '';
			currentDoc = doc;
			
			const loader = document.createElement('div');
			loader.className = 'loader-wrapper';
			loader.style.height = '100%';
			loader.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i>';
			renderArea.appendChild(loader);

			try {
				let text = loadedTextContent.get(doc.filePath);
				if (!text) {
					const response = await fetch(doc.filePath);
					text = await response.text();
					loadedTextContent.set(doc.filePath, text);
				}

				const lines = text.split('\n');
				const contentLines = [];
				let title = doc.title;
				let date = doc.formattedDate;

				for(let i = 0; i < lines.length; i++) {
					const line = lines[i].trim();
					if (i === 0 && line === doc.title) continue; 
					if (i === lines.length - 1 && line.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)) continue;
					contentLines.push(line);
				}

				const htmlContent = `
					<div class="poem-content">
						<h1 class="poem-title">${title}</h1>
						<div class="poem-body">${contentLines.join('\n')}</div>
						<div class="poem-date">${date}</div>
					</div>
				`;

				loader.remove();
				renderArea.innerHTML = htmlContent;
				
				setTimeout(() => {
					const content = renderArea.querySelector('.poem-content');
					if(content) content.classList.add('visible');
				}, 50);

			} catch (e) {
				console.error(e);
				loader.innerHTML = '<p>Error loading text.</p>';
			}
		}

		document.addEventListener('keydown', handleKeyNavigation);
	}
	
	function closeDocumentViewer() {
		if (!modal) return;
		modal.classList.remove('show');
		document.body.style.overflow = '';
		
		if (renderArea) renderArea.innerHTML = '';
		
		currentDoc = null;
		document.removeEventListener('keydown', handleKeyNavigation);
		
		history.pushState("", document.title, window.location.pathname + window.location.search);
	}

	if (closeModalBtn) {
		closeModalBtn.addEventListener('click', closeDocumentViewer);
	}

	function handleKeyNavigation(e) {
		if (e.key === 'Escape') {
			closeDocumentViewer();
		}
	}

	if (listHeader) {
		listHeader.addEventListener('click', (e) => {
			const col = e.target.closest('.header-col');
			if (!col) return;
			const sortValue = col.dataset.sort;
			if (currentSortField === sortValue) {
				currentSortOrder = currentSortOrder === 'asc' ? 'desc' : 'asc';
			} else {
				currentSortField = sortValue;
				currentSortOrder = 'asc';
				if (sortDropdown) {
					const dropdownOption = sortDropdown.querySelector(`[data-value="${sortValue}"]`);
					if (dropdownOption) {
						sortDropdown.querySelectorAll('.filter-option').forEach(opt => opt.classList.remove('selected'));
						dropdownOption.classList.add('selected');
						if (sortTrigger) sortTrigger.textContent = dropdownOption.textContent;
					}
				}
			}
			localStorage.setItem('librarySortField', currentSortField);
			localStorage.setItem('librarySortOrder', currentSortOrder);
			if (sortOrderBtn) {
				if (currentSortOrder === 'asc') {
					sortOrderBtn.classList.add('ascending');
				} else {
					sortOrderBtn.classList.remove('ascending');
				}
			}
			renderDocuments();
		});
	}

	window.addEventListener('scroll', throttle(() => {
		if (backToTopBtn) {
			backToTopBtn.classList.toggle('visible', window.scrollY > 500);

			if (siteFooter) {
				const footerRect = siteFooter.getBoundingClientRect();
				const windowHeight = window.innerHeight;
				
				if (footerRect.top < windowHeight) {
					const newBottom = windowHeight - footerRect.top + 30;
					backToTopBtn.style.bottom = `${newBottom}px`;
				} else {
					backToTopBtn.style.bottom = '';
				}
			}
		}
	}, 100));

	if (backToTopBtn) {
		backToTopBtn.addEventListener('click', () => {
			gsap.to(window, { duration: 1.2, scrollTo: { y: 0 }, ease: "power3.inOut" });
		});
	}

	if (sortFilter) {
		sortFilter.addEventListener('click', (e) => {
			if (e.target.closest('.filter-trigger')) {
				sortFilter.classList.toggle('open');
				if (categoryFilter) categoryFilter.classList.remove('open');
			} else if (e.target.classList.contains('filter-option')) {
				sortFilter.classList.remove('open');
				if (sortDropdown) sortDropdown.querySelectorAll('.filter-option').forEach(opt => opt.classList.remove('selected'));
				e.target.classList.add('selected');
				if (sortTrigger) sortTrigger.textContent = e.target.textContent;
				currentSortField = e.target.dataset.value;
				localStorage.setItem('librarySortField', currentSortField);
				renderDocuments();
			}
		});
	}

	if (sortOrderBtn) {
		sortOrderBtn.addEventListener('click', () => {
			currentSortOrder = currentSortOrder === 'asc' ? 'desc' : 'asc';
			localStorage.setItem('librarySortOrder', currentSortOrder);
			sortOrderBtn.classList.toggle('ascending');
			renderDocuments();
		});
	}

	if (gridBtn) {
		gridBtn.addEventListener('click', () => {
			if (currentViewMode !== 'grid') {
				currentViewMode = 'grid';
				localStorage.setItem('libraryViewMode', 'grid');
				gridBtn.classList.add('active');
				if (listBtn) listBtn.classList.remove('active');
				renderDocuments();
			}
		});
	}

	if (listBtn) {
		listBtn.addEventListener('click', () => {
			if (currentViewMode !== 'list') {
				currentViewMode = 'list';
				localStorage.setItem('libraryViewMode', 'list');
				listBtn.classList.add('active');
				if (gridBtn) gridBtn.classList.remove('active');
				renderDocuments();
			}
		});
	}
	
	if (tagFilter) {
		tagFilter.addEventListener('click', (e) => {
			if (e.target.closest('.filter-trigger')) {
				tagFilter.classList.toggle('open');
				if (categoryFilter) categoryFilter.classList.remove('open');
				if (sortFilter) sortFilter.classList.remove('open');
			} else if (e.target.classList.contains('filter-option')) {
				tagFilter.classList.remove('open');
				if (tagDropdown) tagDropdown.querySelectorAll('.filter-option').forEach(opt => opt.classList.remove('selected'));
				e.target.classList.add('selected');
				if (tagTrigger) tagTrigger.textContent = e.target.textContent;
				currentTagFilter = e.target.dataset.value;
				applyFilters();
			}
		});
	}

	if (clearSearchBtn && searchInput) {
		clearSearchBtn.addEventListener('click', () => {
			searchInput.value = '';
			searchInput.focus();
			applyFilters();
		});
	}

	document.addEventListener('click', e => {
		if (categoryFilter && !categoryFilter.contains(e.target)) {
			categoryFilter.classList.remove('open');
		}
		if (tagFilter && !tagFilter.contains(e.target)) {
			tagFilter.classList.remove('open');
		}
		if (sortFilter && !sortFilter.contains(e.target)) {
			sortFilter.classList.remove('open');
		}
	});
	
	prepareLibrary();
}

if (document.readyState === 'loading') {
	window.addEventListener('load', initLibrary);
} else {
	initLibrary();
}