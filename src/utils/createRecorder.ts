// utils/createRecorder.ts
export interface RecorderHandlers {
  onMedia?: (stream: MediaStream) => void;
  onStart?: () => void;
  onStop?: (blob: Blob) => void;
  onPause?: () => void;
  onResume?: () => void;
  onError?: (err: unknown) => void;
  onData?: (chunk: Blob) => void;
}

export interface RecorderSenders {
  start: () => void;
  stop: () => void;
  pause: () => void;
  resume: () => void;
  mute: () => void;
  unmute: () => void;
}

export interface RecorderObject extends RecorderSenders {
  stream: MediaStream | null;
  chunks: Blob[];
}

export async function createRecorder(
  handlers: RecorderHandlers
): Promise<RecorderObject> {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error("MediaDevices API not supported in this browser.");
  }

  // request camera + mic
  const stream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true,
  });

  const recorder = new MediaRecorder(stream);
  const chunks: Blob[] = [];

  // hook events
  recorder.onstart = () => handlers.onStart?.();
  recorder.onpause = () => handlers.onPause?.();
  recorder.onresume = () => handlers.onResume?.();
  recorder.onerror = (e) => handlers.onError?.(e);
  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) {
      chunks.push(e.data);
      handlers.onData?.(e.data);
    }
  };
  recorder.onstop = () => {
    const blob = new Blob(chunks, { type: "video/webm" });
    handlers.onStop?.(blob);
    stream.getTracks().forEach((t) => t.stop());
  };

  // immediately give back the media stream for preview
  handlers.onMedia?.(stream);

  return {
    stream,
    chunks,

    start: () => {
      try {
        recorder.start();
      } catch (e) {
        handlers.onError?.(e);
      }
    },
    stop: () => {
      try {
        recorder.stop();
      } catch (e) {
        handlers.onError?.(e);
      }
    },
    pause: () => {
      try {
        recorder.pause();
      } catch (e) {
        handlers.onError?.(e);
      }
    },
    resume: () => {
      try {
        recorder.resume();
      } catch (e) {
        handlers.onError?.(e);
      }
    },
    mute: () => {
      stream.getAudioTracks().forEach((t) => (t.enabled = false));
    },
    unmute: () => {
      stream.getAudioTracks().forEach((t) => (t.enabled = true));
    },
  };
}
