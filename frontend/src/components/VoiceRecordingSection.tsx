import { useState, useRef, useEffect } from 'react';
import { Mic, Square, Loader2, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';

interface VoiceRecordingSectionProps {
  onVoiceText: (text: string) => void;
  isProcessing: boolean;
}

export function VoiceRecordingSection({ onVoiceText, isProcessing }: VoiceRecordingSectionProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string>('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      setError('');
      
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError('Voice recording is not supported in your browser. Please use Chrome, Firefox, or Edge.');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      // Don't log to console to avoid showing raw errors
      
      if (err instanceof DOMException) {
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setError('⚠️ Microphone access denied. To enable: Click the camera/microphone icon (or lock icon) in your browser\'s address bar, select "Allow" for microphone, then refresh and try again.');
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          setError('No microphone detected. Please connect a microphone device and try again.');
        } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
          setError('Microphone is already in use by another application. Please close other apps using the microphone and try again.');
        } else if (err.name === 'OverconstrainedError') {
          setError('Could not start microphone with the required settings.');
        } else if (err.name === 'SecurityError') {
          setError('⚠️ Security error: Microphone access requires HTTPS. Please ensure you\'re accessing this page via HTTPS or localhost.');
        } else {
          setError(`Microphone error: ${err.message}. Please check your browser settings.`);
        }
      } else {
        setError('Could not access microphone. Please check your browser permissions in Settings > Privacy > Microphone.');
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const processVoiceInput = async () => {
    if (!audioBlob) return;

    // Simulate voice-to-text processing
    // In a real application, this would send the audio to a speech-to-text API
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock Amharic transcription
    const mockTranscription = `[የድምፅ ግቤት በ ${new Date().toLocaleTimeString('am-ET')}]

የተቀዳው የድምፅ ውጤት። በእውነተኛው መተግበሪያ ውስጥ፣ ይህ በእውነቱ የድምፅ ውጤትን ወደ ጽሑፍ ይለውጣል።

ይህ ባህሪ ለማየት ለተሳናቸው ተጠቃሚዎች ይረዳል፣ ምክንያቱም ሰነዶችን ለማስገባት ድምፃቸውን መጠቀም ይችላሉ።

የመዝገቡ ርዝመት: ${recordingTime} ሰከንዶች`;

    onVoiceText(mockTranscription);
    setAudioBlob(null);
    setRecordingTime(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive" className="border-red-300 bg-red-50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="text-center space-y-4">
        <div className="flex flex-col items-center gap-4">
          {!isRecording && !audioBlob && (
            <Button
              onClick={startRecording}
              disabled={isProcessing}
              size="lg"
              className="bg-amber-800 hover:bg-amber-900 text-white"
            >
              <Mic className="w-5 h-5 mr-2" />
              Start Recording
            </Button>
          )}

          {isRecording && (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-3 text-amber-900">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                <span className="text-2xl font-mono">{formatTime(recordingTime)}</span>
              </div>
              <Button
                onClick={stopRecording}
                size="lg"
                variant="destructive"
                className="bg-red-600 hover:bg-red-700"
              >
                <Square className="w-5 h-5 mr-2" />
                Stop Recording
              </Button>
            </div>
          )}

          {audioBlob && !isRecording && (
            <div className="space-y-4 w-full">
              <div className="p-4 bg-amber-50 border-2 border-amber-200 rounded-lg">
                <p className="text-sm text-amber-900 mb-2">
                  Recording completed: {formatTime(recordingTime)}
                </p>
                <audio 
                  controls 
                  src={URL.createObjectURL(audioBlob)}
                  className="w-full"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={processVoiceInput}
                  disabled={isProcessing}
                  className="flex-1 bg-amber-800 hover:bg-amber-900 text-white"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Process Voice Input'
                  )}
                </Button>
                <Button
                  onClick={() => {
                    setAudioBlob(null);
                    setRecordingTime(0);
                  }}
                  variant="outline"
                  className="border-amber-300"
                >
                  Discard
                </Button>
              </div>
            </div>
          )}
        </div>

        <p className="text-sm text-amber-800/70">
          {isRecording 
            ? 'Speak clearly into your microphone...'
            : 'Voice input for visually impaired users - counts toward daily usage limit'
          }
        </p>
      </div>
    </div>
  );
}