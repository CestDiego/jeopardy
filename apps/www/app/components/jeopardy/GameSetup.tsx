import { Button } from "@/components/ui/button";

interface GameSetupProps {
  savedGames: never[];
  onStartGame: (categories: string[]) => void;
  defaultCategories: string[];
}

export const GameSetup = ({
  onStartGame,
  defaultCategories,
}: GameSetupProps) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#060CE9] p-8">
      <div className="max-w-4xl w-full text-center space-y-8">
        {/* Jeopardy Logo */}
        <h1
          className="text-7xl font-jeopardy font-bold text-white mb-12 tracking-wider"
          style={{
            fontFamily: "Jeopardy, Arial, sans-serif",
            textShadow:
              "4px 4px 8px rgba(0,0,0,0.5), 0 0 40px rgba(255,255,255,0.5)",
          }}
        >
          JEOPARDY!
        </h1>

        {/* Game Description */}
        <p className="text-xl text-white mb-12 max-w-2xl mx-auto">
          Test your knowledge across exciting categories including Hip-Hop
          History, Yu-Gi-Oh!, Sonic the Hedgehog, Reality TV, and Language
          Trivia!
        </p>

        {/* Player List */}
        <div className="grid grid-cols-5 gap-6 mb-12">
          <div className="bg-[#0508B0] p-6 rounded-lg border-4 border-black shadow-lg transform hover:scale-105 transition-all duration-200">
            <div className="w-6 h-6 rounded-full bg-[#FF4136] mx-auto mb-3 shadow-glow-red" />
            <p
              className="text-white font-bold text-xl"
              style={{ fontFamily: "Swiss911, Arial, sans-serif" }}
            >
              Dumi
            </p>
          </div>
          <div className="bg-[#0508B0] p-6 rounded-lg border-4 border-black shadow-lg transform hover:scale-105 transition-all duration-200">
            <div className="w-6 h-6 rounded-full bg-[#2ECC40] mx-auto mb-3 shadow-glow-green" />
            <p
              className="text-white font-bold text-xl"
              style={{ fontFamily: "Swiss911, Arial, sans-serif" }}
            >
              Naledi
            </p>
          </div>
          <div className="bg-[#0508B0] p-6 rounded-lg border-4 border-black shadow-lg transform hover:scale-105 transition-all duration-200">
            <div className="w-6 h-6 rounded-full bg-[#0074D9] mx-auto mb-3 shadow-glow-blue" />
            <p
              className="text-white font-bold text-xl"
              style={{ fontFamily: "Swiss911, Arial, sans-serif" }}
            >
              CJ
            </p>
          </div>
          <div className="bg-[#0508B0] p-6 rounded-lg border-4 border-black shadow-lg transform hover:scale-105 transition-all duration-200">
            <div className="w-6 h-6 rounded-full bg-[#B10DC9] mx-auto mb-3 shadow-glow-purple" />
            <p
              className="text-white font-bold text-xl"
              style={{ fontFamily: "Swiss911, Arial, sans-serif" }}
            >
              Deliwe
            </p>
          </div>
          <div className="bg-[#0508B0] p-6 rounded-lg border-4 border-black shadow-lg transform hover:scale-105 transition-all duration-200">
            <div className="w-6 h-6 rounded-full bg-[#FF851B] mx-auto mb-3 shadow-glow-orange" />
            <p
              className="text-white font-bold text-xl"
              style={{ fontFamily: "Swiss911, Arial, sans-serif" }}
            >
              Diego
            </p>
          </div>
        </div>

        {/* Start Button */}
        <Button
          onClick={() => onStartGame(defaultCategories)}
          className="bg-yellow-400 hover:bg-yellow-500 text-black text-2xl font-bold py-6 px-12 rounded-lg transform hover:scale-105 transition-all duration-200 shadow-lg border-4 border-black"
          style={{ fontFamily: "Swiss911, Arial, sans-serif" }}
        >
          START GAME
        </Button>

        {/* Instructions */}
        <div className="text-white/70 mt-8 text-sm">
          Press START GAME to begin your Jeopardy! adventure
        </div>
      </div>
    </div>
  );
};
