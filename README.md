# Audio Input

A simple control to enable capturing microphone audio as a sort of input element.

# Usage

You need all three js files:
* audio.js
* audioRecorder.js
* audioRecorderWorker.js

Rumor has it that this works best with user-permission requirements via SSL.

## Ugly/unstyled usage
```html

    <div data-audio-input
         data-audio-max-duration="15"
         data-audio-sample-rate="16000"
         onchange="recordingChange(this.polymathAudioControl.value)">
      
        <button type="button" data-audio-play>play</button>
        <canvas data-audio-waveform></canvas>
        <button class="btn btn-default" type="button" data-audio-record>record</button>
    </div>
    <script src="audio.js"></script>
    <script src="audioRecorder.js"></script>
```

```javascript

//You can get the value in the onchange event

function recordingChange(dataView) {
    //do whatever you want with the dataview object. It's a .wav file
    var b = new window.Blob([wavFile], { type: 'audio/wav' });
}

```

## Bootstrap usage to make it pretty

```html

    <style>
      .audio-recording .audio-record * {
      	-webkit-animation: pulse 1s linear infinite;
      	-moz-animation: pulse 1s linear infinite;
      	-ms-animation: pulse 1s linear infinite;
      	animation: pulse 1s linear infinite;
      	color: red;
      }
      
      .audio-waveform {
        padding: 0;
      }
    </style>
    
    ...

    <div data-audio-input
         data-audio-max-duration="15"
         data-audio-sample-rate="16000"
         onchange="recordingChange()">
      
      <div class="container">
          <div class="row">
            <div class="col-sm-6 col-md-3">
              <div class="input-group">
                <span class="input-group-btn">
                  <button class="btn btn-default" type="button" data-audio-play>
                    <span class="glyphicon glyphicon-play"></span>
                  </button>
                </span>
                <canvas class="form-control form-control-static" data-audio-waveform></canvas>
                <span class="input-group-btn">
                  <button class="btn btn-default" type="button" data-audio-record>
                    <span class="glyphicon glyphicon-record"></span>
                  </button>
                </span>
              </div>
            </div>
          </div>
      </div>
    </div>
```

## Options

The following classes are added based on their data-* properties:
* .audio-play
* .audio-record
* .audio-waveform
* .audio-input

When recording the `.audio-recording` class is added to the main element.

When data is available the `.audio-hasdata` class is added to the main element.

## Dependencies

Uses some libraries from [pocketsphinx.js](https://github.com/syl22-00/pocketsphinx.js).