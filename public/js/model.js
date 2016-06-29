var _PLAYER_STATES = {
	UNSTARTED: -1,
	ENDED: 0,
	PLAYING: 1,
	PAUSED: 2,
	BUFFERING: 3,
	VIDEO_CUED: 5,
	ERROR: 6,
	PLAYER_READY: 'PLAYER_READY'
};

var _ACTION_CONSTANTS = {
	CUE_VIDEO: 'CUE_VIDEO',
	LOAD_VIDEO: 'LOAD_VIDEO',
	TOGGLE_PLAY_PAUSE: "TOGGLE_PLAY_PAUSE",
	PLAY_PREV_SONG: "PLAY_PREV_SONG",
	PLAY_NEXT_SONG: "PLAY_NEXT_SONG",
	SET_VOLUME: "SET_VOLUME",
	SET_VIDEO_SIZE: "SET_VIDEO_SIZE",
	SMALL_SIZE: "SMALL_SIZE",
	BIG_SIZE: "BIG_SIZE",
	MAX_SIZE: "MAX_SIZE",
	WEBVIEW_READY: "WEBVIEW_READY"
};

var _CONSTANTS = {
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
	PLAYER_STATES: _PLAYER_STATES,
	ACTION_CONSTANTS: _ACTION_CONSTANTS
};

function SandboxMessenger(player) {
	this.webview = $('#video-player')[0];
	this.player = player;

	if (!chrome.runtime.id) {
		return false;
	}

	this.sendMessage = this.sendMessage.bind(this);
	this.messageHandler = this.messageHandler.bind(this);
	chrome.runtime.onMessage.addListener(this.messageHandler);
}

SandboxMessenger.prototype.sendMessage = function(msg){
	this.webview.contentWindow.postMessage(msg, "*");
}

SandboxMessenger.prototype.messageHandler = function(msg){
	switch (msg.data) {
		case _CONSTANTS.PLAYER_STATES.ENDED:
		case _CONSTANTS.PLAYER_STATES.ERROR:
			this.player.playNextSong();
			break;
		case _CONSTANTS.PLAYER_STATES.PLAYING:
	// 		// Synchronize only when necessary
			if (!this.player.getState().isPlaying) {
				this.player.playToggleState();
			}
			break;
		case _CONSTANTS.PLAYER_STATES.PAUSED:
	// 		// Synchronize only when necessary
			if (this.player.getState().isPlaying) {
				this.player.playToggleState();
			}
			break;
		case _CONSTANTS.PLAYER_STATES.PLAYER_READY:
			var currentVideo = this.player.getState().currentVideo;
			if (currentVideo) {
	// 		// HOWON: Should I just CUE instead of LOAD?
				this.sendMessage({
					type: _CONSTANTS.ACTION_CONSTANTS.CUE_VIDEO,
					videoId: currentVideo.videoId
				});
			}
	// 		this.store.dispatch((0, _WebviewActions.webviewReady)());
			break;
		default:
	// 	// pass
			break;
	}
}

function videoPlayer(view) {
	this.view = view;

	this.videoTitleDOM = $('.song-title')[0];
	this.videoAristDOM = $('.song-artist')[0];
	this.videoPlayBtnDOM = $('.player-controls .fa-play');
	this.videoPauseBtnDOM = $('.player-controls .fa-pause');
	this.videopPreviousBtnDOM = $('.player-controls .fa-step-backward');
	this.videoNextBtnDOM = $('.player-controls .fa-step-forward');
	this.randomToggleBtnDOM = $('.toggle-shuffle-btn');
	this.repeatToggleBtnDOM = $('.toggle-repeat-btn');
	this.volumeControlSliderDOM = $('.volume-control-slider');
	this.volumeBtn = $('.volume-control .volume-btn');

	this.currentPlayList = null;
	this.currentVideo = null;
	this.currentIndex = 0;
	this.nextVideoId = null;
	this.numList = 0;
	this.playCue = [];
	this.volume = 100;
	this.playState = 0;
	this.winSize = null;

	this.playMode = 0;
	this.playRepeat = 0;
	this.sandbox = new SandboxMessenger(this);
	this.controlEventSetUp();
}

