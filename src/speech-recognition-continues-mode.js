import SpeakRecognition from './speak-recognition';

let speakRecognizer;
let speechRecognizer;
let waitingForResultTimeout;
let waitingForActivityTimeout;
let speaking;

let stopped = false;

let onUserSpeech;
let onUserSpeak;

const defaultState = {
  error: null,
  status: 'stopped',
  transcriptions: [],
  finalTranscriptions: false,
};

const notifySpeechRecognizerState = (props = {}) => {
  onUserSpeech({
    ...defaultState,
    ...props,
  });
};

const defaultConfig = {
  lang: 'en-US',
  interimResults: true,
  maxAlternatives: 10,
};

function clearAllTimeouts() {
  clearTimeout(waitingForResultTimeout);
  clearTimeout(waitingForActivityTimeout);
}

function abortSpeechRecognizer() {
  clearAllTimeouts();
  speechRecognizer.abort();
  notifySpeechRecognizerState();
  onUserSpeak(0);
}

function stopSpeechRecognizer() {
  clearAllTimeouts();
  if (speechRecognizer) {
    speechRecognizer.stop();
  }
  notifySpeechRecognizerState();
  onUserSpeak(0);
}

function startSpeechRecognizer() {
  notifySpeechRecognizerState({
    status: 'starting',
  });
  onUserSpeak(0);
  try {
    speechRecognizer.start();
  } catch (err) {
    console.error(err);
  }
}

function delayedStartSpeechRecognizer() {
  try {
    setTimeout(startSpeechRecognizer, 100);
  } catch (error) {
    delayedStartSpeechRecognizer();
  }
}

function stopSpeakRecognizer() {
  if (speakRecognizer) {
    speakRecognizer.stop();
  }
  onUserSpeak(0);
}

function handleOnEnd() {
  clearAllTimeouts();
  notifySpeechRecognizerState();
  onUserSpeak(0);
  if (!stopped) {
    delayedStartSpeechRecognizer();
  }
}

function handleOnStart() {
  notifySpeechRecognizerState({
    status: 'recording',
  });
  onUserSpeak(0);
}

function updateHandleResultTimeout(transcriptions, isFinal) {
  clearTimeout(waitingForResultTimeout);
  if (!isFinal) {
    waitingForResultTimeout = setTimeout(() => {
      notifySpeechRecognizerState({
        finalTranscriptions: true,
        status: 'recording',
        transcriptions,
      });
      abortSpeechRecognizer();
    }, 2000);
  }
}

function handleResult(result) {
  if (!result || !result.results) {
    return;
  }
  const recognition = result.results[result.resultIndex];
  const transcriptions = Object.values(recognition).map(text => ({
    confidence: text.confidence,
    text: text.transcript,
  }));
  notifySpeechRecognizerState({
    finalTranscriptions: recognition.isFinal,
    status: 'recording',
    transcriptions,
  });
  updateHandleResultTimeout(transcriptions, recognition.isFinal);
}

function handleError(event) {
  notifySpeechRecognizerState({
    error: event.error,
    status: 'error',
  });
  onUserSpeak(0);
}

function handleWaitingForActivityTimeout() {
  if (!speaking) {
    abortSpeechRecognizer();
  }
}

function startSpeakRecognizer() {
  speakRecognizer = new SpeakRecognition({
    onSpeaking: () => {
      speaking = true;
    },
    onStopSpeaking: () => {
      speaking = false;
      clearTimeout(waitingForActivityTimeout);
      waitingForActivityTimeout = setTimeout(handleWaitingForActivityTimeout, 5000);
    },
    onVolumeChange: (volume) => {
      onUserSpeak(volume);
    },
  });
  onUserSpeak(0);
  speakRecognizer.start();
}

function initSpeechRecognition({ lang, interimResults, maxAlternatives }) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  speechRecognizer = new SpeechRecognition();
  speechRecognizer.continuous = true;
  speechRecognizer.lang = lang;
  speechRecognizer.interimResults = interimResults;
  speechRecognizer.maxAlternatives = maxAlternatives;

  speechRecognizer.onstart = handleOnStart;
  speechRecognizer.onresult = handleResult;
  speechRecognizer.onerror = handleError;
  speechRecognizer.onend = handleOnEnd;
}

export function init(config) {
  const updatedConfig = {
    ...defaultConfig,
    ...config,
  };
  onUserSpeech = config.onUserSpeech;
  onUserSpeak = config.onUserSpeak;
  initSpeechRecognition(updatedConfig);
}

export function start() {
  stopped = false;
  if (onUserSpeak) {
    startSpeakRecognizer();
  }
  if (onUserSpeech) {
    startSpeechRecognizer();
  }
}

export function stop() {
  stopped = true;
  clearAllTimeouts();
  if (onUserSpeak) {
    stopSpeakRecognizer();
  }
  if (onUserSpeech) {
    stopSpeechRecognizer();
  }
}
