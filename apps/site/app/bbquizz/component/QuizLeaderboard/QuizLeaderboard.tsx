/*
 * QuizLeaderboard component
 * Displays the best players and streaks.
 */
"use client";

import React, { useState, useEffect } from "react";
import PremiumCard from "@/common/components/PremiumCard/PremiumCard";
import { getQuizLeaderboard } from "../../actions";
import UserAvatar from "@/common/components/UserAvatar/UserAvatar";
import ToggleButton from "@/common/components/Button/ToggleButton";
import { Trophy, Calendar, Globe, Zap, Loader2 } from "lucide-react";
import "./QuizLeaderboard.css";

export default function QuizLeaderboard() {
  const [activeTab, setActiveTab ] = useState<"daily" | "weekly" | "alltime">("daily");
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await getQuizLeaderboard(activeTab);
      setData(res || []);
      setLoading(false);
    }
    load();
  }, [activeTab]);

  return (
    <div className="quiz-leaderboard">
      <div className="leaderboard-tabs">
        <ToggleButton 
          active={activeTab === "daily"} 
          onClick={() => setActiveTab("daily")}
          icon={<Calendar size={14} />}
          size="sm"
        >
          Du jour
        </ToggleButton>
        <ToggleButton 
          active={activeTab === "weekly"} 
          onClick={() => setActiveTab("weekly")}
          icon={<Globe size={14} />}
          size="sm"
        >
          Semaine
        </ToggleButton>
        <ToggleButton 
          active={activeTab === "alltime"} 
          onClick={() => setActiveTab("alltime")}
          icon={<Trophy size={14} />}
          size="sm"
        >
          Panthéon
        </ToggleButton>
      </div>

      <PremiumCard className="leaderboard-card">
        {loading ? (
          <div className="loader-container">
            <Loader2 className="animate-spin size-8 text-primary" />
          </div>
        ) : data.length === 0 ? (
          <div className="empty-state">
            Aucun score enregistré pour cette période. Soyez le premier !
          </div>
        ) : (
          <div className="leaderboard-list">
            {data.map((item, index) => {
              const user = ("user" in item) ? item.user : item;
              const score = ("score" in item) ? item.score : (item as any).quizBestScore;
              const streak = ("user" in item) ? item.user.quizStreak : item.quizStreak;
              
              return (
                <div key={item.id || user.id} className="leaderboard-item">
                  <div className="rank">#{index + 1}</div>
                  <UserAvatar image={user.image} name={user.name} size={40} />
                  <div className="user-info">
                    <span className="user-name">{user.name}</span>
                    {streak > 0 && (
                      <span className="streak-badge">
                        <Zap size={12} /> {streak} jours d'affilée
                      </span>
                    )}
                  </div>
                  <div className="user-score">{score} pts</div>
                </div>
              );
            })}
          </div>
        )}
      </PremiumCard>
    </div>
  );
}
