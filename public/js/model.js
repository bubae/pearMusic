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

	this.currentPlayList = null;
	this.currentVideo = null;
	this.currentIndex = 0;
	this.nextVideoId = null;
	this.numList = 0;
	this.playCue = null;
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

	this.volumeControlSliderDOM.on('change', function(value){
		var volume = event.target.value;
		self.changeVolume(volume);
	});
}

videoPlayer.prototype.setPlayList = function(playList){
	this.currentPlayList = playList;
	this.listCueSetUp();
}

videoPlayer.prototype.listCueSetUp = function(){
	this.playCue = Object.keys(this.currentPlayList.videoContainer).reverse();
	this.numList = this.playCue.length;

	// this.cueVideo(this.playCue[this.currentIndex]);
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

videoPlayer.prototype.loadVideo = function(videoId){
	this.currentVideo = videoId;

	var video = this.currentPlayList.videoContainer[videoId];

	this.videoTitleDOM.innerHTML = video.name;
	this.videoAristDOM.innerHTML = video.artist;
	this.sandbox.sendMessage({
		type: _CONSTANTS.LOAD_VIDEO,
		videoId: videoId
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
	this.playlistContainer[playListName] = new videoStorage(playListName, null, this);
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
	this.listStorage = listStorage;
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
	delete this.videoContainer[videoID];
	this.listStorage.saveStorage();
}


function Melon(appKey) {
	var me = this;
	this.appKey = appKey;
	this.options = {
		lang : 'ko_KR',
		apiVersion: '1'
	};
	this.API_URL = 'http://apis.skplanetx.com/melon';

	this._performRequest = function(url, method, data, cb) {
		// var stringify = querystring.stringify(data);
		// if (stringify.length > 0)
		// 	url += '?' + stringify;
		// console.log('REQUEST TO', API_URL + url);

		$.ajax({
			type: method,
			url: me.API_URL + url,
			data: data,
			headers : {
				'Accept-Language' : this.options.lang,
				'appKey' : this.appKey
			},
			success: cb
		});
	};

	this._search = function(path, searchTerm, count, page, cb) {
		this._performRequest(path, 'GET', {
			count : count,
			page : page,
			version : this.options.apiVersion,
			searchKeyword : searchTerm
		}, function(error, response, data) {
			me._resultHandler(error, response, data, cb);
		});
	};
	
	this._pagedQuery = function(path, count, page, cb) {
		this._performRequest(path, 'GET', {
			count : count,
			page : page,
			version : this.options.apiVersion
		}, function(error, response, data) {
			me._resultHandler(error, response, data, cb);
		});
	};
	
	this._resultHandler = function(error, response, data, cb) {
		if (!error) {
			var data = JSON.parse(data);
			cb(true, data.melon)
		} else
			cb(false, null)
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

function shuffle(a) {
    var j, x, i;
    for (i = a.length; i; i -= 1) {
        j = Math.floor(Math.random() * i);
        x = a[i - 1];
        a[i - 1] = a[j];
        a[j] = x;
    }
}