#!/bin/bash

# Find all Vue files with @apply
find src -name "*.vue" -type f | while read file; do
  # Check if file contains @apply
  if grep -q "@apply" "$file"; then
    # Check if file already has @reference
    if ! grep -q "@reference" "$file"; then
      # Add @reference after <style> or <style scoped>
      sed -i '' 's/<style>/<style>\n@reference "tailwindcss";\n/' "$file"
      sed -i '' 's/<style scoped>/<style scoped>\n@reference "tailwindcss";\n/' "$file"
      echo "Fixed: $file"
    fi
  fi
done
