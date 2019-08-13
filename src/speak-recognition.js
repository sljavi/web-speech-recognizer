import hark from 'hark';

function getAverageVolume(list) {
  if (list.length === 0) {
    return 0;
  }
  const sum = list.reduce((acc, val) => acc + val, 0);
  return sum / list.length;
}

class SpeakRecognition {
  constructor(settings) {
    this.settings = {
      onSpeaking: () => {},
      onStopSpeaking: () => {},
      onVolumeChange: () => {},
      ...settings,
    };
  }

  async start() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });
      this.audioStream = stream;
      this.trackSpeaking(stream);
      this.trackVolume(stream);
    } catch (err) {
      console.error(err);
    }
  }

  trackSpeaking(stream) {
    const settings = this.settings;
    this.audioStreamSpeechEvents = hark(stream, {
      interval: 1000 / 8,
    });
    this.audioStreamSpeechEvents.on('speaking', settings.onSpeaking);
    this.audioStreamSpeechEvents.on('stopped_speaking', settings.onStopSpeaking);
  }

  trackVolume(stream) {
    const settings = this.settings;
    const audioContext = new AudioContext();

    this.levels = audioContext.createScriptProcessor(2048, 1, 1);
    this.analyser = audioContext.createAnalyser();
    this.analyser.smoothingTimeConstant = 0.4;
    this.analyser.fftSize = 1024;

    this.levels.onaudioprocess = (/* event */) => {
      const array = new Uint8Array(this.analyser.frequencyBinCount);
      this.analyser.getByteFrequencyData(array);
      const average = getAverageVolume(array);
      settings.onVolumeChange(average);
    };

    this.source = audioContext.createMediaStreamSource(stream);
    this.levels.connect(audioContext.destination);
    this.source.connect(this.analyser);
    this.analyser.connect(this.levels);
  }

  stop() {
    if (this.audioStream) {
      this.audioStream.getTracks().forEach(track => track.stop());
    }
    if (this.audioStreamSpeechEvents) {
      this.audioStreamSpeechEvents.stop();
    }
    if (this.levels) {
      this.levels.disconnect();
    }
    if (this.source) {
      this.source.disconnect();
    }
    if (this.analyser) {
      this.analyser.disconnect();
    }
  }
}

export default SpeakRecognition;