videoPlayer.prototype.controlEventSetUp = function(){
	var self = this;

	this.videoPlayBtnDOM.on('click', function(){
		self.playToggle();
	});

	this.videoPauseBtnDOM.on('click', function(){
		self.playToggle();
	});

	this.videopPreviousBtnDOM.on('click', function(){
		self.playPrevSong();
	});

	this.videoNextBtnDOM.on('click', function(){
		self.playNextSong();
	});

	this.randomToggleBtnDOM.on('click', function(){
		self.playMode = (self.playMode+1) % 2;

		if(self.playMode){
			$(this).addClass("toggled");
		}else{
			$(this).removeClass("toggled");
		}
	});

	this.repeatToggleBtnDOM.on('click', function(){
		self.playRepeat = (self.playRepeat+1) % 2;

		if(self.playRepeat){
			$(this).addClass("toggled");
		}else{
			$(this).removeClass("toggled");
		}
	});

	this.volumeBtn.on('click', function(){
		var value = self.volumeControlSliderDOM[0].value;
		if (value > 0){
			self.volumeControlSliderDOM.val(0);
			self.volumeBtn.removeClass('fa-volume-up');
			self.volumeBtn.addClass('fa-volume-off');
			self.volumeBtn.removeClass('fa-volume-down');
			self.changeVolume(0);
		}else{
			self.volumeControlSliderDOM.val(100);
			self.volumeBtn.addClass('fa-volume-up');
			self.volumeBtn.removeClass('fa-volume-off');
			self.volumeBtn.removeClass('fa-volume-down');
			self.changeVolume(100);
		}
	});
	this.volumeControlSliderDOM.on('change', function(value){
		var volume = event.target.value;

		if(volume > 50){
			self.volumeBtn.addClass('fa-volume-up');
			self.volumeBtn.removeClass('fa-volume-off');
			self.volumeBtn.removeClass('fa-volume-down');
		}else if(volume < 50 && volume > 0){
			self.volumeBtn.removeClass('fa-volume-up');
			self.volumeBtn.removeClass('fa-volume-off');
			self.volumeBtn.addClass('fa-volume-down');
		}else{
			self.volumeBtn.removeClass('fa-volume-up');
			self.volumeBtn.addClass('fa-volume-off');
			self.volumeBtn.removeClass('fa-volume-down');
		}
		self.changeVolume(volume);
	});
}

videoPlayer.prototype.setPlayList = function(playList){
	this.currentPlayList = playList;
	this.listCueSetUp();
}

videoPlayer.prototype.listCueSetUp = function(){
	var keyList = Object.keys(this.currentPlayList.videoContainer).reverse();
	var tmpPlayCue = [];

	this.playCue = [];
	this.numList = keyList.length;

	for(i=0;i<this.numList;i++){
		this.playCue.push(this.currentPlayList.videoContainer[keyList[i]])
	}

}

videoPlayer.prototype.getState = function(){
	ret = {
		isPlaying: this.playState,
		currentVideo: this.currentVideo
	};
	return ret;
}

videoPlayer.prototype.changeVolume = function(value){
	this.volume = value;
	this.sandbox.sendMessage({
		type: _CONSTANTS.SET_VOLUME,
		volume: value
	});
}

videoPlayer.prototype.setWindowSize = function(width, height){
	this.winSize = {"width": width, "height": height};
	this.sandbox.sendMessage({
		type: _CONSTANTS.SET_VIDEO_SIZE,
		width: width,
		height: height
	});
}

videoPlayer.prototype.loadVideo = function(videoInfo){
	this.currentVideo = videoInfo;

	// var video = this.currentPlayList.videoContainer[videoId];

	this.videoTitleDOM.innerHTML = videoInfo.name;
	this.videoAristDOM.innerHTML = videoInfo.artist;
	this.sandbox.sendMessage({
		type: _CONSTANTS.LOAD_VIDEO,
		videoId: videoInfo.id
	});
}

videoPlayer.prototype.cueVideo = function(videoId){
	this.nextVideoId = videoId;
	this.sandbox.sendMessage({
		type: _CONSTANTS.CUE_VIDEO,
		videoId: videoId
	});
}

videoPlayer.prototype.playToggleState = function(){
	this.playState = (this.playState + 1) % 2;
	if (this.playState) {
		this.videoPlayBtnDOM.addClass('hidden');
		this.videoPauseBtnDOM.removeClass('hidden');
	}else{
		this.videoPlayBtnDOM.removeClass('hidden');
		this.videoPauseBtnDOM.addClass('hidden');
	}
}

videoPlayer.prototype.playToggle = function(){
	this.playToggleState();

	this.sandbox.sendMessage({
		type: _CONSTANTS.TOGGLE_PLAY_PAUSE
	});
}

