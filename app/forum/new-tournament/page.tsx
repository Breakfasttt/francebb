import { auth } from "@/auth";
import { isModerator } from "@/lib/roles";
import { ArrowLeft, Trophy, Calendar, MapPin, Users, Coins, Monitor, Shield, Home, Utensils, BedDouble, Sun } from "lucide-react";
import Link from "next/link";
import BackButton from "@/common/components/BackButton/BackButton";
import "../page.css";
import ForumBreadcrumbs from "@/app/forum/component/ForumBreadcrumbs";
import { notFound, redirect } from "next/navigation";
import { createTopic } from "../actions";
import { prisma } from "@/lib/prisma";
import BBCodeEditor from "@/common/components/BBCodeEditor/BBCodeEditor";
import TitleInputWithSmiley from "@/app/forum/component/TitleInputWithSmiley";
import { parseInlineBBCode } from "@/lib/bbcode";
import TournamentForm from "@/app/forum/component/TournamentForm";

/**
 * Page de création d'un sujet de tournoi.
 */

export default async function NewTournamentPage({ searchParams }: { searchParams: Promise<{ forumId?: string }> }) {
  const { forumId } = await searchParams;
  if (!forumId) notFound();

  const forum = await prisma.forum.findUnique({
    where: { id: forumId },
    include: {
      category: true,
      parentForum: {
        include: { category: true }
      }
    }
  });

  if (!forum || !forum.isTournamentForum) notFound();

  const session = await auth();
  if (!session?.user?.id) {
    redirect("/forum");
  }

  const userCanStick = isModerator(session.user.role);

  // Charger toutes les données de référence nécessaires
  const [franceRegions, gameEditions, departments, tournamentTypes, platforms, coachRegions] = await Promise.all([
    prisma.referenceData.findMany({ where: { group: 'REGION_FRANCE', isActive: true }, orderBy: { order: 'asc' } }),
    prisma.referenceData.findMany({ where: { group: 'GAME_EDITION', isActive: true }, orderBy: { order: 'asc' } }),
    prisma.referenceData.findMany({ where: { group: 'DEPARTEMENT_FRANCE', isActive: true }, orderBy: { order: 'asc' } }),
    prisma.referenceData.findMany({ where: { group: 'TOURNAMENT_TYPE', isActive: true }, orderBy: { order: 'asc' } }),
    prisma.referenceData.findMany({ where: { group: 'PLATFORM', isActive: true }, orderBy: { order: 'asc' } }),
    prisma.referenceData.findMany({ where: { group: 'COACH_REGION', isActive: true }, orderBy: { order: 'asc' } }),
  ]);

  const breadcrumbs = [];
  if (forum.parentForum) {
    if (forum.parentForum.category) breadcrumbs.push({ label: forum.parentForum.category.name, isCategory: true });
    breadcrumbs.push({ label: forum.parentForum.name, href: `/forum/${forum.parentForumId}` });
  } else if (forum.category) {
    breadcrumbs.push({ label: forum.category.name, isCategory: true });
  }
  breadcrumbs.push({ label: forum.name, href: `/forum/${forum.id}` });
  breadcrumbs.push({ label: "Annoncer un tournoi" });

  return (
    <main className="container forum-container">
      <header className="page-header" style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '1.5rem' }}>
        <BackButton href={`/forum/${forumId}`} title="Retour au forum" style={{ position: 'absolute', left: 0 }} />
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ margin: 0 }}>Annoncer un <span>tournoi</span></h1>
          <p style={{ color: 'var(--text-secondary)', margin: '0.5rem 0 0' }}>Dans le forum : <strong dangerouslySetInnerHTML={{ __html: parseInlineBBCode(forum.name) }} /></p>
        </div>
      </header>
 
      <ForumBreadcrumbs items={breadcrumbs} />

      <TournamentForm 
        forumId={forumId}
        userCanStick={userCanStick}
        referenceData={{
          franceRegions,
          gameEditions,
          departments,
          tournamentTypes,
          platforms,
          coachRegions
        }}
      />
   </main>
  );
}
