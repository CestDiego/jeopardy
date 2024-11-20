import { useElevenLabsSpeech } from "@/hooks/useElevenLabsSpeech";
import { useEffect, useState } from "react";
import { BackgroundMusic } from "~/components/jeopardy/BackgroundMusic";
import { CurrentPlayer } from "~/components/jeopardy/CurrentPlayer";
import { GameBoard } from "~/components/jeopardy/GameBoard";
import { GameOverScreen } from "~/components/jeopardy/GameOverScreen";
import { GameSetup } from "~/components/jeopardy/GameSetup";
import { QuestionModal } from "~/components/jeopardy/QuestionModal";
import { Scoreboard } from "~/components/jeopardy/Scoreboard";
import jeopardyConfig from "~/config/jeopardy-config.json";
import { useGameAudio } from "~/hooks/useGameAudio";
import { useJeopardyGame } from "~/hooks/useJeopardyGame";
import type { GamePhase, GameState, JeopardyConfig, Player } from "~/types/jeopardy";
import { QRCodeSVG } from "qrcode.react";
import { useMqtt } from "~/hooks/useMqtt";
import { json, redirect } from "@remix-run/node";
import type { LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

const config = jeopardyConfig as unknown as JeopardyConfig;

export const loader: LoaderFunction = ({ request }) => {
  const url = new URL(request.url);
  const existingRoom = url.searchParams.get('room');
  
  if (existingRoom) {
    return json({ roomCode: existingRoom, baseUrl: url.origin });
  }
  
  const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  // Redirect to the same page with the room code in the URL
  return redirect(`${url.pathname}?room=${roomCode}`);
};

const Lobby = ({
  players,
  baseUrl,
  roomCode,
  isConnected,
  startGame,
  handleRemovePlayer,
  defaultCategories,
}: {
  players: ConnectedPlayer[];
  baseUrl: string;
  roomCode: string;
  isConnected: boolean;
  startGame: (categories: string[]) => void;
  handleRemovePlayer: (playerName: string) => void;
  defaultCategories: string[];
}) => {
  const buzzerUrl = `${baseUrl}/jeopardy/buzzer/${roomCode}`;

  return (
    <div className="min-h-screen bg-[#060CE9] p-8">
      <div className="grid gap-12">
        {/* Right side: Game Setup */}
        <div className="flex flex-col items-center justify-start">
          <h1
            className="text-6xl font-bold text-white mb-12 tracking-wider"
            style={{
              fontFamily: "Jeopardy, Arial, sans-serif",
              textShadow:
                "4px 4px 8px rgba(0,0,0,0.5), 0 0 40px rgba(255,255,255,0.5)",
            }}
          >
            JEOPARDY!
          </h1>

          <p className="text-xl text-white mb-12 max-w-2xl">
            Test your knowledge across exciting categories including Hip-Hop
            History, Yu-Gi-Oh!, Sonic the Hedgehog, Reality TV, and Language
            Trivia!
          </p>

          <div className="text-center mb-8">
            <div className="mb-2">
              <span
                className={`inline-block w-3 h-3 rounded-full ${
                  isConnected ? "bg-green-500" : "bg-red-500"
                } mr-2`}
              />
              {isConnected ? "Connected" : "Connecting..."}
            </div>
            <p className="text-xl mb-4 text-white">Scan to join as a player:</p>
            <div className="bg-white p-4 rounded-lg">
              <QRCodeSVG value={buzzerUrl} size={256} />
            </div>
          </div>

          <h3 className="text-xl mb-4 text-white">Connected Players:</h3>
          {players.length === 0 ? (
            <p className="text-gray-300">Waiting for players to join...</p>
          ) : (
            <div className="grid grid-cols-5 gap-6">
              {players.map((player) => (
                <div
                  key={player.playerInfo.name}
                  className={`bg-[#0508B0] p-4 rounded-lg border-4 ${
                    player.connectionStatus === 'connected' 
                      ? 'border-green-400' 
                      : 'border-red-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: player.playerInfo.color }}
                    />
                    <div 
                      className={`w-3 h-3 rounded-full ${
                        player.connectionStatus === 'connected' 
                          ? 'bg-green-400' 
                          : 'bg-red-400'
                      }`} 
                    />
                  </div>
                  <p className="text-white font-bold text-lg text-center">
                    {player.playerInfo.name}
                  </p>
                </div>
              ))}
            </div>
          )}
          <button
            className="bg-yellow-400 hover:bg-yellow-500 text-black text-2xl font-bold py-6 px-12 rounded-lg transform hover:scale-105 transition-all duration-200 shadow-lg border-4 border-black disabled:opacity-50 disabled:transform-none mt-8"
            style={{ fontFamily: "Swiss911, Arial, sans-serif" }}
            disabled={players.length < 2}
            type="button"
            onClick={() => startGame(defaultCategories)}
          >
            START GAME ({players.length}/5 players)
          </button>
        </div>
      </div>
    </div>
  );
};

interface ConnectedPlayer extends Player {
  connectionStatus: 'connected' | 'disconnected';
  lastSeen: number;
}

export default function JeopardyGame() {
  const { baseUrl, roomCode } = useLoaderData<typeof loader>();
  const [gamePhase, setGamePhase] = useState<GamePhase>('join');
  const [categories, setCategories] = useState(
    Object.keys(config.defaultCategories),
  );
  const [isTextToSpeechEnabled, setIsTextToSpeechEnabled] = useState(
    config.textToSpeech?.enabled ?? false,
  );
  const { speak, isLoading } = useElevenLabsSpeech();
  const [selectedCell, setSelectedCell] = useState<{
    category: string;
    value: number;
  } | null>(null);
  const [players, setPlayers] = useState<ConnectedPlayer[]>([]);
  
  const {
    gameState,
    selectQuestion,
    revealAnswer,
    handleAnswer,
    skipQuestion,
    startNewGame,
    handleBuzz,
  } = useJeopardyGame({
    players,
    initialCategories: categories,
    config,
  });

  const { isConnected, publish } = useMqtt(roomCode, (message) => {
    switch (message.action) {
      case "identify":
        if (message.data.type === "player") {
          setPlayers(current => {
            const existingPlayer = current.find(
              p => p.playerInfo.name === message.data.playerInfo.name
            );
            
            if (existingPlayer) {
              // Update existing player
              return current.map(p => 
                p.playerInfo.name === message.data.playerInfo.name
                  ? {
                      ...p,
                      connectionStatus: 'connected',
                      lastSeen: Date.now()
                    }
                  : p
              );
            }
            
            // Add new player
            return [...current, {
              ...message.data,
              connectionStatus: 'connected',
              lastSeen: Date.now()
            }];
          });
        }
        break;
      case "buzz":
        handleBuzz(message.data.name);
        break;
      case "playerLeft":
        setPlayers(current =>
          current.map(p =>
            p.playerInfo.name === message.data.name
              ? { ...p, connectionStatus: 'disconnected', lastSeen: Date.now() }
              : p
          )
        );
        break;
    }
  });

  useEffect(() => {
    console.log({ gameState });
  }, [gameState]);

  const { isMusicPlaying } = useGameAudio({
    isSetupPhase: gamePhase === 'join',
    hasSelectedQuestion: !!gameState.selectedQuestion,
  });

  const handleStartGame = (customCategories: string[]) => {
    setCategories(customCategories);
    setGamePhase('selection');
    startNewGame(customCategories);
    publish('gameStarted', { categories: customCategories });
  };

  const handleQuestionClick = (category: string, value: number) => {
    if (gameState.phase !== 'selection') return;
    
    setSelectedCell({ category, value });
    selectQuestion(category, value);

    if (isTextToSpeechEnabled) {
      const question = gameState.board.questions[category]?.find(
        (q) => q.value === value,
      );
      if (question) {
        speak(question.question);
      }
    }
  };

  const handleQuestionClose = () => {
    setSelectedCell(null);
  };

  const isGameOver =
    Array.from(gameState.answeredQuestions.values()).length ===
    Object.keys(gameState.board.questions).length * 5;

  const handlePlayAgain = () => {
    setGamePhase('join');
    startNewGame(categories);
    publish('gameReset', {});
  };

  // Render different screens based on game phase
  switch (gamePhase) {
    case 'join':
      return (
        <Lobby
          players={players}
          baseUrl={baseUrl}
          roomCode={roomCode}
          isConnected={isConnected}
          defaultCategories={categories}
          startGame={() => {
            if (players.length >= 2) {
              setGamePhase('selection');
            }
          }}
          handleRemovePlayer={(playerName) => {
            setPlayers((current) =>
              current.filter((p) => p.playerInfo.name !== playerName),
            );
            publish("playerLeft", { name: playerName });
          }}
        />
      );

    case 'selection':
      return (
        <div className="min-h-screen bg-black p-4">
          <BackgroundMusic isPlaying={isMusicPlaying} />
          <CurrentPlayer
            player={players[gameState.currentPlayer]}
            score={gameState.scores[players[gameState.currentPlayer]?.playerInfo?.name] ?? 0}
          />

          <div className="flex gap-8 max-w-[1600px] mx-auto mt-20">
            <div className="flex-grow">
              <GameBoard
                categories={gameState.board.categories}
                questions={gameState.board.questions}
                onQuestionSelect={handleQuestionClick}
                answeredQuestions={gameState.answeredQuestions}
                selectedCell={selectedCell}
              />
            </div>
            <div className="w-96">
              <Scoreboard
                players={players}
                scores={gameState.scores}
                currentPlayerIndex={gameState.currentPlayer}
              />
            </div>

            {gameState.selectedQuestion && (
              <QuestionModal
                layoutId={`${selectedCell?.category}-${selectedCell?.value}`}
                players={players}
                gameState={gameState}
                isLoading={isLoading}
                isTextToSpeechEnabled={isTextToSpeechEnabled}
                onRepeatQuestion={() => {
                  if (isTextToSpeechEnabled && gameState.selectedQuestion) {
                    speak(gameState.selectedQuestion.questionData.question);
                  }
                }}
                onSkip={() => {
                  skipQuestion();
                  handleQuestionClose();
                  publish('questionSkipped', {});
                }}
                onRevealAnswer={() => {
                  revealAnswer();
                  publish('answerRevealed', {});
                }}
                onAnswerResult={(correct) => {
                  handleAnswer(correct);
                  handleQuestionClose();
                  publish('questionAnswered', { correct });
                }}
              />
            )}
          </div>

          {isGameOver && (
            <GameOverScreen
              players={players}
              scores={gameState.scores}
              onPlayAgain={handlePlayAgain}
            />
          )}
        </div>
      );
  }
}
