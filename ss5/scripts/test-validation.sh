#!/bin/bash

# This script helps test the pattern validation process

# Create a temporary pattern file
echo "# Test Pattern

## Status: Draft

## Classification: Security

## Context

This is a test pattern.

## Problem

Test problem description.

## Solution

Test solution description." > /tmp/test-pattern.md

# Run validation
ss5/scripts/validate-patterns.sh /tmp/test-pattern.md

echo "Test completed. Exit code: $?"

