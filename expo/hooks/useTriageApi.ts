/** Custom hook for triage API calls with loading and error states. */
import { useState, useCallback } from 'react';
import { triageFromAudio, triageFromText, TriageResponse, TriageRequest } from '../services/api';

export function useTriageApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TriageResponse | null>(null);

  const submitAudio = useCallback(async (request: TriageRequest) => {
    setLoading(true);
    setError(null);
    try {
      const response = await triageFromAudio(request);
      setResult(response);
      return response;
    } catch (err: any) {
      setError(err.message || 'Triage failed');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const submitText = useCallback(async (text: string, sessionId: string, language: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await triageFromText(text, sessionId, language);
      setResult(response);
      return response;
    } catch (err: any) {
      setError(err.message || 'Text triage failed');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    loading,
    error,
    result,
    submitAudio,
    submitText,
    reset,
  };
}
