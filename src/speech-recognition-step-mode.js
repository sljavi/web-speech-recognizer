import SpeakRecognition from './speak-recognition';

let speakRecognizer;
let speechRecognizer;
let speechRecognizerStarted = false;
let onUserSpeech;
let onUserSpeak;
let waitingForResultTimeout;

const defaultConfig = {
  lang: 'en-US',
  interimResults: true,
  maxAlternatives: 10,
};

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

function handleOnStart() {
  notifySpeechRecognizerState({
    status: 'recording',
  });
}

function stopSpeakRecognizer() {
  onUserSpeak(0);
  if (speakRecognizer) {
    speakRecognizer.stop();
  }
}

function startSpeakRecognizer() {
  speakRecognizer = new SpeakRecognition({
    onVolumeChange: (volume) => {
      onUserSpeak(volume);
    },
  });
  speakRecognizer.start();
  onUserSpeak(0);
}

function abortSpeechRecognizer() {
  if (onUserSpeak) {
    stopSpeakRecognizer();
  }
  speechRecognizer.abort();
  speechRecognizerStarted = false;
  notifySpeechRecognizerState();
}

function updateHandleResultTimeout(transcriptions, isFinal) {
  clearTimeout(waitingForResultTimeout);
  if (!isFinal) {
    waitingForResultTimeout = setTimeout(() => {
      notifySpeechRecognizerState({
        finalTranscriptions: true,
        transcriptions,
      });
      abortSpeechRecognizer();
    }, 2000);
  }
}

function stopSpeechRecognizer() {
  if (onUserSpeak) {
    stopSpeakRecognizer();
  }
  speechRecognizerStarted = false;
  clearTimeout(waitingForResultTimeout);
  notifySpeechRecognizerState();
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

function handleOnEnd() {
  speechRecognizerStarted = false;
  clearTimeout(waitingForResultTimeout);
  if (onUserSpeak) {
    stopSpeakRecognizer();
  }
  notifySpeechRecognizerState();
}

function handleError(event) {
  notifySpeechRecognizerState({
    error: event.error,
    status: 'error',
  });
  if (onUserSpeak) {
    stopSpeakRecognizer();
  }
}

function startSpeechRecognizer() {
  if (!speechRecognizerStarted) {
    notifySpeechRecognizerState({
      status: 'starting',
    });
    try {
      speechRecognizer.start();
      speechRecognizerStarted = true;
    } catch (err) {
      console.error(err);
    }
  }
}

function initSpeechRecognition({ lang, interimResults, maxAlternatives }) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  speechRecognizer = new SpeechRecognition();
  speechRecognizer.continuous = false;
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
  initSpeechRecognition(updatedConfig);
  onUserSpeech = config.onUserSpeech;
  onUserSpeak = config.onUserSpeak;
}

export function start() {
  if (onUserSpeak) {
    startSpeakRecognizer();
  }
  if (onUserSpeech) {
    startSpeechRecognizer();
  }
}

export function stop() {
  if (onUserSpeak) {
    stopSpeakRecognizer();
  }
  if (onUserSpeech) {
    stopSpeechRecognizer();
  }
}
