/*
 * Écran du jeu BBQuizz `/bbquizz` (refonte, carte 098, ADR 0006) : accueil du jeu, partie en cours, écran de fin, et
 * le classement passé par la page (`leaderboard`).
 * Le serveur tient la partie (app/bbquizz/actions.ts) : il envoie une question à la fois sans la bonne réponse, calcule
 * les points et enregistre le score final. Ce composant ne fait qu'afficher ce que le serveur renvoie ; la logique de
 * la partie (phases, chronomètres, jokers) est celle d'avant la refonte, seul l'affichage a changé.
 *
 * Sur ordinateur, le classement est dans une colonne à droite du jeu. Sur téléphone, il passe sous l'accueil du jeu
 * et sous l'écran de fin ; pendant une partie, le titre de la page et le classement sont masqués pour que la question,
 * le chronomètre, le score et les quatre réponses tiennent dans l'écran sans défiler.
 */
"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  Award,
  Brain,
  Check,
  CheckCircle2,
  FastForward,
  Gamepad2,
  Loader2,
  MinusCircle,
  Pencil,
  Plus,
  PlusCircle,
  RefreshCcw,
  Scissors,
  Settings2,
  Sparkles,
  Timer,
  Users,
  XCircle,
  Zap,
} from "lucide-react";
import { ActionMenu, Badge, Button, Card, cn, toast } from "@bbfrance/ui";
import ForumListHeader from "@/app/forum/component/ForumListHeader";
import { isModerator } from "@/lib/roles";
import {
  answerQuizQuestion,
  applyQuizCommunity,
  applyQuizFiftyFifty,
  getQuizQuestion,
  skipQuizQuestion,
  startQuizGame,
  type QuizFinalResult,
  type QuizQuestionPayload,
} from "../actions";
import { QUIZ_ANSWER_TIME, QUIZ_LENGTH, QUIZ_READ_TIME, translateCategory } from "../utils";

type Phase = "start" | "loading" | "reading" | "answering" | "result" | "finished";

/** Ce que le serveur révèle après une réponse. */
interface Reveal {
  correctIndex: number;
  explanation: string | null;
  points: number;
}

/** Titre de bloc sobre (ni majuscules ni italique hérités de l'ancien CSS des titres). */
const blockTitle = "m-0 border-0 p-0 text-xl leading-tight font-bold tracking-normal text-bb-text normal-case not-italic lg:text-2xl";

/** Bouton de joker : sur téléphone, l'icône au-dessus du nom, pour que les trois tiennent sur une ligne. */
const jokerClass = "px-2 max-lg:min-h-14 max-lg:flex-col max-lg:gap-0.5 max-lg:text-sm";

/** Une règle du jeu de l'écran d'accueil, avec son icône. */
function Rule({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <li className="flex items-start gap-3 text-left text-[0.95rem] text-bb-text">
      <span aria-hidden="true" className="mt-0.5 shrink-0 text-bb-accent-text">{icon}</span>
      <span>{children}</span>
    </li>
  );
}

/** Une case de l'écran de fin (« Réponses correctes », « Temps total »). */
function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-bb-md border border-bb-border bg-bb-surface-2 px-3 py-3">
      <dt className="text-sm text-bb-text-muted">{label}</dt>
      <dd className="m-0 text-xl font-bold text-bb-text">{value}</dd>
    </div>
  );
}

