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
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>('');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    console.log("🎤 VoiceRecordingSection mounted - WAV CONVERSION VERSION");
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      setError('');
      setDebugInfo('');
      setAudioBlob(null);
      
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError('Voice recording is not supported in your browser. Please use Chrome, Firefox, or Edge.');
        return;
      }

      // Request audio with specific constraints
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true
        } 
      });
      
      // Use WebM format for recording (browsers support this well)
      const mediaRecorder = new MediaRecorder(stream, { 
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      
      setDebugInfo(`Recording with: ${mediaRecorder.mimeType}`);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const webmBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        
        // Convert WebM to WAV
        setDebugInfo('Converting to WAV format...');
        try {
          const wavBlob = await convertWebMToWAV(webmBlob);
          setAudioBlob(wavBlob);
          setDebugInfo(`Converted to WAV: ${(wavBlob.size / 1024).toFixed(2)} KB`);
        } catch (convError) {
          console.error('Conversion error:', convError);
          // Fallback to original WebM if conversion fails
          setAudioBlob(webmBlob);
          setDebugInfo(`Using WebM format (conversion failed): ${(webmBlob.size / 1024).toFixed(2)} KB`);
        }
        
        stream.getTracks().forEach(track => track.stop());
        
        if (recordingTime < 3) {
          setError('Recording is too short. Please record at least 3 seconds of speech.');
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err: unknown) {
      if (err instanceof DOMException) {
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setError('⚠️ Microphone access denied. Click the camera/microphone icon in your browser\'s address bar, select "Allow", then refresh.');
        } else {
          setError(`Microphone error: ${err.message}`);
        }
      } else if (err instanceof Error) {
        setError(`Error: ${err.message}`);
      } else {
        setError('Could not access microphone. Please check your browser settings.');
      }
    }
  };

  // Convert WebM to WAV using Web Audio API
  const convertWebMToWAV = async (webmBlob: Blob): Promise<Blob> => {
    return new Promise(async (resolve, reject) => {
      try {
        // Create audio context
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
          sampleRate: 16000
        });
        audioContextRef.current = audioContext;
        
        // Decode WebM to audio buffer
        const arrayBuffer = await webmBlob.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        
        // Convert to WAV
        const wavBuffer = audioBufferToWAV(audioBuffer);
        
        // Create WAV blob
        const wavBlob = new Blob([wavBuffer], { type: 'audio/wav' });
        
        await audioContext.close();
        resolve(wavBlob);
      } catch (error) {
        console.error('Conversion error:', error);
        reject(error);
      }
    });
  };

  // Helper function to convert AudioBuffer to WAV format
  const audioBufferToWAV = (buffer: AudioBuffer): ArrayBuffer => {
    const numChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const format = 1; // PCM
    const bitDepth = 16;
    
    // Get audio data
    const channelData = [];
    for (let channel = 0; channel < numChannels; channel++) {
      channelData.push(buffer.getChannelData(channel));
    }
    
    // Interleave channels
    const length = channelData[0].length * numChannels * (bitDepth / 8);
    const interleaved = new Float32Array(channelData[0].length * numChannels);
    
    for (let i = 0; i < channelData[0].length; i++) {
      for (let channel = 0; channel < numChannels; channel++) {
        interleaved[i * numChannels + channel] = channelData[channel][i];
      }
    }
    
    // Convert to 16-bit PCM
    const pcmData = new Int16Array(interleaved.length);
    for (let i = 0; i < interleaved.length; i++) {
      const s = Math.max(-1, Math.min(1, interleaved[i]));
      pcmData[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    
    // Create WAV header
    const header = new ArrayBuffer(44);
    const view = new DataView(header);
    
    // RIFF identifier
    writeString(view, 0, 'RIFF');
    // RIFF chunk length
    view.setUint32(4, 36 + pcmData.byteLength, true);
    // RIFF type
    writeString(view, 8, 'WAVE');
    // format chunk identifier
    writeString(view, 12, 'fmt ');
    // format chunk length
    view.setUint32(16, 16, true);
    // sample format (raw)
    view.setUint16(20, format, true);
    // channel count
    view.setUint16(22, numChannels, true);
    // sample rate
    view.setUint32(24, sampleRate, true);
    // byte rate (sample rate * block align)
    view.setUint32(28, sampleRate * numChannels * (bitDepth / 8), true);
    // block align (channel count * bytes per sample)
    view.setUint16(32, numChannels * (bitDepth / 8), true);
    // bits per sample
    view.setUint16(34, bitDepth, true);
    // data chunk identifier
    writeString(view, 36, 'data');
    // data chunk length
    view.setUint32(40, pcmData.byteLength, true);
    
    // Combine header and PCM data
    const wavBuffer = new ArrayBuffer(header.byteLength + pcmData.byteLength);
    const wavView = new Uint8Array(wavBuffer);
    wavView.set(new Uint8Array(header), 0);
    wavView.set(new Uint8Array(pcmData.buffer), header.byteLength);
    
    return wavBuffer;
  };

  const writeString = (view: DataView, offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
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
    console.log("🔴 processVoiceInput CALLED");
    
    if (!audioBlob) {
      setError('No recording found');
      return;
    }

    console.log("Audio blob details:", {
      size: audioBlob.size,
      type: audioBlob.type,
      sizeKB: (audioBlob.size / 1024).toFixed(2)
    });

    setIsTranscribing(true);
    setError('');
    setDebugInfo('Sending WAV to Hasab AI...');

    try {
      const formData = new FormData();
      
      // Always send as WAV
      formData.append('audio', audioBlob, 'recording.wav');
      
      const backendUrl = 'http://localhost:5000/api/ocr/transcribe';
      console.log(`📡 Sending WAV file to backend`);
      
      const response = await fetch(backendUrl, {
        method: 'POST',
        body: formData,
      });

      console.log(`📥 Response status:`, response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error response:', errorText);
        throw new Error(`Server error (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ Response:', data);
      
      if (data.success) {
        console.log("✅ Transcription:", data.text);
        onVoiceText(data.text);
        setAudioBlob(null);
        setRecordingTime(0);
        setDebugInfo('✅ Transcription successful!');
      } else {
        throw new Error(data.message || 'Transcription failed');
      }
      
    } catch (err: unknown) {
      console.error('❌ Error:', err);
      
      let errorMessage = 'Unknown error';
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setError(`Connection failed: ${errorMessage}`);
    } finally {
      setIsTranscribing(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const discardRecording = () => {
    setAudioBlob(null);
    setRecordingTime(0);
    setError('');
    setDebugInfo('');
  };

  return (
    <div className="space-y-4">
      {/* Format indicator */}
      <div className="text-xs text-center bg-green-100 text-green-700 p-1 rounded-full">
        {/* ✅ Records as WebM → Converts to WAV for Hasab AI */}
      </div>

      {error && (
        <Alert variant="destructive" className="border-red-300 bg-red-50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {debugInfo && !error && (
        <div className="text-xs text-gray-500 bg-gray-100 p-2 rounded">
          {/* Debug: {debugInfo} */}
        </div>
      )}

      <div className="text-center space-y-4">
        <div className="flex flex-col items-center gap-4">
          {!isRecording && !audioBlob && (
            <Button
              onClick={startRecording}
              disabled={isProcessing || isTranscribing}
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
                <p className="text-xs text-amber-700 mb-2">
                  Format: {audioBlob.type} (converted to WAV for API)
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
                  disabled={isProcessing || isTranscribing}
                  className="flex-1 bg-amber-800 hover:bg-amber-900 text-white"
                >
                  {isTranscribing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Process with Hasab AI'
                  )}
                </Button>
                <Button
                  onClick={discardRecording}
                  variant="outline"
                  disabled={isTranscribing}
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
            : isTranscribing 
            ? 'Converting and sending to Hasab AI...'
            : 'Record audio - automatically converts to WAV for Hasab AI'
          }
        </p>
      </div>
    </div>
  );
}