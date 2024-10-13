import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Volume2, VolumeX } from 'lucide-react';
import { questions, type Depth } from '@/lib/questions';
import { useElevenLabsSpeech } from '@/hooks/useElevenLabsSpeech';

const BackgroundVideo = React.memo(() => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play();
    }
  }, []);

  return (
    <div className="absolute top-0 left-0 w-full h-full">
      <div className="absolute top-0 left-0 w-full h-full bg-black opacity-50 z-10"></div>
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover z-0"
      >
        <source src="/background-video.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
});

const BackgroundAudio = React.memo(() => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio('/background-music.ogg');
    audioRef.current.loop = true;
    audioRef.current.play();

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, []);

  return null;
});

const DeepConversationCardsMVP = () => {
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isIncognito, setIsIncognito] = useState(false);
  const [isSpeechEnabled, setIsSpeechEnabled] = useState(false);
  const [sessionDuration, setSessionDuration] = useState(5); // Default to 5 minutes
  const [preferredDepth, setPreferredDepth] = useState<Depth>('Medium');
  const { speak, isLoading, error } = useElevenLabsSpeech();

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

  const toggleSpeech = () => {
    setIsSpeechEnabled(!isSpeechEnabled);
    if (!isSpeechEnabled && currentQuestion) {
      speak(currentQuestion);
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen p-4 overflow-hidden">
      <BackgroundVideo />
      <BackgroundAudio />
      <div className="relative z-20 bg-white bg-opacity-20 backdrop-blur-md p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-3xl font-bold mb-8 text-center text-white">Deep Conversation Cards</h1>
        <Card className="w-full mb-4 bg-white bg-opacity-30 backdrop-blur-sm">
          <CardContent className="p-6">
            <p className="text-xl text-center mb-6 text-white">
              {currentQuestion || "Click 'Start Session' to begin"}
            </p>
            {timeRemaining > 0 && (
              <p className="text-center mb-4 text-white">Time remaining: {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}</p>
            )}
            <Button 
              onClick={timeRemaining > 0 ? getRandomQuestion : startSession}
              className="w-full mb-4 bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {timeRemaining > 0 ? 'Next Question' : 'Start Session'}
            </Button>
            <div className="flex justify-between items-center mb-4 text-white">
              <span>Incognito Mode</span>
              <Switch checked={isIncognito} onCheckedChange={setIsIncognito} />
            </div>
            <div className="flex justify-between items-center mb-4 text-white">
              <span>Voice Narration (Eleven Labs)</span>
              <Button variant="ghost" size="icon" onClick={toggleSpeech} disabled={isLoading}>
                {isSpeechEnabled ? <Volume2 className="text-white" /> : <VolumeX className="text-white" />}
              </Button>
            </div>
            <Select value={sessionDuration.toString()} onValueChange={(value) => setSessionDuration(Number(value))}>
              <SelectTrigger className="w-full mb-4 border-white text-white bg-transparent">
                <SelectValue placeholder="Select session duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">Quick Connect (5 min)</SelectItem>
                <SelectItem value="20">Deep Dive (20 min)</SelectItem>
              </SelectContent>
            </Select>
            <Select value={preferredDepth} onValueChange={setPreferredDepth}>
              <SelectTrigger className="w-full border-white text-white bg-transparent">
                <SelectValue placeholder="Select preferred depth" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Light">Light</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Deep">Deep</SelectItem>
              </SelectContent>
            </Select>
            {error && <p className="text-red-300 text-sm mt-2">{error}</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DeepConversationCardsMVP;
