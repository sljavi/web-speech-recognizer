import * as SpeechRecognitionContinuesMode from './speech-recognition-continues-mode';
import * as SpeechRecognitionStepMode from './speech-recognition-step-mode';

const currentLang = navigator.language || navigator.userLanguage || 'en-US';
let speechRecognition;

function init({
  continuesRecognition = true,
  lang = currentLang,
  onUserSpeech,
  onUserSpeak,
}) {
  if (speechRecognition && speechRecognition.stop) {
    speechRecognition.stop();
  }
  if (continuesRecognition) {
    speechRecognition = SpeechRecognitionContinuesMode;
  } else {
    speechRecognition = SpeechRecognitionStepMode;
  }
  speechRecognition.init({
    lang,
    onUserSpeech,
    onUserSpeak,
  });
  return {
    start: speechRecognition.start,
    stop: speechRecognition.stop,
  };
}

export default {
  init,
};
