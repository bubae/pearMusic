var APP_ID = chrome.runtime.id;

// FIXME: merge these constants into ../others/constants.js
var CONSTANTS = {
  LOAD_VIDEO: 'LOAD_VIDEO',
  CUE_VIDEO: 'CUE_VIDEO',
  TOGGLE_PLAY_PAUSE: 'TOGGLE_PLAY_PAUSE',
  ERROR_CODE: 6,
  PLAYER_READY: 'PLAYER_READY',
  SET_VOLUME: 'SET_VOLUME',
  SET_VIDEO_SIZE: 'SET_VIDEO_SIZE',
  SMALL_SIZE: "SMALL_SIZE",
  BIG_SIZE: "BIG_SIZE",
  MAX_SIZE: "MAX_SIZE",
  REPORT_TO_GA: "REPORT_TO_GA",
};

var messageHandler = function(rawMsg) {
  console.log(rawMsg)
  var msg = rawMsg.data;
  switch (msg.type) {
    case CONSTANTS.LOAD_VIDEO:
      player.loadVideoById(msg.videoId);
      // ga('send', 'event', 'YT', 'playVideo', msg.videoId);
      break;
    case CONSTANTS.CUE_VIDEO:
      player.cueVideoById(msg.videoId);
      break;
    case CONSTANTS.SET_VOLUME:
      player.setVolume(msg.volume);
      break;
    case CONSTANTS.SET_VIDEO_SIZE:
      player.setSize(msg.width, msg.height);
      break;
    case CONSTANTS.TOGGLE_PLAY_PAUSE:
      var playerState = player.getPlayerState();
      if (playerState === YT.PlayerState.PLAYING) {
        player.pauseVideo();
      } else {
        player.playVideo();
      }
      break;
    // case CONSTANTS.REPORT_TO_GA:
    //   ga('send', 'event', msg.category, msg.action, msg.label);
    //   break;
    default:
      break;
  }
}

var sendMessage = function(msg) {
  chrome.runtime.sendMessage(APP_ID, msg);
}

var registerYouTubeEvents = function() {
  window.onYouTubeIframeAPIReady = function() {
    window.player = new YT.Player('player', {
      height: '200',
      width: '300',
      videoId: 'c7rCyll5AeY',
      events: {
        'onReady': onPlayerReady,
        'onStateChange': onPlayerStateChange,
        'onError': onPlayerError
      },
      wmode: "transparent",
      autohide: 0, // FIXME: how come this potion doesn't work?
      fs: 0
    });
  }

  window.onPlayerReady = function(event) {
    event.target.playVideo();

    // chrome.runtime.sendMessage(APP_ID, {data: CONSTANTS.PLAYER_READY});
    // event.target.setVolume(100);
    // $('#player').removeAttr("width").removeAttr("height");
  }

  window.onPlayerStateChange = function(event) {
    // chrome.runtime.sendMessage(APP_ID, event);
  }

  window.onPlayerError = function(event) {
    // chrome.runtime.sendMessage(APP_ID, {data: CONSTANTS.ERROR_CODE});
  }
}

var loadYouTubeAsync = function() {
  var tag = document.createElement('script');
  tag.src = "https://www.youtube.com/iframe_api";
  var firstScriptTag = document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
}

document.addEventListener("DOMContentLoaded", function(event) {
  loadYouTubeAsync();
  registerYouTubeEvents();
  window.addEventListener("message", messageHandler, false);
});
