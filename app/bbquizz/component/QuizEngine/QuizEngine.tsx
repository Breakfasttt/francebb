/*
 * QuizEngine component for the Blood Bowl Quiz.
 * Handles game logic, timers, and scoring.
 */
"use client";

import React, { useState, useEffect, useCallback } from "react";
import PremiumCard from "@/common/components/PremiumCard/PremiumCard";
import { getRandomQuizQuestions, submitQuizAttempt, getCommunityStats } from "../../actions";
import { toast } from "react-hot-toast";
import Tooltip from "@/common/components/Tooltip/Tooltip";
import { Loader2, Zap, Users, Scissors, FastForward, Award, Trophy, Brain, PlusCircle, MinusCircle, Plus, Edit2, Check } from "lucide-react";
import "./QuizEngine.css";
import { useRouter } from "next/navigation";
import { isModerator } from "@/lib/roles";
import { translateCategory } from "../../utils";

interface Question {
  category: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

const READ_TIME = 5;
const ANSWER_TIME = 30;

export default function QuizEngine({ session }: { session: any }) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(READ_TIME);
  const [phase, setPhase] = useState<"loading" | "start" | "reading" | "answering" | "result" | "finished">("loading");
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [jokers, setJokers] = useState({
    fiftyFifty: true,
    community: true,
    skip: true,
  });
  const [hiddenOptions, setHiddenOptions] = useState<number[]>([]);
  const [communityStats, setCommunityStats] = useState<number[] | null>(null);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastPointsWon, setLastPointsWon] = useState<number | null>(null);

  const router = useRouter();
  const isModo = isModerator(session?.user?.role);

  const openManagement = (mode: "suggest" | "validate" | "edit") => {
    if (mode === "suggest") router.push("/bbquizz/proposer");
    if (mode === "validate") router.push("/bbquizz/valider");
    if (mode === "edit") router.push("/bbquizz/editer");
  };

  // Initialize quiz
  useEffect(() => {
    async function init() {
      const q = await getRandomQuizQuestions();
      if (q) {
        setQuestions(q);
        setPhase("start");
      } else {
        toast.error("Erreur lors du chargement des questions");
      }
    }
    init();
  }, []);

  const startQuiz = () => {
    setPhase("reading");
    setTimeLeft(READ_TIME);
  };

  // Timer logic
  useEffect(() => {
    if (phase === "loading" || phase === "start" || phase === "finished" || phase === "result") return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (phase === "reading") {
            setPhase("answering");
            return ANSWER_TIME;
          } else if (phase === "answering") {
            // Use setTimeout to avoid 'Cannot update a component while rendering' error
            setTimeout(() => handleAnswer(-1), 0);
            return 0;
          }
        }
        return prev - 1;
      });
      setSessionDuration((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [phase]);

  const handleAnswer = useCallback((index: number) => {
    if (phase !== "answering") return;

    setSelectedOption(index);
    setPhase("result");

    const currentQ = questions[currentIndex];
    const isCorrect = index === currentQ.correctIndex;

    if (isCorrect) {
      const bonus = timeLeft;
      const points = 100 + bonus;
      setScore((prev) => prev + points);
      setTotalCorrect((prev) => prev + 1);
      setLastPointsWon(points);
    } else {
      setScore((prev) => Math.max(0, prev - 25));
      setLastPointsWon(-25);
    }
  }, [currentIndex, questions, phase, timeLeft]);

  const handleNext = useCallback(() => {
    if (currentIndex >= questions.length - 1) {
      finishQuiz();
    } else {
      setCurrentIndex((prev) => prev + 1);
      setPhase("reading");
      setTimeLeft(READ_TIME);
      setSelectedOption(null);
      setHiddenOptions([]);
      setCommunityStats(null);
      setLastPointsWon(null);
    }
  }, [currentIndex, questions.length]);

  // Auto-advance logic in result phase
  useEffect(() => {
    if (phase !== "result") return;
    
    const autoTimer = setTimeout(() => {
      handleNext();
    }, 5000); // 5 secondes d'attente avant la suite
    
    return () => clearTimeout(autoTimer);
  }, [phase, handleNext]);

  const finishQuiz = async () => {
    setPhase("finished");
    setIsSubmitting(true);
    const result = await submitQuizAttempt({
      score,
      totalQuestions: questions.length,
      correctAnswers: totalCorrect,
      duration: sessionDuration,
      jokersUsed: [], // Could be improved to track which were used
    });
    setIsSubmitting(false);
    
    if (result) {
      setTimeout(() => toast.success("Score enregistré !"), 0);
    }
  };

  // Jokers
  const useFiftyFifty = () => {
    if (!jokers.fiftyFifty || phase !== "answering") return;
    const currentQ = questions[currentIndex];
    const incorrectIndices = [0, 1, 2, 3].filter(i => i !== currentQ.correctIndex);
    const toHide = incorrectIndices.sort(() => 0.5 - Math.random()).slice(0, 2);
    setHiddenOptions(toHide);
    setJokers(prev => ({ ...prev, fiftyFifty: false }));
    toast.success("50/50 activé !");
  };

  const useCommunity = async () => {
    if (!jokers.community || phase !== "answering") return;
    const stats = await getCommunityStats(questions[currentIndex].question);
    setCommunityStats(stats || [25, 25, 25, 25]);
    setJokers(prev => ({ ...prev, community: false }));
    toast.success("L'avis de la communauté est arrivé !");
  };

  const useSkip = () => {
    if (!jokers.skip) return;
    setJokers(prev => ({ ...prev, skip: false }));
    toast("Question passée !");
    handleNext();
  };

  if (phase === "loading") {
    return (
      <div className="quiz-container fixed-size">
        <div className="quiz-loading">
          <Loader2 className="animate-spin size-12 text-primary" />
          <p>Préparation du terrain de Blood Bowl...</p>
        </div>
      </div>
    );
  }

  if (phase === "start") {
    return (
      <div className="quiz-container fixed-size">
        <div className="quiz-start">
          <PremiumCard className="quiz-welcome-card fixed-height">
            <Brain className="size-16 text-primary mb-4" />
            <h1>Prêt pour le quizz ?</h1>
            <p>
              Testez vos connaissances sur l'univers de Blood Bowl. 
              20 questions, des jokers et le Panthéon à la clé.
            </p>
            <ul className="quiz-rules-list">
              <li>5s pour lire, 30s pour répondre</li>
              <li>+100 pts par bonne réponse + bonus temps</li>
              <li>-25 pts par mauvaise réponse</li>
            </ul>
            <div className="quiz-start-actions">
              <button className="quiz-btn primary" onClick={startQuiz}>
                Commencer le match !
              </button>
              
              <div className="quiz-admin-actions">
                <button className="quiz-btn outline" onClick={() => openManagement("suggest")}>
                  <Plus size={16} /> Proposer
                </button>
                {isModo && (
                  <>
                    <button className="quiz-btn outline" onClick={() => openManagement("edit")}>
                      <Edit2 size={16} /> Éditer
                    </button>
                    <button className="quiz-btn outline" onClick={() => openManagement("validate")}>
                      <Check size={16} /> Validation
                    </button>
                  </>
                )}
              </div>
            </div>
          </PremiumCard>
        </div>

      </div>
    );
  }

  if (phase === "finished") {
    return (
      <div className="quiz-container fixed-size">
        <div className="quiz-finished">
          <PremiumCard className="quiz-result-card fixed-height">
            <Award className="size-16 text-yellow-500 mb-4" />
            <h2>Match Terminé !</h2>
            <div className="final-score">
              <Trophy className="text-yellow-400" />
              <span>{score} points</span>
            </div>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="label">Réponses correctes</span>
                <span className="value">{totalCorrect} / {questions.length}</span>
              </div>
              <div className="stat-item">
                <span className="label">Temps total</span>
                <span className="value">{sessionDuration}s</span>
              </div>
            </div>
            <button className="quiz-btn primary mt-8" onClick={() => window.location.reload()}>
              Recommencer
            </button>
          </PremiumCard>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const maxTime = phase === "reading" ? READ_TIME : ANSWER_TIME;
  const timeProgress = (timeLeft / maxTime) * 100;

  return (
    <div className="quiz-container fixed-size">
      <div className="quiz-engine">
        <div className="quiz-header">
          <div className="quiz-progress">
            <div className="progress-labels">
              <span>Question {currentIndex + 1} / {questions.length}</span>
              <span className={`timer-text ${phase}`}>{timeLeft}s</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}></div>
            </div>
            {(phase === "reading" || phase === "answering") && (
              <div className="timer-bar">
                <div className={`timer-fill ${phase}`} style={{ width: `${timeProgress}%` }}></div>
              </div>
            )}
          </div>
          <div className="quiz-score">
            Score: {score}
          </div>
        </div>

        <PremiumCard className="quiz-question-card fixed-height">
          <div className="category-tag">
            <Brain className="size-4" />
            {translateCategory(currentQ.category)}
          </div>

          <h1 className="question-text">{currentQ.question}</h1>

          <div className={`options-grid ${phase === "reading" ? "hidden" : ""}`}>
            {currentQ.options.map((option, idx) => {
              const isHidden = hiddenOptions.includes(idx);
              const isCorrect = idx === currentQ.correctIndex;
              const isSelected = selectedOption === idx;
              
              let className = "option-btn";
              if (phase === "result") {
                if (isCorrect) className += " correct";
                else if (isSelected) className += " incorrect";
                else className += " disabled";
              } else if (isHidden) {
                className += " invisible";
              }

              return (
                <button
                  key={idx}
                  className={className}
                  disabled={phase !== "answering" || isHidden}
                  onClick={() => handleAnswer(idx)}
                >
                  <span className="option-letter">{String.fromCharCode(65 + idx)}</span>
                  <span className="option-text">{option}</span>
                  {communityStats && (
                    <div className="community-stat" style={{ width: `${communityStats[idx]}%` }}>
                      {communityStats[idx]}%
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {phase === "result" && (
            <div className="explanation-section animate-fade-in">
              {lastPointsWon !== null && (
                <div className={`points-feedback ${lastPointsWon > 0 ? 'plus' : 'minus'}`}>
                  {lastPointsWon > 0 ? (
                    <PlusCircle className="size-5" />
                  ) : (
                    <MinusCircle className="size-5" />
                  )}
                  <span>{lastPointsWon > 0 ? `+${lastPointsWon}` : lastPointsWon} points</span>
                </div>
              )}
              {currentQ.explanation && (
                <p className="explanation-text">{currentQ.explanation}</p>
              )}
            </div>
          )}

          <div className="quiz-footer-actions">
            <div className="quiz-jokers">
              <Tooltip text="50/50 : Supprime deux mauvaises réponses">
                <button 
                  className="joker-btn" 
                  disabled={!jokers.fiftyFifty || phase !== "answering"} 
                  onClick={useFiftyFifty}
                >
                  <Scissors className="size-5" />
                  <span className="joker-count">{jokers.fiftyFifty ? 1 : 0}</span>
                </button>
              </Tooltip>
              <Tooltip text="Avis mondial : Affiche le choix de la communauté">
                <button 
                  className="joker-btn" 
                  disabled={!jokers.community || phase !== "answering"} 
                  onClick={useCommunity}
                >
                  <Users className="size-5" />
                  <span className="joker-count">{jokers.community ? 1 : 0}</span>
                </button>
              </Tooltip>
              <Tooltip text="Sauter : Passe à la question suivante (1 seule fois)">
                <button 
                  className="joker-btn" 
                  disabled={!jokers.skip} 
                  onClick={useSkip}
                >
                  <Zap className="size-5" />
                  <span className="joker-count">{jokers.skip ? 1 : 0}</span>
                </button>
              </Tooltip>
            </div>

            {phase === "result" && (
              <button className="quiz-btn primary next-btn" onClick={handleNext}>
                Continuer <FastForward className="size-4 ml-2" />
              </button>
            )}
          </div>
        </PremiumCard>
      </div>
    </div>
  );
}
