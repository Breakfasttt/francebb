
import os
import shutil

root = "d:\\devperso\\antigravity\\bbfrance"

moves = [
    # Forum
    ("components\\forum\\DeleteForumButton.tsx", "app\\forum\\component\\DeleteForumButton.tsx"),
    ("components\\forum\\DeletionToast.tsx", "app\\forum\\component\\DeletionToast.tsx"),
    ("components\\forum\\EditPostForm.tsx", "app\\forum\\component\\EditPostForm.tsx"),
    ("components\\forum\\EditTopicTitleModal.tsx", "app\\forum\\component\\EditTopicTitleModal.tsx"),
    ("components\\forum\\ForumBreadcrumbs.tsx", "app\\forum\\component\\ForumBreadcrumbs.tsx"),
    ("components\\forum\\ForumCategory.tsx", "app\\forum\\component\\ForumCategory.tsx"),
    ("components\\forum\\ForumSidebar.tsx", "app\\forum\\component\\ForumSidebar.tsx"),
    ("components\\forum\\MarkAllAsReadButton.tsx", "app\\forum\\component\\MarkAllAsReadButton.tsx"),
    ("components\\forum\\MarkAsRead.tsx", "app\\forum\\component\\MarkAsRead.tsx"),
    ("components\\forum\\MarkUnreadAction.tsx", "app\\forum\\component\\MarkUnreadAction.tsx"),
    ("components\\forum\\ModerationModal.tsx", "app\\forum\\component\\ModerationModal.tsx"),
    ("components\\forum\\MoveTopicModal.tsx", "app\\forum\\component\\MoveTopicModal.tsx"),
    ("components\\forum\\NewForumButton.tsx", "app\\forum\\component\\NewForumButton.tsx"),
    ("components\\forum\\PostActions.tsx", "app\\forum\\component\\PostActions.tsx"),
    ("components\\forum\\PostReactions.tsx", "app\\forum\\component\\PostReactions.tsx"),
    ("components\\forum\\QuickReply.tsx", "app\\forum\\component\\QuickReply.tsx"),
    ("components\\forum\\ReplyForm.tsx", "app\\forum\\component\\ReplyForm.tsx"),
    ("components\\forum\\SearchForm.tsx", "app\\forum\\component\\SearchForm.tsx"),
    ("components\\forum\\SharePostButton.tsx", "app\\forum\\component\\SharePostButton.tsx"),
    ("components\\forum\\SidebarPagination.tsx", "app\\forum\\component\\SidebarPagination.tsx"),
    ("components\\forum\\TitleInputWithSmiley.tsx", "app\\forum\\component\\TitleInputWithSmiley.tsx"),
    ("components\\forum\\TopicSidebar.tsx", "app\\forum\\component\\TopicSidebar.tsx"),

    # Profile
    ("components\\profile\\ConversationList.tsx", "app\\profile\\component\\ConversationList.tsx"),
    ("components\\profile\\ConversationView.tsx", "app\\profile\\component\\ConversationView.tsx"),
    ("components\\profile\\ProfilePM.tsx", "app\\profile\\component\\ProfilePM.tsx"),
    ("components\\ProfileForm.tsx", "app\\profile\\component\\ProfileForm.tsx"),
    ("components\\forum\\ProfileActivity.tsx", "app\\profile\\component\\ProfileActivity.tsx"),
    ("components\\forum\\ProfileEdit.tsx", "app\\profile\\component\\ProfileEdit.tsx"),
    ("components\\forum\\ProfileSidebar.tsx", "app\\profile\\component\\ProfileSidebar.tsx"),

    # Membres
    ("components\\MembersTable.tsx", "app\\membres\\component\\MembersTable.tsx"),

    # Tournaments
    ("components\\ActiveFilters.tsx", "app\\tournaments\\component\\ActiveFilters.tsx"),
    ("components\\TournamentFilterSidebar.tsx", "app\\tournaments\\component\\TournamentFilterSidebar.tsx"),
]

for src_rel, dst_rel in moves:
    src = os.path.join(root, src_rel)
    dst = os.path.join(root, dst_rel)
    if os.path.exists(src):
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        shutil.move(src, dst)
        print(f"Moved: {src_rel} -> {dst_rel}")
    else:
        print(f"Skipped (not found): {src_rel}")