videoPlayer.prototype.playPrevSong = function(){
	if(this.playRepeat){
		this.loadVideo(this.currentVideo);
	}else{
		if(this.playMode){
			this.currentIndex = (this.currentIndex + 1 + Math.floor(Math.random()*(this.numList-1))) % this.numList;
			this.loadVideo(this.playCue[this.currentIndex]);
		}else{
			this.currentIndex = (this.currentIndex - 1 + this.numList) % this.numList;
			this.loadVideo(this.playCue[this.currentIndex]);
		}		
	}
}

videoPlayer.prototype.playNextSong = function(){
	if(this.playRepeat){
		this.loadVideo(this.currentVideo);
	}else{
		if(this.playMode){
			this.currentIndex = (this.currentIndex + 1 + Math.floor(Math.random()*(this.numList-1))) % this.numList;
			this.loadVideo(this.playCue[this.currentIndex]);
		}else{
			this.currentIndex = (this.currentIndex + 1) % this.numList;
			this.loadVideo(this.playCue[this.currentIndex]);
		}		
	}
}

videoPlayer.prototype.togglePlayingState = function(){
	
}

function listStorage(view) {
	var self = this;
	this.view = view;
	this.playlistContainer = {};
	this.playListIDSet = null;
	this.numLoaded = 0;
	// chrome.storage.sync.clear();
	this.loadStorage();
}

listStorage.prototype.loadStorage = function(){
	var self = this;

	chrome.storage.sync.get('_playLists', function(item){

		if (Object.keys(item).length == 0){
			self.playListIDSet = ["MyList"];
			self.playlistContainer["MyList"] = new videoStorage(null, null, self);
			self.saveStorage();
			self.view.playListSetUp();
		}else{
			self.playListIDSet = item._playLists;
			self.numLoaded = 0;
			if (self.playListIDSet.length==0){
				self.playListIDSet = ["MyList"];
				self.playlistContainer["MyList"] = new videoStorage(null, null, self);
				self.saveStorage();
				self.view.playListSetUp();
			}else{
				self.numLoaded = 0;
				for(i=0;i<self.playListIDSet.length;i++){
					self.initStorage(self.playListIDSet[i]);
				}				
			}
		}
		// self.view.playListSetUp();
	});

}

listStorage.prototype.initStorage = function(playListID){
	var self = this;
	// var tempContainer = this.playlistContainer;
	// var playlistContainer = {};
	// var listKeys = Object.keys(tempContainer);
	// var numPlayLists = listKeys.length;
	chrome.storage.sync.get(playListID, function(item){
		self.playlistContainer[playListID] = new videoStorage(playListID, item[playListID], self);
		self.numLoaded = self.numLoaded + 1;
		if( self.numLoaded >= self.playListIDSet.length){
			self.view.playListSetUp();
		}
	});


}

listStorage.prototype.saveStorage = function(){

	chrome.storage.sync.set({'_playLists': this.playListIDSet}, this.saveStorageCallback);

	for(i=0;i<this.playListIDSet.length;i++){
		var key = this.playListIDSet[i];
		var obj = {};
		obj[key] = this.playlistContainer[key].videoContainer;
		chrome.storage.sync.set(obj, this.saveStorageCallback);
	}
}

listStorage.prototype.saveStorageCallback = function(){
}

listStorage.prototype.addList = function(playListName){
	// Name duplicate Check
	this.playListIDSet.push(playListName);
	this.playlistContainer[playListName] = new videoStorage(playListName, null, this);
	this.saveStorage();
}

listStorage.prototype.removeList = function(playListName){
	var index = this.playListIDSet.indexOf(playListName);
	if (index >= 0){
		this.playListIDSet.splice(index, 1);
	}
	delete this.playlistContainer[playListName];
	this.saveStorage();
}

listStorage.prototype.changeListName = function(oldName, newName){
	var index = this.playListIDSet.indexOf(oldName);
	if (index >= 0){
		this.playListIDSet[index] = newName;
	}
	this.playlistContainer[oldName].changeName(newName);
	this.playlistContainer[newName] = this.playlistContainer[oldName];
	delete this.playlistContainer[oldName];
	this.saveStorage();	
}

listStorage.prototype.refresh = function(){
	chrome.storage.sync.clear();
	this.saveStorage();
}

function videoStorage(name, videoContainer, listStorage) {
	var self = this;
	this.listStorage = listStorage;
	this.name = (name) ? name : "MyList";
	this.videoContainer = (videoContainer) ? videoContainer : {};
}

