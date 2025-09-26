// utils/createRecorder.ts
export type RecorderSource = "camera" | "screen" | "both";

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

interface RecorderOptions {
  source: RecorderSource; // "camera" | "screen" | "both"
  withAudio?: boolean;
}

export async function createRecorder(
  options: {
    camera: boolean;
    microphone: boolean;
    systemSound: boolean;
    watermark: boolean;
  },
  handlers: RecorderHandlers,
): Promise<RecorderObject> {
  if (!navigator.mediaDevices) {
    throw new Error("MediaDevices API not supported in this browser.");
  }

  let finalStream: MediaStream;

  if (!options.camera) {
    finalStream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: options.microphone,
    });
  } else {
    // both: combine screen + camera into one canvas
    const screenStream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: options.systemSound,
    });

    const cameraStream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 320 }, // smaller webcam overlay
        height: { ideal: 240 },
      },
      audio: options.microphone,
    });

    // create canvas for compositing
    const screenTrack = screenStream.getVideoTracks()[0];
    const screenSettings = screenTrack.getSettings();

    const canvas = document.createElement("canvas");
    canvas.width = screenSettings.width || window.screen.width;
    canvas.height = screenSettings.height || window.screen.height;
    const ctx = canvas.getContext("2d")!;

    const screenVideo = document.createElement("video");
    screenVideo.srcObject = new MediaStream([screenTrack]);
    screenVideo.play();

    const cameraVideo = document.createElement("video");
    cameraVideo.srcObject = new MediaStream(cameraStream.getVideoTracks());
    cameraVideo.play();

    // draw loop
    function draw() {
      ctx.drawImage(screenVideo, 0, 0, canvas.width, canvas.height);
      // draw camera in bottom-right corner
      const camWidth = canvas.width / 8;
      const camHeight = (cameraVideo.videoHeight / cameraVideo.videoWidth) * camWidth;
      ctx.drawImage(cameraVideo, canvas.width - camWidth - 20, canvas.height - camHeight - 20, camWidth, camHeight);
      requestAnimationFrame(draw);
    }
    draw();

    // capture canvas as stream
    const mixedStream = canvas.captureStream(30); // 30fps
    const audioTracks: MediaStreamTrack[] = [];

    if (options.systemSound || options.microphone) {
      // merge audio (both screen + mic)
      const audioCtx = new AudioContext();
      const destination = audioCtx.createMediaStreamDestination();

      if (options.systemSound && screenStream.getAudioTracks().length > 0) {
        const screenSource = audioCtx.createMediaStreamSource(screenStream);
        screenSource.connect(destination);
      }
      if (options.microphone && cameraStream.getAudioTracks().length > 0) {
        const micSource = audioCtx.createMediaStreamSource(cameraStream);
        micSource.connect(destination);
      }

      audioTracks.push(...destination.stream.getAudioTracks());
    }

    finalStream = new MediaStream([
      ...mixedStream.getVideoTracks(),
      ...audioTracks,
    ]);
  }

  // recorder setup
  const recorder = new MediaRecorder(finalStream);
  const chunks: Blob[] = [];

  recorder.addEventListener('start',() => handlers.onStart?.());
  recorder.addEventListener('pause', () => handlers.onPause?.());
  recorder.addEventListener('resume', () => handlers.onResume?.());
  recorder.addEventListener('error', (e) => handlers.onError?.(e));
  recorder.addEventListener('dataavailable', (e) => {
    if (e.data.size > 0) {
      chunks.push(e.data);
      handlers.onData?.(e.data);
    }
  });
  recorder.addEventListener('stop', () => {
    const blob = new Blob(chunks, { type: "video/webm" });
    handlers.onStop?.(blob);
    finalStream.getTracks().forEach((t) => t.stop());
  });

  // preview stream
  handlers.onMedia?.(finalStream);

  const recorderObj = {
    stream: finalStream,
    chunks,
    start: () => recorder.start(),
    stop: () => recorder.stop(),
    pause: () => recorder.pause(),
    resume: () => recorder.resume(),
    mute: () => {
      finalStream.getAudioTracks().forEach((t) => (t.enabled = false));
    },
    unmute: () => {
      finalStream.getAudioTracks().forEach((t) => (t.enabled = true));
    },
  };
  return recorderObj;
}

export function downloadFile(url: string, name = '') {
  const a = document.createElement('a');
  a.setAttribute('href', url);
  a.style.display = 'none';
  a.setAttribute('download', name);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
