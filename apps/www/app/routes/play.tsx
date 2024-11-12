import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useElevenLabsSpeech } from "@/hooks/useElevenLabsSpeech";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { type Depth, questions } from "@/lib/questions";
import { Volume2, VolumeX } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";

const BackgroundVideo = React.memo(({ isPlaying }: { isPlaying: boolean }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.8;
      if (isPlaying) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
    }
  }, [isPlaying]);

  return (
    <div className="absolute top-0 right-0 h-full w-full bg-black overflow-hidden flex items-center justify-center">
      {isPlaying && (
        <video
          ref={videoRef}
          loop
          muted
          playsInline
          className="w-full h-auto max-h-full object-contain"
        >
          <source src="/background-video.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      )}
    </div>
  );
});

const BackgroundAudio = React.memo(({ isPlaying }: { isPlaying: boolean }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio("/background-music.ogg");
    audioRef.current.loop = true;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play();
      } else {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    }
  }, [isPlaying]);

  return null;
});

const DeepConversationCardsMVP = () => {
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isIncognito, setIsIncognito] = useState(false);
  const [isSpeechEnabled, setIsSpeechEnabled] = useState(true);
  const [sessionDuration, setSessionDuration] = useState(5);
  const [preferredDepth, setPreferredDepth] = useState<Depth>("Medium");
  const { speak, isLoading, error } = useElevenLabsSpeech();
  const [isSessionActive, setIsSessionActive] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  useEffect(() => {
    if (timeRemaining > 0) {
      const timer = setTimeout(() => setTimeRemaining(timeRemaining - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeRemaining]);

  const getRandomQuestion = () => {
    const filteredQuestions = questions.filter(
      (q) => q.depth === preferredDepth,
    );
    const randomIndex = Math.floor(Math.random() * filteredQuestions.length);
    setCurrentQuestion(filteredQuestions[randomIndex].text);
    if (isSpeechEnabled) {
      speak(filteredQuestions[randomIndex].text);
    }
  };

  const startSession = () => {
    setTimeRemaining(sessionDuration * 60);
    getRandomQuestion();
    setIsSessionActive(true);
  };

  useEffect(() => {
    if (timeRemaining === 0 && isSessionActive) {
      setIsSessionActive(false);
    }
  }, [timeRemaining, isSessionActive]);

  const toggleSpeech = () => {
    setIsSpeechEnabled(!isSpeechEnabled);
    if (!isSpeechEnabled && currentQuestion) {
      speak(currentQuestion);
    }
  };

  return (
    <div className={`flex min-h-screen ${isDesktop ? "flex-row" : "flex-col"}`}>
      <div
        className={`
        ${
          isDesktop
            ? "w-1/2 bg-gradient-to-l from-black to-indigo-900"
            : "w-full bg-gradient-to-b from-indigo-900 via-blue-800 to-blue-900 flex-grow flex items-center"
        } 
        p-4 md:p-8 flex flex-col justify-center
      `}
      >
        <div className="max-w-md mx-auto w-full">
          <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-8 text-center text-white">
            Deep Conversation Cards
          </h1>
          <Card className="w-full mb-4 bg-purple-800/50 text-white backdrop-blur-sm border-0">
            <CardContent className="p-4 md:p-6">
              <p className="text-xl text-center mb-6">
                {currentQuestion || "Click 'Start Session' to begin"}
              </p>
              {timeRemaining > 0 && (
                <p className="text-center mb-4">
                  Time remaining: {Math.floor(timeRemaining / 60)}:
                  {(timeRemaining % 60).toString().padStart(2, "0")}
                </p>
              )}
              <Button
                onClick={timeRemaining > 0 ? getRandomQuestion : startSession}
                className="w-full mb-4 bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                {timeRemaining > 0 ? "Next Question" : "Start Session"}
              </Button>
              <div className="flex justify-between items-center mb-4">
                <span>Voice Narration (Eleven Labs)</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleSpeech}
                  disabled={isLoading}
                >
                  {isSpeechEnabled ? <Volume2 /> : <VolumeX />}
                </Button>
              </div>
              {!isSessionActive && (
                <>
                  <div className="flex justify-between items-center mb-4">
                    <span>Incognito Mode</span>
                    <Switch
                      checked={isIncognito}
                      onCheckedChange={setIsIncognito}
                    />
                  </div>
                  <Select
                    value={sessionDuration.toString()}
                    onValueChange={(value) => setSessionDuration(Number(value))}
                  >
                    <SelectTrigger className="w-full mb-4 border-white bg-purple-700/50">
                      <SelectValue placeholder="Select session duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">Quick Connect (5 min)</SelectItem>
                      <SelectItem value="20">Deep Dive (20 min)</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={preferredDepth}
                    onValueChange={(value) => setPreferredDepth(value as Depth)}
                  >
                    <SelectTrigger className="w-full border-white bg-purple-700/50">
                      <SelectValue placeholder="Select preferred depth" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Light">Light</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Deep">Deep</SelectItem>
                    </SelectContent>
                  </Select>
                </>
              )}
              {error && <p className="text-red-300 text-sm mt-2">{error}</p>}
            </CardContent>
          </Card>
        </div>
      </div>
      {isDesktop && (
        <div className="relative w-1/2">
          <BackgroundVideo isPlaying={isSessionActive} />
        </div>
      )}
      <BackgroundAudio isPlaying={isSessionActive} />
    </div>
  );
};

export default DeepConversationCardsMVP;
