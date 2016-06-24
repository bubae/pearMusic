function SandboxMessenger() {

}

SandboxMessenger.prototype.sendMessage = function(msg){

}

SandboxMessenger.prototype.messageHandler = function(msg){

}

function listStorage(view) {
	var self = this;
	this.view = view;
	this.playlistContainer = {};

	// chrome.storage.sync.clear();
	chrome.storage.sync.get('listStorage', function(item){
		if (Object.keys(item).length == 0){
			self.playlistContainer["MyList"] = new videoStorage(null, null, self);
			self.saveStorage();
		}else{
			self.playlistContainer = item.listStorage;
			self.initStorage();
		}
		self.view.playListSetUp();
	});
}

listStorage.prototype.initStorage = function(){
	var tempContainer = this.playlistContainer;
	var playlistContainer = {};
	var listKeys = Object.keys(tempContainer);
	var numPlayLists = listKeys.length;

	for (i=0;i<numPlayLists;i++){
		console.log(listKeys[i], tempContainer[listKeys[i]].videoContainer);
		this.playlistContainer[listKeys[i]] = new videoStorage(listKeys[i], tempContainer[listKeys[i]].videoContainer, this);
	}

	// this.playlistContainer = playlistContainer;
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

function videoStorage(name, videoContainer, listStorage) {
	var self = this;
	this.listStorage = listStorage
	this.name = (name) ? name : "MyList";
	this.videoContainer = (videoContainer) ? videoContainer : {};
}

videoStorage.prototype.changeName = function(newName){
	this.name = newName;
	this.listStorage.saveStorage();
}

videoStorage.prototype.addVideo = function(videoID, videoName, videoArtist) {
	this.videoContainer[videoID] = {"id": videoID, "name": videoName, "artist": videoArtist};
	this.listStorage.saveStorage();
}

videoStorage.prototype.removeVideo = function(videoID) {
	delete this.videoContainer[videoID]
	this.listStorage.saveStorage();
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