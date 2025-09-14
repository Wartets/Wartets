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
