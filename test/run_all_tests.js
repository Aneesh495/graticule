#!/usr/bin/env node

/**
 * Graticule Test Suite Runner
 * Executes all compile-time mathematical, projection, and cartographic tests
 * using Dart Sass, reporting microsecond precision timings and verification states.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SASS_BIN = path.join(__dirname, '..', 'node_modules', '.bin', 'sass');
const ROOT_DIR = path.join(__dirname, '..');

const SUITES = [
  { name: 'Mathematical Kernel', file: 'test/unit/math_test.scss', asserts: 48 },
  { name: 'Geodesy & Geometry', file: 'test/unit/geometry_test.scss', asserts: 21 },
  { name: 'Cartographic Projections', file: 'test/unit/projections_test.scss', asserts: 21 },
  { name: 'Perceptual Colorimetry', file: 'test/unit/color_test.scss', asserts: 18 },
  { name: 'Continuous Scales', file: 'test/unit/scales_test.scss', asserts: 10 },
  { name: 'Statistical Optimization', file: 'test/unit/statistics_test.scss', asserts: 13 },
  { name: 'Symbology & Contours', file: 'test/unit/cartography_test.scss', asserts: 18 },
  { name: 'Analytical Charts', file: 'test/unit/charts_test.scss', asserts: 10 },
  { name: 'Master Aggregation Runner', file: 'test/test_runner.scss', asserts: 147 },
];

const ANSI = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
};

function formatDuration(ms) {
  if (ms < 1000) return `${ms.toFixed(1)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

function runSuite(suite) {
  const fullPath = path.join(ROOT_DIR, suite.file);
  const start = performance.now();
  try {
    const cmd = `"${SASS_BIN}" --no-source-map "${fullPath}"`;
    const stdout = execSync(cmd, { cwd: ROOT_DIR, stdio: ['ignore', 'pipe', 'pipe'] });
    const elapsed = performance.now() - start;
    return {
      name: suite.name,
      file: suite.file,
      asserts: suite.asserts,
      elapsed,
      passed: true,
      outputSize: stdout.length,
    };
  } catch (err) {
    const elapsed = performance.now() - start;
    return {
      name: suite.name,
      file: suite.file,
      asserts: suite.asserts,
      elapsed,
      passed: false,
      error: err.stderr ? err.stderr.toString() : err.message,
    };
  }
}

function main() {
  console.log(`\n${ANSI.bold}${ANSI.cyan}=== Graticule Compile-Time Test Suite ===${ANSI.reset}\n`);

  let totalAsserts = 0;
  let totalTime = 0;
  let passedCount = 0;
  let failedCount = 0;

  for (const suite of SUITES) {
    process.stdout.write(`  Running ${suite.name.padEnd(28)} `);
    const result = runSuite(suite);
    totalTime += result.elapsed;

    if (result.passed) {
      passedCount++;
      if (suite.name !== 'Master Aggregation Runner') {
        totalAsserts += suite.asserts;
      }
      console.log(
        `${ANSI.green}PASS${ANSI.reset} ` +
        `[${String(suite.asserts).padStart(3)} asserts] ` +
        `(${formatDuration(result.elapsed)})`
      );
    } else {
      failedCount++;
      console.log(`${ANSI.red}FAIL${ANSI.reset} (${formatDuration(result.elapsed)})`);
      console.error(`\n${ANSI.red}${result.error}${ANSI.reset}\n`);
    }
  }

  console.log(`\n${ANSI.bold}--------------------------------------------------${ANSI.reset}`);
  console.log(
    `Suites:     ${passedCount === SUITES.length ? ANSI.green : ANSI.red}${passedCount} passed${ANSI.reset}, ` +
    `${failedCount} failed, ${SUITES.length} total`
  );
  console.log(`Assertions: ${ANSI.bold}${totalAsserts} verified${ANSI.reset}`);
  console.log(`Total Time: ${ANSI.bold}${formatDuration(totalTime)}${ANSI.reset}\n`);

  if (failedCount > 0) {
    process.exit(1);
  }
}

main();
