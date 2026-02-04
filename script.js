document.addEventListener('DOMContentLoaded', () => {
	const container = document.getElementById('gallery');
	const customSelect = document.getElementById('customSelect');
	const customOptionsContainer = customSelect.querySelector('.filter-dropdown');
	const customTrigger = customSelect.querySelector('.filter-trigger span');
	const searchInput = document.getElementById('searchInput');
	const modal = document.getElementById('projectModal');
	const closeModalBtn = document.querySelector('.close-modal');
	const backToTopBtn = document.getElementById('backToTop');
	const clearSearchBtn = document.getElementById('clearSearchBtn');
	const sortFilter = document.getElementById('sortFilter');
	const sortOrderBtn = document.getElementById('sortOrderBtn');
	const gridBtn = document.getElementById('grid-view-btn');
	const listBtn = document.getElementById('list-view-btn');
	const listHeader = document.getElementById('list-header');
	const noResultsMessage = document.getElementById('no-results-message');
	const resetFiltersBtn = document.getElementById('reset-filters-btn');
	const siteFooter = document.querySelector('.site-footer');

	let sortDropdown = null;
	let sortTrigger = null;
	
	if (sortFilter) {
		sortDropdown = sortFilter.querySelector('.filter-dropdown');
		const sortTriggerSpan = sortFilter.querySelector('.filter-trigger span');
		if (sortTriggerSpan) sortTrigger = sortTriggerSpan;
	}

	let currentViewMode = localStorage.getItem('projectsViewMode') || 'grid';
	let currentSortField = localStorage.getItem('projectsSortField') || 'date';
	let currentSortOrder = localStorage.getItem('projectsSortOrder') || 'desc';

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
		
	if (typeof projects === 'undefined') {
		container.innerHTML = '<p style="text-align:center; color:red;">Erreur: Le fichier projects.js est introuvable ou mal chargé.</p>';
		return;
	}

	const flatProjects = projects.flat();
	let sortedProjects = [...flatProjects];

	const projectCardsCache = new Map();

	let tooltip = document.createElement('div');
	tooltip.className = 'tooltip';
	document.body.appendChild(tooltip);

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

	function sortProjects() {
		const multiplier = currentSortOrder === 'asc' ? 1 : -1;
		sortedProjects = [...flatProjects].sort((a, b) => {
			let valA, valB;
			switch (currentSortField) {
				case 'title':
					valA = a.title.toLowerCase();
					valB = b.title.toLowerCase();
					return valA.localeCompare(valB) * multiplier;
				case 'category':
					valA = (a.keywords && a.keywords[0]) ? a.keywords[0].toLowerCase() : '';
					valB = (b.keywords && b.keywords[0]) ? b.keywords[0].toLowerCase() : '';
					return valA.localeCompare(valB) * multiplier;
				case 'language':
					valA = (a.languages && a.languages[0]) ? a.languages[0].toLowerCase() : 'zzz';
					valB = (b.languages && b.languages[0]) ? b.languages[0].toLowerCase() : 'zzz';
					return valA.localeCompare(valB) * multiplier;
				case 'date':
				default:
					valA = a.timestamp ? new Date(a.timestamp) : new Date(0);
					valB = b.timestamp ? new Date(b.timestamp) : new Date(0);
					return (valA - valB) * multiplier;
			}
		});
	}

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

	function formatDate(timestamp) {
		if (!timestamp) return '';
		const date = new Date(timestamp);
		const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
		return `${months[date.getMonth()]} ${date.getFullYear()}`;
	}

	sortProjects();

	const allKeywords = new Set();
	sortedProjects.forEach(p => {
		if (p.keywords && p.show !== false) {
			p.keywords.forEach(k => allKeywords.add(k.toLowerCase()));
		}
	});

	const sortedKeywords = Array.from(allKeywords).sort();

	const fuse = new Fuse(sortedProjects, {
		keys: ['title', 'description', 'keywords', 'longDescription', 'longDescrition'],
		threshold: 0.4,
		ignoreLocation: true,
		includeMatches: true
	});

	function highlightText(text, query) {
		if (!query || !text) return text;
		const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
		return text.replace(regex, '<span class="search-highlight">$1</span>');
	}

	function updateURL(key, value) {
		const url = new URL(window.location);
		if (value) {
			url.searchParams.set(key, value);
		} else {
			url.searchParams.delete(key);
		}
		window.history.pushState({}, '', url);
	}

	const urlParams = new URLSearchParams(window.location.search);
	let currentFilter = urlParams.get('filter') || 'all';
	let searchQuery = urlParams.get('search') || '';
	const initialProject = urlParams.get('project');

	if (searchQuery) {
		searchInput.value = searchQuery;
	}

	if (currentFilter !== 'all') {
		const triggerText = currentFilter.charAt(0).toUpperCase() + currentFilter.slice(1);
		customTrigger.textContent = triggerText;
	}

	sortedKeywords.forEach(keyword => {
		const option = document.createElement('div');
		option.className = 'filter-option';
		option.dataset.value = keyword;
		option.textContent = keyword.charAt(0).toUpperCase() + keyword.slice(1);
		option.setAttribute('role', 'option');
		customOptionsContainer.appendChild(option);
	});

	const customFilterTrigger = customSelect.querySelector('.filter-trigger');
	if (customFilterTrigger) {
		customFilterTrigger.setAttribute('role', 'button');
		customFilterTrigger.setAttribute('aria-haspopup', 'listbox');
		customFilterTrigger.setAttribute('aria-expanded', 'false');
		customFilterTrigger.setAttribute('tabindex', '0');

		customFilterTrigger.addEventListener('keydown', (e) => {
			if (e.key === 'Enter' || e.key === ' ') {
				e.preventDefault();
				customSelect.classList.toggle('open');
				const isOpen = customSelect.classList.contains('open');
				customFilterTrigger.setAttribute('aria-expanded', isOpen);
				if (sortFilter) {
					sortFilter.classList.remove('open');
					const sortTriggerEl = sortFilter.querySelector('.filter-trigger');
					sortTriggerEl?.setAttribute('aria-expanded', 'false');
				}
			}
		});
	}

	customSelect.addEventListener('click', (e) => {
		if (e.target.closest('.filter-trigger')) {
			customSelect.classList.toggle('open');
			const isOpen = customSelect.classList.contains('open');
			customFilterTrigger?.setAttribute('aria-expanded', isOpen);
			if (sortFilter) sortFilter.classList.remove('open');
		}
	});

	if (sortFilter) {
		const sortFilterTrigger = sortFilter.querySelector('.filter-trigger');
		if (sortFilterTrigger) {
			sortFilterTrigger.setAttribute('role', 'button');
			sortFilterTrigger.setAttribute('aria-haspopup', 'listbox');
			sortFilterTrigger.setAttribute('aria-expanded', 'false');
			sortFilterTrigger.setAttribute('tabindex', '0');

			sortFilterTrigger.addEventListener('keydown', (e) => {
				if (e.key === 'Enter' || e.key === ' ') {
					e.preventDefault();
					sortFilter.classList.toggle('open');
					const isOpen = sortFilter.classList.contains('open');
					sortFilterTrigger.setAttribute('aria-expanded', isOpen);
					customSelect.classList.remove('open');
					customFilterTrigger?.setAttribute('aria-expanded', 'false');
				}
			});
		}

		sortFilter.addEventListener('click', (e) => {
			if (e.target.closest('.filter-trigger')) {
				sortFilter.classList.toggle('open');
				const isOpen = sortFilter.classList.contains('open');
				sortFilterTrigger?.setAttribute('aria-expanded', isOpen);
				customSelect.classList.remove('open');
				customFilterTrigger?.setAttribute('aria-expanded', 'false');
			}
		});

		sortDropdown.querySelectorAll('.filter-option').forEach(option => {
			option.setAttribute('role', 'option');
			option.addEventListener('click', (e) => {
				e.stopPropagation();
				sortFilter.classList.remove('open');
				sortFilterTrigger?.setAttribute('aria-expanded', 'false');
				sortDropdown.querySelectorAll('.filter-option').forEach(opt => opt.classList.remove('selected'));
				option.classList.add('selected');
				if (sortTrigger) sortTrigger.textContent = option.textContent;
				
				currentSortField = option.dataset.value;
				localStorage.setItem('projectsSortField', currentSortField);
				sortProjects();
				renderProjects();
			});
		});
	}

	if (sortOrderBtn) {
		sortOrderBtn.setAttribute('aria-label', 'Toggle sort order');
		sortOrderBtn.addEventListener('click', () => {
			currentSortOrder = currentSortOrder === 'desc' ? 'asc' : 'desc';
			sortOrderBtn.classList.toggle('ascending', currentSortOrder === 'asc');
			sortOrderBtn.setAttribute('aria-label', `Sort order: ${currentSortOrder === 'asc' ? 'ascending' : 'descending'}`);
			localStorage.setItem('projectsSortOrder', currentSortOrder);
			sortProjects();
			renderProjects();
		});
	}

	if (gridBtn && listBtn) {
		gridBtn.setAttribute('aria-label', 'Grid view');
		listBtn.setAttribute('aria-label', 'List view');
		gridBtn.addEventListener('click', () => {
			if (currentViewMode === 'grid') return;
			currentViewMode = 'grid';
			localStorage.setItem('projectsViewMode', currentViewMode);
			gridBtn.classList.add('active');
			listBtn.classList.remove('active');
			renderProjects();
		});

		listBtn.addEventListener('click', () => {
			if (currentViewMode === 'list') return;
			currentViewMode = 'list';
			localStorage.setItem('projectsViewMode', currentViewMode);
			listBtn.classList.add('active');
			gridBtn.classList.remove('active');
			renderProjects();
		});
	}

	if (clearSearchBtn) {
		clearSearchBtn.addEventListener('click', () => {
			searchInput.value = '';
			searchQuery = '';
			searchInput.focus();
			updateURL('search', null);
			clearSearchBtn.classList.remove('visible');
			renderProjects();
		});
	}

	searchInput.addEventListener('keydown', (e) => {
		if (e.key === 'Escape' && searchInput.value) {
			e.stopPropagation();
			searchInput.value = '';
			searchQuery = '';
			updateURL('search', null);
			if (clearSearchBtn) clearSearchBtn.classList.remove('visible');
			renderProjects();
		}
	});

	if (resetFiltersBtn) {
		resetFiltersBtn.addEventListener('click', () => {
			searchInput.value = '';
			searchQuery = '';
			currentFilter = 'all';
			updateURL('search', null);
			updateURL('filter', null);
			customTrigger.textContent = 'All';
			customOptionsContainer.querySelectorAll('.filter-option').forEach(opt => {
				opt.classList.toggle('selected', opt.dataset.value === 'all');
			});
			if (clearSearchBtn) clearSearchBtn.classList.remove('visible');
			renderProjects();
		});
	}

	if (listHeader) {
		listHeader.querySelectorAll('.header-col').forEach(col => {
			col.addEventListener('click', () => {
				const sortField = col.dataset.sort;
				if (currentSortField === sortField) {
					currentSortOrder = currentSortOrder === 'desc' ? 'asc' : 'desc';
					if (sortOrderBtn) sortOrderBtn.classList.toggle('ascending', currentSortOrder === 'asc');
				} else {
					currentSortField = sortField;
					currentSortOrder = 'desc';
					if (sortOrderBtn) sortOrderBtn.classList.remove('ascending');
				}
				localStorage.setItem('projectsSortField', currentSortField);
				localStorage.setItem('projectsSortOrder', currentSortOrder);
				
				if (sortDropdown && sortTrigger) {
					const matchingOption = sortDropdown.querySelector(`[data-value="${currentSortField}"]`);
					if (matchingOption) {
						sortDropdown.querySelectorAll('.filter-option').forEach(opt => opt.classList.remove('selected'));
						matchingOption.classList.add('selected');
						sortTrigger.textContent = matchingOption.textContent;
					}
				}
				
				sortProjects();
				renderProjects();
			});
		});
	}

	customOptionsContainer.querySelectorAll('.filter-option').forEach(option => {
		option.addEventListener('click', (e) => {
			e.stopPropagation();
			
			customSelect.classList.remove('open');
			customOptionsContainer.querySelectorAll('.filter-option').forEach(opt => opt.classList.remove('selected'));
			option.classList.add('selected');
			customTrigger.textContent = option.textContent;
			
			currentFilter = option.dataset.value;
			updateURL('filter', currentFilter === 'all' ? null : currentFilter);
			renderProjects();
		});
	});

	customOptionsContainer.querySelectorAll('.custom-option').forEach(option => {
		option.addEventListener('click', (e) => {
			e.stopPropagation();
			
			customSelect.classList.remove('open');
			customOptionsContainer.querySelectorAll('.custom-option').forEach(opt => opt.classList.remove('selected'));
			option.classList.add('selected');
			customTrigger.textContent = option.textContent;
			
			currentFilter = option.dataset.value;
			renderProjects();
		});
	});

	window.addEventListener('click', (e) => {
		if (!customSelect.contains(e.target) && (!sortFilter || !sortFilter.contains(e.target))) {
			customSelect.classList.remove('open');
			customFilterTrigger?.setAttribute('aria-expanded', 'false');
			if (sortFilter) {
				sortFilter.classList.remove('open');
				const sortTriggerEl = sortFilter.querySelector('.filter-trigger');
				sortTriggerEl?.setAttribute('aria-expanded', 'false');
			}
		}
	});

	document.addEventListener('keydown', (e) => {
		if (e.key === 'Escape') {
			customSelect.classList.remove('open');
			customFilterTrigger?.setAttribute('aria-expanded', 'false');
			if (sortFilter) {
				sortFilter.classList.remove('open');
				const sortTriggerEl = sortFilter.querySelector('.filter-trigger');
				sortTriggerEl?.setAttribute('aria-expanded', 'false');
			}
			
			const expandedCard = document.querySelector('.card.expanded');
			if (expandedCard) {
				expandedCard.classList.remove('expanded');
				const btn = expandedCard.querySelector('.expand-trigger');
				if (btn) btn.innerHTML = 'Details <i class="fa-solid fa-expand"></i>';
				updateURL('project', null);
			}

			if (modal && modal.classList.contains('show')) {
				closeModal();
			}
		}
	});

	function showTooltip(element, content) {
		tooltip.innerHTML = content;
		tooltip.classList.add('visible');
		
		const rect = element.getBoundingClientRect();
		const tooltipRect = tooltip.getBoundingClientRect();
		
		let left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
		let top = rect.top - tooltipRect.height - 8;
		
		if (left < 8) left = 8;
		if (left + tooltipRect.width > window.innerWidth - 8) {
			left = window.innerWidth - tooltipRect.width - 8;
		}
		
		if (top < 8) {
			top = rect.bottom + 8;
		}
		
		tooltip.style.left = `${left}px`;
		tooltip.style.top = `${top}px`;
	}

	function hideTooltip() {
		tooltip.classList.remove('visible');
	}

	container.addEventListener('mouseover', (e) => {
		const dateElement = e.target.closest('.date');
		const tagsElement = e.target.closest('.tags');
		const langElement = e.target.closest('.lang-indicator');
		
		if (dateElement && dateElement.dataset.timestamp) {
			dateElement.style.cursor = 'help';
			const timestamp = dateElement.dataset.timestamp;
			if (timestamp) {
				const date = new Date(timestamp);
				const formattedDate = date.toLocaleDateString('en-US', { 
					year: 'numeric', 
					month: 'long', 
					day: 'numeric' 
				});
				showTooltip(dateElement, `Created: ${formattedDate}`);
			}
		} else if (tagsElement && tagsElement.dataset.allTags) {
			try {
				const allTags = JSON.parse(tagsElement.dataset.allTags);
				if (allTags.length > 4) {
					tagsElement.style.cursor = 'help';
					const tooltipContent = allTags.map(tag => tag.charAt(0).toUpperCase() + tag.slice(1)).join(', ');
					showTooltip(tagsElement, tooltipContent);
				}
			} catch (err) {}
		} else if (langElement && langElement.dataset.languages) {
			langElement.style.cursor = 'help';
			showTooltip(langElement, langElement.dataset.languages);
		}
	});

	container.addEventListener('mouseout', (e) => {
		const tooltipElement = e.target.closest('.date, .tags, .lang-indicator');
		if (tooltipElement) {
			tooltipElement.style.cursor = '';
			hideTooltip();
		}
	});
	
	function generateStructuredData() {
		const schema = {
			"@context": "https://schema.org",
			"@type": "ItemList",
			"itemListElement": sortedProjects.map((project, index) => ({
				"@type": "ListItem",
				"position": index + 1,
				"item": {
					"@type": "SoftwareApplication",
					"name": project.title,
					"description": project.description,
					"applicationCategory": "EducationalApplication",
					"operatingSystem": "Web",
					"url": project.link || project.github,
					"author": {
						"@type": "Person",
						"name": "Wartets (Colin Bossu Réaubourg)"
					},
					"offers": {
						"@type": "Offer",
						"price": "0",
						"priceCurrency": "USD"
					}
				}
			}))
		};

		const script = document.createElement('script');
		script.type = 'application/ld+json';
		script.textContent = JSON.stringify(schema);
		document.head.appendChild(script);
	}
	
	gsap.registerPlugin(Flip, ScrollTrigger, ScrollToPlugin);
	
	function renderProjects() {
		const loader = container.querySelector('.loader-wrapper');

		if (listHeader) {
			listHeader.classList.remove('list-mode', 'grid-mode');
			if (currentViewMode === 'list') {
				container.classList.add('list-view');
				listHeader.classList.add('list-mode');
			} else {
				container.classList.remove('list-view');
				listHeader.classList.add('grid-mode');
			}

			Array.from(listHeader.children).forEach(col => {
				col.classList.remove('active', 'asc', 'desc');
				if (col.dataset.sort === currentSortField) {
					col.classList.add('active', currentSortOrder);
				}
			});
		}

		if (clearSearchBtn) {
			clearSearchBtn.classList.toggle('visible', searchQuery.length > 0);
		}

		if (container.children.length === 0 || loader) {
			if (loader) {
				loader.remove();
			}

			const now = new Date();
			const msPerDay = 24 * 60 * 60 * 1000;
			const newThreshold = 29 * msPerDay;
			const updatedThreshold = 7 * msPerDay;
			const cacheDuration = 24 * 60 * 60 * 1000;

			sortedProjects.forEach((project) => {
				const projectDate = new Date(project.timestamp);

				if (projectDate > now) return;

				const isNew = (now - projectDate) < newThreshold;
				
				const card = document.createElement('div');
				card.className = 'card';
				card.dataset.title = project.title.toLowerCase();
				card.dataset.desc = project.description.toLowerCase();
				card.dataset.keywords = (project.keywords || []).join(',').toLowerCase();
				card.dataset.show = project.show;

				card.setAttribute('tabindex', '0');
				card.setAttribute('role', 'button');
				card.setAttribute('aria-label', `View details of ${project.title}`);

				card.addEventListener('mousemove', (e) => {
					const rect = card.getBoundingClientRect();
					const x = e.clientX - rect.left;
					const y = e.clientY - rect.top;
					card.style.setProperty('--mouse-x', `${x}px`);
					card.style.setProperty('--mouse-y', `${y}px`);
				});

				card.addEventListener('keydown', (e) => {
					if (e.key === 'Enter' || e.key === ' ') {
						e.preventDefault();
						card.click();
					}
				});

				card.addEventListener('click', (e) => {
					if ((e.target.classList.contains('btn') || e.target.closest('.btn')) && !e.target.classList.contains('expand-trigger') && !e.target.closest('.expand-trigger')) return;

					const state = Flip.getState(".card");
					
					const isExpanded = card.classList.contains('expanded');
					const previouslyExpanded = document.querySelector('.card.expanded');

					if (previouslyExpanded) {
						previouslyExpanded.classList.remove('expanded');
						const btn = previouslyExpanded.querySelector('.expand-trigger');
						if (btn) btn.innerHTML = 'Details <i class="fa-solid fa-expand"></i>';
					}

					if (!isExpanded) {
						card.classList.add('expanded');
						const currentBtn = card.querySelector('.expand-trigger');
						if (currentBtn) currentBtn.innerHTML = 'Close <i class="fa-solid fa-compress"></i>';
						updateURL('project', project.title.toLowerCase().replace(/\s+/g, '-'));
					} else {
						updateURL('project', null);
					}

					Flip.from(state, {
						duration: 0.5,
						ease: "power2.inOut",
						absolute: true,
						scale: true,
						nested: true,
						prune: true,
						zIndex: (element) => {
							return element === card ? 20 : 19;
						},
						onStart: () => {
							card.classList.add('is-flipping');
							if (previouslyExpanded) {
								previouslyExpanded.classList.add('is-flipping');
							}
						},
						onComplete: () => {
							document.querySelectorAll('.is-flipping').forEach(el => el.classList.remove('is-flipping'));
							
							if (card.classList.contains('expanded')) {
								const cardRect = card.getBoundingClientRect();
								const isFullyVisible = cardRect.top >= 0 && cardRect.bottom <= window.innerHeight;

								if (!isFullyVisible) {
									const isMobile = window.innerWidth < 768;
									gsap.to(window, {
										duration: 1,
										scrollTo: {
											y: card,
											offsetY: isMobile ? 20 : 100
										},
										ease: "power2.inOut"
									});
								}
							}
							ScrollTrigger.refresh();
						}
					});
				});

				let imageHtml = '';
				if (project.image) {
					imageHtml = `<img src="${project.image}" alt="${project.title}" class="card-img" loading="lazy" onload="this.classList.add('loaded')" onerror="this.style.display='none'">`;
				}

				let linksHtml = '';
				if (project.link) {
					linksHtml += `<a href="${project.link}" target="_blank" rel="noopener noreferrer" class="btn"><i class="fa-solid fa-external-link"></i> Open</a>`;
				}
				if (project.github) {
					linksHtml += `<a href="${project.github}" target="_blank" rel="noopener noreferrer" class="btn"><i class="fa-brands fa-github"></i> Code</a>`;
				}

				let badgeHtml = '';
				if (isNew) {
					badgeHtml = `<span class="badge badge-new">New</span>`;
				}

				const longDescText = project.longDescription || project.longDescrition || project.description;
				const primaryCategory = (project.keywords && project.keywords[0]) ? 
					project.keywords[0].charAt(0).toUpperCase() + project.keywords[0].slice(1) : '';

				const displayTitle = searchQuery ? highlightText(project.title, searchQuery) : project.title;
				const displayDesc = searchQuery ? highlightText(project.description, searchQuery) : project.description;
				const displayLongDesc = searchQuery ? highlightText(longDescText, searchQuery) : longDescText;

				const formattedDate = formatDate(project.timestamp);

				const projectLangs = project.languages || [];
				let langHtml = '';
				if (projectLangs.length > 0) {
					const fullLangNames = projectLangs.map(l => languageNames[l] || l).join(', ');
					if (projectLangs.length === 1) {
						langHtml = `<span class="lang-indicator" data-languages="${fullLangNames}">${projectLangs[0].toUpperCase()}</span>`;
					} else if (projectLangs.length <= 2) {
						langHtml = `<span class="lang-indicator" data-languages="${fullLangNames}">${projectLangs.map(l => l.toUpperCase()).join('/')}</span>`;
					} else {
						langHtml = `<span class="lang-indicator lang-multi" data-languages="${fullLangNames}">MULTI</span>`;
					}
				}

				const allTags = project.keywords || [];
				const visibleTags = allTags.slice(0, 4);
				const hasMoreTags = allTags.length > 4;

				let tagsHtml = '';
				if (allTags.length > 0) {
					tagsHtml = `<div class="tags" data-all-tags='${JSON.stringify(allTags)}'>
						${visibleTags.map(tag => `<span class="tag">#${tag}</span>`).join('')}
						${hasMoreTags ? `<span class="tag tag-more">+${allTags.length - 4}</span>` : ''}
					</div>`;
				}

				card.innerHTML = `
					${imageHtml}
					<div class="card-header">
						<h2 class="card-title">${displayTitle}${badgeHtml}</h2>
						<span class="list-category">${primaryCategory}</span>
						<span class="list-lang">${langHtml}</span>
						${formattedDate ? `<span class="date" data-timestamp="${project.timestamp || ''}">${formattedDate}</span>` : ''}
					</div>
					<div class="expanded-content">
						<p class="description">${displayDesc}</p>
						<div class="long-description">${displayLongDesc}</div>
						${tagsHtml}
					</div>
					<div class="links">
						${linksHtml}
						<button class="btn expand-trigger" style="margin-left:auto; border:none; background:transparent;">
							Details <i class="fa-solid fa-expand"></i>
						</button>
					</div>
				`;

				if (!isNew && project.github && project.github.includes('github.com')) {
					const repoPath = project.github.split('github.com/')[1];
					if (repoPath) {
						const cacheKey = `gh_cache_${repoPath}`;
						const cachedData = localStorage.getItem(cacheKey);
						let shouldFetch = true;

						if (cachedData) {
							const parsed = JSON.parse(cachedData);
							if (now.getTime() - parsed.timestamp < cacheDuration) {
								shouldFetch = false;
								const lastPush = new Date(parsed.pushed_at);
								if ((now - lastPush) < updatedThreshold) {
									const titleEl = card.querySelector('.card-title');
									const updatedBadge = document.createElement('span');
									updatedBadge.className = 'badge badge-updated';
									updatedBadge.textContent = 'Updated';
									titleEl.appendChild(updatedBadge);
								}
							}
						}

						if (shouldFetch) {
							fetch(`https://api.github.com/repos/${repoPath}`)
								.then(response => {
									if (response.ok) return response.json();
									throw new Error('Network response was not ok');
								})
								.then(data => {
									localStorage.setItem(cacheKey, JSON.stringify({
										timestamp: now.getTime(),
										pushed_at: data.pushed_at
									}));
									
									const lastPush = new Date(data.pushed_at);
									if ((now - lastPush) < updatedThreshold) {
										const titleEl = card.querySelector('.card-title');
										let existing = titleEl.querySelector('.badge-updated');
										if (!existing) {
											const updatedBadge = document.createElement('span');
											updatedBadge.className = 'badge badge-updated';
											updatedBadge.textContent = 'Updated';
											titleEl.appendChild(updatedBadge);
										}
									}
								})
								.catch(() => {});
						}
					}
				}

				container.appendChild(card);
			});

			if (initialProject) {
				const targetCard = Array.from(container.children).find(c => {
					const t = c.dataset.title.toLowerCase().replace(/\s+/g, '-');
					return t === initialProject.toLowerCase();
				});
				if (targetCard) {
					setTimeout(() => targetCard.click(), 500);
				}
			}
		}

		const state = Flip.getState(".card");

		const cards = Array.from(container.children);
		let visibleCount = 0;

		let fuseResults = null;
		if (searchQuery) {
			fuseResults = new Set(fuse.search(searchQuery).map(res => res.item.title.toLowerCase()));
		}

		cards.forEach(card => {
			if (card.tagName === 'P') return; 

			if (card.dataset.show === "false") {
				card.classList.add('hidden');
				card.style.display = "none";
				return;
			}

			const matchesFilter = currentFilter === 'all' || 
				(card.dataset.keywords && card.dataset.keywords.includes(currentFilter));

			let matchesSearch = true;
			if (searchQuery && fuseResults) {
				matchesSearch = fuseResults.has(card.dataset.title);
			}

			if (matchesFilter && matchesSearch) {
				card.classList.remove('hidden');
				card.style.display = "";
				visibleCount++;

				const lastQuery = card.dataset.lastQuery || '';
				if (lastQuery !== searchQuery) {
					card.dataset.lastQuery = searchQuery;
					const project = sortedProjects.find(p => p.title.toLowerCase() === card.dataset.title);
					if (project) {
						const titleEl = card.querySelector('.card-title');
						const descEl = card.querySelector('.description');
						const longDescEl = card.querySelector('.long-description');
						const longDescText = project.longDescription || project.longDescrition || project.description;
						
						if (titleEl) {
							const badges = titleEl.querySelectorAll('.badge');
							titleEl.innerHTML = searchQuery ? highlightText(project.title, searchQuery) : project.title;
							badges.forEach(b => titleEl.appendChild(b));
						}
						if (descEl) descEl.innerHTML = searchQuery ? highlightText(project.description, searchQuery) : project.description;
						if (longDescEl) longDescEl.innerHTML = searchQuery ? highlightText(longDescText, searchQuery) : longDescText;
					}
				}
			} else {
				card.classList.add('hidden');
				card.classList.remove('expanded');
				const btn = card.querySelector('.expand-trigger');
				if (btn) btn.innerHTML = 'Details <i class="fa-solid fa-expand"></i>';
				card.style.display = "none";
			}
		});

		if (noResultsMessage) {
			if (visibleCount === 0) {
				noResultsMessage.classList.remove('hidden');
			} else {
				noResultsMessage.classList.add('hidden');
			}
		}

		Flip.from(state, {
			duration: 0.5,
			ease: "power2.out",
			scale: true,
			absolute: true,
			onEnter: elements => gsap.fromTo(elements, {opacity: 0, scale: 0.8}, {opacity: 1, scale: 1, duration: 0.4}),
			onLeave: elements => gsap.to(elements, {opacity: 0, scale: 0.8, duration: 0.3})
		});
	}
	
	searchInput.addEventListener('input', debounce((e) => {
		searchQuery = e.target.value;
		if (clearSearchBtn) {
			clearSearchBtn.classList.toggle('visible', searchQuery.length > 0);
		}
		updateURL('search', searchQuery || null);
		renderProjects();
	}, 200));

	function openModal(project) {
		const modalImg = document.getElementById('modalImage');
		const modalTitle = document.getElementById('modalTitle');
		const modalDate = document.getElementById('modalDate');
		const modalDesc = document.getElementById('modalDescription');
		const modalTags = document.getElementById('modalTags');
		const modalLinks = document.getElementById('modalLinks');

		modalImg.src = project.image || '';
		modalImg.style.display = project.image ? 'block' : 'none';
		
		modalTitle.textContent = project.title;
		modalDate.textContent = formatDate(project.timestamp);
		
		modalDesc.textContent = project.longDescription || project.longDescrition || project.description;

		if (project.keywords) {
			modalTags.innerHTML = project.keywords.map(tag => `<span class="tag">#${tag}</span>`).join('');
		} else {
			modalTags.innerHTML = '';
		}

		let linksHtml = '';
		if (project.link) {
			linksHtml += `<a href="${project.link}" target="_blank" rel="noopener noreferrer" class="btn"><i class="fa-solid fa-globe"></i> Visit Website</a>`;
		}
		if (project.github) {
			linksHtml += `<a href="${project.github}" target="_blank" rel="noopener noreferrer" class="btn"><i class="fa-brands fa-github"></i> View on GitHub</a>`;
		}
		modalLinks.innerHTML = linksHtml;

		modal.classList.add('show');
		modal.setAttribute('aria-hidden', 'false');
		document.body.style.overflow = 'hidden';
	}

	function closeModal() {
		modal.classList.remove('show');
		modal.setAttribute('aria-hidden', 'true');
		document.body.style.overflow = '';
	}

	closeModalBtn.addEventListener('click', closeModal);

	window.addEventListener('click', (e) => {
		if (e.target === modal) {
			closeModal();
		}
	});

	window.addEventListener('scroll', throttle(() => {
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
	}, 100));

	if (backToTopBtn) {
		backToTopBtn.setAttribute('aria-label', 'Scroll to top');
	}

	backToTopBtn.addEventListener('click', () => {
		gsap.to(window, {
			duration: 1.2,
			scrollTo: { y: 0 },
			ease: "power3.inOut"
		});
	});

	window.addEventListener('popstate', () => {
		const params = new URLSearchParams(window.location.search);
		currentFilter = params.get('filter') || 'all';
		searchQuery = params.get('search') || '';
		
		searchInput.value = searchQuery;
		
		const triggerText = currentFilter === 'all' ? 'All' : currentFilter.charAt(0).toUpperCase() + currentFilter.slice(1);
		customTrigger.textContent = triggerText;
		
		customOptionsContainer.querySelectorAll('.filter-option').forEach(opt => {
			if (opt.dataset.value === currentFilter) opt.classList.add('selected');
			else opt.classList.remove('selected');
		});

		renderProjects();
		
		const projParam = params.get('project');
		const cards = Array.from(container.children);
		
		document.querySelectorAll('.card.expanded').forEach(c => {
			c.classList.remove('expanded');
			const btn = c.querySelector('.expand-trigger');
			if (btn) btn.innerHTML = 'Details <i class="fa-solid fa-expand"></i>';
		});
		
		if (projParam) {
			const target = cards.find(c => c.dataset.title && c.dataset.title.replace(/\s+/g, '-') === projParam);
			if (target) {
				target.classList.add('expanded');
				const btn = target.querySelector('.expand-trigger');
				if (btn) btn.innerHTML = 'Close <i class="fa-solid fa-compress"></i>';
				setTimeout(() => {
					gsap.to(window, {duration: 0.5, scrollTo: {y: target, offsetY: 100}});
				}, 100);
			}
		}
	});

	setTimeout(() => {
		renderProjects();
	}, 0);
});