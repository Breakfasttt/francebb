/**
 * Point d'entrée de @bbfrance/ui : composants partagés entre les apps du monorepo.
 * Les composants de la refonte (ADR 0006) n'utilisent que les variables v2 `--bb-*` (src/tokens.css).
 */
export { cn } from "./cn";
export { Button, buttonVariants, type ButtonProps } from "./button";
export {
  Dialog,
  DialogTrigger,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "./dialog";
export { Toaster, toast } from "./toaster";

// Refonte (carte 082)
export { useMediaQuery, DESKTOP_QUERY } from "./use-media-query";
export { Sheet, SheetTrigger, SheetClose, SheetContent, type SheetContentProps } from "./sheet";
export { ActionMenu, type ActionMenuItem, type ActionMenuProps } from "./action-menu";
export { Card, CardHeader, CardTitle, CardBody, ListRow } from "./card";
export { Badge, badgeVariants, CountBadge } from "./badge";
export { Avatar, type AvatarProps } from "./avatar";
export { Label, Input, Textarea, Select, Field } from "./field";
export { Switch } from "./switch";
export { Tooltip } from "./tooltip";
export { Tabs, TabsList, TabsTrigger, TabsContent, LinkTabs, type LinkTab } from "./tabs";
export { PageNav } from "./page-nav";
export { PagePicker, type PagePickerOptions } from "./page-picker";
export { EmptyState, Skeleton } from "./feedback";

// Refonte de l'éditeur de message (carte 087)
export { Popover, PopoverTrigger, PopoverClose, PopoverContent } from "./popover";

// Refonte des tournois (carte 089) : fenêtre de confirmation
export { ConfirmDialog } from "./confirm-dialog";
