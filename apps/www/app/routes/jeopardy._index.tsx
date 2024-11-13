import { useElevenLabsSpeech } from "@/hooks/useElevenLabsSpeech";
import { useState } from "react";
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
import type { JeopardyConfig, Player } from "~/types/jeopardy";
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
}: {
  players: Player[];
  baseUrl: string;
  roomCode: string;
  isConnected: boolean;
  startGame: () => void;
  handleRemovePlayer: (playerName: string) => void;
}) => {
  const buzzerUrl = `${baseUrl}/jeopardy/buzzer/${roomCode}`;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-blue-900 text-white p-4">
      <h1 className="text-4xl font-bold mb-8">Jeopardy Game Setup</h1>

      <div className="text-center mb-8">
        <div className="mb-2">
          <span
            className={`inline-block w-3 h-3 rounded-full ${
              isConnected ? "bg-green-500" : "bg-red-500"
            } mr-2`}
          />
          {isConnected ? "Connected" : "Connecting..."}
        </div>
        <p className="text-xl mb-4">Scan to join as a player:</p>
        <div className="bg-white p-4 rounded-lg">
          <QRCodeSVG value={buzzerUrl} size={256} />
        </div>
      </div>

      <div className="w-full max-w-md">
        <h2 className="text-xl mb-4">Connected Players:</h2>
        {players.length === 0 ? (
          <p className="text-gray-300">Waiting for players to join...</p>
        ) : (
          <ul className="space-y-2">
            {players.map((player) => (
              <li
                key={player.playerInfo.name}
                className="flex items-center justify-between p-2 rounded"
                style={{ backgroundColor: player.playerInfo.color }}
              >
                <span>{player.playerInfo.name}</span>
                <button
                  onClick={() => handleRemovePlayer(player.playerInfo.name)}
                  className="ml-2 px-2 py-1 bg-red-500 rounded hover:bg-red-600 text-white"
                  type="button"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <button
        className="mt-8 px-6 py-3 bg-green-500 rounded-lg font-bold disabled:opacity-50"
        disabled={players.length < 2}
        type="button"
        onClick={startGame}
      >
        Start Game ({players.length}/5 players)
      </button>
    </div>
  );
};

export default function JeopardyGame() {
  const { baseUrl, roomCode } = useLoaderData<typeof loader>();
  const [isSetupPhase, setIsSetupPhase] = useState(true);
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
  const [isJoinPhase, setIsJoinPhase] = useState(true);
  const [players, setPlayers] = useState<Player[]>([]);
  const { isConnected, publish } = useMqtt(roomCode, (message) => {
    console.log("handleMessage", message);
    switch (message.action) {
      case "identify":
        if (message.data.type === "player") {
          setPlayers((current) => [...current, message.data]);
        }
        break;
      case "buzz":
        console.log("buzz", message.data);
        break;
      case "playerLeft":
        if (message.data.type === "player") {
          setPlayers((current) =>
            current.filter((p) => p.playerInfo.name !== message.data.name),
          );
        }
        break;
    }
  });
  const {
    gameState,
    selectQuestion,
    revealAnswer,
    handleAnswer,
    skipQuestion,
    startNewGame,
  } = useJeopardyGame({
    players,
    initialCategories: categories,
    config,
  });

  const { isMusicPlaying } = useGameAudio({
    isSetupPhase,
    hasSelectedQuestion: !!gameState.selectedQuestion,
  });

  const handleStartGame = (customCategories: string[]) => {
    setCategories(customCategories);
    setIsSetupPhase(false);
    setIsJoinPhase(false);
    startNewGame(customCategories);
  };

  const handleQuestionClick = (category: string, value: number) => {
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
    setIsSetupPhase(true);
    startNewGame(categories);
  };

  if (isJoinPhase) {
    return (
      <Lobby
        players={players}
        baseUrl={baseUrl}
        roomCode={roomCode}
        isConnected={isConnected}
        startGame={() => {
          setIsJoinPhase(false);
        }}
        handleRemovePlayer={(playerName) => {
          setPlayers((current) =>
            current.filter((p) => p.playerInfo.name !== playerName),
          );
          publish("removePlayer", { name: playerName });
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-black p-4">
      <BackgroundMusic isPlaying={isMusicPlaying} />

      {isSetupPhase ? (
        <GameSetup
          savedGames={[]}
          players={players}
          onStartGame={handleStartGame}
          defaultCategories={categories}
        />
      ) : (
        <>
          <CurrentPlayer
            player={players[gameState.currentPlayer]}
            score={gameState.scores[players[gameState.currentPlayer].playerInfo.name]}
          />

          <div className="flex gap-8 max-w-[1600px] mx-auto mt-20">
            <div className="flex-grow">
              <GameBoard
                categories={gameState.board.categories}
                questions={gameState.board.questions}
                pointValues={
                  config.gameSettings.rounds[gameState.round].pointValues
                }
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
                question={gameState.selectedQuestion.questionData}
                currentPlayer={players[gameState.currentPlayer]}
                value={gameState.selectedQuestion.value}
                isAnswerRevealed={gameState.isAnswerRevealed}
                showAnswerButtons={gameState.isAnswerRevealed}
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
                }}
                onRevealAnswer={revealAnswer}
                onAnswerResult={(correct) => {
                  handleAnswer(correct);
                  handleQuestionClose();
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
        </>
      )}
    </div>
  );
}
