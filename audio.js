//The following line is MIT licensed from https://github.com/beatgammit/base64-js
(function(r){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=r()}else if(typeof define==="function"&&define.amd){define([],r)}else{var e;if(typeof window!=="undefined"){e=window}else if(typeof global!=="undefined"){e=global}else if(typeof self!=="undefined"){e=self}else{e=this}e.base64js=r()}})(function(){var r,e,t;return function n(r,e,t){function o(i,a){if(!e[i]){if(!r[i]){var u=typeof require=="function"&&require;if(!a&&u)return u(i,!0);if(f)return f(i,!0);var d=new Error("Cannot find module '"+i+"'");throw d.code="MODULE_NOT_FOUND",d}var c=e[i]={exports:{}};r[i][0].call(c.exports,function(e){var t=r[i][1][e];return o(t?t:e)},c,c.exports,n,r,e,t)}return e[i].exports}var f=typeof require=="function"&&require;for(var i=0;i<t.length;i++)o(t[i]);return o}({"/":[function(r,e,t){"use strict";t.toByteArray=a;t.fromByteArray=c;var n=[];var o=[];var f=typeof Uint8Array!=="undefined"?Uint8Array:Array;function i(){var r="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";for(var e=0,t=r.length;e<t;++e){n[e]=r[e];o[r.charCodeAt(e)]=e}o["-".charCodeAt(0)]=62;o["_".charCodeAt(0)]=63}i();function a(r){var e,t,n,i,a,u;var d=r.length;if(d%4>0){throw new Error("Invalid string. Length must be a multiple of 4")}a=r[d-2]==="="?2:r[d-1]==="="?1:0;u=new f(d*3/4-a);n=a>0?d-4:d;var c=0;for(e=0,t=0;e<n;e+=4,t+=3){i=o[r.charCodeAt(e)]<<18|o[r.charCodeAt(e+1)]<<12|o[r.charCodeAt(e+2)]<<6|o[r.charCodeAt(e+3)];u[c++]=i>>16&255;u[c++]=i>>8&255;u[c++]=i&255}if(a===2){i=o[r.charCodeAt(e)]<<2|o[r.charCodeAt(e+1)]>>4;u[c++]=i&255}else if(a===1){i=o[r.charCodeAt(e)]<<10|o[r.charCodeAt(e+1)]<<4|o[r.charCodeAt(e+2)]>>2;u[c++]=i>>8&255;u[c++]=i&255}return u}function u(r){return n[r>>18&63]+n[r>>12&63]+n[r>>6&63]+n[r&63]}function d(r,e,t){var n;var o=[];for(var f=e;f<t;f+=3){n=(r[f]<<16)+(r[f+1]<<8)+r[f+2];o.push(u(n))}return o.join("")}function c(r){var e;var t=r.length;var o=t%3;var f="";var i=[];var a=16383;for(var u=0,c=t-o;u<c;u+=a){i.push(d(r,u,u+a>c?c:u+a))}if(o===1){e=r[t-1];f+=n[e>>2];f+=n[e<<4&63];f+="=="}else if(o===2){e=(r[t-2]<<8)+r[t-1];f+=n[e>>10];f+=n[e>>4&63];f+=n[e<<2&63];f+="="}i.push(f);return i.join("")}},{}]},{},[])("/")});

