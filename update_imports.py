
import os
import re

root = "d:\\devperso\\antigravity\\bbfrance"

# Mapping from old import path to new import path
# We use regex to match lines like: from "@/components/..."
# Or: import { ... } from "@/components/..."

mappings = {
    # Common components (moved to common/components/Name/Name)
    r'@/components/AuthProvider': r'@/common/components/AuthProvider/AuthProvider',
    r'@/components/BannedRedirect': r'@/common/components/BannedRedirect/BannedRedirect',
    r'@/components/DebugAuthWidget': r'@/common/components/DebugAuthWidget/DebugAuthWidget',
    r'@/components/Modal': r'@/common/components/Modal/Modal',
    r'@/components/SignInButton': r'@/common/components/SignInButton/SignInButton',
    r'@/components/Toast': r'@/common/components/Toast/Toast',
    r'@/components/forum/BBCodeEditor': r'@/common/components/BBCodeEditor/BBCodeEditor',
    r'@/components/forum/ConfirmModal': r'@/common/components/ConfirmModal/ConfirmModal',
    r'@/components/forum/SmileyGrid': r'@/common/components/SmileyGrid/SmileyGrid',
    r'@/components/forum/SmileyPicker': r'@/common/components/SmileyPicker/SmileyPicker',

    # Feature specific components
    r'@/components/MembersTable': r'@/app/membres/component/MembersTable',
    r'@/components/ActiveFilters': r'@/app/tournaments/component/ActiveFilters',
    r'@/components/TournamentFilterSidebar': r'@/app/tournaments/component/TournamentFilterSidebar',
    r'@/components/ProfileForm': r'@/app/profile/component/ProfileForm',
    
    # Forum components
    r'@/components/forum/ProfileActivity': r'@/app/profile/component/ProfileActivity',
    r'@/components/forum/ProfileEdit': r'@/app/profile/component/ProfileEdit',
    r'@/components/forum/ProfileSidebar': r'@/app/profile/component/ProfileSidebar',
    # Catch-all for forum components (must be after specific ones)
    r'@/components/forum/': r'@/app/forum/component/',
    
    # Profile components
    r'@/components/profile/': r'@/app/profile/component/',

    # Actions
    r'@/app/profile/pmActions': r'@/app/profile/actions',
}

def update_file(file_path):
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()
        
        new_content = content
        for old, new in mappings.items():
            # Replace occurrences in quotes
            new_content = re.sub(f'"{old}"', f'"{new}"', new_content)
            new_content = re.sub(f"'{old}'", f"'{new}'", new_content)

        if new_content != content:
            with open(file_path, "w", encoding="utf-8") as f:
                f.write(new_content)
            return True
    except Exception as e:
        print(f"Error updating {file_path}: {e}")
    return False

# Files to scan
scan_dirs = ["app", "common", "components", "lib"]

for d in scan_dirs:
    dir_path = os.path.join(root, d)
    if not os.path.exists(dir_path): continue
    for r, _, files in os.walk(dir_path):
        for file in files:
            if file.endswith(".tsx") or file.endswith(".ts") or file.endswith(".css"):
                if update_file(os.path.join(r, file)):
                    print(f"Updated imports in: {os.path.relpath(os.path.join(r, file), root)}")

# Also handle relative imports in moved files
# Specifically components that moved from depth 2 to 3
# components/forum/X.tsx -> app/forum/component/X.tsx
# Relative imports like "../X" or "../../X" need adjustment if not using @/

def adjust_relative_imports(file_path):
    # This is trickier. Let's see if there are many.
    # From my observation, most use @/.
    # I'll check for "../" in moved files.
    pass

print("Imports updated.")
