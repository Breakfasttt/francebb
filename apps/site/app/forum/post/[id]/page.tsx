/**
 * Lien permanent d'un message du forum (carte 169) : `/forum/post/<identifiant>` envoie le lecteur sur la bonne page de
 * son sujet, directement sur le message (`forumPostHrefFor`, lib/forumPostLink.ts). Les citations s'en servent pour
 * leur lien « Voir le message » : avant, ce lien était une simple ancre « #post-… » qui ne marchait que si le message
 * cité était sur la page affichée.
 * Les droits sont ceux de la page du sujet : un message d'un forum réservé à un autre rôle, ou d'un sujet supprimé
 * (sauf pour un modérateur), donne la page « introuvable » ; un visiteur est d'abord invité à se connecter.
 * Cette page ne montre rien : elle redirige seulement. La page `/forum/post/<identifiant>/edit` reste à part.
 */
import { notFound, redirect } from "next/navigation";
import { getActiveSession } from "@/lib/authGuard";
import { forumAccessWhere, getForumAccess } from "@/lib/forumAccess";
import { forumPostHrefFor } from "@/lib/forumPostLink";
import { prisma } from "@/lib/prisma";
import { isModerator } from "@/lib/roles";

export const dynamic = "force-dynamic";

export default async function ForumPostPermalink({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [session, { roles }] = await Promise.all([getActiveSession(), getForumAccess()]);

  const post = await prisma.post.findFirst({
    where: {
      id,
      // Un sujet supprimé (carte 165) n'est montré qu'aux modérateurs, comme sur la page du sujet
      topic: { forum: forumAccessWhere(roles), ...(isModerator(session?.user?.role) ? {} : { isDeleted: false }) },
    },
    select: { id: true, topicId: true, createdAt: true },
  });

  if (!post) {
    if (!session?.user?.id) redirect(`/auth/login?callbackUrl=${encodeURIComponent(`/forum/post/${id}`)}`);
    notFound();
  }

  redirect(await forumPostHrefFor(post.topicId, post));
}
