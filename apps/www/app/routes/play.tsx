import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Volume2, VolumeX } from 'lucide-react';

const questions = [
  { text: "What's a childhood memory that still makes you smile?", depth: "Light" },
  { text: "If you could master one skill instantly, what would it be and why?", depth: "Medium" },
  { text: "What's the most significant way in which you've grown as a person in the last year?", depth: "Deep" },
  { text: "If you could have dinner with any historical figure, who would it be and why?", depth: "Medium" },
  { text: "What's a belief you held strongly in the past that you've since changed your mind about?", depth: "Deep" },
  // Add more questions here...
];

const DeepConversationCardsMVP = () => {
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isIncognito, setIsIncognito] = useState(false);
  const [isSpeechEnabled, setIsSpeechEnabled] = useState(false);
  const [sessionDuration, setSessionDuration] = useState(5); // Default to 5 minutes
  const [preferredDepth, setPreferredDepth] = useState('Medium');

  useEffect(() => {
    getRandomQuestion();
  }, []);

  useEffect(() => {
    if (timeRemaining > 0) {
      const timer = setTimeout(() => setTimeRemaining(timeRemaining - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeRemaining]);

  const getRandomQuestion = () => {
    const filteredQuestions = questions.filter(q => q.depth === preferredDepth);
    const randomIndex = Math.floor(Math.random() * filteredQuestions.length);
    setCurrentQuestion(filteredQuestions[randomIndex].text);
    if (isSpeechEnabled) {
      speak(filteredQuestions[randomIndex].text);
    }
  };

  const startSession = () => {
    setTimeRemaining(sessionDuration * 60);
    getRandomQuestion();
  };

  const speak = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    }
  };

  const toggleSpeech = () => {
    setIsSpeechEnabled(!isSpeechEnabled);
    if (!isSpeechEnabled && currentQuestion) {
      speak(currentQuestion);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Deep Conversation Cards</h1>
      <Card className="w-full max-w-md mb-4">
        <CardContent className="p-6">
          <p className="text-xl text-center mb-6">
            {currentQuestion || "Click 'Start Session' to begin"}
          </p>
          {timeRemaining > 0 && (
            <p className="text-center mb-4">Time remaining: {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}</p>
          )}
          <Button 
            onClick={timeRemaining > 0 ? getRandomQuestion : startSession}
            className="w-full mb-4"
          >
            {timeRemaining > 0 ? 'Next Question' : 'Start Session'}
          </Button>
          <div className="flex justify-between items-center mb-4">
            <span>Incognito Mode</span>
            <Switch checked={isIncognito} onCheckedChange={setIsIncognito} />
          </div>
          <div className="flex justify-between items-center mb-4">
            <span>Voice Narration</span>
            <Button variant="ghost" size="icon" onClick={toggleSpeech}>
              {isSpeechEnabled ? <Volume2 /> : <VolumeX />}
            </Button>
          </div>
          <Select value={sessionDuration.toString()} onValueChange={(value) => setSessionDuration(Number(value))}>
            <SelectTrigger className="w-full mb-4">
              <SelectValue placeholder="Select session duration" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">Quick Connect (5 min)</SelectItem>
              <SelectItem value="20">Deep Dive (20 min)</SelectItem>
            </SelectContent>
          </Select>
          <Select value={preferredDepth} onValueChange={setPreferredDepth}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select preferred depth" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Light">Light</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="Deep">Deep</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>
    </div>
  );
};

export default DeepConversationCardsMVP;