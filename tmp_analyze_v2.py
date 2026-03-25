
import os
import re
from collections import defaultdict

root_dir = "d:\\devperso\\antigravity\\bbfrance"
components_dir = os.path.join(root_dir, "components")
app_dir = os.path.join(root_dir, "app")

component_files = []
for root, dirs, files in os.walk(components_dir):
    for file in files:
        if file.endswith(".tsx"):
            component_files.append(os.path.join(root, file))

# Map component name to its source path
component_map = {os.path.basename(f).replace(".tsx", ""): f for f in component_files}

# Usage map
usage = defaultdict(set)

# Search in all tsx and ts files in app/
for root, dirs, files in os.walk(app_dir):
    for file in files:
        if file.endswith(".tsx") or file.endswith(".ts"):
            file_path = os.path.join(root, file)
            # Determine which "page" or "feature" this file belongs to
            # We'll use the first level subdirectory of app/ as the feature name
            rel_path = os.path.relpath(file_path, app_dir)
            parts = rel_path.split(os.sep)
            if len(parts) > 1:
                feature = parts[0]
            else:
                feature = "root" # app/page.tsx etc
            
            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    content = f.read()
                    for comp_name in component_map:
                        # Look for imports or usage
                        # Match component name as a word
                        if re.search(r'\b' + re.escape(comp_name) + r'\b', content):
                            usage[comp_name].add(feature)
            except Exception:
                pass

with open(os.path.join(root_dir, "analysis_utf8.txt"), "w", encoding="utf-8") as out:
    out.write("--- ANALYSIS ---\n")
    for comp_name, features in sorted(usage.items()):
        out.write(f"{comp_name}: {sorted(list(features))}\n")

    # Components NOT used anywhere
    all_comps = set(component_map.keys())
    used_comps = set(usage.keys())
    unused = all_comps - used_comps
    out.write(f"--- UNUSED ---: {sorted(list(unused))}\n")