(function(window) {
  
  function LocalConsumer() {
  };
  
  LocalConsumer.prototype.postMessage = function(cmd) {
    this[cmd.command](cmd.data);
  };
  
  LocalConsumer.prototype.start = function() { };
  LocalConsumer.prototype.stop = function() { };
  LocalConsumer.prototype.process = function() { };
  
  function WavExportConsumer(config) {
    this.sampleRate = config.sampleRate;
    this.maxLength = (config.durationSeconds || 10) * config.sampleRate;
    this.buffer = [];
    this.onFinish = config.onFinish || function(){};
    this.isRecording = false; //auto-start
    this.loop = config.loop || false;
  }
  
  WavExportConsumer.prototype = new LocalConsumer();
  WavExportConsumer.prototype.constructor = WavExportConsumer;
  
  WavExportConsumer.prototype.start = function() {
    this.isRecording = true;
  };
  
  WavExportConsumer.prototype.stop = function() {
    this.done(false);
  };
  
  WavExportConsumer.prototype.done = function(loop) {
    var wav = this.encodeWAV(this.buffer);
    this.onFinish(wav, this.buffer);
    this.buffer = [];
    this.isRecording = loop;
  };
  
  WavExportConsumer.prototype.process = function(buffer) {
    
    if(this.isRecording) {
      
      for(var i=0; i<buffer.length; i++) {
        this.buffer.push(buffer[i]);
      }
      
      if(this.buffer.length >= this.maxLength) {
        this.done(this.loop);
      }
    }
  };
  
  //The following portions for WavExportConsumer are from
  //https://github.com/mattdiamond/Recorderjs
  //Copyright © 2013 Matt Diamond License MIT
  WavExportConsumer.prototype.writeString = function(view, offset, string) {
      for (var i = 0; i < string.length; i++) {
          view.setUint8(offset + i, string.charCodeAt(i));
      }
  };
  
  WavExportConsumer.prototype.encodeWAV = function(samples) {
      var len = Math.min(samples.length, this.maxLength);
      var buffer = new ArrayBuffer(44 + len * 2);
      var view = new DataView(buffer);
      
      var numChannels = 1;
      /* RIFF identifier */
      this.writeString(view, 0, 'RIFF');
      /* RIFF chunk length */
      view.setUint32(4, 36 + len * 2, true);
      /* RIFF type */
      this.writeString(view, 8, 'WAVE');
      /* format chunk identifier */
      this.writeString(view, 12, 'fmt ');
      /* format chunk length */
      view.setUint32(16, 16, true);
      /* sample format (raw) */
      view.setUint16(20, 1, true);
      /* channel count */
      view.setUint16(22, numChannels, true);
      /* sample rate */
      view.setUint32(24, this.sampleRate, true);
      /* byte rate (sample rate * block align) */
      view.setUint32(28, this.sampleRate * 2, true);
      /* block align (channel count * bytes per sample) */
      view.setUint16(32, numChannels * 2, true);
      /* bits per sample */
      view.setUint16(34, 16, true);
      /* data chunk identifier */
      this.writeString(view, 36, 'data');
      /* data chunk length */
      view.setUint32(40, len * 2, true);
      
      this.buffersToView(view, 44, samples);
      
      return view;
  };
  
  WavExportConsumer.prototype.buffersToView = function(output, offset, input) {
    var i = 0;
    var cap = Math.min(input.length, this.maxLength);
    for (var j = 0; j < input.length && i < cap; j++, i++, offset += 2) {
        output.setInt16(offset, input[j], true);
    }
  };
  
  var audioContext, recorder;
  var errors = [];
  var isMicReady = false;
  
  function microphoneReady(stream) {
    //only one recorder is really needed for all of the controls
    var input = audioContext.createMediaStreamSource(stream);
    // Firefox hack https://support.mozilla.org/en-US/questions/984179
    window.firefox_audio_hack = input; 
    var audioRecorderConfig = {errorCallback: function(x) {
      errors.push(x);
    }};
    
    recorder = new window.AudioRecorder(input, audioRecorderConfig);
    recorder.consumers = [];
    isMicReady = true;
    recorder.start();
    var eles = document.querySelectorAll('[data-audio-input]');
    for(var i=0; i<eles.length; i++) {
      var ele = eles[i];
      
      if(ele.polymathAudioControl) {
        ele.polymathAudioControl.ready();
      }
    }
  };

  function updateStatus(msg) {
    errors.push(msg);
    isMicReady = false;
    if(console && console.error){
      console.error(msg);
    }
  }
  
  function AudioControl(opts) {
    this.element = opts.element;
    this.duartion = opts.duration;
    this.play = opts.play;
    this.record = opts.record;
    this.consumer = null;
    
    this.play.setAttribute("disabled", "disabled");
    
    this.waveForm = opts.waveForm; //optional
    this.sampleRate = opts.sampleRate; //optional
    
    this.value = null;
    this.audioElement = null;
    this.status = 'stopped';
    
    this.element.classList.add('audio-input');
    this.play.classList.add('audio-play');
    this.record.classList.add('audio-record');
    if(this.waveForm) {
      this.waveForm.classList.add('audio-waveform');
    }
    
    var self = this;
    this.play.onclick = function() {
      self.playRecording();
    };
    
    this.record.onclick = function() {
      if(self.status == 'recording')
        self.stopRecording();
      else if(self.status == 'stopped')
        self.startRecording();
    };
    
    if(isMicReady) {
      this.ready();
    }
  }
  
  AudioControl.prototype.ready = function() {
    if(this.consumer)
      return;
    
    this.element.classList.remove('disabled');
    this.element.removeAttribute('disabled');
    
    var self = this;
    this.consumer = new WavExportConsumer({
      sampleRate: this.sampleRate || 16000,
      durationSeconds: this.duration,
      onFinish: function(wavFile, buffer) {
        self.stopRecording();
        self.visualize(buffer);
        
        self.value = wavFile;
        var b = new window.Blob([wavFile], { type: 'audio/wav' });
        var url = window.URL.createObjectURL(b);
        if(self.audioElement) {
          self.audioElement.remove();
        }
        self.audioElement = new Audio(url);
        self.audioElement.controls = false;
        self.element.classList.add('audio-hasdata');
        if ("createEvent" in document) {
            var evt = document.createEvent("HTMLEvents");
            evt.initEvent("change", false, true);
            self.element.dispatchEvent(evt);
        }
        else {
            self.element.fireEvent("onchange");
        }
      }
    });
    recorder.consumers.push(this.consumer);
  };
  
  AudioControl.prototype.visualize = function(buffer) {
    
    if(!this.waveForm)
      return;
    
    var canvas = this.waveForm;
    var w = canvas.width = canvas.clientWidth;
    var h = canvas.height = canvas.clientHeight;
    
    if(!this.waveFormCtx) {
      this.waveFormCtx = canvas.getContext('2d');
    }
    
    var ctx = this.waveFormCtx;
    
    var length = buffer.length;
    
    var step = Math.ceil( length / w );
    var amp = h / 2;
    ctx.fillStyle = 'rgb(0, 0, 0)';
    ctx.fillRect(0, 0, w, h);
    
    ctx.fillStyle = 'rgb(0, 128, 0)';
    
    var upper = -32768;
    var lower = 32768;
    for(var i=0; i<length; i++) {
      upper = Math.max(buffer[i], upper);
      lower = Math.min(buffer[i], lower);
    }
    
    var scale = Math.max(Math.abs(upper), Math.abs(lower));
    
    for(var i=0; i < w; i++) {
        
        var min = 1.0;
        var max = -1.0;
        
        for (var j=0; j<step; j++) {
          
          var idx = (i*step)+j;
          var datum = buffer[idx] / scale;
          
          if (datum < min)
              min = datum;
          if (datum > max)
              max = datum;
        }
        
        ctx.fillRect(i,(1+min)*amp,1,Math.max(1,(max-min)*amp));
    }
  };
  
  AudioControl.prototype.isDisabled = function() {
    return !isMicReady || this.element.classList.contains('disabled') || this.element.hasAttribute('disabled');
  };
  
  AudioControl.prototype.startRecording = function() {
    
    if(this.isDisabled() || this.status == 'recording') {
      return;
    }
    
    this.element.classList.add('audio-recording');
    this.element.classList.remove('audio-hasdata');
    this.status = 'recording';
    this.play.setAttribute("disabled", "disabled");
    this.consumer.start();
  };
  
  AudioControl.prototype.stopRecording = function() {
    if(this.isDisabled() || this.status != 'recording') {
      return;
    }
    
    this.element.classList.remove('audio-recording');
    this.status = 'stopped';
    this.consumer.stop();
    this.play.removeAttribute("disabled", "disabled");
  };
  
  AudioControl.prototype.playRecording = function() {
    if(this.isDisabled() || this.status != 'stopped' || !this.audioElement) {
      return;
    }
    
    this.audioElement.play();
  };
  
  function createAudioControl(ele) {
    
    var ctrl = new AudioControl({
      element: ele,
      duartion: parseInt(ele.getAttribute('data-audio-max-duration')) || 10,
      play: ele.querySelector('[data-audio-play]'),
      record: ele.querySelector('[data-audio-record]'),
      waveForm: ele.querySelector('[data-audio-waveform]'),
      sampleRate: parseInt(ele.getAttribute('data-audio-sample-rate'))
    });
    
    ele.polymathAudioControl = ctrl;
  }
  
  window.onload = function() {
    var navigator = window.navigator;
    try {
      window.AudioContext = window.AudioContext || window.webkitAudioContext;
      navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
      window.URL = window.URL || window.webkitURL;
      audioContext = new window.AudioContext();
    } catch (e) {
      updateStatus("Error initializing Web Audio browser");
    }
    if (navigator.getUserMedia) {
      navigator.getUserMedia({audio: true}, microphoneReady, function(e) {
        updateStatus("No live audio input in this browser");
      });
    } else
      updateStatus("No web audio support in this browser");
    
    var eles = document.querySelectorAll('[data-audio-input]');
    for(var i=0; i<eles.length; i++) {
      var ele = eles[i];
      
      createAudioControl(ele);
    }
  };
  
})(window);