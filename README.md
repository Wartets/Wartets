<div align="center">

# Colin Bossu Réaubourg (Wartets)

**Scientific Software Developer | Computational Physicist**

[![Portfolio](https://img.shields.io/badge/Portfolio-wartets.github.io-00599C?style=flat-square&logo=firefox&logoColor=white)](https://wartets.github.io/)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0077B5?style=flat-square&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/colin-bossu)
[![GitHub](https://img.shields.io/badge/GitHub-Follow-181717?style=flat-square&logo=github&logoColor=white)](https://github.com/Wartets)

</div>

<br>

<p align="justify">
  I am a final-year Physics student (B.Sc.) at Université Paris Cité with a strong specialization in computational physics, high-performance computing, and interactive simulations. 
  
  My work bridges the gap between theoretical mathematical models and real-time visualization engines. I specialize in developing high-throughput simulations using C++20, OpenGL Compute Shaders, and WebAssembly. My academic focus includes Quantum Mechanics, Fluid Dynamics, and Complex Systems.
</p>

<br>

## Technical Proficiency

<div align="center">

| Core Engineering | HPC & Graphics | Web & Visualization | Scientific Stack |
| :---: | :---: | :---: | :---: |
| ![C++](https://img.shields.io/badge/C++20-00599C?style=flat-square&logo=c%2B%2B&logoColor=white) <br> ![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white) <br> ![Linux](https://img.shields.io/badge/Linux-FCC624?style=flat-square&logo=linux&logoColor=black) <br> ![CMake](https://img.shields.io/badge/CMake-064F8C?style=flat-square&logo=cmake&logoColor=white) | ![OpenGL](https://img.shields.io/badge/OpenGL_4.6-5586A4?style=flat-square&logo=opengl&logoColor=white) <br> ![GLSL](https://img.shields.io/badge/GLSL-5586A4?style=flat-square&logo=opengl&logoColor=white) <br> ![WebAssembly](https://img.shields.io/badge/WebAssembly-654FF0?style=flat-square&logo=webassembly&logoColor=white) <br> ![OpenMP](https://img.shields.io/badge/OpenMP-blueviolet?style=flat-square) | ![WebGL2](https://img.shields.io/badge/WebGL2-990000?style=flat-square&logo=webgl&logoColor=white) <br> ![Three.js](https://img.shields.io/badge/Three.js-000000?style=flat-square&logo=three.js&logoColor=white) <br> ![JavaScript](https://img.shields.io/badge/ES6+-F7DF1E?style=flat-square&logo=javascript&logoColor=black) <br> ![Flask](https://img.shields.io/badge/Flask-000000?style=flat-square&logo=flask&logoColor=white) | ![NumPy](https://img.shields.io/badge/NumPy-013243?style=flat-square&logo=numpy&logoColor=white) <br> ![SciPy](https://img.shields.io/badge/SciPy-8CAAE6?style=flat-square&logo=scipy&logoColor=white) <br> ![LaTeX](https://img.shields.io/badge/LaTeX-008080?style=flat-square&logo=latex&logoColor=white) <br> ![Gnuplot](https://img.shields.io/badge/Gnuplot-E41A1C?style=flat-square) |

</div>

<br>

## Selected Engineering Projects

<table border="0" width="100%">
  <tr>
    <td width="45%" align="center">
      <a href="https://wartets.github.io/Lenia/docs/">
        <img src="img/Lenia-card.png" alt="Lenia GPU Simulator" width="100%">
      </a>
    </td>
    <td width="55%" valign="top">
      <h3>1. Lenia GPU Simulator</h3>
      <p>
        <img src="https://img.shields.io/badge/C++20-00599C?style=flat-square&logo=c%2B%2B&logoColor=white" />
        <img src="https://img.shields.io/badge/OpenGL_4.6-5586A4?style=flat-square&logo=opengl&logoColor=white" />
        <img src="https://img.shields.io/badge/Compute_Shaders-black?style=flat-square" />
      </p>
      <p align="justify">
        A state-of-the-art implementation of Lenia, a continuous cellular automaton. This engine is built for extreme performance, utilizing a <b>"Zero-Copy" architecture</b> where the simulation state resides permanently in VRAM, achieving throughputs exceeding <b>10 Gcells/s</b> via Compute Shaders.
      </p>
      <ul>
        <li><b>Features:</b> Massive library of 548 pre-loaded species, multichannel RGB dynamics, and 11 distinct growth functions.</li>
        <li><b>Metrics:</b> Includes real-time centroid tracking and stability monitoring.</li>
      </ul>
      <a href="https://wartets.github.io/Lenia/docs/"><b>View Documentation &rarr;</b></a>
    </td>
  </tr>
</table>

<table border="0" width="100%">
  <tr>
    <td width="55%" valign="top">
      <h3>2. Turbulence Simulation (CFD)</h3>
      <p>
        <img src="https://img.shields.io/badge/C++-00599C?style=flat-square&logo=c%2B%2B&logoColor=white" />
        <img src="https://img.shields.io/badge/WebAssembly-654FF0?style=flat-square&logo=webassembly&logoColor=white" />
        <img src="https://img.shields.io/badge/LBM_Method-orange?style=flat-square" />
      </p>
      <p align="justify">
        A high-performance 2D fluid dynamics engine compiled to WebAssembly for browser-based execution. Utilizing the <b>Lattice Boltzmann Method (LBM)</b>, it supports <b>Large Eddy Simulation (LES)</b> via the Smagorinsky model to handle turbulence efficiently.
      </p>
      <ul>
        <li><b>Physics:</b> Non-Newtonian fluid rheology, vorticity confinement, and buoyancy.</li>
        <li><b>Rendering:</b> Custom WebGL2 engine handling scalar field visualization in real-time.</li>
      </ul>
      <a href="https://github.com/wartets/Turbulence-sim"><b>View Repository &rarr;</b></a>
    </td>
    <td width="45%" align="center">
      <a href="https://github.com/wartets/Turbulence-sim">
        <img src="img/Turbulence-sim-card.png" alt="Turbulence Simulation" width="100%">
      </a>
    </td>
  </tr>
</table>

<table border="0" width="100%">
  <tr>
    <td width="45%" align="center">
      <a href="https://wartets.github.io/TikZ-Generator/">
        <img src="img/TikZ-Generator-card.png" alt="TikZ Generator" width="100%">
      </a>
    </td>
    <td width="55%" valign="top">
      <h3>3. TikZ Generator</h3>
      <p>
        <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black" />
        <img src="https://img.shields.io/badge/LaTeX-008080?style=flat-square&logo=latex&logoColor=white" />
        <img src="https://img.shields.io/badge/Vector_Graphics-green?style=flat-square" />
      </p>
      <p align="justify">
        A comprehensive visual editor designed to bridge the gap between visual drafting and LaTeX coding. The application provides an intuitive canvas for geometric shapes, electric circuits (Circuitikz), and logic gates, generating clean, semantic <b>TikZ code</b> in real-time.
      </p>
      <ul>
        <li><b>Capabilities:</b> Freehand drawing with algorithmic smoothing and local state persistence.</li>
        <li><b>Utility:</b> Eliminates the overhead of writing complex vector graphics code from scratch.</li>
      </ul>
      <a href="https://wartets.github.io/TikZ-Generator/"><b>Launch Application &rarr;</b></a>
    </td>
  </tr>
</table>

<table border="0" width="100%">
  <tr>
    <td width="55%" valign="top">
      <h3>4. N-Body Simulation</h3>
      <p>
        <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black" />
        <img src="https://img.shields.io/badge/Barnes--Hut-purple?style=flat-square" />
        <img src="https://img.shields.io/badge/Physics-blue?style=flat-square" />
      </p>
      <p align="justify">
        An advanced physics sandbox for simulating N-body systems. The engine implements the <b>Barnes-Hut algorithm</b> to reduce the computational complexity of long-range force calculations to $O(n \log n)$, enabling large-scale simulations.
      </p>
      <ul>
        <li><b>Dynamics:</b> Features elastic bonds, solid barriers, thermodynamic properties, and environmental viscosity.</li>
        <li><b>Control:</b> Full real-time control over simulation parameters and integrator precision.</li>
      </ul>
      <a href="https://wartets.github.io/N-Body-Simulation/"><b>Launch Application &rarr;</b></a>
    </td>
    <td width="45%" align="center">
      <a href="https://wartets.github.io/N-Body-Simulation/">
        <img src="img/N-Body-Simulation-card.png" alt="N-Body Simulation" width="100%">
      </a>
    </td>
  </tr>
</table>

<table border="0" width="100%">
  <tr>
    <td width="45%" align="center">
      <a href="https://wartets.github.io/FDTD-Wave-Simulator/">
        <img src="img/FDTD-Wave-Simulator-card.png" alt="FDTD Wave Simulator" width="100%">
      </a>
    </td>
    <td width="55%" valign="top">
      <h3>5. FDTD Wave Simulator</h3>
      <p>
        <img src="https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white" />
        <img src="https://img.shields.io/badge/Flask-000000?style=flat-square&logo=flask&logoColor=white" />
        <img src="https://img.shields.io/badge/SocketIO-010101?style=flat-square&logo=socket.io&logoColor=white" />
      </p>
      <p align="justify">
        A numerical simulator modeling 2D scalar wave propagation using the <b>Finite-Difference Time-Domain (FDTD)</b> method. The project employs a client-server architecture where a Python backend performs matrix calculations while a responsive frontend handles visualization.
      </p>
      <ul>
        <li><b>Simulation:</b> Models interference, reflection, and diffraction.</li>
        <li><b>Boundaries:</b> Configurable conditions (Dirichlet, Neumann, Mur absorbing layers).</li>
      </ul>
      <a href="https://wartets.github.io/FDTD-Wave-Simulator/"><b>Launch Application &rarr;</b></a>
    </td>
  </tr>
</table>

<br>

## Academic Research & Publications

I maintain a digital archive of my academic notes, reports, and original research.

> **[Digital Document Library](https://wartets.github.io/Wartets/lib/library.html)**  
> An interactive archive featuring a custom lazy-loading PDF viewer and fuzzy search.

<br>

| Year | Title & Description | PDF |
| :--- | :--- | :---: |
| **2026** | **Real-Time Interactive Fluid Dynamics on the Web**<br>Technical study on implementing the Lattice Boltzmann Method using WebAssembly and WebGL2. Detailed analysis of high-performance CFD engine implementation, LES turbulence, and non-Newtonian rheology. | [<img src="https://img.shields.io/badge/Read-PDF-red?style=flat-square&logo=adobe-acrobat-reader&logoColor=white">](https://wartets.github.io/Wartets/lib/assets/Turbulence-sim.pdf) |
| **2026** | **Resolution of NP-Complete Problems via Monte Carlo**<br>Application of the Metropolis-Hastings algorithm to Sudoku grid solving. Analysis of convergence rates and energy landscapes in combinatorial optimization problems. | [<img src="https://img.shields.io/badge/Read-PDF-red?style=flat-square&logo=adobe-acrobat-reader&logoColor=white">](https://wartets.github.io/Wartets/lib/assets/sudoku_monte_carlo_np_complet.pdf) |
| **2025** | **Experimental Study of the Lasso**<br>Experimental analysis of the supercritical bifurcation of a rotating ring. Study of finite geometry effects and mechanical imperfections (Laboratory Report). | [<img src="https://img.shields.io/badge/Read-PDF-red?style=flat-square&logo=adobe-acrobat-reader&logoColor=white">](https://wartets.github.io/Wartets/lib/assets/Rapport_Final_Physique_Expérimentale.pdf) |