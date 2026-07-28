# R0-7A — CI Workflow Inventory and Reconstruction Plan

**Evidence type:** Planning / assessment only (non-normative)  
**Branch:** `governance/r0-7a-ci-reconstruction-plan`  
**Integration tip:** `c6110f417b3c602dc031dacbc422f8a044129cfc`  
**Date:** 2026-07-26

## Purpose

Inventory all tracked GitHub Actions workflows, determine why PR #3 checks
failed or skipped, and propose separately reviewable reconstruction tasks
R0-7B–R0-7F.

## Non-goals

This package does **not** modify workflows, lockfiles, manifests, Docker files,
schemas, application code, branch protection, or production deployment settings.

## Status context

- R0-3 deployment containment: active with conditions
- R0-1B1 authority chain: active
- R0-1B2.1 architecture SoT: active
- Production deployment: unauthorized
