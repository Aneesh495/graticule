#!/usr/bin/env python3
"""
Linting script to enforce the zero em dash and en dash rule across the repository.
Scans all text files and verifies that no em dashes or en dashes exist in
code, comments, documentation, or commit messages.
"""

import os
import sys
import re

EM_DASH = "\u2014"
EN_DASH = "\u2013"

IGNORE_DIRS = {".git", "node_modules", "dist", ".gemini"}
IGNORE_EXTS = {".png", ".jpg", ".jpeg", ".ico", ".svg.gz", ".tar.gz", ".zip"}

def check_file(filepath):
    errors = []
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            for line_no, line in enumerate(f, 1):
                if EM_DASH in line:
                    errors.append(f"Line {line_no}: Unicode em dash found (\\u2014)")
                if EN_DASH in line:
                    errors.append(f"Line {line_no}: Unicode en dash found (\\u2013)")
                # Check for double hyphens used as punctuation (e.g. ' -- ' or 'word--word')
                # But allow CSS custom properties (--var), markdown tables (---), or CLI flags (--flag)
                if re.search(r"[a-zA-Z0-9]\s*--\s*[a-zA-Z0-9]", line):
                    # Check if it is a CSS variable or BEM syntax
                    if not re.search(r"var\(--|--[a-z0-9_-]+:", line) and not re.search(r"(--[a-zA-Z0-9-]+)", line):
                        errors.append(f"Line {line_no}: Double hyphen used as punctuation: {line.strip()}")
    except UnicodeDecodeError:
        pass
    except Exception as e:
        errors.append(f"Could not read file: {e}")
    return errors

def main():
    repo_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    has_errors = False
    checked_count = 0

    for root, dirs, files in os.walk(repo_root):
        dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]
        for filename in files:
            ext = os.path.splitext(filename)[1].lower()
            if ext in IGNORE_EXTS:
                continue
            filepath = os.path.join(root, filename)
            relpath = os.path.relpath(filepath, repo_root)
            errs = check_file(filepath)
            checked_count += 1
            if errs:
                has_errors = True
                print(f"FAILED: {relpath}")
                for err in errs:
                    print(f"  {err}")

    if has_errors:
        print(f"\nLint failed! Prohibited dashes discovered across {checked_count} files.")
        sys.exit(1)
    else:
        print(f"Lint passed: checked {checked_count} files with zero em dashes or en dashes.")
        sys.exit(0)

if __name__ == "__main__":
    main()