export default function QuizEngine({ userRole, leaderboard }: { userRole?: string | null; leaderboard: ReactNode }) {
  const [payload, setPayload] = useState<QuizQuestionPayload | null>(null);
  const [phase, setPhaseState] = useState<Phase>("start");
  const [timeLeft, setTimeLeft] = useState(QUIZ_READ_TIME);
  const [score, setScore] = useState(0);
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

  const isModo = isModerator(userRole);

  const setPhase = (next: Phase) => {
    phaseRef.current = next;
    setPhaseState(next);
  };

  const showFinished = (result: QuizFinalResult) => {
    setFinalResult(result);
    setScore(result.score);
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

  // Partie en cours : sur téléphone, le titre de la page et le classement laissent toute la place au jeu
  const playing = phase !== "start" && phase !== "finished";

  return (
    <div className="mx-auto w-full max-w-[1100px] px-3 pb-10 font-bb-sans text-base text-bb-text lg:px-6">
      <div className={cn(playing && "max-lg:hidden")}>
        <ForumListHeader
          title="Quizz Blood Bowl"
          subtitle="Testez vos connaissances sur l'univers de Blood Bowl."
          backHref="/"
          backTitle="Retour à l'accueil"
        >
          <div className="flex w-full items-center gap-2 lg:w-auto">
            <Button asChild variant="secondary" size="tap" className="max-lg:flex-1">
              <Link href="/bbquizz/proposer">
                <Plus size={18} aria-hidden="true" /> Proposer une question
              </Link>
            </Button>
            {isModo && (
              <ActionMenu
                label="Gestion du quizz"
                title="Gestion du quizz"
                linkComponent={Link}
                trigger={
                  <span className="inline-flex items-center gap-2 px-3 text-[0.95rem] font-semibold">
                    <Settings2 size={18} aria-hidden="true" /> Gestion
                  </span>
                }
                triggerClassName="border border-solid border-bb-border bg-bb-surface-2 text-bb-text"
                items={[
                  { label: "Valider les propositions", icon: <Check size={18} aria-hidden="true" />, href: "/bbquizz/valider" },
                  { label: "Éditer les questions", icon: <Pencil size={18} aria-hidden="true" />, href: "/bbquizz/editer" },
                ]}
              />
            )}
          </div>
        </ForumListHeader>
      </div>

      <div className={cn("flex flex-col gap-6 lg:grid lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start", playing && "max-lg:pt-3")}>
        <section aria-label="Partie" className="min-w-0">
          {phase === "start" && (
            <Card className="flex flex-col items-center gap-5 px-4 py-6 text-center lg:px-8 lg:py-8">
              <Brain size={48} aria-hidden="true" className="text-bb-accent-text" />
              <div className="flex flex-col gap-2">
                <h2 className={blockTitle}>Prêt pour le quizz ?</h2>
                <p className="m-0 text-[0.95rem] text-bb-text-muted">
                  {QUIZ_LENGTH} questions sur Blood Bowl, des jokers et le Panthéon à la clé.
                </p>
              </div>
              <ul className="m-0 flex w-full max-w-md list-none flex-col gap-3 p-0">
                <Rule icon={<Timer size={20} />}>
                  {QUIZ_READ_TIME} secondes pour lire la question, puis {QUIZ_ANSWER_TIME} secondes pour répondre.
                </Rule>
                <Rule icon={<PlusCircle size={20} />}>
                  100 points par bonne réponse, plus 1 point par seconde restante.
                </Rule>
                <Rule icon={<MinusCircle size={20} />}>25 points de moins par mauvaise réponse.</Rule>
                <Rule icon={<Sparkles size={20} />}>
                  Trois jokers, une fois chacun par partie : 50/50, avis de la communauté et passer la question.
                </Rule>
              </ul>
              <Button type="button" variant="primary" size="tap" className="w-full lg:w-auto lg:px-8" onClick={startQuiz}>
                <Gamepad2 size={20} aria-hidden="true" /> Commencer le quizz !
              </Button>
            </Card>
          )}

          {phase === "loading" && !payload && (
            <Card className="flex flex-col items-center gap-3 px-4 py-12 text-center" aria-busy="true">
              <Loader2 size={40} aria-hidden="true" className="animate-spin text-bb-accent-text" />
              <p className="m-0 text-bb-text-muted">Préparation du terrain de Blood Bowl…</p>
            </Card>
          )}

          {phase === "finished" && finalResult && (
            <Card className="flex flex-col items-center gap-5 px-4 py-6 text-center lg:px-8 lg:py-8">
              <Award size={48} aria-hidden="true" className="text-bb-rank" />
              <h2 className={blockTitle}>Quizz terminé !</h2>
              <p className="m-0 text-3xl font-bold text-bb-accent-text">{finalResult.score} points</p>
              <dl className="m-0 grid w-full max-w-md grid-cols-2 gap-3">
                <Stat label="Réponses correctes" value={`${finalResult.correct} / ${finalResult.total}`} />
                <Stat label="Temps total" value={`${finalResult.duration} s`} />
              </dl>
              <Button type="button" variant="primary" size="tap" className="w-full lg:w-auto lg:px-8" onClick={() => window.location.reload()}>
                <RefreshCcw size={20} aria-hidden="true" /> Rejouer
              </Button>
            </Card>
          )}

          {playing && payload && (
            <GameCard
              payload={payload}
              phase={phase}
              timeLeft={timeLeft}
              score={score}
              selectedOption={selectedOption}
              reveal={reveal}
              hiddenOptions={hiddenOptions}
              communityStats={communityStats}
              jokers={jokers}
              onAnswer={(index) => void handleAnswer(index)}
              onNext={handleNext}
              onFiftyFifty={handleFiftyFifty}
              onCommunity={handleCommunity}
              onSkip={handleSkip}
            />
          )}
        </section>

        <aside aria-label="Classement" className={cn("min-w-0", playing && "max-lg:hidden")}>
          {leaderboard}
        </aside>
      </div>
    </div>
  );
}

interface GameCardProps {
  payload: QuizQuestionPayload;
  phase: Phase;
  timeLeft: number;
  score: number;
  selectedOption: number | null;
  reveal: Reveal | null;
  hiddenOptions: number[];
  communityStats: number[] | null;
  jokers: { fiftyFifty: boolean; community: boolean; skip: boolean };
  onAnswer: (index: number) => void;
  onNext: () => void;
  onFiftyFifty: () => void;
  onCommunity: () => void;
  onSkip: () => void;
}

/**
 * Une question en cours : barre de la partie (numéro de la question, chronomètre, score), la question, les quatre
 * réponses en grands boutons, puis les jokers ou, après la réponse, les points gagnés, l'explication et « Suivant ».
 */
function GameCard({
  payload,
  phase,
  timeLeft,
  score,
  selectedOption,
  reveal,
  hiddenOptions,
  communityStats,
  jokers,
  onAnswer,
  onNext,
  onFiftyFifty,
  onCommunity,
  onSkip,
}: GameCardProps) {
  const question = payload.question;
  const reading = phase === "reading" || phase === "loading";
  const maxTime = phase === "reading" ? QUIZ_READ_TIME : QUIZ_ANSWER_TIME;
  const timerRunning = phase === "reading" || phase === "answering";
  const timeProgress = timerRunning ? (timeLeft / maxTime) * 100 : 0;
  const points = reveal?.points ?? null;

  return (
    <Card className="overflow-hidden">
      {/* Barre de la partie : toujours en haut de la carte */}
      <div className="flex items-center gap-3 border-b border-bb-border px-4 py-3">
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <p className="m-0 text-sm font-semibold text-bb-text">Question {payload.index + 1} / {payload.total}</p>
          <div className="h-1.5 overflow-hidden rounded-full bg-bb-surface-2" aria-hidden="true">
            <div className="h-full rounded-full bg-bb-accent" style={{ width: `${((payload.index + 1) / payload.total) * 100}%` }} />
          </div>
        </div>
        {/* Après la réponse, le chronomètre est arrêté : il passe en gris */}
        <div className={cn("flex items-center gap-1.5 text-lg font-bold tabular-nums", !timerRunning ? "text-bb-text-muted" : phase === "reading" ? "text-bb-warning-text" : "text-bb-accent-text")}>
          <Timer size={18} aria-hidden="true" />
          <span role="timer" aria-label={phase === "reading" ? "Temps de lecture restant" : "Temps restant pour répondre"}>{timeLeft} s</span>
        </div>
        <div className="flex flex-col items-end leading-tight">
          <span className="text-xs text-bb-text-muted">Score</span>
          <output aria-label="Score" className="text-lg font-bold tabular-nums text-bb-text">{score}</output>
        </div>
      </div>
      {/* Chronomètre en barre : orange pendant la lecture, couleur du thème pendant la réponse */}
      <div className="h-1 bg-bb-surface-2" aria-hidden="true">
        <div
          className={cn("h-full transition-[width] duration-200 ease-linear", phase === "reading" ? "bg-bb-warning-text" : "bg-bb-accent")}
          style={{ width: `${timeProgress}%` }}
        />
      </div>

      <section aria-label="Question en cours" className="flex flex-col gap-4 p-4 lg:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="py-1 text-sm">
            <Brain size={14} aria-hidden="true" /> {translateCategory(question.category)}
          </Badge>
          {phase === "reading" && <span className="text-sm text-bb-warning-text">Lisez la question : les réponses arrivent.</span>}
        </div>

        <h2 className="m-0 border-0 p-0 text-lg leading-snug font-bold tracking-normal break-words text-bb-text normal-case not-italic lg:text-xl">
          {question.question}
        </h2>

        <div
          role="group"
          aria-label="Réponses"
          className={cn("grid gap-2 lg:grid-cols-2 lg:gap-3", reading && "pointer-events-none opacity-20 blur-md transition-[filter,opacity]")}
        >
          {question.options.map((option, idx) => {
            const isHidden = hiddenOptions.includes(idx);
            const isCorrect = reveal !== null && idx === reveal.correctIndex;
            const isWrongChoice = reveal !== null && selectedOption === idx && !isCorrect;
            const dimmed = phase === "result" && !isCorrect && !isWrongChoice;
            return (
              <Button
                key={idx}
                type="button"
                variant="secondary"
                size="tap"
                disabled={phase !== "answering" || isHidden}
                onClick={() => onAnswer(idx)}
                className={cn(
                  "relative min-h-14 w-full justify-start overflow-hidden py-2 text-left font-semibold whitespace-normal disabled:opacity-100",
                  isCorrect && "border-bb-success-text bg-bb-success-text/15",
                  isWrongChoice && "border-bb-danger-text bg-bb-danger-text/15",
                  dimmed && "disabled:opacity-50",
                  isHidden && phase !== "result" && "line-through disabled:opacity-40"
                )}
              >
                {/* Joker « appel à la communauté » : la barre de fond suit le pourcentage */}
                {communityStats && (
                  <span aria-hidden="true" className="absolute inset-y-0 left-0 bg-bb-accent-soft" style={{ width: `${communityStats[idx]}%` }} />
                )}
                <span
                  aria-hidden="true"
                  className={cn(
                    "relative inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-bb-border bg-bb-surface text-sm font-bold",
                    isCorrect && "border-bb-success-text text-bb-success-text",
                    isWrongChoice && "border-bb-danger-text text-bb-danger-text"
                  )}
                >
                  {String.fromCharCode(65 + idx)}
                </span>
                <span className="relative min-w-0 flex-1 break-words">{option}</span>
                {isHidden && <span className="sr-only"> (retirée par le joker 50/50)</span>}
                {communityStats && <span className="relative shrink-0 text-sm font-bold text-bb-text">{communityStats[idx]} %</span>}
                {isCorrect && (
                  <>
                    <CheckCircle2 size={20} aria-hidden="true" className="relative shrink-0 text-bb-success-text" />
                    <span className="sr-only"> (bonne réponse)</span>
                  </>
                )}
                {isWrongChoice && (
                  <>
                    <XCircle size={20} aria-hidden="true" className="relative shrink-0 text-bb-danger-text" />
                    <span className="sr-only"> (votre réponse, fausse)</span>
                  </>
                )}
              </Button>
            );
          })}
        </div>

        {phase === "result" ? (
          <div className="flex flex-col gap-3 border-t border-bb-border pt-4">
            {reveal === null && <Loader2 size={20} aria-hidden="true" className="animate-spin text-bb-text-muted" />}
            {points !== null && (
              <p role="status" className={cn("m-0 flex items-center gap-2 text-lg font-bold", points > 0 ? "text-bb-success-text" : "text-bb-danger-text")}>
                {points > 0 ? <PlusCircle size={20} aria-hidden="true" /> : <MinusCircle size={20} aria-hidden="true" />}
                <span>{points > 0 ? `+${points}` : points} points</span>
              </p>
            )}
            {reveal?.explanation && <p className="m-0 text-[0.95rem] leading-relaxed text-bb-text">{reveal.explanation}</p>}
            {reveal && (
              <Button type="button" variant="primary" size="tap" className="w-full lg:w-auto lg:self-end lg:px-8" onClick={onNext}>
                <FastForward size={18} aria-hidden="true" /> Suivant
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2 border-t border-bb-border pt-4">
            <Button
              type="button"
              variant="secondary"
              size="tap"
              className={jokerClass}
              aria-label="Joker 50/50"
              title="50/50 : retire deux mauvaises réponses"
              disabled={!jokers.fiftyFifty || phase !== "answering"}
              onClick={onFiftyFifty}
            >
              <Scissors size={18} aria-hidden="true" /> 50/50
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="tap"
              className={jokerClass}
              aria-label="Joker appel à la communauté"
              title="Appel à la communauté : montre ce qu'ont répondu les autres coachs"
              disabled={!jokers.community || phase !== "answering"}
              onClick={onCommunity}
            >
              <Users size={18} aria-hidden="true" /> Communauté
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="tap"
              className={jokerClass}
              aria-label="Joker passer la question"
              title="Passer : saute cette question, sans gagner ni perdre de points"
              disabled={!jokers.skip || (phase !== "reading" && phase !== "answering")}
              onClick={onSkip}
            >
              <Zap size={18} aria-hidden="true" /> Passer
            </Button>
          </div>
        )}
      </section>
    </Card>
  );
}