videoStorage.prototype.changeName = function(newName){
	this.name = newName;
}

videoStorage.prototype.addVideo = function(videoID, videoName, videoArtist) {
	this.videoContainer[videoID] = {"id": videoID, "name": videoName, "artist": videoArtist};
	this.listStorage.saveStorage();
}

videoStorage.prototype.removeVideo = function(videoID) {
	delete this.videoContainer[videoID];
	this.listStorage.saveStorage();
}


function Melon(appKey) {
	var me = this;
	this.flagCount = 0;
	this.appKey = appKey;
	this.options = {
		lang : 'ko_KR',
		apiVersion: '1'
	};
	this.API_URL = 'http://apis.skplanetx.com/melon';

	this.rtChart = null;
	
	this._performRequest = function(url, method, data, cb) {

		var xhr = new XMLHttpRequest();
		xhr.open('GET', me.API_URL + url, true);
		xhr.responseType = 'json';
		xhr.setRequestHeader('Accept-Language', this.options.lang);
		xhr.setRequestHeader('appKey', this.appKey);

		xhr.onload = function(e) {
			cb(this.response, null);
		};
		xhr.send();	
	};

	this._search = function(path, searchTerm, count, page, cb) {
		this._performRequest(path, 'GET', {
			count : count,
			page : page,
			version : this.options.apiVersion,
			searchKeyword : searchTerm
		}, function(response, data) {
			me._resultHandler(response, data, cb);
		});
	};
	
	this._pagedQuery = function(path, count, page, cb) {
		this._performRequest(path + "?page=1&count=100&version=1", 'GET', {
			count : count,
			page : page,
			version : this.options.apiVersion
		}, function(response, data) {
			me._resultHandler(response, data, cb);
		});
	};
	
	this._resultHandler = function(response, data, cb) {
		cb(response.melon.songs.song);
	};
}

/* Search API */

Melon.prototype.SearchArtists = function(searchTerm, count, page, cb) {
	this._search('/artists', searchTerm, count, page, cb);
};

Melon.prototype.SearchAlbums = function(searchTerm, count, page, cb) {
	this._search('/albums', searchTerm, count, page, cb);
};

Melon.prototype.SearchSongs = function(searchTerm, count, page, cb) {
	this._search('/songs', searchTerm, count, page, cb);
};

/* Album API */

Melon.prototype.LatestAlbums = function(count, page, cb) {
	this._pagedQuery('/newreleases/albums', count, page, cb);
};

Melon.prototype.LatestAlbumsByGenre = function(genreId, count, page, cb) {
	this._pagedQuery('/newreleases/albums/'+genreId, count, page, cb);
};

Melon.prototype.LatestSongs = function(count, page, cb) {
	this._pagedQuery('/newreleases/songs', count, page, cb);
};

Melon.prototype.LatestSongsByGenre = function(genreId,count, page, cb) {
	this._pagedQuery('/newreleases/songs/'+genreId, count, page, cb);
};

/* Charts API */

Melon.prototype.RealTimeCharts = function(count, page, cb) {
	this._pagedQuery('/charts/realtime', count, page, cb);
};

Melon.prototype.TopDailySongs = function(count, page, cb) {
	this._pagedQuery('/charts/todaytopsongs', count, page, cb);
};

Melon.prototype.TopAlbums = function(count, page, cb) {
	this._pagedQuery('/charts/topalbums', count, page, cb);
};

Melon.prototype.TopGenres = function(count, page, cb) {
	this._pagedQuery('/charts/topgenres', count, page, cb);
};

Melon.prototype.TopSongsByGenre = function(genreId, count, page, cb) {
	this._pagedQuery('/charts/topgenres/'+genreId, count, page, cb);
};

Melon.prototype.Genres = function(cb) {
	this._performRequest('/genres', 'GET', {
		version : this.options.apiVersion
	}, function(error, response, data) {
		me._resultHandler(error, response, data, cb);
	});
};

Melon.prototype.getVideoID = function(cb) {
	var chart = rtChart;
	for (i=0;i<chart.length;i++){
		item = chart[i];
		var artist = "";
		for (j=0;j<item.artists.artist.length;j++){
			artist = artist + item.artists.artist[j].artistName + ', ';			
		}
		artist = artist.slice(0,-2);
	}	
};

function shuffle(a) {
    var j, x, i;
    for (i = a.length; i; i -= 1) {
        j = Math.floor(Math.random() * i);
        x = a[i - 1];
        a[i - 1] = a[j];
        a[j] = x;
    }
}