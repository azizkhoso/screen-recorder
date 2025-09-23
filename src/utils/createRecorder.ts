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
  handlers: RecorderHandlers,
  options: RecorderOptions = { source: "camera", withAudio: true }
): Promise<RecorderObject> {
  if (!navigator.mediaDevices) {
    throw new Error("MediaDevices API not supported in this browser.");
  }

  const { source, withAudio = true } = options;

  let finalStream: MediaStream;

  if (source === "camera") {
    const screenWidth = window.screen.width;
    const screenHeight = window.screen.height;

    finalStream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: screenWidth },
        height: { ideal: screenHeight },
      },
      audio: withAudio,
    });
  } else if (source === "screen") {
    finalStream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: withAudio,
    });
  } else {
    // both: combine screen + camera into one canvas
    const screenStream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: withAudio,
    });

    const cameraStream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 320 }, // smaller webcam overlay
        height: { ideal: 240 },
      },
      audio: withAudio,
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
      const camWidth = canvas.width / 4;
      const camHeight = (cameraVideo.videoHeight / cameraVideo.videoWidth) * camWidth;
      ctx.drawImage(cameraVideo, canvas.width - camWidth - 20, canvas.height - camHeight - 20, camWidth, camHeight);
      requestAnimationFrame(draw);
    }
    draw();

    // capture canvas as stream
    const mixedStream = canvas.captureStream(30); // 30fps
    const audioTracks: MediaStreamTrack[] = [];

    if (withAudio) {
      // merge audio (both screen + mic)
      const audioCtx = new AudioContext();
      const destination = audioCtx.createMediaStreamDestination();

      if (screenStream.getAudioTracks().length > 0) {
        const screenSource = audioCtx.createMediaStreamSource(screenStream);
        screenSource.connect(destination);
      }
      if (cameraStream.getAudioTracks().length > 0) {
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
    finalStream.getTracks().forEach((t) => t.stop());
  };

  // preview stream
  handlers.onMedia?.(finalStream);

  return {
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
}
