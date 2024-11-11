import type { Player } from '~/types/jeopardy';

interface ScoreboardProps {
  players: Player[];
  scores: Record<string, number>;
  currentPlayerIndex: number;
}

export const Scoreboard = ({ players, scores, currentPlayerIndex }: ScoreboardProps) => {
  const sortedPlayers = [...players].sort((a, b) => scores[b.name] - scores[a.name]);

  return (
    <div className="bg-[#060CE9] p-6 rounded-lg shadow-xl border-4 border-black">
      <h2 className="text-2xl font-bold mb-6 text-white text-center uppercase"
          style={{ fontFamily: 'Swiss911, Arial, sans-serif' }}>
        Scoreboard
      </h2>
      <div className="space-y-3">
        {sortedPlayers.map((player) => (
          <div
            key={player.id}
            className={`flex justify-between items-center p-3 rounded-md
                      transition-all duration-300
                      ${currentPlayerIndex === players.findIndex(p => p.id === player.id)
                        ? 'bg-yellow-500 scale-105 shadow-lg'
                        : 'bg-opacity-20'}`}
            style={{ backgroundColor: player.color + (currentPlayerIndex === players.findIndex(p => p.id === player.id) ? '' : '20') }}
          >
            <span className="text-white font-bold text-lg">{player.name}</span>
            <span className={`text-white font-bold text-xl
                            ${scores[player.name] < 0 ? 'text-red-400' : 'text-green-400'}`}>
              ${scores[player.name]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}; 