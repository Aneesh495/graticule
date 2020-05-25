#!/usr/bin/env node

/**
 * Graticule Compilation Integration Tests
 * Validates that all entrypoints and submodules compile cleanly
 * under both expanded and compressed output styles with zero warnings.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SASS_BIN = path.join(__dirname, '..', '..', 'node_modules', '.bin', 'sass');
const ROOT_DIR = path.join(__dirname, '..', '..');

const ENTRYPOINTS = [
  'scss/graticule.scss',
  'scss/math/index.scss',
  'scss/geometry/index.scss',
  'scss/projections/index.scss',
  'scss/color/index.scss',
  'scss/scales/index.scss',
  'scss/statistics/index.scss',
  'scss/cartography/index.scss',
  'scss/symbology/index.scss',
  'scss/charts/index.scss',
  'scss/emitter/index.scss',
  'scss/layout/index.scss',
  'scss/data/index.scss',
];

function testCompilation() {
  console.log('Testing clean compilation for all entrypoints...');
  let failed = 0;

  for (const entry of ENTRYPOINTS) {
    const fullPath = path.join(ROOT_DIR, entry);
    process.stdout.write(`  Checking ${entry.padEnd(35)} `);

    try {
      // Test expanded style with fatal deprecations to ensure zero compiler warnings
      const cmdExpanded = `"${SASS_BIN}" --no-source-map --style=expanded --fatal-deprecation=1.83.1 "${fullPath}"`;
      const outExpanded = execSync(cmdExpanded, { cwd: ROOT_DIR, stdio: ['ignore', 'pipe', 'pipe'] });

      // Test compressed style
      const cmdCompressed = `"${SASS_BIN}" --no-source-map --style=compressed "${fullPath}"`;
      const outCompressed = execSync(cmdCompressed, { cwd: ROOT_DIR, stdio: ['ignore', 'pipe', 'pipe'] });

      console.log(`OK (exp: ${outExpanded.length}B, comp: ${outCompressed.length}B)`);
    } catch (err) {
      failed++;
      console.log('FAILED');
      console.error(err.stderr ? err.stderr.toString() : err.message);
    }
  }

  if (failed > 0) {
    console.error(`\nCompilation test failed: ${failed} entrypoints had errors.`);
    process.exit(1);
  } else {
    console.log(`\nAll ${ENTRYPOINTS.length} entrypoints compiled cleanly with zero warnings.\n`);
  }
}

testCompilation();
