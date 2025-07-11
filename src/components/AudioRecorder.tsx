import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Square, Play, Pause, Download, Trash2, Loader2 } from 'lucide-react';

interface AudioRecorderProps {
  onAudioReady: (audioBlob: Blob, audioFile: File) => void;
  isProcessing?: boolean;
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({ onAudioReady, isProcessing = false }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    // Check for microphone permission on component mount
    checkMicrophonePermission();
    
    return () => {
      // Cleanup
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, []);

  const checkMicrophonePermission = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError('Audio recording is not supported in this browser');
        setHasPermission(false);
        return;
      }

      // Check if we already have permission
      const permissionStatus = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      
      if (permissionStatus.state === 'granted') {
        setHasPermission(true);
      } else if (permissionStatus.state === 'denied') {
        setHasPermission(false);
        setError('Microphone permission denied. Please enable microphone access in your browser settings.');
      } else {
        setHasPermission(null); // Will request permission when user clicks record
      }
    } catch (err) {
      console.error('Error checking microphone permission:', err);
      setHasPermission(null);
    }
  };

  const requestMicrophoneAccess = async (): Promise<MediaStream | null> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });
      setHasPermission(true);
      setError(null);
      return stream;
    } catch (err: any) {
      console.error('Error accessing microphone:', err);
      setHasPermission(false);
      
      if (err.name === 'NotAllowedError') {
        setError('Microphone permission denied. Please enable microphone access and try again.');
      } else if (err.name === 'NotFoundError') {
        setError('No microphone found. Please connect a microphone and try again.');
      } else {
        setError('Failed to access microphone. Please check your browser settings.');
      }
      return null;
    }
  };

  const startRecording = async () => {
    try {
      setError(null);
      
      // Request microphone access if we don't have it
      let stream = streamRef.current;
      if (!stream) {
        stream = await requestMicrophoneAccess();
        if (!stream) return;
        streamRef.current = stream;
      }

      // Clear previous recording
      audioChunksRef.current = [];
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
        setAudioUrl(null);
      }
      setAudioBlob(null);

      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm;codecs=opus') 
          ? 'audio/webm;codecs=opus' 
          : 'audio/webm'
      });

      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        
        // Create a File object for the API
        const audioFile = new File([blob], `recording-${Date.now()}.webm`, { type: 'audio/webm' });
        onAudioReady(blob, audioFile);
      };

      // Start recording
      mediaRecorder.start(100); // Collect data every 100ms
      setIsRecording(true);
      setIsPaused(false);
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (err: any) {
      console.error('Error starting recording:', err);
      setError('Failed to start recording. Please try again.');
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      
      // Resume timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const playAudio = () => {
    if (audioUrl && audioElementRef.current) {
      audioElementRef.current.play();
      setIsPlaying(true);
    }
  };

  const pauseAudio = () => {
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      setIsPlaying(false);
    }
  };

  const downloadAudio = () => {
    if (audioUrl) {
      const a = document.createElement('a');
      a.href = audioUrl;
      a.download = `recording-${new Date().toISOString().slice(0, 19)}.webm`;
      a.click();
    }
  };

  const clearRecording = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioUrl(null);
    setAudioBlob(null);
    setIsPlaying(false);
    setRecordingTime(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (hasPermission === false) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 text-red-700 mb-2">
          <MicOff className="h-5 w-5" />
          <span className="font-medium">Microphone Access Required</span>
        </div>
        <p className="text-red-600 text-sm mb-3">{error}</p>
        <button
          onClick={checkMicrophonePermission}
          className="text-sm bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition-colors"
        >
          Check Permission Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Recording Controls */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Mic className="h-5 w-5 text-gray-600" />
            <span className="font-medium text-gray-900">Audio Recorder</span>
          </div>
          
          {(isRecording || recordingTime > 0) && (
            <div className="flex items-center space-x-2">
              {isRecording && (
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-red-600">REC</span>
                </div>
              )}
              <span className="text-sm font-mono text-gray-600">
                {formatTime(recordingTime)}
              </span>
            </div>
          )}
        </div>

        {/* Recording Buttons */}
        <div className="flex items-center space-x-2 mb-4">
          {!isRecording ? (
            <button
              onClick={startRecording}
              disabled={isProcessing}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              <Mic className="h-4 w-4" />
              <span>Start Recording</span>
            </button>
          ) : (
            <div className="flex items-center space-x-2">
              {!isPaused ? (
                <button
                  onClick={pauseRecording}
                  className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors flex items-center space-x-2"
                >
                  <Pause className="h-4 w-4" />
                  <span>Pause</span>
                </button>
              ) : (
                <button
                  onClick={resumeRecording}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                >
                  <Play className="h-4 w-4" />
                  <span>Resume</span>
                </button>
              )}
              
              <button
                onClick={stopRecording}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
              >
                <Square className="h-4 w-4" />
                <span>Stop</span>
              </button>
            </div>
          )}
        </div>

        {/* Audio Playback */}
        {audioUrl && (
          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-700">Recorded Audio</span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={downloadAudio}
                  className="text-blue-600 hover:text-blue-800 transition-colors"
                  title="Download recording"
                >
                  <Download className="h-4 w-4" />
                </button>
                <button
                  onClick={clearRecording}
                  className="text-red-600 hover:text-red-800 transition-colors"
                  title="Delete recording"
                  disabled={isProcessing}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={isPlaying ? pauseAudio : playAudio}
                className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors"
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </button>
              
              <audio
                ref={audioElementRef}
                src={audioUrl}
                onEnded={() => setIsPlaying(false)}
                onPause={() => setIsPlaying(false)}
                className="flex-1"
                controls
              />
            </div>
          </div>
        )}

        {isProcessing && (
          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-center space-x-2 text-blue-600">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Processing audio...</span>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}
    </div>
  );
};

export default AudioRecorder;