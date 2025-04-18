#!/bin/bash

# Find all TypeScript and TypeScript React files
FILES=$(find app -type f -name "*.ts" -o -name "*.tsx")

# Remove console.log statements
for FILE in $FILES; do
  # Replace console.log statements
  sed -i '' 's/console\.log(.*);*//g' "$FILE"
  
  # Replace console.error statements
  sed -i '' 's/console\.error(.*);*//g' "$FILE"
done

echo "Removed console.log and console.error statements from all TypeScript files."
