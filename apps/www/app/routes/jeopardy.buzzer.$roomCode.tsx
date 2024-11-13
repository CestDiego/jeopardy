import { motion } from "framer-motion";
import { json, redirect, useLoaderData, useParams } from "@remix-run/react";
import { useState, useRef } from 'react';
import { Config } from '~/config';
import { useMqtt } from '~/hooks/useMqtt';
import type { LoaderFunction } from "@remix-run/node";

export const loader: LoaderFunction = ({ request }) => {
  const url = new URL(request.url);
  const roomCode = url.pathname.split('/').pop();
  if (!roomCode) {
    return redirect('/jeopardy/join');
  }
  return json({ roomCode });
};

export default function JeopardyBuzzer() {
  const { roomCode } = useLoaderData<typeof loader>();
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState('#2563eb'); // Default blue color
  const [isJoined, setIsJoined] = useState(false);
  const { isConnected, publish } = useMqtt(roomCode);

  const colors = [
    { hex: '#2563eb', name: 'Blue' },
    { hex: '#dc2626', name: 'Red' },
    { hex: '#16a34a', name: 'Green' },
    { hex: '#ca8a04', name: 'Yellow' },
    { hex: '#9333ea', name: 'Purple' },
    { hex: '#ea580c', name: 'Orange' },
    { hex: '#0d9488', name: 'Teal' },
    { hex: '#be185d', name: 'Pink' },
    { hex: '#854d0e', name: 'Brown' },
    { hex: '#4f46e5', name: 'Indigo' },
    { hex: '#059669', name: 'Emerald' },
    { hex: '#7c2d12', name: 'Rust' },
    { hex: '#475569', name: 'Slate' },
    { hex: '#86198f', name: 'Magenta' },
    { hex: '#1e3a8a', name: 'Navy' },
  ];

  const joinGame = async () => {
    if (!name) return;

    const playerInfo = {
      name,
      color: selectedColor
    };

    await publish("identify", {
      type: "player",
      roomCode,
      playerInfo,
    });
    setIsJoined(true);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-blue-900 text-white p-4">
      <div className={`fixed top-4 right-4 flex items-center gap-2 ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
        <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
        <span className="text-sm">{isConnected ? 'Connected' : 'Disconnected'}</span>
      </div>

      {!isJoined ? (
        <div className="w-full max-w-xs bg-blue-800 p-6 rounded-lg shadow-xl border-2 border-blue-700">
          <h2 className="text-2xl font-bold mb-4 text-center">Join Game</h2>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            className="w-full p-4 text-lg bg-white text-black rounded-lg mb-4 border-2 border-blue-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-400 focus:outline-none"
          />
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Choose your color:</label>
            <div className="grid grid-cols-5 gap-2">
              {colors.map((color) => (
                <button
                  key={color.hex}
                  onClick={() => setSelectedColor(color.hex)}
                  className={`w-8 h-8 rounded-full border-2 ${
                    selectedColor === color.hex ? 'border-white' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: color.hex }}
                  title={color.name}
                />
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={joinGame}
            className="w-full bg-green-500 p-4 rounded-lg text-lg font-bold hover:bg-green-600 transition-colors shadow-lg border-2 border-green-400 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!name || !isConnected}
          >
            Join Game
          </button>
        </div>
      ) : (
        <button
          className="w-64 h-64 bg-red-500 rounded-full text-4xl font-bold shadow-xl hover:bg-red-600 transition-colors transform hover:scale-105 active:scale-95 border-4 border-red-400"
          type="button"
          onClick={() => {
            publish("buzz", {
              player: name,
              time: Date.now(),
            });
          }}
        >
          BUZZ!
        </button>
      )}
    </div>
  );
}
