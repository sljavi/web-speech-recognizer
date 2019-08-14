[![Build Status](https://travis-ci.org/sljavi/web-speech-recognizer.svg?branch=master)](https://travis-ci.org/sljavi/web-speech-recognizer)

# Web Speech Recognizer

A convenient client for Web Speech Recognition API.

In addition to handle any interaction with the Web Speech Recognition API supported by HTML 5, it notifies when the user speaks and what's the volume of the sound.

## Requirements

Web Speech Recognition API is **not** supported by all the browsers.
Here you can check the browser support
[https://caniuse.com/#feat=speech-recognition](https://caniuse.com/#feat=speech-recognition)


## Install

```
npm install web-speech-recognizer
```

## Usage

```javascript
import WebSpeechRecognizer from 'web-speech-recognizer';

const speechRecognizer = WebSpeechRecognizer.init({
  lang: 'en-US',
  continuesRecognition: true,
  onUserSpeech: (recognition) => {
    console.log('Speech recognition', recognition)
  },
  onUserSpeak: (volume) => {
    console.log('Speak volume', volume)
  }
})
```

## API
Requiring the module gives you an object that defines one primary function.

### init(settings)
Useful to initialize the speech recognition service. 

##### Arguments

`(Object)`: An object with the following properties:
 * `lang (String)`:  Language code (ISO 639-1). Default to browser language. i.e. "en-US"
 * `continuesRecognition (Bool)`: When continues recognition mode is turned on, the service will be continuously listening and returning transcriptions for what was received. If the continues recognition mode is turned off, the service will start listening after calling the `start` method, and it will stop listening as soon as the first transcription result has been reported or the `stop` method is called. Default to `true`.
 * `onUserSpeech (function)`: A callback function useful to handle the status of the speech recognition service and the speech transcriptions.
 * `onUserSpeak (function)`: A callback function to handle the user speak volume (0 - 100).

##### Returns
`(Object)`: Speech recognizer client that defines two methods `start` and `stop`.

## Examples

### Continues recognition

```javascript
import WebSpeechRecognizer from 'web-speech-recognizer';

const speechRecognizer = WebSpeechRecognizer.init({
  lang: 'it-IT',
  continuesRecognition: true,
  onUserSpeech: (recognition) => {
    console.log('Speech recognition', recognition)
  },
  onUserSpeak: (volume) => {
    console.log('Speak volume', volume)
  }
})

speechRecognizer.start();
// Now it is listening
// You can stop the service executing `speechRecognizer.stop()` and resume it executing `speechRecognizer.start()`
```

### On demand recognition

```javascript
import WebSpeechRecognizer from 'web-speech-recognizer';

const speechRecognizer = WebSpeechRecognizer.init({
  lang: 'it-IT',
  continuesRecognition: false,
  onUserSpeech: (recognition) => {
    console.log('Speech recognition', recognition)
  },
  onUserSpeak: (volume) => {
    console.log('Speak volume', volume)
  }
})

speechRecognizer.start();
// Now it is listening
// It will stop listening as soon as the first final results has been reported to the callback defined in `onUserSpeech`.
// As second option, you can stop the service executing `speechRecognizer.stop()`
// If you want to resume the speech recognition you have to re-execute `speechRecognizer.start()`
```