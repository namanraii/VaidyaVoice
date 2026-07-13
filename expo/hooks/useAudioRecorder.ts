/** Custom hook for audio recording using expo-audio on Native and MediaRecorder on Web. */
import { useState, useRef, useCallback } from 'react';
import { Platform } from 'react-native';
import {
  useAudioRecorder as useNativeRecorder,
  RecordingPresets,
  useAudioRecorderState,
  AudioModule,
  setAudioModeAsync,
} from 'expo-audio';
import * as FileSystem from 'expo-file-system';

export interface RecordingResult {
  uri: string;
  base64: string;
  duration: number;
}

// -------------------------------------------------------------
// Web Version (MediaRecorder API)
// -------------------------------------------------------------
function useWebAudioRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number>(0);

  const requestPermission = useCallback(async () => {
    try {
      const stream = await window.navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop()); // Clean up immediately
      setIsReady(true);
      return true;
    } catch (err) {
      setError('Microphone permission denied');
      return false;
    }
  }, []);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      const stream = await window.navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      startTimeRef.current = Date.now();
    } catch (err) {
      setError('Failed to start recording');
    }
  }, []);

  const stopRecording = useCallback(async (): Promise<RecordingResult | null> => {
    return new Promise((resolve) => {
      const mediaRecorder = mediaRecorderRef.current;
      if (!mediaRecorder) {
        setError('No recording active');
        resolve(null);
        return;
      }

      mediaRecorder.onstop = async () => {
        const duration = Date.now() - startTimeRef.current;
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        
        mediaRecorder.stream.getTracks().forEach(track => track.stop()); // Stop mic stream
        setIsRecording(false);

        const reader = new FileReader();
        reader.onloadend = () => {
          const base64data = (reader.result as string).split(',')[1];
          resolve({
            uri: URL.createObjectURL(audioBlob),
            base64: base64data,
            duration,
          });
        };
        reader.onerror = () => {
          setError('Failed to process audio data');
          resolve(null);
        };
        reader.readAsDataURL(audioBlob);
      };

      mediaRecorder.stop();
    });
  }, []);

  return {
    isRecording,
    isReady,
    error,
    requestPermission,
    startRecording,
    stopRecording,
  };
}

// -------------------------------------------------------------
// Native Version (expo-audio API)
// -------------------------------------------------------------
function useNativeAudioRecorder() {
  const recorder = useNativeRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const startTimeRef = useRef<number>(0);

  const requestPermission = useCallback(async () => {
    try {
      const status = await AudioModule.requestRecordingPermissionsAsync();
      if (!status.granted) {
        setError('Microphone permission denied');
        return false;
      }
      await setAudioModeAsync({
        playsInSilentMode: true,
        allowsRecording: true,
      });
      setIsReady(true);
      return true;
    } catch (err) {
      setError('Failed to request microphone permission');
      return false;
    }
  }, []);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      await recorder.prepareToRecordAsync();
      recorder.record();
      startTimeRef.current = Date.now();
    } catch (err) {
      setError('Failed to start recording');
    }
  }, [recorder]);

  const stopRecording = useCallback(async (): Promise<RecordingResult | null> => {
    try {
      await recorder.stop();
      const duration = Date.now() - startTimeRef.current;
      
      if (!recorder.uri) {
        setError('No recording URI');
        return null;
      }

      const base64 = await FileSystem.readAsStringAsync(recorder.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      return {
        uri: recorder.uri,
        base64,
        duration,
      };
    } catch (err) {
      setError('Failed to stop recording');
      return null;
    }
  }, [recorder]);

  return {
    isRecording: recorderState.isRecording,
    isReady,
    error,
    requestPermission,
    startRecording,
    stopRecording,
  };
}

// Export wrapper routing to appropriate platform-specific hook
export function useAudioRecorder() {
  return Platform.OS === 'web' ? useWebAudioRecorder() : useNativeAudioRecorder();
}
