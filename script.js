document.addEventListener('DOMContentLoaded', () => {
	const container = document.getElementById('gallery');
	const customSelect = document.getElementById('customSelect');
	const customOptionsContainer = customSelect.querySelector('.filter-dropdown');
	const customTrigger = customSelect.querySelector('.filter-trigger span');
	const searchInput = document.getElementById('searchInput');
	const modal = document.getElementById('projectModal');
	const closeModalBtn = document.querySelector('.close-modal');
	const backToTopBtn = document.getElementById('backToTop');

	if (typeof projects === 'undefined') {
		container.innerHTML = '<p style="text-align:center; color:red;">Erreur: Le fichier projects.js est introuvable ou mal chargé.</p>';
		return;
	}

	const flatProjects = projects.flat();
	const sortedProjects = flatProjects.sort((a, b) => {
		if (!a.timestamp) return 1;
		if (!b.timestamp) return -1;
		return new Date(b.timestamp) - new Date(a.timestamp);
	});

	const allKeywords = new Set();
	sortedProjects.forEach(p => {
		if (p.keywords && p.show !== false) {
			p.keywords.forEach(k => allKeywords.add(k.toLowerCase()));
		}
	});

	const sortedKeywords = Array.from(allKeywords).sort();

	const fuse = new Fuse(sortedProjects, {
		keys: ['title', 'description', 'keywords', 'longDescrition'],
		threshold: 0.4,
		ignoreLocation: true
	});

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
		customOptionsContainer.appendChild(option);
	});

	customSelect.addEventListener('click', (e) => {
		if (e.target.closest('.filter-trigger')) {
			customSelect.classList.toggle('open');
		}
	});

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
		if (!customSelect.contains(e.target)) {
			customSelect.classList.remove('open');
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

				card.addEventListener('click', (e) => {
					if (e.target.classList.contains('btn') || e.target.closest('.btn')) return;

					const state = Flip.getState(".card");
					
					const isExpanded = card.classList.contains('expanded');
					const previouslyExpanded = document.querySelector('.card.expanded');

					document.querySelectorAll('.card.expanded').forEach(c => {
						c.classList.remove('expanded');
						const btn = c.querySelector('.expand-trigger');
						if (btn) btn.innerHTML = 'Details <i class="fa-solid fa-expand"></i>';
					});

					if (!isExpanded) {
						card.classList.add('expanded');
						const currentBtn = card.querySelector('.expand-trigger');
						if (currentBtn) currentBtn.innerHTML = 'Close <i class="fa-solid fa-compress"></i>';
						updateURL('project', project.title.toLowerCase().replace(/\s+/g, '-'));
					} else {
						const currentBtn = card.querySelector('.expand-trigger');
						if (currentBtn) currentBtn.innerHTML = 'Details <i class="fa-solid fa-expand"></i>';
						updateURL('project', null);
					}

					Flip.from(state, {
						duration: 0.6,
						ease: "power2.inOut",
						absolute: true,
						nested: true,
						prune: true,
						zIndex: (element) => {
							if (element === card) return 20;
							if (element === previouslyExpanded) return 19;
							return 1;
						},
						onComplete: () => {
							if (card.classList.contains('expanded')) {
								const isMobile = window.innerWidth < 768;
								gsap.to(window, {
									duration: 0.6,
									scrollTo: {
										y: card,
										offsetY: isMobile ? 20 : 100
									},
									ease: "power2.inOut"
								});
							}
							ScrollTrigger.refresh();
						}
					});
				});

				let tagsHtml = '';
				if (project.keywords && project.keywords.length > 0) {
					tagsHtml = `<div class="tags">
						${project.keywords.map(tag => `<span class="tag">#${tag}</span>`).join('')}
					</div>`;
				}

				let imageHtml = '';
				if (project.image) {
					imageHtml = `<img src="${project.image}" alt="${project.title}" class="card-img" loading="lazy" onerror="this.style.display='none'">`;
				}

				let linksHtml = '';
				if (project.link) {
					linksHtml += `<a href="${project.link}" target="_blank" rel="noopener noreferrer" class="btn"><i class="fa-solid fa-globe"></i> Demo</a>`;
				}
				if (project.github) {
					linksHtml += `<a href="${project.github}" target="_blank" rel="noopener noreferrer" class="btn"><i class="fa-brands fa-github"></i> Code</a>`;
				}

				let badgeHtml = '';
				if (isNew) {
					badgeHtml = `<span class="badge badge-new">New</span>`;
				}

				const longDescText = project.longDescrition || project.longDescription || project.description;

				card.innerHTML = `
					${imageHtml}
					<div class="card-header">
						<h2 class="card-title">${project.title}${badgeHtml}</h2>
						${project.date ? `<span class="date">${project.date}</span>` : ''}
					</div>
					<div class="expanded-content">
						<p class="description">${project.description}</p>
						<div class="long-description">${longDescText}</div>
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
			} else {
				card.classList.add('hidden');
				card.classList.remove('expanded');
				const btn = card.querySelector('.expand-trigger');
				if (btn) btn.innerHTML = 'Details <i class="fa-solid fa-expand"></i>';
				card.style.display = "none";
			}
		});

		let noResMsg = document.getElementById('no-results-msg');
		if (visibleCount === 0) {
			if (!noResMsg) {
				noResMsg = document.createElement('p');
				noResMsg.id = 'no-results-msg';
				noResMsg.style.textAlign = 'center';
				noResMsg.style.color = '#888';
				noResMsg.style.gridColumn = '1/-1';
				noResMsg.textContent = 'No projects found matching your criteria.';
				container.appendChild(noResMsg);
			}
		} else if (noResMsg) {
			noResMsg.remove();
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
	
	searchInput.addEventListener('input', (e) => {
		searchQuery = e.target.value;
		updateURL('search', searchQuery);
		renderProjects();
	});

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
		modalDate.textContent = project.date || '';
		
		modalDesc.textContent = project.longDescrition || project.longDescription || project.description;

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
		document.body.style.overflow = 'hidden';
	}

	function closeModal() {
		modal.classList.remove('show');
		document.body.style.overflow = '';
	}

	closeModalBtn.addEventListener('click', closeModal);

	window.addEventListener('click', (e) => {
		if (e.target === modal) {
			closeModal();
		}
	});

	window.addEventListener('scroll', () => {
		if (window.scrollY > 500) {
			backToTopBtn.classList.add('visible');
		} else {
			backToTopBtn.classList.remove('visible');
		}

		const footer = document.querySelector('.site-footer');
		if (footer) {
			const footerRect = footer.getBoundingClientRect();
			const windowHeight = window.innerHeight;

			if (footerRect.top < windowHeight) {
				const newBottom = 30 + (windowHeight - footerRect.top);
				backToTopBtn.style.bottom = `${newBottom}px`;
			} else {
				backToTopBtn.style.bottom = '30px';
			}
		}
	});

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