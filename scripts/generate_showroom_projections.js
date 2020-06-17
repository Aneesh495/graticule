#!/usr/bin/env node

/**
 * Graticule Showroom SVG Projection Asset Generator
 * Compiles real-world geospatial datasets and graticules through Sass
 * across all supported projections, saving static SVG maps to showroom/assets/projections/.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SASS_BIN = path.join(__dirname, '..', 'node_modules', '.bin', 'sass');
const ROOT_DIR = path.join(__dirname, '..');
const OUT_DIR = path.join(ROOT_DIR, 'showroom', 'assets', 'projections');

fs.mkdirSync(OUT_DIR, { recursive: true });

const PROJECTIONS = [
  { id: 'equirectangular', name: 'Plate Carree', family: 'Cylindrical', aspect: 2.0, scale: 70 },
  { id: 'mercator', name: 'Conformal Mercator', family: 'Cylindrical', aspect: 1.0, scale: 50 },
  { id: 'web-mercator', name: 'Web Mercator (EPSG:3857)', family: 'Cylindrical', aspect: 1.0, scale: 50 },
  { id: 'gall-peters', name: 'Gall-Peters Equal-Area', family: 'Cylindrical', aspect: 1.57, scale: 65 },
  { id: 'lambert-cylindrical', name: 'Lambert Cylindrical Equal-Area', family: 'Cylindrical', aspect: 3.14, scale: 70 },
  { id: 'miller', name: 'Miller Cylindrical', family: 'Cylindrical', aspect: 1.36, scale: 55 },
  { id: 'transverse-mercator', name: 'Transverse Mercator', family: 'Cylindrical', aspect: 1.0, scale: 45 },
  { id: 'lambert-conformal-conic', name: 'Lambert Conformal Conic', family: 'Conic', aspect: 1.4, scale: 55 },
  { id: 'albers', name: 'Albers Equal-Area Conic', family: 'Conic', aspect: 1.4, scale: 55 },
  { id: 'equidistant-conic', name: 'Equidistant Conic', family: 'Conic', aspect: 1.4, scale: 55 },
  { id: 'orthographic', name: 'Orthographic (3D Globe)', family: 'Azimuthal', aspect: 1.0, scale: 180 },
  { id: 'stereographic', name: 'Stereographic Azimuthal', family: 'Azimuthal', aspect: 1.0, scale: 90 },
  { id: 'azimuthal-equidistant', name: 'Azimuthal Equidistant', family: 'Azimuthal', aspect: 1.0, scale: 60 },
  { id: 'gnomonic', name: 'Gnomonic Geodesic', family: 'Azimuthal', aspect: 1.0, scale: 100 },
  { id: 'laea', name: 'Lambert Azimuthal Equal-Area', family: 'Azimuthal', aspect: 1.0, scale: 90 },
  { id: 'robinson', name: 'Robinson Pseudocylindrical', family: 'Pseudocylindrical', aspect: 1.97, scale: 70 },
  { id: 'mollweide', name: 'Mollweide Equal-Area', family: 'Pseudocylindrical', aspect: 2.0, scale: 65 },
  { id: 'sinusoidal', name: 'Sinusoidal (Sanson-Flamsteed)', family: 'Pseudocylindrical', aspect: 2.0, scale: 70 },
  { id: 'natural-earth', name: 'Natural Earth', family: 'Pseudocylindrical', aspect: 1.92, scale: 70 },
  { id: 'winkel-tripel', name: 'Winkel Tripel (Winkel III)', family: 'Pseudocylindrical', aspect: 1.64, scale: 70 },
];

function generateProjectionSvg(proj) {
  const width = 800;
  const height = Math.round(width / proj.aspect);
  const cx = width / 2;
  const cy = height / 2;

  const scssContent = `
@use "scss/projections" as p;
@use "scss/data" as d;
@use "scss/emitter" as e;
@use "scss/geometry" as g;
@use "sass:map";
@use "sass:list";

$cx: ${cx};
$cy: ${cy};
$scale: ${proj.scale};
$proj-id: "${proj.id}";

// Continents
$continents: ("africa", "eurasia", "north_america", "south_america", "australia", "antarctica");
$all-land-paths: ();

@each $c in $continents {
  $raw-pts: map.get(d.$WORLD_CONTINENTS, $c);
  $proj-pts: ();
  @each $pt in $raw-pts {
    $lon: map.get($pt, "lon");
    $lat: map.get($pt, "lat");
    $xy: p.project-point($lon, $lat, $proj-id);
    @if map.get($xy, "visible") != false {
      $px: $cx + (map.get($xy, "x") * $scale);
      $py: $cy - (map.get($xy, "y") * $scale);
      $proj-pts: list.append($proj-pts, (x: $px, y: $py));
    }
  }
  @if list.length($proj-pts) > 2 {
    $d: e.polyline-to-svg-path($proj-pts, true, 1);
    $all-land-paths: list.append($all-land-paths, $d);
  }
}

// Parallels (every 30 deg)
$parallels-d: ();
$lats: (-60, -30, 0, 30, 60);
@each $plat in $lats {
  $line-pts: ();
  @for $i from 0 through 36 {
    $plon: -180 + ($i * 10);
    $xy: p.project-point($plon, $plat, $proj-id);
    @if map.get($xy, "visible") != false {
      $px: $cx + (map.get($xy, "x") * $scale);
      $py: $cy - (map.get($xy, "y") * $scale);
      $line-pts: list.append($line-pts, (x: $px, y: $py));
    }
  }
  @if list.length($line-pts) > 1 {
    $d: e.polyline-to-svg-path($line-pts, false, 1);
    $parallels-d: list.append($parallels-d, $d);
  }
}

// Meridians (every 30 deg)
$meridians-d: ();
$lons: (-180, -150, -120, -90, -60, -30, 0, 30, 60, 90, 120, 150, 180);
@each $mlon in $lons {
  $line-pts: ();
  @for $i from 0 through 16 {
    $mlat: -80 + ($i * 10);
    $xy: p.project-point($mlon, $mlat, $proj-id);
    @if map.get($xy, "visible") != false {
      $px: $cx + (map.get($xy, "x") * $scale);
      $py: $cy - (map.get($xy, "y") * $scale);
      $line-pts: list.append($line-pts, (x: $px, y: $py));
    }
  }
  @if list.length($line-pts) > 1 {
    $d: e.polyline-to-svg-path($line-pts, false, 1);
    $meridians-d: list.append($meridians-d, $d);
  }
}

// Flight Routes (sampled Great Circles)
$routes-d: ();
@each $code, $route in d.$GLOBAL_FLIGHT_ROUTES {
  $from-lon: map.get($route, "from-lon");
  $from-lat: map.get($route, "from-lat");
  $to-lon: map.get($route, "to-lon");
  $to-lat: map.get($route, "to-lat");
  $pts: g.great-circle-path($from-lon, $from-lat, $to-lon, $to-lat, 16);
  $line-pts: ();
  @each $pt in $pts {
    $lon: map.get($pt, "lon");
    $lat: map.get($pt, "lat");
    $xy: p.project-point($lon, $lat, $proj-id);
    @if map.get($xy, "visible") != false {
      $px: $cx + (map.get($xy, "x") * $scale);
      $py: $cy - (map.get($xy, "y") * $scale);
      $line-pts: list.append($line-pts, (x: $px, y: $py));
    }
  }
  @if list.length($line-pts) > 1 {
    $d: e.polyline-to-svg-path($line-pts, false, 1);
    $routes-d: list.append($routes-d, $d);
  }
}

.export-data {
  --land-count: #{list.length($all-land-paths)};
  @for $i from 1 through list.length($all-land-paths) {
    --land-#{$i}: "#{list.nth($all-land-paths, $i)}";
  }

  --par-count: #{list.length($parallels-d)};
  @for $i from 1 through list.length($parallels-d) {
    --par-#{$i}: "#{list.nth($parallels-d, $i)}";
  }

  --mer-count: #{list.length($meridians-d)};
  @for $i from 1 through list.length($meridians-d) {
    --mer-#{$i}: "#{list.nth($meridians-d, $i)}";
  }

  --route-count: #{list.length($routes-d)};
  @for $i from 1 through list.length($routes-d) {
    --route-#{$i}: "#{list.nth($routes-d, $i)}";
  }
}
`;

  const tmpScss = path.join(ROOT_DIR, `.tmp_svg_${proj.id}.scss`);
  fs.writeFileSync(tmpScss, scssContent, 'utf8');

  try {
    const stdout = execSync(`"${SASS_BIN}" --no-source-map "${tmpScss}"`, {
      cwd: ROOT_DIR,
      stdio: ['ignore', 'pipe', 'pipe'],
    }).toString();

    // Extract paths from CSS variables
    function extractPaths(prefix, countKey) {
      const countMatch = stdout.match(new RegExp(`--${countKey}:\\s*(\\d+)`));
      const count = countMatch ? parseInt(countMatch[1], 10) : 0;
      const paths = [];
      for (let i = 1; i <= count; i++) {
        const re = new RegExp(`--${prefix}-${i}:\\s*"([^"]+)"`);
        const m = stdout.match(re);
        if (m && m[1].length > 0) {
          paths.push(m[1]);
        }
      }
      return paths;
    }

    const landPaths = extractPaths('land', 'land-count');
    const parPaths = extractPaths('par', 'par-count');
    const merPaths = extractPaths('mer', 'mer-count');
    const routePaths = extractPaths('route', 'route-count');

    // Assemble SVG XML
    const landElements = landPaths.map((d, i) => `    <path id="land-${i}" d="${d}" class="graticule-land" />`).join('\n');
    const parElements = parPaths.map((d, i) => `    <path id="par-${i}" d="${d}" class="graticule-wireframe" />`).join('\n');
    const merElements = merPaths.map((d, i) => `    <path id="mer-${i}" d="${d}" class="graticule-wireframe" />`).join('\n');
    const routeElements = routePaths.map((d, i) => `    <path id="route-${i}" d="${d}" class="graticule-flight-path" />`).join('\n');

    const svgDoc = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="100%" height="100%" data-projection="${proj.id}">
  <defs>
    <style>
      .graticule-ocean { fill: #090d16; }
      .graticule-land { fill: #1a2744; stroke: #38bdf8; stroke-width: 0.8px; stroke-linejoin: round; }
      .graticule-land:hover { fill: #22355c; }
      .graticule-wireframe { fill: none; stroke: #24324d; stroke-width: 0.5px; stroke-dasharray: 2 2; opacity: 0.6; }
      .graticule-flight-path { fill: none; stroke: #f59e0b; stroke-width: 1.5px; stroke-linecap: round; opacity: 0.85; }
      .graticule-outline { fill: none; stroke: #64748b; stroke-width: 1.2px; }
    </style>
  </defs>
  <rect width="${width}" height="${height}" class="graticule-ocean" />
  <g id="graticule-wireframe">
${parElements}
${merElements}
  </g>
  <g id="landmasses">
${landElements}
  </g>
  <g id="flight-routes">
${routeElements}
  </g>
</svg>
`;

    const svgFile = path.join(OUT_DIR, `${proj.id}.svg`);
    fs.writeFileSync(svgFile, svgDoc.trim(), 'utf8');
    return {
      id: proj.id,
      name: proj.name,
      family: proj.family,
      aspect: proj.aspect,
      width,
      height,
      file: `assets/projections/${proj.id}.svg`,
      size: fs.statSync(svgFile).size,
    };
  } finally {
    if (fs.existsSync(tmpScss)) {
      fs.unlinkSync(tmpScss);
    }
  }
}

function main() {
  console.log('Generating Standalone SVG Projections via Pure Sass...');
  const manifest = [];

  for (const proj of PROJECTIONS) {
    process.stdout.write(`  Projecting ${proj.name.padEnd(35)} `);
    const start = performance.now();
    try {
      const item = generateProjectionSvg(proj);
      manifest.push(item);
      const elapsed = (performance.now() - start).toFixed(1);
      console.log(`DONE (${item.size} bytes, ${elapsed}ms)`);
    } catch (err) {
      console.log('FAILED');
      console.error(err.message);
    }
  }

  const manifestPath = path.join(OUT_DIR, 'index.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
  console.log(`\nGenerated ${manifest.length} SVG projection files in ${path.relative(ROOT_DIR, OUT_DIR)}\n`);
}

main();
