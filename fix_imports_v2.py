
import os
import re

root = "d:\\devperso\\antigravity\\bbfrance"

# Mapping component names to their new @/ aliases
component_to_path = {
    # Common
    "AuthProvider": "@/common/components/AuthProvider/AuthProvider",
    "BannedRedirect": "@/common/components/BannedRedirect/BannedRedirect",
    "DebugAuthWidget": "@/common/components/DebugAuthWidget/DebugAuthWidget",
    "Modal": "@/common/components/Modal/Modal",
    "SignInButton": "@/common/components/SignInButton/SignInButton",
    "Toast": "@/common/components/Toast/Toast",
    "BBCodeEditor": "@/common/components/BBCodeEditor/BBCodeEditor",
    "ConfirmModal": "@/common/components/ConfirmModal/ConfirmModal",
    "SmileyGrid": "@/common/components/SmileyGrid/SmileyGrid",
    "SmileyPicker": "@/common/components/SmileyPicker/SmileyPicker",
    
    # Tournaments
    "ActiveFilters": "@/app/tournaments/component/ActiveFilters",
    "TournamentFilterSidebar": "@/app/tournaments/component/TournamentFilterSidebar",
    
    # Membres
    "MembersTable": "@/app/membres/component/MembersTable",
    
    # Profile
    "ProfileForm": "@/app/profile/component/ProfileForm",
    "ConversationList": "@/app/profile/component/ConversationList",
    "ConversationView": "@/app/profile/component/ConversationView",
    "ProfilePM": "@/app/profile/component/ProfilePM",
    "ProfileActivity": "@/app/profile/component/ProfileActivity",
    "ProfileEdit": "@/app/profile/component/ProfileEdit",
    "ProfileSidebar": "@/app/profile/component/ProfileSidebar",
    
    # Forum
    "DeleteForumButton": "@/app/forum/component/DeleteForumButton",
    "DeletionToast": "@/app/forum/component/DeletionToast",
    "EditPostForm": "@/app/forum/component/EditPostForm",
    "EditTopicTitleModal": "@/app/forum/component/EditTopicTitleModal",
    "ForumBreadcrumbs": "@/app/forum/component/ForumBreadcrumbs",
    "ForumCategory": "@/app/forum/component/ForumCategory",
    "ForumSidebar": "@/app/forum/component/ForumSidebar",
    "MarkAllAsReadButton": "@/app/forum/component/MarkAllAsReadButton",
    "MarkAsRead": "@/app/forum/component/MarkAsRead",
    "MarkUnreadAction": "@/app/forum/component/MarkUnreadAction",
    "ModerationModal": "@/app/forum/component/ModerationModal",
    "MoveTopicModal": "@/app/forum/component/MoveTopicModal",
    "NewForumButton": "@/app/forum/component/NewForumButton",
    "PostActions": "@/app/forum/component/PostActions",
    "PostReactions": "@/app/forum/component/PostReactions",
    "QuickReply": "@/app/forum/component/QuickReply",
    "ReplyForm": "@/app/forum/component/ReplyForm",
    "SearchForm": "@/app/forum/component/SearchForm",
    "SharePostButton": "@/app/forum/component/SharePostButton",
    "SidebarPagination": "@/app/forum/component/SidebarPagination",
    "TitleInputWithSmiley": "@/app/forum/component/TitleInputWithSmiley",
    "TopicSidebar": "@/app/forum/component/TopicSidebar"
}

# Regex to find imports: import ... from "path"
# or import "path"
import_regex = re.compile(r'from\s+["\']([^"\']+)["\']')
simple_import_regex = re.compile(r'import\s+["\']([^"\']+)["\']')

def fix_imports(file_path):
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            lines = f.readlines()
        
        changed = False
        new_lines = []
        for line in lines:
            new_line = line
            # Check for matches in both regexes
            for regex in [import_regex, simple_import_regex]:
                match = regex.search(line)
                if match:
                    import_path = match.group(1)
                    # Extract the potential component name from the end of the path
                    parts = import_path.split('/')
                    last_part = parts[-1]
                    
                    if last_part in component_to_path:
                        # Double check if this import path was actually targeting a component
                        # (e.g. it contains "components" or it's a relative path in an app folder)
                        if "components" in import_path or import_path.startswith(".") or import_path.startswith("@/app/"):
                            new_path = component_to_path[last_part]
                            if import_path != new_path:
                                new_line = line.replace(import_path, new_path)
                                changed = True
            new_lines.append(new_line)
            
        if changed:
            with open(file_path, "w", encoding="utf-8") as f:
                f.writelines(new_lines)
            return True
    except Exception as e:
        print(f"Error in {file_path}: {e}")
    return False

# Scan all TSX/TS files
for r, _, files in os.walk(root):
    if "node_modules" in r or ".next" in r or ".git" in r: continue
    for file in files:
        if file.endswith(".tsx") or file.endswith(".ts"):
            path = os.path.join(r, file)
            if fix_imports(path):
                print(f"Fixed imports in: {os.path.relpath(path, root)}")

print("All imports verified and fixed.")
