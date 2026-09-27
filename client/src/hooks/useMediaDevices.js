import { useCallback, useEffect, useRef, useState } from 'react';

const DEVICE_KINDS = ['audioinput', 'videoinput', 'audiooutput'];
const EMPTY_DEVICES = { audioinput: [], videoinput: [], audiooutput: [] };

function groupDevices(deviceList) {
  return deviceList.reduce((grouped, device) => {
    if (DEVICE_KINDS.includes(device.kind)) grouped[device.kind].push(device);
    return grouped;
  }, { audioinput: [], videoinput: [], audiooutput: [] });
}

export default function useMediaDevices(videoRef) {
  const streamRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [devices, setDevices] = useState(EMPTY_DEVICES);
  const [selected, setSelected] = useState({ audioinput: '', videoinput: '', audiooutput: '' });
  const [error, setError] = useState('');

  const refreshDevices = useCallback(async () => {
    if (!navigator.mediaDevices?.enumerateDevices) {
      setError('This browser does not provide media device access.');
      return;
    }
    const grouped = groupDevices(await navigator.mediaDevices.enumerateDevices());
    setDevices(grouped);
    setSelected((current) => ({
      audioinput: grouped.audioinput.some((device) => device.deviceId === current.audioinput) ? current.audioinput : grouped.audioinput[0]?.deviceId || '',
      videoinput: grouped.videoinput.some((device) => device.deviceId === current.videoinput) ? current.videoinput : grouped.videoinput[0]?.deviceId || '',
      audiooutput: grouped.audiooutput.some((device) => device.deviceId === current.audiooutput) ? current.audiooutput : grouped.audiooutput[0]?.deviceId || '',
    }));
  }, []);

  const startPreview = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setError('This browser does not provide camera and microphone access.');
      return null;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      streamRef.current = stream;
      setStream(stream);
      if (videoRef.current) videoRef.current.srcObject = stream;
      await refreshDevices();
      setError('');
      return stream;
    } catch {
      setError('Camera and microphone permission is required for a live preview.');
      return null;
    }
  }, [refreshDevices, videoRef]);

  const replaceInput = useCallback(async (kind, deviceId, enabledState) => {
    if (kind === 'audiooutput') {
      if (!videoRef.current?.setSinkId) {
        setError('Speaker selection is not supported by this browser.');
        return;
      }
      try {
        await videoRef.current.setSinkId(deviceId);
        setSelected((current) => ({ ...current, audiooutput: deviceId }));
        setError('');
      } catch {
        setError('That speaker could not be selected.');
      }
      return;
    }

    const nextSelection = { ...selected, [kind]: deviceId };
    const constraints = {
      audio: nextSelection.audioinput ? { deviceId: { exact: nextSelection.audioinput } } : true,
      video: nextSelection.videoinput ? { deviceId: { exact: nextSelection.videoinput } } : true,
    };
    try {
      const nextStream = await navigator.mediaDevices.getUserMedia(constraints);
      nextStream.getAudioTracks().forEach((track) => { track.enabled = enabledState.mic; });
      nextStream.getVideoTracks().forEach((track) => { track.enabled = enabledState.camera; });
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = nextStream;
      setStream(nextStream);
      if (videoRef.current) videoRef.current.srcObject = nextStream;
      setSelected(nextSelection);
      setError('');
    } catch {
      setError('That device could not be opened. Please choose another input.');
    }
  }, [selected, videoRef]);

  useEffect(() => {
    const mediaDevices = navigator.mediaDevices;
    if (!mediaDevices) return undefined;
    const handleDeviceChange = () => { refreshDevices().catch(() => setError('Unable to refresh media devices.')); };
    mediaDevices.addEventListener?.('devicechange', handleDeviceChange);
    startPreview();
    return () => {
      mediaDevices.removeEventListener?.('devicechange', handleDeviceChange);
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, [refreshDevices, startPreview]);

  return { devices, selected, setSelected, streamRef, stream, error, setError, replaceInput };
}
