import { Link } from "@remix-run/react";

export default function Index() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-4">
        Welcome to Deep Conversation Cards
      </h1>
      <p className="mb-4">
        Facilitate meaningful conversations with thought-provoking questions.
      </p>
      <div className="space-x-4">
        <Link
          to="/play"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Start a Session Now
        </Link>
        <Link
          to="/about"
          className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
        >
          Learn More
        </Link>
      </div>
    </div>
  );
}
