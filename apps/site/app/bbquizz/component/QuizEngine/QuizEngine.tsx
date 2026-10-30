/*
 * QuizEngine component for the Blood Bowl Quiz.
 * Affiche une partie : chronomètres, jokers, réponses. Le serveur tient la partie (app/bbquizz/actions.ts) :
 * il envoie une question à la fois sans la bonne réponse, calcule les points et enregistre le score final.
 * Ce composant ne fait qu'afficher ce que le serveur renvoie.
 */
"use client";

import PremiumCard from "@/common/components/PremiumCard/PremiumCard";
import Tooltip from "@/common/components/Tooltip/Tooltip";
import { isModerator } from "@/lib/roles";
import { Award, Brain, Check, Edit2, FastForward, Gamepad2, Loader2, MinusCircle, Plus, PlusCircle, RefreshCcw, Scissors, Trophy, Users, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "@bbfrance/ui";
import {
  answerQuizQuestion,
  applyQuizCommunity,
  applyQuizFiftyFifty,
  getQuizQuestion,
  skipQuizQuestion,
  startQuizGame,
  type QuizFinalResult,
  type QuizQuestionPayload,
} from "../../actions";
import { QUIZ_ANSWER_TIME, QUIZ_READ_TIME, translateCategory } from "../../utils";
import "./QuizEngine.css";
import "./QuizEngine-mobile.css";
import CTAButton from "@/common/components/Button/CTAButton";
import AdminButton from "@/common/components/Button/AdminButton";
import ExplainButton from "@/common/components/Button/ExplainButton";

type Phase = "start" | "loading" | "reading" | "answering" | "result" | "finished";

/** Ce que le serveur révèle après une réponse. */
interface Reveal {
  correctIndex: number;
  explanation: string | null;
  points: number;
}

export default function QuizEngine({ userRole }: { userRole?: string | null }) {
  const [payload, setPayload] = useState<QuizQuestionPayload | null>(null);
  const [phase, setPhaseState] = useState<Phase>("start");
  const [timeLeft, setTimeLeft] = useState(QUIZ_READ_TIME);
  const [score, setScore] = useState(0);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [reveal, setReveal] = useState<Reveal | null>(null);
  const [jokers, setJokers] = useState({ fiftyFifty: true, community: true, skip: true });
  const [hiddenOptions, setHiddenOptions] = useState<number[]>([]);
  const [communityStats, setCommunityStats] = useState<number[] | null>(null);
  const [finalResult, setFinalResult] = useState<QuizFinalResult | null>(null);

  // Valeurs lues par le chronomètre et les actions sans attendre un nouveau rendu
  const gameIdRef = useRef<string | null>(null);
  const phaseRef = useRef<Phase>("start");
  const phaseEndRef = useRef(0);
  const pendingFinalRef = useRef<QuizFinalResult | null>(null);

  const router = useRouter();
  const isModo = isModerator(userRole);

  const setPhase = (next: Phase) => {
    phaseRef.current = next;
    setPhaseState(next);
  };

  const openManagement = (mode: "suggest" | "validate" | "edit") => {
    if (mode === "suggest") router.push("/bbquizz/proposer");
    if (mode === "validate") router.push("/bbquizz/valider");
    if (mode === "edit") router.push("/bbquizz/editer");
  };

  const showFinished = (result: QuizFinalResult) => {
    setFinalResult(result);
    setScore(result.score);
    setTotalCorrect(result.correct);
    setPhase("finished");
    toast.success("Score enregistré !");
  };

  /** Demande la question en cours au serveur, puis lance les 5 secondes de lecture. */
  const loadQuestion = async () => {
    const gameId = gameIdRef.current;
    if (!gameId) return;
    setPhase("loading");
    const next = await getQuizQuestion(gameId);
    if (!next) {
      toast.error("Erreur lors du chargement de la question");
      setPhase("start");
      return;
    }
    setPayload(next);
    setSelectedOption(null);
    setReveal(null);
    setHiddenOptions([]);
    setCommunityStats(null);
    phaseEndRef.current = Date.now() + QUIZ_READ_TIME * 1000;
    setTimeLeft(QUIZ_READ_TIME);
    setPhase("reading");
  };

  const startQuiz = async () => {
    setPhase("loading");
    const game = await startQuizGame();
    if (!game) {
      toast.error("Erreur lors du chargement des questions");
      setPhase("start");
      return;
    }
    gameIdRef.current = game.gameId;
    pendingFinalRef.current = null;
    setScore(0);
    setTotalCorrect(0);
    setFinalResult(null);
    setJokers({ fiftyFifty: true, community: true, skip: true });
    await loadQuestion();
  };

  /** Envoie la réponse (-1 si le temps est écoulé) ; le serveur renvoie les points et la bonne réponse. */
  const handleAnswer = async (index: number) => {
    const gameId = gameIdRef.current;
    if (phaseRef.current !== "answering" || !gameId) return;
    setSelectedOption(index);
    setPhase("result");

    const result = await answerQuizQuestion(gameId, index);
    if (!result) {
      toast.error("Votre réponse n'a pas pu être enregistrée");
      return;
    }
    setReveal({ correctIndex: result.correctIndex, explanation: result.explanation, points: result.points });
    setScore(result.score);
    setTotalCorrect(result.correct);
    pendingFinalRef.current = result.finished;
  };

  const handleNext = () => {
    if (pendingFinalRef.current) {
      showFinished(pendingFinalRef.current);
      return;
    }
    void loadQuestion();
  };

  // Chronomètre : compte à partir de l'heure de fin de la phase, pour rester juste même si l'onglet ralentit
  useEffect(() => {
    if (phase !== "reading" && phase !== "answering") return;
    const timer = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((phaseEndRef.current - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining > 0) return;
      if (phaseRef.current === "reading") {
        phaseEndRef.current = Date.now() + QUIZ_ANSWER_TIME * 1000;
        setTimeLeft(QUIZ_ANSWER_TIME);
        setPhase("answering");
      } else if (phaseRef.current === "answering") {
        void handleAnswer(-1);
      }
    }, 250);
    return () => clearInterval(timer);
    // handleAnswer ne lit que des références (gameIdRef, phaseRef) : pas besoin de relancer le chronomètre
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Passage automatique à la question suivante 5 secondes après l'affichage de la bonne réponse
  useEffect(() => {
    if (phase !== "result" || !reveal) return;
    const autoTimer = setTimeout(() => handleNext(), 5000);
    return () => clearTimeout(autoTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, reveal]);

  // Jokers : chacun est vérifié et décompté par le serveur
  const handleFiftyFifty = async () => {
    const gameId = gameIdRef.current;
    if (!jokers.fiftyFifty || phaseRef.current !== "answering" || !gameId) return;
    setJokers(prev => ({ ...prev, fiftyFifty: false }));
    const toHide = await applyQuizFiftyFifty(gameId);
    if (!toHide) return;
    setHiddenOptions(toHide);
    toast.success("50/50 activé !");
  };

  const handleCommunity = async () => {
    const gameId = gameIdRef.current;
    if (!jokers.community || phaseRef.current !== "answering" || !gameId) return;
    setJokers(prev => ({ ...prev, community: false }));
    const stats = await applyQuizCommunity(gameId);
    if (!stats) return;
    setCommunityStats(stats);
    toast.success("L'avis de la communauté est arrivé !");
  };

  const handleSkip = async () => {
    const gameId = gameIdRef.current;
    const current = phaseRef.current;
    if (!jokers.skip || (current !== "reading" && current !== "answering") || !gameId) return;
    setJokers(prev => ({ ...prev, skip: false }));
    setPhase("loading");
    const result = await skipQuizQuestion(gameId);
    if (!result) {
      toast.error("Impossible de passer cette question");
      setPhase("start");
      return;
    }
    toast("Question passée !");
    if (result.finished) showFinished(result.finished);
    else void loadQuestion();
  };

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
              <CTAButton onClick={startQuiz} icon={<Gamepad2 size={18} />}>
                Commencer le quizz !
              </CTAButton>

              <div className="quiz-admin-actions">
                <ExplainButton onClick={() => openManagement("suggest")} icon={<Plus size={16} />}>
                  Proposer
                </ExplainButton>
                {isModo && (
                  <>
                    <AdminButton onClick={() => openManagement("edit")} icon={<Edit2 size={16} />}>
                      Éditer
                    </AdminButton>
                    <AdminButton onClick={() => openManagement("validate")} icon={<Check size={16} />}>
                      Validation
                    </AdminButton>
                  </>
                )}
              </div>
            </div>
          </PremiumCard>
        </div>

      </div>
    );
  }

  if (phase === "loading" && !payload) {
    return (
      <div className="quiz-container fixed-size">
        <div className="quiz-loading">
          <Loader2 className="animate-spin size-12 text-primary" />
          <p>Préparation du terrain de Blood Bowl...</p>
        </div>
      </div>
    );
  }

  if (phase === "finished" && finalResult) {
    return (
      <div className="quiz-container fixed-size">
        <div className="quiz-finished">
          <PremiumCard className="quiz-result-card fixed-height">
            <Award className="size-16 text-yellow-500 mb-4" />
            <h2>Quizz Terminé !</h2>
            <div className="final-score">
              <Trophy className="text-yellow-400" />
              <span>{finalResult.score} points</span>
            </div>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="label">Réponses correctes</span>
                <span className="value">{finalResult.correct} / {finalResult.total}</span>
              </div>
              <div className="stat-item">
                <span className="label">Temps total</span>
                <span className="value">{finalResult.duration}s</span>
              </div>
            </div>
            <div className="quiz-finished-actions">
              <CTAButton
                onClick={() => window.location.reload()}
                icon={<RefreshCcw size={18} />}
              >
                Recommencer une partie
              </CTAButton>
            </div>
          </PremiumCard>
        </div>
      </div>
    );
  }

  if (!payload) return null;

  const currentQ = payload.question;
  const maxTime = phase === "reading" ? QUIZ_READ_TIME : QUIZ_ANSWER_TIME;
  const timeProgress = (timeLeft / maxTime) * 100;
  const lastPointsWon = reveal?.points ?? null;

  return (
    <div className="quiz-container fixed-size">
      <div className="quiz-engine">
        <div className="quiz-header">
          <div className="quiz-progress">
            <div className="progress-labels">
              <span>Question {payload.index + 1} / {payload.total}</span>
              <span className={`timer-text ${phase}`}>{timeLeft}s</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${((payload.index + 1) / payload.total) * 100}%` }}></div>
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

          <div className={`options-grid ${phase === "reading" || phase === "loading" ? "hidden" : ""}`}>
            {currentQ.options.map((option, idx) => {
              const isHidden = hiddenOptions.includes(idx);
              const isCorrect = reveal !== null && idx === reveal.correctIndex;
              const isSelected = selectedOption === idx;

              let className = "option-btn";
              if (phase === "result") {
                if (isCorrect) className += " correct";
                else if (isSelected && reveal) className += " incorrect";
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
              {reveal === null && <Loader2 className="animate-spin size-5" />}
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
              {reveal?.explanation && (
                <p className="explanation-text">{reveal.explanation}</p>
              )}
            </div>
          )}

          <div className="quiz-footer-actions">
            <div className="quiz-jokers">
              <Tooltip text="50/50 : Supprime deux mauvaises réponses">
                <button
                  className="joker-btn"
                  aria-label="Joker 50/50"
                  disabled={!jokers.fiftyFifty || phase !== "answering"}
                  onClick={handleFiftyFifty}
                >
                  <Scissors className="size-5" />
                  <span className="joker-count">{jokers.fiftyFifty ? 1 : 0}</span>
                </button>
              </Tooltip>
              <Tooltip text="Avis mondial : Affiche le choix de la communauté">
                <button
                  className="joker-btn"
                  aria-label="Joker appel à la communauté"
                  disabled={!jokers.community || phase !== "answering"}
                  onClick={handleCommunity}
                >
                  <Users className="size-5" />
                  <span className="joker-count">{jokers.community ? 1 : 0}</span>
                </button>
              </Tooltip>
              <Tooltip text="Sauter : Passe à la question suivante (1 seule fois)">
                <button
                  className="joker-btn"
                  aria-label="Joker passer la question"
                  disabled={!jokers.skip || (phase !== "reading" && phase !== "answering")}
                  onClick={handleSkip}
                >
                  <Zap className="size-5" />
                  <span className="joker-count">{jokers.skip ? 1 : 0}</span>
                </button>
              </Tooltip>
            </div>

            {phase === "result" && reveal && (
              <CTAButton onClick={handleNext} icon={<FastForward size={18} />}>
                Continuer
              </CTAButton>
            )}
          </div>
        </PremiumCard>
      </div>
    </div>
  );
}
