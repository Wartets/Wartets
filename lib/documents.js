window.libraryData = {
	categories: [
		{ id: 1, name: "Physics" },
		{ id: 2, name: "Mathematics" },
		{ id: 3, name: "Computer Science" },
		{ id: 4, name: "Personal Notes" },
		{ id: 5, name: "Chemistry" },
		{ id: 6, name: "Biology" },
		{ id: 7, name: "Engineering" },
		{ id: 8, name: "Philosophy" },
		{ id: 9, name: "History" },
		{ id: 10, name: "Economics" },
		{ id: 11, name: "Literature" },
		{ id: 12, name: "Art" },
		{ id: 13, name: "Astronomy" },
		{ id: 14, name: "Medicine" },
		{ id: 15, name: "Law" },
		{ id: 16, name: "Psychology" },
		{ id: 17, name: "Sociology" },
		{ id: 18, name: "Geography" },
		{ id: 19, name: "Political Science" },
		{ id: 20, name: "Linguistics" }
	],
	types: [
		{ id: "course", name: "Course" },
		{ id: "exercise", name: "Exercise" },
		{ id: "report", name: "Report" },
		{ id: "paper", name: "Paper" },
		{ id: "reference", name: "Reference" },
		{ id: "theory", name: "Theory" }
	],
	languages: [
		{ id: "fr", name: "Français" },
		{ id: "en", name: "English" }
	],
	authors: [
		{ id: "cbr", forname: "Colin", surname: "Bossu Réaubourg" },
		{ id: "atp", forname: "Ayrton", surname: "Tavares de Pinho" }
	],
	documents: [
		{
			id: "doc-001",
			title: "Introduction à la Physique Quantique",
			description: "Notes de cours magistral de troisième année de licence.",
			filePath: "https://wartets.github.io/Wartets/lib/assets/Cours_Quantique_1.pdf",
			categoryIds: [1],
			typeId: "course",
			authorIds: ["cbr"],
			tags: ["physics", "quantum", "university", "lecture", "lesson"],
			langId: "fr",
			timestamp: "2025-12-13T00:00:00Z"
		},
		{
			id: "doc-002",
			title: "Mathématiques 5 - Cours",
			description: "Écriture tensorielle, Analyse complexe, Séries de Fourier et Équations différentielles.",
			filePath: "https://wartets.github.io/Wartets/lib/assets/Cours_Mathématiques_5.pdf",
			categoryIds: [2],
			typeId: "course",
			authorIds: ["cbr"],
			tags: ["mathematics", "university", "lecture", "lesson"],
			langId: "fr",
			timestamp: "2025-12-08T00:00:00Z"
		},
		{
			id: "doc-003",
			title: "Rapport de physique expérimentale - Etude du lasso",
			description: "Étude expérimentale de la bifurcation supercritique d’un anneau en rotation : effets de géométrie finie et imperfections.",
			filePath: "https://wartets.github.io/Wartets/lib/assets/Rapport_Final_Physique_Expérimentale.pdf",
			categoryIds: [1],
			typeId: "report",
			authorIds: ["cbr", "atp"],
			tags: ["physics", "experimental", "university", "lecture"],
			langId: "fr",
			timestamp: "2025-12-07T00:00:00Z"
		},
		{
			id: "doc-004",
			title: "Résolution de l'équation de Schrödinger pour un potentiel périodique fini",
			description: "",
			filePath: "https://wartets.github.io/Wartets/lib/assets/Résolution_eqShrod_period_fini.pdf",
			categoryIds: [1],
			typeId: "exercise",
			authorIds: ["cbr"],
			tags: ["physics", "quantum", "exercise"],
			langId: "fr",
			timestamp: "2025-10-16T00:00:00Z"
		},
		{
			id: "doc-005",
			title: "Probabilités et Lancer de Dés",
			description: "Calcul des probabilités associées aux sommes obtenues lors de lancers de dés.",
			filePath: "https://wartets.github.io/Wartets/lib/assets/Lancé_de_dés.pdf",
			categoryIds: [2],
			typeId: "exercise",
			authorIds: ["cbr"],
			tags: ["mathematics", "exercise", "probabilities"],
			langId: "fr",
			timestamp: "2025-11-07T00:00:00Z"
		},
		{
			id: "doc-006",
			title: "Informatique Quantique avec Qiskit",
			description: "Traité sur l'information quantique avec Qiskit",
			filePath: "https://wartets.github.io/Wartets/lib/assets/Informatique_Quantique_avec_Qiskit.pdf",
			categoryIds: [1, 3],
			typeId: "course",
			authorIds: ["cbr"],
			tags: ["physics", "quantum", "lesson", "computer"],
			langId: "fr",
			timestamp: "2025-09-29T00:00:00Z"
		},
		{
			id: "doc-007",
			title: "Optique et électromagnétisme - Cours",
			description: "Optique ondulatoire et électromagnétisme dans les milieu.",
			filePath: "https://wartets.github.io/Wartets/lib/assets/Cours_OOEM.pdf",
			categoryIds: [1],
			typeId: "course",
			authorIds: ["cbr"],
			tags: ["physics", "optics", "university", "lecture", "lesson"],
			langId: "fr",
			timestamp: "2025-09-25T00:00:00Z"
		},
		{
			id: "doc-008",
			title: "Quelques formules mathématiques pour la physique",
			description: "Formules mathématiques couramment utilisées en physique, présentées de manière concise comme référence analytique.",
			filePath: "https://wartets.github.io/Wartets/lib/assets/Quelques_formules_mathématiques_pour_la_physique.pdf",
			categoryIds: [1, 2],
			typeId: "reference",
			authorIds: ["cbr"],
			tags: ["physics", "mathematics"],
			langId: "fr",
			timestamp: "2025-08-10T00:00:00Z"
		},
		{
			id: "doc-009",
			title: "Théorie Algébrique des Unités, Constantes et Normalisation Physique",
			description: "Formalisme mathématique, métrologie et implémentation numérique de la théroie des unitées",
			filePath: "https://wartets.github.io/Wartets/lib/assets/theorie_algebrique_unites.pdf",
			categoryIds: [1, 2, 3],
			typeId: "theory",
			authorIds: ["cbr"],
			tags: ["physics", "mathematics", "computer science"],
			langId: "fr",
			timestamp: "2025-12-09T00:00:00Z"
		},
		{
			id: "doc-010",
			title: "Arithmetic and Number Theory",
			description: "Selected Problems on Perfect Squares and Divisibility",
			filePath: "https://wartets.github.io/Wartets/lib/assets/Arithmetic_and_Number_Theory.pdf",
			categoryIds: [2],
			typeId: "exercise",
			authorIds: ["cbr"],
			tags: ["mathematics", "arithmetic", "number theory"],
			langId: "en",
			timestamp: "2025-12-12T23:42:50Z"
		},
		{
			id: "doc-011",
			title: "Résolution de Problèmes NP-Complets par Méthodes de Monte Carlo",
			description: "Application de l’algorithme de Metropolis-Hastings au Sudoku",
			filePath: "https://wartets.github.io/Wartets/lib/assets/sudoku_monte_carlo_np_complet.pdf",
			categoryIds: [2, 3],
			typeId: "paper",
			authorIds: ["cbr"],
			tags: ["mathematics", "computer science", "number theory"],
			langId: "fr",
			timestamp: "2026-01-06T23:27:23Z"
		},
		{
			id: "doc-012",
			title: "Quelques Curiosités de la Gravitation Cylindrique",
			description: "Exploration théorique des structures de l'espace-temps, des effets de bord Newtoniens aux singularités relativistes.",
			filePath: "https://wartets.github.io/Wartets/lib/assets/Gravitation_Cylindrique.pdf",
			categoryIds: [1],
			typeId: "theory",
			authorIds: ["cbr"],
			tags: ["physics", "relativity", "gravitation", "mathematics"],
			langId: "fr",
			timestamp: "2025-01-10T00:00:00Z"
		},
		{
			id: "doc-013",
			title: "Factorielles",
			description: "Panorama des hiérarchies de croissance et des structures arithmétiques : des extensions analytiques aux factorielles exotiques",
			filePath: "https://wartets.github.io/Wartets/lib/assets/Factorielles.pdf",
			categoryIds: [2],
			typeId: "theory",
			authorIds: ["cbr"],
			tags: ["mathematics", "analysis", "combinatorics", "number theory"],
			langId: "fr",
			timestamp: "2026-01-23T21:42:00Z"
		}
	]
};