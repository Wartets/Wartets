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

	if (window.pdfjsLib) {
		pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
	}

	const grid = document.getElementById('document-grid');
	if (!grid) return;
	
	const debounce = (func, wait) => {
		let timeout;
		return function(...args) {
			const context = this;
			clearTimeout(timeout);
			timeout = setTimeout(() => func.apply(context, args), wait);
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
	let pdfInterval = null;
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
	const renderArea = document.getElementById('pdf-render-area');
	const siteFooter = document.querySelector('.site-footer');

	const documentCardsCache = new Map();
	const loadedPdfDocuments = new Map();

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
		console.error('Library data is missing. Ensure documents.js is loaded correctly.');
		grid.innerHTML = '<div class="loader-wrapper"><p>Error: Library data could not be loaded.</p></div>';
		return;
	}

	const categoryMap = new Map((libraryData.categories || []).map(c => [c.id, c.name]));
	const authorMap = new Map((libraryData.authors || []).map(a => [a.id, a.name]));
	const langMap = new Map((libraryData.languages || []).map(l => [l.id, l.name]));

	let processedDocs = (libraryData.documents || []).map(doc => {
		const catIds = doc.categoryIds || (doc.categoryId ? [doc.categoryId] : []);
		const catNames = catIds.map(id => categoryMap.get(id) || 'Uncategorized');
		const langCode = doc.langId || doc.lang || 'en';
		
		return {
			...doc,
			categoryIds: catIds,
			categoryName: catNames.join(', '),
			primaryCategoryName: catNames[0],
			authorNames: doc.authorIds.map(id => authorMap.get(id) || 'Unknown').join(', '),
			lang: langCode,
			langName: langMap.get(langCode) || langCode.toUpperCase(),
			date: new Date(doc.timestamp).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
		};
	});

	const fuse = typeof Fuse !== 'undefined' ? new Fuse(processedDocs, {
		keys: ['title', 'description', 'tags', 'authorNames', 'categoryName', 'primaryCategoryName'],
		threshold: 0.05,
		ignoreLocation: true
	}) : null;
	
	function populateFilters() {
		if (filterDropdown && libraryData.categories) {
			libraryData.categories.forEach(category => {
				const option = document.createElement('div');
				option.className = 'filter-option';
				option.dataset.value = category.id;
				option.textContent = category.name;
				filterDropdown.appendChild(option);
			});
		}

		if (tagDropdown && libraryData.documents) {
			const allTags = new Set();
			libraryData.documents.forEach(doc => {
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
				case 'lang':
					valA = (a.lang || '').toLowerCase();
					valB = (b.lang || '').toLowerCase();
					return valA.localeCompare(valB) * multiplier;
				case 'date':
				default:
					valA = new Date(a.timestamp);
					valB = new Date(b.timestamp);
					return (valA - valB) * multiplier;
			}
		});
	}

	const cardObserver = new IntersectionObserver((entries, observer) => {
		entries.forEach(entry => {
			if (entry.isIntersecting) {
				const card = entry.target;
				const canvas = card.querySelector('canvas');
				const filePath = card.dataset.filePath;
				if (canvas && filePath) renderPdfPreview(canvas, filePath);
				observer.unobserve(card);
			}
		});
	}, { rootMargin: '0px 0px 200px 0px' });

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

		const state = (typeof Flip !== 'undefined') ? Flip.getState(grid.querySelectorAll('.doc-card')) : null;

		const fragment = document.createDocumentFragment();
		const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
		if (clearSearchBtn) {
			clearSearchBtn.classList.toggle('visible', query.length > 0);
		}

		const highlightRegex = query ? new RegExp(`(${searchInput.value.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi') : null;
		const highlightText = (text) => {
			if (!highlightRegex || !text) return text;
			return text.replace(highlightRegex, '<span class="search-highlight">$1</span>');
		};

		let visibleCount = 0;

		processedDocs.forEach(doc => {
			const docTags = doc.tags || [];
			const categoryIdsStr = doc.categoryIds.map(String);
			const matchesCategory = currentFilter === 'all' || categoryIdsStr.includes(currentFilter);
			const matchesTag = currentTagFilter === 'all' || docTags.includes(currentTagFilter);

			let matchesSearch = true;
			if (query) {
				const searchableText = [
					doc.title,
					doc.description,
					doc.authorNames,
					doc.categoryName,
					...(doc.tags || [])
				].join(' ').toLowerCase();
				matchesSearch = searchableText.includes(query);
			}

			if (matchesCategory && matchesTag && matchesSearch) {
				visibleCount++;
				let card = documentCardsCache.get(doc.id);
				if (!card) {
					card = document.createElement('div');
					card.dataset.id = doc.id;
					card.dataset.filePath = doc.filePath;
					card.dataset.title = doc.title;
					card.dataset.tags = (doc.tags || []).join(',');
					card.dataset.categoryIds = JSON.stringify(doc.categoryIds);
					
					card.setAttribute('tabindex', '0');
					card.setAttribute('role', 'button');
					card.setAttribute('aria-label', `Open ${doc.title}`);
					
					card.addEventListener('click', () => openPdfViewer(doc));
					card.addEventListener('keydown', (e) => {
						if (e.key === 'Enter' || e.key === ' ') {
							e.preventDefault();
							openPdfViewer(doc);
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

				const tagsHtml = (doc.tags || []).slice(0, 3).map(tag => `<span class="doc-tag">${tag}</span>`).join('');
				const displayTitle = highlightText(doc.title);
				const displayDesc = doc.description ? highlightText(doc.description) : '';
				const descriptionHtml = displayDesc ? `<p class="card-description">${displayDesc}</p>` : '';

				if (card.dataset.viewMode !== currentViewMode || query !== card.dataset.lastQuery) {
					card.dataset.viewMode = currentViewMode;
					card.dataset.lastQuery = query;
					
					if (currentViewMode === 'grid') {
						card.className = 'doc-card';
						card.innerHTML = `
							<div class="card-preview-wrapper">
								<i class="fa-solid fa-circle-notch preview-loader"></i>
								<canvas></canvas>
							</div>
							<div class="card-content">
								<div class="doc-tags">${tagsHtml}</div>
								<h2 class="card-title">${displayTitle}</h2>
								${descriptionHtml}
								<div class="card-meta">
									<span class="author">${doc.authorNames}</span>
									<span class="date">${doc.date}</span>
								</div>
							</div>
						`;
						cardObserver.observe(card);
					} else {
						card.className = 'doc-card list-view-item';
						card.innerHTML = `
							<div class="card-content">
								<div class="list-title-wrapper">
									<div class="card-title" title="${doc.title}">${displayTitle}</div>
									${descriptionHtml}
								</div>
								<div class="list-category">${doc.categoryName}</div>
								<div class="list-lang">${(doc.lang || '').toUpperCase()}</div>
								<div class="card-meta">
									<span class="author">${doc.authorNames}</span>
									<span class="date">${doc.date}</span>
								</div>
							</div>
						`;
					}
				}
				card.classList.remove('hidden');
				fragment.appendChild(card);
			}
		});

		const loader = grid.querySelector('.loader-wrapper');
		if (loader) loader.remove();
		
		const noResultsMsg = document.getElementById('no-results-message');
		if (noResultsMsg) grid.appendChild(noResultsMsg);

		const existingCards = Array.from(grid.children).filter(c => c.classList.contains('doc-card'));
		existingCards.forEach(c => c.remove());
		
		grid.insertBefore(fragment, noResultsMsg);

		if (noResultsMsg) {
			noResultsMsg.classList.toggle('hidden', visibleCount > 0);
			if (visibleCount === 0 && processedDocs.length > 0) {
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
						renderDocuments();
					};
				}
			}
		}

		if (state && typeof Flip !== 'undefined') {
			Flip.from(state, {
				targets: grid.querySelectorAll('.doc-card:not(.hidden)'),
				duration: 0.4, stagger: 0.02, ease: "power2.out", simple: true,
				onEnter: elements => gsap.fromTo(elements, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.3, stagger: 0.02, ease: "power2.out" }),
				onLeave: elements => gsap.to(elements, { opacity: 0, duration: 0.2, onComplete: () => elements.forEach(el => el.style.display = 'none') })
			});
		}

		updateURLState();
	}
	
	async function renderPdfPreview(canvas, filePath) {
		if (canvas.classList.contains('loaded')) return;
		
		if (!window.pdfjsLib) return;

		try {
			let loadingTask;
			if (loadedPdfDocuments.has(filePath)) {
				const cachedDoc = loadedPdfDocuments.get(filePath);
				loadingTask = { promise: Promise.resolve(cachedDoc) };
			} else {
				loadingTask = window.pdfjsLib.getDocument({
					url: filePath,
					disableAutoFetch: true,
					disableStream: true,
					rangeChunkSize: 65536
				});
			}
			
			const pdf = await loadingTask.promise;
			if (!loadedPdfDocuments.has(filePath)) {
				loadedPdfDocuments.set(filePath, pdf);
			}

			const page = await pdf.getPage(1);
			const viewport = page.getViewport({ scale: 1.0 });
			const context = canvas.getContext('2d', { alpha: false, willReadFrequently: false });
			
			if (!context) {
				page.cleanup();
				return;
			}

			canvas.height = viewport.height;
			canvas.width = viewport.width;

			const renderContext = {
				canvasContext: context,
				viewport: viewport
			};

			await page.render(renderContext).promise;
			page.cleanup();
			
			const loader = canvas.parentElement ? canvas.parentElement.querySelector('.preview-loader') : null;
			if (loader) loader.style.display = 'none';
			if (canvas.parentElement) canvas.parentElement.style.animation = 'none';
			
			canvas.classList.add('loaded');
		} catch (error) {
			console.error(`Failed to render PDF preview for ${filePath}:`, error);
			const loader = canvas.parentElement ? canvas.parentElement.querySelector('.preview-loader') : null;
			if (loader) {
				loader.classList.remove('fa-spin', 'fa-circle-notch');
				loader.classList.add('fa-triangle-exclamation');
				loader.title = "Preview failed";
			}
		}
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
	
	if (searchInput) {
		searchInput.addEventListener('input', debounce(() => {
			renderDocuments();
		}, 200));
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
				renderDocuments();
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
				const page = hashParams.get('page');

				if (docId) {
					const docToOpen = processedDocs.find(d => d.id === docId);
					if (docToOpen) {
						setTimeout(() => openPdfViewer(docToOpen, page || 1), 500);
					}
				}
			} catch (e) {
				console.error(e);
			}
		}
	}

	function openPdfViewer(doc, page = 1) {
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
				link.download = doc.title;
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
		params.set('page', page);
		history.replaceState(null, '', `#${params.toString()}`);
		
		if (renderArea) {
			renderArea.innerHTML = '';
			currentDoc = doc;
			
			const loader = document.createElement('div');
			loader.className = 'loader-wrapper';
			loader.style.height = '100%';
			loader.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i>';
			renderArea.appendChild(loader);

			const iframe = document.createElement('iframe');
			iframe.style.opacity = '0';
			iframe.style.transition = 'opacity 0.6s ease-out';
			iframe.src = `${doc.filePath}#page=${page}`;
			iframe.type = 'application/pdf';
			
			iframe.onload = () => {
				loader.style.opacity = '0';
				loader.style.transition = 'opacity 0.3s ease';
				setTimeout(() => {
					loader.remove();
					iframe.style.opacity = '1';
				}, 300);
			};

			renderArea.appendChild(iframe);

			if (pdfInterval) clearInterval(pdfInterval);
			
			pdfInterval = setInterval(() => {
				try {
					if (iframe.contentWindow) {
						const hash = iframe.contentWindow.location.hash;
						const match = hash.match(/page=(\d+)/);
						if (match) {
							const currentPage = match[1];
							const currentHash = window.location.hash.substring(1);
							const currentParams = new URLSearchParams(currentHash);
							
							if (currentParams.get('page') !== currentPage) {
								const newParams = new URLSearchParams();
								newParams.set('doc', doc.id);
								newParams.set('page', currentPage);
								history.replaceState(null, '', `#${newParams.toString()}`);
							}
						}
					}
				} catch (e) {}
			}, 1000);
		}

		document.addEventListener('keydown', handleKeyNavigation);
	}
	
	function closePdfViewer() {
		if (!modal) return;
		modal.classList.remove('show');
		document.body.style.overflow = '';
		
		if (renderArea) renderArea.innerHTML = '';
		
		if (pdfInterval) {
			clearInterval(pdfInterval);
			pdfInterval = null;
		}

		currentDoc = null;
		document.removeEventListener('keydown', handleKeyNavigation);
		
		history.pushState("", document.title, window.location.pathname + window.location.search);
	}

	if (closeModalBtn) {
		closeModalBtn.addEventListener('click', closePdfViewer);
	}

	function handleKeyNavigation(e) {
		if (e.key === 'Escape') {
			closePdfViewer();
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
				renderDocuments();
			}
		});
	}

	if (clearSearchBtn && searchInput) {
		clearSearchBtn.addEventListener('click', () => {
			searchInput.value = '';
			searchInput.focus();
			renderDocuments();
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
	
	initializeFromURL();
	populateFilters();
	renderDocuments();
}

if (document.readyState === 'loading') {
	window.addEventListener('load', initLibrary);
} else {
	initLibrary();
}