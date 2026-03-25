
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

# dependency_map[component_name] = set of other components it uses
dependency_map = defaultdict(set)
# feature_usage[component_name] = set of app features that use it directly
feature_usage = defaultdict(set)

# 1. Analyze usage in components/ (inter-component dependencies)
for comp_name, comp_path in component_map.items():
    try:
        with open(comp_path, "r", encoding="utf-8") as f:
            content = f.read()
            for other_name in component_map:
                if other_name != comp_name:
                    if re.search(r'\b' + re.escape(other_name) + r'\b', content):
                        dependency_map[comp_name].add(other_name)
    except Exception:
        pass

# 2. Analyze usage in app/
for root, dirs, files in os.walk(app_dir):
    for file in files:
        if file.endswith(".tsx") or file.endswith(".ts"):
            file_path = os.path.join(root, file)
            rel_path = os.path.relpath(file_path, app_dir)
            parts = rel_path.split(os.sep)
            if len(parts) > 1:
                feature = parts[0]
            else:
                feature = "root"
            
            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    content = f.read()
                    for comp_name in component_map:
                        if re.search(r'\b' + re.escape(comp_name) + r'\b', content):
                            feature_usage[comp_name].add(feature)
            except Exception:
                pass

# 3. Propagate feature usage (if A uses B, then B is used by whatever uses A)
# Simple iterative approach
changed = True
while changed:
    changed = False
    for comp_a, deps in dependency_map.items():
        for comp_b in deps:
            # If A is used in some features, then B is also used in those features
            before = len(feature_usage[comp_b])
            feature_usage[comp_b].update(feature_usage[comp_a])
            if len(feature_usage[comp_b]) > before:
                changed = True

# 4. Final classification
with open(os.path.join(root_dir, "final_analysis.txt"), "w", encoding="utf-8") as out:
    out.write("--- FINAL CLASSIFICATION ---\n")
    for comp_name in sorted(component_map.keys()):
        features = sorted(list(feature_usage[comp_name]))
        if len(features) > 1 or (len(features) == 1 and features[0] == "root"):
            category = "COMMON"
        elif len(features) == 1:
            category = f"PAGE/FEATURE: {features[0]}"
        else:
            category = "UNUSED (or internal to components)"
        
        out.write(f"{comp_name}: {category} (used in: {features})\n")
