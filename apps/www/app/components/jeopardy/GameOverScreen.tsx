import { useEffect, useState } from "react";
import Confetti from "react-confetti";
import type { Player } from "~/types/jeopardy";

interface GameOverScreenProps {
  players: Player[];
  scores: Record<string, number>;
  onPlayAgain: () => void;
}

export function GameOverScreen({
  players,
  scores,
  onPlayAgain,
}: GameOverScreenProps) {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Sort players by score in descending order
  const sortedPlayers = [...players].sort(
    (a, b) => scores[b.name] - scores[a.name],
  );
  const winner = sortedPlayers[0];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
      <Confetti
        width={windowSize.width}
        height={windowSize.height}
        recycle={true}
        numberOfPieces={200}
        gravity={0.3}
      />

      <div className="text-center">
        <h1 className="text-6xl font-bold text-white mb-8">Game Over!</h1>

        <div className="mb-12">
          <h2
            className="text-4xl font-bold mb-4"
            style={{ color: winner.color }}
          >
            {winner.name} Wins!
          </h2>
          <p className="text-3xl text-white">with ${scores[winner.name]}</p>
        </div>

        <div className="space-y-4 mb-12">
          {sortedPlayers.map((player, index) => (
            <div
              key={player.name}
              className="flex items-center justify-between w-96 mx-auto p-4 rounded"
              style={{ backgroundColor: `${player.color}33` }}
            >
              <div className="flex items-center gap-4">
                <span className="text-2xl text-white">{index + 1}.</span>
                <span
                  className="text-2xl font-bold"
                  style={{ color: player.color }}
                >
                  {player.name}
                </span>
              </div>
              <span className="text-2xl text-white">
                ${scores[player.name]}
              </span>
            </div>
          ))}
        </div>

        <button
          onClick={onPlayAgain}
          className="bg-blue-600 text-white px-8 py-4 rounded-lg text-2xl font-bold hover:bg-blue-700 transition-colors"
        >
          Play Again
        </button>
      </div>
    </div>
  );
}
