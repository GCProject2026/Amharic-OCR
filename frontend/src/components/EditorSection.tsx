import { useState, useRef, useEffect } from 'react';
import { PenTool, Volume2, VolumeX, Pause } from 'lucide-react';
import { Card } from './ui/card';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { toast } from 'sonner@2.0.3';

interface EditorSectionProps {
  text: string;
  onTextChange: (text: string) => void;
}

export function EditorSection({ text, onTextChange }: EditorSectionProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    return () => {
      // Cleanup: stop speaking when component unmounts
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speakText = () => {
    if (!text.trim()) {
      toast.error('No text to read');
      return;
    }

    if (!window.speechSynthesis) {
      toast.error('Text-to-speech is not supported in your browser');
      return;
    }

    if (isSpeaking && !isPaused) {
      // Pause speaking
      try {
        window.speechSynthesis.pause();
        setIsPaused(true);
      } catch (err) {
        // Fallback: cancel if pause fails
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        setIsPaused(false);
      }
      return;
    }

    if (isPaused) {
      // Resume speaking
      try {
        window.speechSynthesis.resume();
        setIsPaused(false);
      } catch (err) {
        // Fallback: restart if resume fails
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        setIsPaused(false);
      }
      return;
    }

    // Start new speech
    try {
      window.speechSynthesis.cancel(); // Cancel any ongoing speech
      
      const utterance = new SpeechSynthesisUtterance(text);
      utteranceRef.current = utterance;

      // Try to find an Amharic voice, fallback to default
      const voices = window.speechSynthesis.getVoices();
      const amharicVoice = voices.find(voice => 
        voice.lang.includes('am') || voice.lang.includes('AM')
      );
      
      if (amharicVoice) {
        utterance.voice = amharicVoice;
      }

      utterance.rate = 0.9; // Slightly slower for better clarity
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      utterance.onstart = () => {
        setIsSpeaking(true);
        setIsPaused(false);
        toast.success('Reading text aloud');
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        setIsPaused(false);
      };

      utterance.onerror = (event) => {
        setIsSpeaking(false);
        setIsPaused(false);
        
        // Silently handle interrupted/cancelled speech
        if (event.error === 'interrupted' || event.error === 'canceled' || event.error === 'cancelled') {
          return;
        }
        
        // Only show user-friendly messages for actual errors
        if (event.error === 'network') {
          toast.error('Network error: Check your internet connection');
        } else if (event.error === 'synthesis-unavailable') {
          toast.error('Text-to-speech unavailable in this browser');
        } else if (event.error === 'synthesis-failed') {
          toast.error('Failed to read text. Try selecting a different voice in your system settings.');
        } else if (event.error === 'not-allowed') {
          toast.error('Text-to-speech permission denied. Please check browser settings.');
        }
        // Don't show error toast for other cases - fail silently
      };

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      setIsSpeaking(false);
      setIsPaused(false);
      toast.error('Text-to-speech feature unavailable. Please try again later.');
    }
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-white to-amber-50/30 border-amber-200 shadow-md">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <PenTool className="w-5 h-5 text-amber-800" />
          <h3 className="text-amber-900">Text Editor</h3>
        </div>
        
        <div className="flex items-center gap-2">
          {isSpeaking && (
            <Button
              onClick={stopSpeaking}
              size="sm"
              variant="outline"
              className="border-amber-300 text-amber-900 hover:bg-amber-50"
            >
              <VolumeX className="w-4 h-4 mr-1" />
              Stop
            </Button>
          )}
          <Button
            onClick={speakText}
            size="sm"
            variant="outline"
            className="border-amber-300 text-amber-900 hover:bg-amber-50"
            disabled={!text.trim()}
          >
            {isSpeaking && !isPaused ? (
              <>
                <Pause className="w-4 h-4 mr-1" />
                Pause
              </>
            ) : isPaused ? (
              <>
                <Volume2 className="w-4 h-4 mr-1" />
                Resume
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4 mr-1" />
                Read Aloud
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm text-amber-900/70">
          Review and refine the digitized text. Make corrections to preserve accuracy.
        </p>
        
        <Textarea
          value={text}
          onChange={(e) => onTextChange(e.target.value)}
          className="min-h-[400px] font-mono bg-stone-50/50 border-amber-200 focus:border-amber-400"
          placeholder="Converted text will appear here..."
          style={{ 
            lineHeight: '1.8',
            fontSize: '16px'
          }}
        />

        <div className="flex justify-between text-xs text-amber-800/70">
          <span>Characters: {text.length}</span>
          <span>Words: {text.trim().split(/\s+/).filter(w => w).length}</span>
        </div>
      </div>
    </Card>
  );
}