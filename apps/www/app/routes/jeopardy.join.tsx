import { json, type LoaderFunction } from "@remix-run/node";
import { useLoaderData, useLocation, useNavigate } from "@remix-run/react";
import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";

export const loader: LoaderFunction = ({ request }) => {
  const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  return json({ roomCode, baseUrl: new URL(request.url).origin });
};

export default function JeopardyJoin() {
  const { roomCode, baseUrl } = useLoaderData<typeof loader>();
  const [players, setPlayers] = useState<
    Array<{ name: string; color: string }>
  >([]);
  const navigate = useNavigate();
  
  // Create the buzzer URL using useHref to handle the base URL properly
  const buzzerUrl = `${baseUrl}/jeopardy/buzzer/${roomCode}`;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-blue-900 text-white p-4">
      <h1 className="text-4xl font-bold mb-8">Jeopardy Game Setup</h1>

      <div className="text-center mb-8">
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
            {players.map((player, index) => (
              <li
                key={index}
                className="flex items-center p-2 rounded"
                style={{ backgroundColor: player.color }}
              >
                {player.name}
              </li>
            ))}
          </ul>
        )}
      </div>

      <button
        className="mt-8 px-6 py-3 bg-green-500 rounded-lg font-bold disabled:opacity-50"
        disabled={players.length < 2}
        type="button"
        onClick={() => {
          // Navigate to the main game display
          navigate(`/jeopardy/game/${roomCode}`);
        }}
      >
        Start Game ({players.length}/5 players)
      </button>
    </div>
  );
}
