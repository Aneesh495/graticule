#!/usr/bin/env bash

# Graticule Comprehensive Verification Pipeline
# Runs all linters, compile-time test suites, integration tests, and build checks.
# Strictly enforces zero em dashes, zero compiler warnings, and zero broken tests.

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${ROOT_DIR}"

COLOR_RESET="\033[0m"
COLOR_BOLD="\033[1m"
COLOR_GREEN="\033[32m"
COLOR_CYAN="\033[36m"
COLOR_RED="\033[31m"

echo -e "\n${COLOR_BOLD}${COLOR_CYAN}====================================================${COLOR_RESET}"
echo -e "${COLOR_BOLD}${COLOR_CYAN}        GRATICULE VERIFICATION PIPELINE             ${COLOR_RESET}"
echo -e "${COLOR_BOLD}${COLOR_CYAN}====================================================${COLOR_RESET}\n"

# Step 1: Strict Em Dash and En Dash Linter
echo -e "${COLOR_BOLD}[1/6] Scanning codebase for forbidden dash characters...${COLOR_RESET}"
python3 scripts/lint_no_em_dashes.py
echo -e "${COLOR_GREEN}✓ Dash linting passed cleanly.${COLOR_RESET}\n"

# Step 2: Unit Test Suite
echo -e "${COLOR_BOLD}[2/6] Executing pure Sass unit test suites...${COLOR_RESET}"
./test/run_all_tests.js
echo -e "${COLOR_GREEN}✓ All unit test suites passed.${COLOR_RESET}\n"

# Step 3: Compilation Verification
echo -e "${COLOR_BOLD}[3/6] Verifying clean compilation across all entrypoints...${COLOR_RESET}"
./test/integration/compilation_test.js
echo -e "${COLOR_GREEN}✓ Clean compilation verified with zero warnings.${COLOR_RESET}\n"

# Step 4: Geodesic & Precision Benchmarks
echo -e "${COLOR_BOLD}[4/6] Running geodetic precision benchmarks...${COLOR_RESET}"
./test/integration/precision_test.js
echo -e "${COLOR_GREEN}✓ Geodetic precision benchmarks verified.${COLOR_RESET}\n"

# Step 5: CLI Executable Verification
echo -e "${COLOR_BOLD}[5/6] Verifying Graticule CLI executable...${COLOR_RESET}"
./bin/graticule list-projections > /dev/null
./bin/graticule project 0 45 --proj=mercator > /dev/null
echo -e "${COLOR_GREEN}✓ CLI executable verified.${COLOR_RESET}\n"

# Step 6: Production Build Verification
echo -e "${COLOR_BOLD}[6/6] Verifying production build artifacts in dist/...${COLOR_RESET}"
./bin/graticule build > /dev/null
if [[ ! -f "dist/graticule.css" || ! -f "dist/graticule.min.css" ]]; then
  echo -e "${COLOR_RED}Build artifacts missing from dist/${COLOR_RESET}"
  exit 1
fi
echo -e "${COLOR_GREEN}✓ Production build artifacts verified.${COLOR_RESET}\n"

echo -e "${COLOR_BOLD}${COLOR_GREEN}====================================================${COLOR_RESET}"
echo -e "${COLOR_BOLD}${COLOR_GREEN}   ALL VERIFICATION PASSES COMPLETED SUCCESSFULLY   ${COLOR_RESET}"
echo -e "${COLOR_BOLD}${COLOR_GREEN}====================================================${COLOR_RESET}\n"
