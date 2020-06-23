/**
 * Graticule Interactive Showroom Controller
 * Orchestrates projection gallery switching, layer toggling, HUD coordinate tracking,
 * and vector visualization rendering without client-side geospatial dependencies.
 */

(function () {
  'use strict';

  let currentProjection = null;
  let projectionsManifest = [];
  const activeLayers = {
    wireframe: true,
    landmasses: true,
    flightRoutes: true,
  };

  const elements = {
    heroCanvas: document.getElementById('hero-canvas'),
    projTitle: document.getElementById('active-proj-title'),
    projFamily: document.getElementById('active-proj-family'),
    aspectTag: document.getElementById('active-aspect-tag'),
    reticleHud: document.getElementById('reticle-hud'),
    galleryGrid: document.getElementById('gallery-grid'),
    telemetryLog: document.getElementById('telemetry-log'),
    btnWireframe: document.getElementById('btn-toggle-wireframe'),
    btnLand: document.getElementById('btn-toggle-land'),
    btnRoutes: document.getElementById('btn-toggle-routes'),
  };

  function appendLog(message) {
    if (!elements.telemetryLog) return;
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0');
    const entry = document.createElement('div');
    entry.className = 'log-entry';
    entry.innerHTML = `<span class="log-time">[${timeStr}]</span> <span class="log-msg">${message}</span>`;
    elements.telemetryLog.appendChild(entry);
    elements.telemetryLog.scrollTop = elements.telemetryLog.scrollHeight;
  }

  async function loadManifest() {
    try {
      const res = await fetch('assets/projections/index.json');
      projectionsManifest = await res.json();
      renderGallery();
      if (projectionsManifest.length > 0) {
        selectProjection(projectionsManifest[0].id);
      }
      appendLog(`Loaded manifest with ${projectionsManifest.length} pure-Sass projections`);
    } catch (err) {
      appendLog(`Failed to load manifest: ${err.message}`);
    }
  }

  function renderGallery() {
    if (!elements.galleryGrid) return;
    elements.galleryGrid.innerHTML = '';

    projectionsManifest.forEach((p) => {
      const card = document.createElement('div');
      card.className = `proj-card ${currentProjection === p.id ? 'active' : ''}`;
      card.dataset.id = p.id;

      card.innerHTML = `
        <div class="card-preview">
          <img src="${p.file}" alt="${p.name}" loading="lazy" />
        </div>
        <div class="card-info">
          <span class="card-name">${p.name}</span>
          <span class="card-family">${p.family}</span>
        </div>
      `;

      card.addEventListener('click', () => {
        selectProjection(p.id);
      });

      elements.galleryGrid.appendChild(card);
    });
  }

  async function selectProjection(projId) {
    const proj = projectionsManifest.find((p) => p.id === projId);
    if (!proj) return;

    currentProjection = projId;

    // Update active card class
    document.querySelectorAll('.proj-card').forEach((card) => {
      if (card.dataset.id === projId) {
        card.classList.add('active');
      } else {
        card.classList.remove('active');
      }
    });

    // Update header labels
    if (elements.projTitle) elements.projTitle.textContent = proj.name;
    if (elements.projFamily) elements.projFamily.textContent = proj.family;
    if (elements.aspectTag) elements.aspectTag.textContent = `Aspect: ${proj.aspect}:1`;

    // Fetch and inject SVG
    try {
      const res = await fetch(proj.file);
      const svgText = await res.text();
      elements.heroCanvas.innerHTML = svgText;

      applyLayerVisibility();
      bindCoordinateTracking();
      appendLog(`Active projection: ${proj.name} (${proj.family})`);
    } catch (err) {
      appendLog(`Error loading SVG for ${proj.id}: ${err.message}`);
    }
  }

  function applyLayerVisibility() {
    const svg = elements.heroCanvas.querySelector('svg');
    if (!svg) return;

    const wireframe = svg.querySelector('#graticule-wireframe');
    const land = svg.querySelector('#landmasses');
    const routes = svg.querySelector('#flight-routes');

    if (wireframe) wireframe.style.display = activeLayers.wireframe ? 'inline' : 'none';
    if (land) land.style.display = activeLayers.landmasses ? 'inline' : 'none';
    if (routes) routes.style.display = activeLayers.flightRoutes ? 'inline' : 'none';

    if (elements.btnWireframe) {
      elements.btnWireframe.classList.toggle('active', activeLayers.wireframe);
    }
    if (elements.btnLand) {
      elements.btnLand.classList.toggle('active', activeLayers.landmasses);
    }
    if (elements.btnRoutes) {
      elements.btnRoutes.classList.toggle('active', activeLayers.flightRoutes);
    }
  }

  function bindCoordinateTracking() {
    const svg = elements.heroCanvas.querySelector('svg');
    if (!svg || !elements.reticleHud) return;

    svg.addEventListener('mousemove', (e) => {
      const rect = svg.getBoundingClientRect();
      const relX = (e.clientX - rect.left) / rect.width;
      const relY = (e.clientY - rect.top) / rect.height;

      // Approximate world coordinate mapping from normalized position
      const approxLon = (-180 + relX * 360).toFixed(1);
      const approxLat = (90 - relY * 180).toFixed(1);

      elements.reticleHud.textContent = `LON: ${approxLon}° | LAT: ${approxLat}° | VIEWPORT: ${(relX * 100).toFixed(0)}%, ${(relY * 100).toFixed(0)}%`;
    });

    svg.addEventListener('mouseleave', () => {
      elements.reticleHud.textContent = 'LON: -- | LAT: -- | VIEWPORT: STANDBY';
    });
  }

  function bindEventHandlers() {
    if (elements.btnWireframe) {
      elements.btnWireframe.addEventListener('click', () => {
        activeLayers.wireframe = !activeLayers.wireframe;
        applyLayerVisibility();
        appendLog(`Toggled graticule wireframe: ${activeLayers.wireframe ? 'ON' : 'OFF'}`);
      });
    }

    if (elements.btnLand) {
      elements.btnLand.addEventListener('click', () => {
        activeLayers.landmasses = !activeLayers.landmasses;
        applyLayerVisibility();
        appendLog(`Toggled landmasses: ${activeLayers.landmasses ? 'ON' : 'OFF'}`);
      });
    }

    if (elements.btnRoutes) {
      elements.btnRoutes.addEventListener('click', () => {
        activeLayers.flightRoutes = !activeLayers.flightRoutes;
        applyLayerVisibility();
        appendLog(`Toggled flight routes: ${activeLayers.flightRoutes ? 'ON' : 'OFF'}`);
      });
    }
  }

  // Initialize on DOM load
  document.addEventListener('DOMContentLoaded', () => {
    bindEventHandlers();
    loadManifest();
  });
})();
