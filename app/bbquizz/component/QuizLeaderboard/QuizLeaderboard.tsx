/*
 * QuizLeaderboard component
 * Displays the best players and streaks.
 */
"use client";

import React, { useState, useEffect } from "react";
import PremiumCard from "@/common/components/PremiumCard/PremiumCard";
import { getQuizLeaderboard } from "../../actions";
import UserAvatar from "@/common/components/UserAvatar/UserAvatar";
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
        <button 
          className={activeTab === "daily" ? "active" : ""} 
          onClick={() => setActiveTab("daily")}
        >
          <Calendar className="size-4" /> Du jour
        </button>
        <button 
          className={activeTab === "weekly" ? "active" : ""} 
          onClick={() => setActiveTab("weekly")}
        >
          <Globe className="size-4" /> De la semaine
        </button>
        <button 
          className={activeTab === "alltime" ? "active" : ""} 
          onClick={() => setActiveTab("alltime")}
        >
          <Trophy className="size-4" /> Panthéon
        </button>
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
                        <Zap className="size-3" /> {streak} d d'affilée
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
