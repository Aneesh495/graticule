#!/usr/bin/env node

/**
 * Graticule Numerical Precision and Geodesic Benchmark Suite
 * Compiles targeted Sass evaluation harnesses and validates numerical outputs
 * against authoritative analytical references (USGS, PROJ.4, and EPSG geodetic tables).
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SASS_BIN = path.join(__dirname, '..', '..', 'node_modules', '.bin', 'sass');
const ROOT_DIR = path.join(__dirname, '..', '..');

const BENCHMARKS = [
  {
    name: 'Great-Circle Haversine (London to New York)',
    sass: `
      @use "scss/geometry/geodesy" as g;
      $dist: g.haversine-distance(-0.1278, 51.5074, -74.0060, 40.7128);
      .result { --value: #{$dist}; }
    `,
    expected: 5570222, // meters (~5,570.2 km)
    tolerance: 10000,   // within 10 km on spherical earth model
  },
  {
    name: 'Vincenty Ellipsoidal Inverse (Equatorial 1 deg)',
    sass: `
      @use "scss/geometry/geodesy" as g;
      $dist: g.vincenty-inverse-distance(0, 0, 1, 0);
      .result { --value: #{$dist}; }
    `,
    expected: 111319.49, // WGS-84 equatorial degree in meters
    tolerance: 50,       // within 50 meters
  },
  {
    name: 'Forward Mercator Aspect Scaling (45 deg North)',
    sass: `
      @use "scss/projections/cylindrical" as c;
      @use "sass:map";
      $pt: c.project-mercator(0, 45, 1);
      .result { --value: #{map.get($pt, "y")}; }
    `,
    expected: 0.881373587, // ln(tan(pi/4 + 45/2)) = ln(1 + sqrt(2)) ~ 0.881373587
    tolerance: 0.0001,
  },
  {
    name: 'Albers Equal-Area Conic Scale Ratio',
    sass: `
      @use "scss/projections/conic" as c;
      @use "sass:map";
      $pt: c.project-albers(0, 30, 0, 0, 20, 60);
      .result { --value: #{map.get($pt, "y")}; }
    `,
    expected: 0.528,
    tolerance: 0.05,
  },
  {
    name: 'Orthographic Horizon Culling Flag (Antipodal point)',
    sass: `
      @use "scss/projections/azimuthal" as a;
      @use "sass:map";
      $pt: a.project-orthographic(180, 0, 0, 0);
      $vis: 0;
      @if map.get($pt, "visible") {
        $vis: 1;
      }
      .result { --value: #{$vis}; }
    `,
    expected: 0, // Antipodal point should be culled (visible = false)
    tolerance: 0,
  },
  {
    name: 'Fisher-Jenks Natural Breaks (3 Classes)',
    sass: `
      @use "scss/statistics/jenks" as j;
      @use "sass:list";
      $breaks: j.jenks-breaks((1, 2, 4, 5, 7, 9, 10, 20, 21, 22, 23, 24, 40, 42, 43), 3);
      .result { --count: #{list.length($breaks)}; }
    `,
    expected: 4, // 3 classes yield 4 boundary markers
    tolerance: 0,
  },
  {
    name: 'OKLab Linear Interpolation Midpoint',
    sass: `
      @use "scss/color/oklab" as ok;
      @use "sass:map";
      $c1: #000000;
      $c2: #ffffff;
      $mid: ok.oklab-lerp($c1, $c2, 0.5);
      $lab: ok.color-to-oklab($mid);
      .result { --value: #{map.get($lab, "l")}; }
    `,
    expected: 0.5,
    tolerance: 0.01,
  },
];

function runBenchmarks() {
  console.log('Running Geodetic & Cartographic Precision Verification...');
  let passed = 0;
  let failed = 0;

  for (const b of BENCHMARKS) {
    process.stdout.write(`  Benchmark: ${b.name.padEnd(45)} `);
    const tmpScss = path.join(ROOT_DIR, '.tmp_precision_benchmark.scss');
    fs.writeFileSync(tmpScss, b.sass.trim());

    try {
      const cmd = `"${SASS_BIN}" --no-source-map "${tmpScss}"`;
      const stdout = execSync(cmd, { cwd: ROOT_DIR, stdio: ['ignore', 'pipe', 'pipe'] }).toString();

      // Extract --value or --count
      const match = stdout.match(/--(?:value|count):\s*([0-9.-]+)/);
      if (!match) {
        throw new Error(`Could not parse numerical output from CSS: ${stdout}`);
      }

      const val = parseFloat(match[1]);
      const delta = Math.abs(val - b.expected);

      if (delta <= b.tolerance) {
        passed++;
        console.log(`PASS (val: ${val.toFixed(4)}, delta: ${delta.toFixed(6)})`);
      } else {
        failed++;
        console.log(`FAIL (val: ${val}, expected: ${b.expected}, delta: ${delta} > tol ${b.tolerance})`);
      }
    } catch (err) {
      failed++;
      console.log('ERROR');
      console.error(err.message);
    } finally {
      if (fs.existsSync(tmpScss)) {
        fs.unlinkSync(tmpScss);
      }
    }
  }

  console.log(`\nPrecision Benchmark Summary: ${passed} passed, ${failed} failed.\n`);
  if (failed > 0) process.exit(1);
}

runBenchmarks();
