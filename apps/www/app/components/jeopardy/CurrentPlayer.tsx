import type { Player } from "~/types/jeopardy";

interface CurrentPlayerProps {
  player: Player | undefined;
  score: number;
}

export const CurrentPlayer = ({ player, score }: CurrentPlayerProps) => {
  if (!player) return null;

  return (
    <div
      className="fixed top-4 left-1/2 -translate-x-1/2 bg-[#060CE9] px-8 py-4 rounded-lg 
                 shadow-xl border-4 border-black z-10 min-w-[300px]"
      style={{ fontFamily: "Swiss911, Arial, sans-serif" }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div
            className="w-4 h-4 rounded-full animate-pulse"
            style={{ backgroundColor: player.playerInfo.color }}
          />
          <span className="text-2xl font-bold text-white">
            {player.playerInfo.name}
          </span>
        </div>
        <span
          className={`text-2xl font-bold ${score < 0 ? "text-red-400" : "text-green-400"}`}
        >
          ${score}
        </span>
      </div>
    </div>
  );
};
