/*
 * Classement de BBQuizz (refonte, carte 098, ADR 0006) : les 10 meilleurs du jour, de la semaine, ou de tous les
 * temps (le « Panthéon »), choisis par trois onglets. Chaque ligne montre le rang, l'avatar, le pseudo, la série de
 * jours joués d'affilée quand elle existe, et le score. Les données viennent de l'action serveur `getQuizLeaderboard`,
 * inchangée.
 */
"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Calendar, Globe, Trophy, Zap } from "lucide-react";
import { Avatar, Card, CardHeader, CardTitle, EmptyState, Skeleton, Tabs, TabsList, TabsTrigger, cn } from "@bbfrance/ui";
import { getQuizLeaderboard } from "../actions";

type Period = "daily" | "weekly" | "alltime";
type LeaderboardRow = Awaited<ReturnType<typeof getQuizLeaderboard>>[number];

/** Une ligne du classement, quelle que soit la période (meilleure partie de la période, ou meilleur score du membre). */
interface Entry {
  key: string;
  name: string | null;
  image: string | null;
  streak: number;
  score: number;
}

function toEntry(row: LeaderboardRow): Entry {
  if ("user" in row) {
    return { key: row.id, name: row.user.name, image: row.user.image, streak: row.user.quizStreak, score: row.score };
  }
  return { key: row.id, name: row.name, image: row.image, streak: row.quizStreak, score: row.quizBestScore };
}

const PERIODS: { value: Period; label: string; icon: ReactNode }[] = [
  { value: "daily", label: "Du jour", icon: <Calendar size={16} aria-hidden="true" /> },
  { value: "weekly", label: "Semaine", icon: <Globe size={16} aria-hidden="true" /> },
  { value: "alltime", label: "Panthéon", icon: <Trophy size={16} aria-hidden="true" /> },
];

export default function QuizLeaderboard() {
  const [activeTab, setActiveTab] = useState<Period>("daily");
  const [data, setData] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getQuizLeaderboard(activeTab).then((res) => {
      if (cancelled) return;
      setData((res || []).map(toEntry));
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [activeTab]);

  const changeTab = (value: string) => {
    setLoading(true);
    setActiveTab(value as Period);
  };

  return (
    <Card>
      <CardHeader>
        <Trophy size={18} aria-hidden="true" className="text-bb-accent-text" />
        <CardTitle>Classement</CardTitle>
      </CardHeader>
      <Tabs value={activeTab} onValueChange={changeTab}>
        <TabsList aria-label="Période du classement" className="px-2">
          {PERIODS.map((period) => (
            <TabsTrigger key={period.value} value={period.value} className="flex-1 justify-center px-2">
              {period.icon} {period.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {loading ? (
        <div className="flex flex-col gap-2 p-4" aria-busy="true" aria-label="Chargement du classement">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12" />
          ))}
        </div>
      ) : data.length === 0 ? (
        <EmptyState icon={<Trophy size={32} />} title="Aucun score enregistré pour cette période.">
          Soyez le premier !
        </EmptyState>
      ) : (
        <ol className="m-0 list-none p-0">
          {data.map((entry, index) => (
            <li key={entry.key} className="flex min-h-14 items-center gap-3 border-b border-bb-border px-4 py-2 last:border-b-0">
              <span
                className={cn(
                  "w-7 shrink-0 text-center text-sm font-bold tabular-nums",
                  index < 3 ? "text-bb-rank" : "text-bb-text-muted"
                )}
              >
                #{index + 1}
              </span>
              <Avatar name={entry.name} src={entry.image} size={36} ring={index === 0} />
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate font-semibold text-bb-text">{entry.name}</span>
                {entry.streak > 0 && (
                  <span className="flex items-center gap-1 text-xs text-bb-warning-text">
                    <Zap size={12} aria-hidden="true" /> {entry.streak} jours d&apos;affilée
                  </span>
                )}
              </span>
              <span className="shrink-0 font-bold tabular-nums text-bb-accent-text">{entry.score} pts</span>
            </li>
          ))}
        </ol>
      )}
    </Card>
  );
}
