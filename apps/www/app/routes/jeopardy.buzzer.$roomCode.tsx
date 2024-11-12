export default function JeopardyBuzzer() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-blue-900">
      <button
        className="w-64 h-64 rounded-full bg-red-600 active:bg-red-800 shadow-lg"
        type="button"
        onClick={() => {
          // Send buzzer signal via WebSocket
          console.log("Buzzed in!");
        }}
      >
        <span className="text-white text-2xl font-bold">BUZZ IN!</span>
      </button>
    </div>
  );
}
