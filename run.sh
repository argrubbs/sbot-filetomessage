#!/bin/bash

# Install Deno runtime
if command -v &> /dev/null 2>&1; then
  echo "Deno is already installed"
else
  curl -fsSL https://deno.land/install.sh | sh
fi

# Check if deno is installed
if deno -v &> /dev/null 2>&1; then
  echo "Deno installed successfully"
else
  echo "Deno installation failed"
  exit 1
fi

# Install dependencies with Deno
deno install --allow-scripts

# Run the script using deno
deno run --allow-env --allow-read --allow-ffi --allow-net src/sendFileToChat.ts
