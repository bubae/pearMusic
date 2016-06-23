function YoutubePlayer() {
  // this.operatorNeedsReset = true;
  // this.operandNeedsReset = true;
  // this.accumulatorNeedsReset = true;
  // this.decimal = -1;
  // this.ResetRegisters();
}

function SandboxMessenger() {

}

SandboxMessenger.prototype.sendMessage = function(msg){

}


SandboxMessenger.prototype.messageHandler = function(msg){

}

function listStorage() {
	var self = this;

	this.playlistContainer = {};

	// chrome.storage.sync.clear();
	chrome.storage.sync.get('listStorage', function(item){
		if (Object.keys(item).length == 0){
			self.playlistContainer["MyList"] = new videoStorage();
			self.saveStorage();
		}else{
			self.playlistContainer = item.listStorage;
		}
	});
}

listStorage.prototype.saveStorage = function(){
	chrome.storage.sync.set({'listStorage': this.playlistContainer}, this.saveStorageCallback);	
}

listStorage.prototype.saveStorageCallback = function(){

}

listStorage.prototype.addList = function(playListName){
	// Name duplicate Check

	this.playlistContainer[playListName] = new videoStorage(playListName);
	this.saveStorage();
}

listStorage.prototype.removeList = function(playListName){
	delete this.playlistContainer[playListName];
	this.saveStorage();
}

listStorage.prototype.changeListName = function(oldName, newName){
	this.playlistContainer[oldName].changeName(newName);
	this.playlistContainer[newName] = this.playlistContainer[oldName];
	delete this.playlistContainer[oldName];
	this.saveStorage();	
}

function videoStorage(name) {
	var self = this;
	this.name = (name) ? name : "MyList";
	this.videoContainer = {};
}

videoStorage.prototype.changeName = function(newName){
	this.name = newName;
}

videoStorage.prototype.addVideo = function(videoID, videoTitle, videoArtist) {
	this.videoContainer[videoID] = {"id": videoID, "title": videoTitle, "artist": videoArtist};
}

videoStorage.prototype.removeVideo = function(videoID) {
	delete this.videoContainer[videoID]
}


	// var SandboxMessenger = function () {
	//   function SandboxMessenger(store, webview) {
	//     _classCallCheck(this, SandboxMessenger);

	//     if (!chrome.runtime.id) {
	//       return false;
	//     }

	//     this.webview = webview;
	//     this.store = store;

	//     this.sendMessage = this.sendMessage.bind(this);
	//     this.messageHandler = this.messageHandler.bind(this);
	//     this.commandHandler = this.commandHandler.bind(this);

	//     if (chrome.runtime.id) {
	//       chrome.runtime.onMessage.addListener(this.messageHandler);
	//       chrome.commands.onCommand.addListener(this.commandHandler);
	//     }
	//   }

	//   _createClass(SandboxMessenger, [{
	//     key: "sendMessage",
	//     value: function sendMessage(msg) {
	//       if (this.webview.contentWindow) {
	//         this.webview.contentWindow.postMessage(msg, "*");
	//       }
	//     }

	//     // FIXME: handle other cases

	//   }, 
	//   {
	//     key: "messageHandler",
	//     value: function messageHandler(msg) {
	//       switch (msg.data) {

	//         case _constants.PLAYER_STATES.ENDED:
	//         case _constants.PLAYER_STATES.ERROR:
	//           this.store.dispatch((0, _PlaylistActions.playNextSong)());
	//           break;
	//         case _constants.PLAYER_STATES.PLAYING:
	//           // Synchronize only when necessary
	//           if (!this.store.getState().isPlaying) {
	//             this.store.dispatch((0, _ControlsActions.togglePlayingState)());
	//           }
	//           break;
	//         case _constants.PLAYER_STATES.PAUSED:
	//           // Synchronize only when necessary
	//           if (this.store.getState().isPlaying) {
	//             this.store.dispatch((0, _ControlsActions.togglePlayingState)());
	//           }
	//           break;
	//         case _constants.PLAYER_STATES.PLAYER_READY:
	//           var currentSong = this.store.getState().currentSong;
	//           if (currentSong) {
	//             // HOWON: Should I just CUE instead of LOAD?

	//             this.sendMessage({
	//               type: _constants.CONSTANTS.CUE_VIDEO,
	//               videoId: currentSong.videoId
	//             });
	//           }

	//           this.store.dispatch((0, _WebviewActions.webviewReady)());
	//           break;
	//         default:
	//           // pass
	//           break;
	//       }
	//     }
	//   }, {
	//     key: "commandHandler",
	//     value: function commandHandler(command) {
	//       switch (command) {
	//         case _constants.CONSTANTS.TOGGLE_PLAY_PAUSE:
	//           this.store.dispatch((0, _ControlsActions.togglePlayPause)());
	//           break;
	//         case _constants.CONSTANTS.PLAY_PREV_SONG:
	//           this.store.dispatch((0, _PlaylistActions.playPrevSong)());
	//           break;
	//         case _constants.CONSTANTS.PLAY_NEXT_SONG:
	//           this.store.dispatch((0, _PlaylistActions.playNextSong)());
	//           break;
	//         default:
	//           break;
	//       }
	//     }
	//   }]);

	//   return SandboxMessenger;
	// }();