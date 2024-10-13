export default function About() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">About Deep Conversation Cards</h1>
      <p className="mb-4">
        Deep Conversation Cards is an app designed to foster meaningful connections through thought-provoking questions.
        Whether you're looking to deepen relationships, practice self-reflection, or simply have more engaging conversations,
        our curated selection of questions will help guide you to more profound interactions.
      </p>
      <h2 className="text-2xl font-semibold mb-2">How it works:</h2>
      <ol className="list-decimal list-inside mb-4">
        <li>Choose a session mode: Quick Connect or Deep Dive</li>
        <li>Set your preferences for themes and depth</li>
        <li>Start the session and answer questions at your own pace</li>
        <li>Reflect on your answers and gain new insights</li>
      </ol>
    </div>
  );
}
