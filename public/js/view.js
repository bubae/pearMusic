var app_keys = ["AIzaSyBjSx3cD_ArNqKRGFGlVzBQl-N7h16EU8Q", "AIzaSyBUAKM6epIO_0DV9rWjyt9kTrJvmThI6ws", 
				"AIzaSyC6GQKuqmKjNk7HIJlBiVpmwI5nLZyqdI0", "AIzaSyAUQq3alwESMEJTZnu9myTfFQgxRzvoUF0",
				"AIzaSyDwgSNoxqbjeExpdf4S9z1dtTl7IA7GKEA", "AIzaSyADF2_6Hs-uwnOedVTfIOzqEXbLPugynYM",
				"AIzaSyCGreXczp30WwPV-NO8Dz94_LCH6-gtfts", "AIzaSyBuQSKIiKDz2Jg6Tev2Tb8zk4iEklgHzf4",
				"AIzaSyCHFCHMvJKxYudGyoP4kbQiTWTP50rrGo8", "AIzaSyBLQLesUsDmE53AoR7zv9Eemjlop8T9phE"];

function View() {
	var self = this;

	this.searchBox = $('#searchBox');
	this.searchResult = $('#searchResult');
	this.searchContent = $('#searchContent');
	this.playListContent = $('#playlist-content');
	this.pageWapper = $('#main-content');
	this.videoWapper = $('#video-wrapper');
	this.videoPlayerDOM = $('#video-player');
	this.videoSizeBtn = $('#video-size-btn');
	this.videoControllerDOM = $('#video-controller');

	this.playListContextMenuDOM = $('#playListContextMenu');
	this.videoListContextMenuDOM = $('#videoListContextMenu');

	this.imgThumbnail = $('#searchThumbnail');

	this.sizeBtnSmall = $('.video-size-icon.small');
	this.sizeBtnBig = $('.video-size-icon.big');
	this.sizeBtnFull = $('.video-size-icon.full');
	this.addListBtnDOM = $('#addListBtn');
	this.renameListBtnDOM = $('#renameListBtn');
	this.melonChartDOM = $('#melon-chart');
	this.loadingDOM = $('.loading');

	this.selectedItem = null;
	this.lastDisplayElement = null;
	this.currentPlayList = null;
	this.numPlayEntry = null;
	this.store = new listStorage(this);
	this.videoPlayer = new videoPlayer(this);
	this.melon = new Melon('8821b706-32bb-3892-8bc6-7b4540b08581');
	this.chartResetFlag = false;

	$(document).click(function(evt){
        self.contextMenuClear();
	});

	$(document).keydown(function(event) {
		if (event.keyCode == 27) {
			self.searchContent[0].innerHTML = '';
			self.imgThumbnail.addClass('hidden');
		}
	});

	$("#searchBox").keydown(function(event){
	    if(event.keyCode == 13){
	    	if ($("#searchBox")[0].value.length > 1) {
		        self.videoSearch($("#searchBox")[0].value, self.searchResultShow);
		        $("#searchBox")[0].value = "";
	    	}
	    }
	});

	$( window ).resize(function() {
		self.videoPlayer.setWindowSize(self.videoPlayerDOM.width(), self.videoPlayerDOM.height())
	});


	$('#list-name').keydown(function(event){
		if(event.keyCode == 13){
			if(!self.addListBtnDOM.hasClass('hidden')){
				self.addListBtnDOM.click();
			}else if(!self.renameListBtnDOM.hasClass('hidden')){
				self.renameListBtnDOM.click();
			}
			event.preventDefault();
		}
	})
	this.addListBtnDOM.on('click', function(){
		var listName = $('#list-name')[0];

		self.store.addList(listName.value);
		listName.value = "";
		$('#addListModal').modal('hide');

		self.playListSetUp();
	});

	this.renameListBtnDOM.on('click', function(){
		var newName = $('#list-name')[0];
		var oldName = self.selectedItem[0].dataset.name;
		self.store.changeListName(oldName, newName.value);
		newName.value = "";
		$('#addListModal').modal('hide');

		self.playListSetUp();
	});

	this.smallVideoView = this.smallVideoView.bind(this);
	this.bigVideoView = this.bigVideoView.bind(this);
	this.fullVideoView = this.fullVideoView.bind(this);

	this.viewSizeBtnEventSetUp();
	this.videoListEventSetUp();
	this.contextEventSetUp();
	// this.getChartList();
	this.chartEventSetUp();
}

View.prototype.viewSizeBtnEventSetUp = function(){
	var self = this;

	this.sizeBtnSmall.on('click',this.smallVideoView);
	this.sizeBtnBig.on('click',this.bigVideoView);
	this.sizeBtnFull.on('click',this.fullVideoView);
}

View.prototype.smallVideoView = function(){

	this.videoControllerDOM.removeClass("full-video");
	this.videoControllerDOM.removeClass("big-video");

	this.pageWapper.removeClass("full-video");
	this.pageWapper.removeClass("big-video");

	this.videoWapper.removeClass("full-video");
	this.videoWapper.removeClass("big-video");

	this.videoSizeBtn.removeClass("video-full");
	this.videoSizeBtn.removeClass("video-big");

	this.sizeBtnBig.removeClass("hidden");
	this.sizeBtnFull.removeClass("hidden");
	this.sizeBtnSmall.addClass("hidden")
	this.videoPlayer.setWindowSize(this.videoPlayerDOM.width(), this.videoPlayerDOM.height());
}

View.prototype.bigVideoView = function(){

	this.videoControllerDOM.removeClass("full-video");
	this.videoControllerDOM.addClass("big-video");

	this.pageWapper.removeClass("full-video");
	this.pageWapper.addClass("big-video");

	this.videoWapper.removeClass("full-video");
	this.videoWapper.addClass("big-video");

	this.videoSizeBtn.removeClass("video-full")
	this.videoSizeBtn.addClass("video-big")

	this.sizeBtnSmall.removeClass("hidden");
	this.sizeBtnFull.removeClass("hidden");
	this.sizeBtnBig.addClass("hidden")

	this.videoPlayer.setWindowSize(this.videoPlayerDOM.width(), this.videoPlayerDOM.height());
}

View.prototype.fullVideoView = function(){

	this.videoControllerDOM.removeClass("big-video");
	this.videoControllerDOM.addClass("full-video");

	this.pageWapper.removeClass("big-video");
	this.pageWapper.addClass("full-video");

	this.videoWapper.removeClass("big-video");
	this.videoWapper.addClass("full-video");

	this.videoSizeBtn.removeClass("video-big")
	this.videoSizeBtn.addClass("video-full")

	this.sizeBtnSmall.removeClass("hidden");
	this.sizeBtnBig.addClass("hidden");
	this.sizeBtnFull.addClass("hidden")

	this.videoPlayer.setWindowSize(this.videoPlayerDOM.width(), this.videoPlayerDOM.height());
}

View.prototype.videoSearch = function(searchText, callback){
	var app_key = app_keys[Math.floor(Math.random()*app_keys.length)];
	template_url = "https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q={{searchText}}&key={{app_key}}";

	search_url = template_url.replace("{{searchText}}", searchText).replace("{{app_key}}", app_key);

	jQuery.ajax({
		type: "GET", 
		dataType: "json",
		url: search_url,
		// data: “id=”+id.val()+”&password=”+password.val()+”&name=”+name.val(),
		success: callback,
		error: errorNoti
	}); 	
};

View.prototype.searchResultShow = function(searchData){
	searchContent = $('#searchContent');
	searchContentTemplate = '<li data-thumbnail="{{thumbnail}}" data-id="{{videoID}}" data-title="{{title}}" data-artist="{{artist}}"><div class="title">{{title}}</div><div class="desc">{{desc}}</div></li>';
	if (searchData == []){
		core.noSearchResult();
		return;
	}

	searchContent[0].innerHTML = '';
	var videoInfos = searchData.items;
	allContent = "";
	for (i = 0; i < videoInfos.length; i++) {
		title = videoInfos[i].snippet.title;
		desc = videoInfos[i].snippet.description;
		artist = videoInfos[i].snippet.channelTitle;
		videoID = videoInfos[i].id.videoId;
		addItem = searchContentTemplate.replace("{{thumbnail}}", videoInfos[i].snippet.thumbnails.medium.url).replace(/{{title}}/g, title).replace("{{videoID}}",videoID).replace("{{desc}}", desc).replace("{{artist}}", artist);
		allContent = allContent + addItem;		
	}
	searchContent[0].innerHTML = allContent;
	core.searchContentEventSetUp();
	searchContent.show();
};


View.prototype.playListSetUp = function(){
	var liTemplate = '<li class="{{class}} playlist" data-name="{{listName}}"><a href="#">{{listName}}</a></li>'
	var addButtonHTML = '<li class="addList"><a href="#"><span class="glyphicon glyphicon-plus" aria-hidden="true"></span> ADD LIST</a></li>'

	var playListMenuDOM = $('#play-list-menu')
	var playLists = this.store.playlistContainer;
	var listKeys = this.store.playListIDSet;
	var numList = listKeys.length;

	// if (numList==0)
	// 	return;

	var liClass = "";
	var defaultListName = "";
	var liInnerHTML = "";

	for (i=0;i<numList;i++){
		liClass = "";
		if (this.currentPlayList){
			if(playLists[listKeys[i]].name == this.currentPlayList.name){
				liClass="active";
			}
		}else{
			if(i==0){
				liClass="active";
				defaultListName = playLists[listKeys[i]].name;							
			}
		}
		liInnerHTML = liInnerHTML + liTemplate.replace("{{class}}", liClass).replace(/{{listName}}/g, playLists[listKeys[i]].name);
	}

	this.playListContent[0].innerHTML = liInnerHTML + addButtonHTML;
	this.playListContent.collapse()

	this.currentPlayList = this.currentPlayList ? this.currentPlayList : playLists[defaultListName];

	this.playListEventSetUp();
	this.videoListSetUp(this.currentPlayList.name);
};

View.prototype.videoListSetUp = function(playListName){
	// var trTemplate = '<tr data-id="{{videoID}}" data-name="{{videoName}}" data-artist="{{artist}}">'
	//     + '<th scope="row" class="table-rank">{{index}}</th>'
 //        + '<td class="table-name">{{videoName}}</td>'
 //        + '<td class="table-artist">{{artist}}</td>'
 //        + '</tr>';
    var liTemplate = '<li data-id="{{videoID}}" data-name="{{videoName}}" data-artist="{{artist}}">'
    + '<div class="list-row">'
    + '<div class="row-index">{{index}}</div>'
    + '<div class="row-song">{{videoName}}</div>'
    + '<div class="row-artist">{{artist}}</div>'
    + '</div></li>';
    // var playListTableDOM = $('#playlist-table tbody');
    var playListBodyDOM = $('#playlist-body');
	var playLists = this.store.playlistContainer;
	var selectedPlayList = playLists[playListName].videoContainer;
	var listKeys = Object.keys(selectedPlayList).reverse();
	var numList = listKeys.length;

	var bodyInnerHTML = "";

	// if (numList==0){
	// 	playListTableDOM[0].innerHTML = tableInnerHTML;
	// 	return;
	// }

	for (i=0;i<numList;i++){
		item = selectedPlayList[listKeys[i]];
		bodyInnerHTML = bodyInnerHTML + liTemplate.replace(/{{videoID}}/g,item.id).replace(/{{index}}/g, i+1).replace(/{{videoName}}/g, item.name).replace(/{{artist}}/g, item.artist);
	}

	this.numPlayEntry = numList;
	playListBodyDOM[0].innerHTML = bodyInnerHTML;

	this.videoPlayer.setPlayList(playLists[playListName]);
	this.videoListEventSetUp();
};

View.prototype.videoListAdd = function(id, title, artist){
	// var trTemplate = '<tr data-id="{{videoID}}" data-name="{{videoName}}" data-artist="{{artist}}">'
	//     + '<th scope="row" class="table-rank">{{index}}</th>'
 //        + '<td class="table-name">{{videoName}}</td>'
 //        + '<td class="table-artist">{{artist}}</td>'
 //        + '</tr>';
    var liTemplate = '<li data-id="{{videoID}}" data-name="{{videoName}}" data-artist="{{artist}}">'
    + '<div class="list-row">'
    + '<div class="row-index">{{index}}</div>'
    + '<div class="row-song">{{videoName}}</div>'
    + '<div class="row-artist">{{artist}}</div>'
    + '</div></li>';

    var playListBodyDOM = $('#playlist-body');
    // var playListTableDOM = $('#playlist-table tbody');

	playListBodyDOM[0].innerHTML = playListBodyDOM[0].innerHTML + liTemplate.replace(/{{videoID}}/g,id).replace(/{{index}}/g, this.numPlayEntry+1).replace(/{{videoName}}/g, title).replace(/{{artist}}/g, artist);
	this.numPlayEntry = this.numPlayEntry + 1;
	this.videoListEventSetUp();
}

View.prototype.searchContentEventSetUp = function(){
	var self = this;
	var dataset;

	$("#searchContent li").click(function() {
		dataset = $(this)[0].dataset;
		self.searchContent[0].innerHTML = '';
		self.imgThumbnail.addClass('hidden');
		self.currentPlayList.addVideo(dataset.id, dataset.title, dataset.artist);
		// self.store.saveStorage();

		// self.videoListAdd(dataset.id, dataset.title, dataset.artist)		
		self.videoListSetUp(self.currentPlayList.name);
	});

	$("#searchContent li").hover(function() {
		var top = $(this).offset().top;
		var left = $(this).offset().left + $(this).width() + 20;

		self.imgThumbnail.css('position', 'absolute');
		self.imgThumbnail.css('top', top);
		self.imgThumbnail.css('left', left);

		setThumbnail($(this)[0].dataset.thumbnail);
		self.imgThumbnail.removeClass("hidden");
	}, function(){
		self.imgThumbnail.addClass("hidden");		
	});

};

View.prototype.playListEventSetUp = function(){
	var self = this;

	$('#playlist-content .playlist').on('click', function(){
		self.currentPlayList = self.store.playlistContainer[$(this)[0].dataset.name];
		$('#playlist-content .playlist').removeClass('active');
		$(this).addClass('active');

		self.videoListSetUp($(this)[0].dataset.name);
	});

	$('#playlist-content .playlist').contextmenu(function(evt){
		self.contextMenuClear();
		self.selectedItem = $(this);

        var posx = evt.clientX +window.pageXOffset +'px'; //Left Position of Mouse Pointer
        var posy = evt.clientY + window.pageYOffset + 'px'; //Top Position of Mouse Pointer

        self.playListContextMenuDOM.css("display", "inline");
        self.playListContextMenuDOM.css("left", posx);
        self.playListContextMenuDOM.css("top", posy);

		evt.preventDefault();
	});

	$('#playlist-content .addList').on('click', function(){
		self.addListBtnDOM.removeClass('hidden');
		self.renameListBtnDOM.addClass('hidden');

		$('#list-name').focus();
		$('#addListModal').modal('show');
	});
}

View.prototype.activePlayingDOM = function(videoId){
	var self = this;
	var liList = $("#playlist-body li");
	if(typeof(liList)=="object"){
		liList.removeClass("playing");
		var length = liList.length;
		for(i=0;i<length;i++){
			if(liList[i].dataset.id == videoId){
				$(liList[i]).addClass("playing");
				break;
			}
		}
	}
}

View.prototype.videoListEventSetUp = function(){
	var self = this;

	$("#playlist-body li").click(function() {
		self.videoPlayer.loadVideo($(this)[0].dataset);
	});	

	$("#playlist-body li").contextmenu(function(evt){
		self.contextMenuClear();
		self.selectedItem = $(this);
        var posx = evt.clientX +window.pageXOffset +'px'; //Left Position of Mouse Pointer
        var posy = evt.clientY + window.pageYOffset + 'px'; //Top Position of Mouse Pointer
      
		self.videoListContextMenuDOM.css("display", "inline");
        self.videoListContextMenuDOM.css("left", posx);
        self.videoListContextMenuDOM.css("top", posy);
		evt.preventDefault();
	});	
}

View.prototype.contextMenuClear = function(){
	var self = this;
    self.playListContextMenuDOM.css("display", "none");	
    self.videoListContextMenuDOM.css("display", "none");	
}

View.prototype.contextEventSetUp = function(){
	var self = this;

	$('#playListContextMenu .itemRename').on('click', function(){
		self.addListBtnDOM.addClass('hidden');
		self.renameListBtnDOM.removeClass('hidden');
		$('#list-name').focus();
		$('#addListModal').modal('show');
	});

	$('#playListContextMenu .listDelete').on('click', function(){
		var listName = self.selectedItem[0].dataset.name;

		// var msg = "{{listName}} playlist will be deleted".replace("{{listName}}", listName);
		// Yes click
		self.store.removeList(listName);
		self.currentPlayList = null;
		self.playListSetUp();
	});

	$('#videoListContextMenu .addVideo').on('click', function(){
		var dataset = self.selectedItem[0].dataset;

		self.currentPlayList.addVideo(dataset.id, dataset.name, dataset.artist);

		// self.videoListSetUp(self.currentPlayList.name);
	});

	$('#videoListContextMenu .removeVideo').on('click', function(){
		var dataset = self.selectedItem[0].dataset;
		self.currentPlayList.removeVideo(dataset.id);
		self.videoListSetUp(self.currentPlayList.name);
	});

}

View.prototype.getChartList = function(){
	var self = this;
	self.loadingDOM.removeClass("hidden");
	$('#playlist-body')[0].innerHTML = "";
	if(this.chartResetFlag){
		self.melonListSetUp();		
	}else{
		self.chartResetFlag = true;
		self.melon.RealTimeCharts(100, 1, function(res){
			self.store.refresh();
			self.melon.flagCount = 0;
			self.melon.rtChart = res;
			self.MelonVideoIDSetUp();
		});
		setTimeout(function(){
			self.chartResetFlag = false;
		}, 3600000);
	}
}

View.prototype.chartEventSetUp = function() {
	var self = this;

	this.melonChartDOM.on('click', function(){
		self.getChartList();
	});
}

View.prototype.melonListSetUp = function(){
	var self = this;
	// var trTemplate = '<tr data-id="{{videoID}}" data-name="{{videoName}}" data-artist="{{artist}}">'
	//     + '<th scope="row" class="table-rank">{{index}}</th>'
 //        + '<td class="table-name">{{videoName}}</td>'
 //        + '<td class="table-artist">{{artist}}</td>'
 //        + '</tr>';
    var liTemplate = '<li data-id="{{videoID}}" data-name="{{videoName}}" data-artist="{{artist}}">'
    + '<div class="list-row">'
    + '<div class="row-index">{{index}}</div>'
    + '<div class="row-song">{{videoName}}</div>'
    + '<div class="row-artist">{{artist}}</div>'
    + '</div></li>';

    var playListBodyDOM = $('#playlist-body');
	var chartList = this.melon.rtChart;
	var bodyInnerHTML = "";
	for (i=0;i<chartList.length;i++){
		item = chartList[i];
		var artist = "";
		for (j=0;j<item.artists.artist.length;j++){
			artist = artist + item.artists.artist[j].artistName + ', ';			
		}
		artist = artist.slice(0,-2);

		bodyInnerHTML = bodyInnerHTML + liTemplate.replace(/{{videoID}}/g, item.id).replace(/{{index}}/g, i+1).replace(/{{videoName}}/g, item.songName).replace(/{{artist}}/g, artist);
	}

	playListBodyDOM[0].innerHTML = bodyInnerHTML;

	this.loadingDOM.addClass("hidden");
	this.videoListEventSetUp();
}

View.prototype.MelonVideoIDSetUp = function(){
	var self = this;
	var chart = this.melon.rtChart;
	for (i=0;i<chart.length;i++){
		item = chart[i];
		var artist = "";
		for (j=0;j<item.artists.artist.length;j++){
			artist = artist + item.artists.artist[j].artistName + ', ';			
		}
		artist = artist.slice(0,-2);
		var searchText = artist + " " + item.songName;
		searchText = searchText.replace("?", "").replace("&", "").replace("#", "");
		this.getMelonVideoID(i, searchText);
	}	
}

View.prototype.getMelonVideoID = function(index, searchText){
	var self = this;
	this.videoSearch(searchText, function(searchData){
		self.melon.rtChart[index].id = searchData.items[0].id.videoId;
		self.melon.flagCount = self.melon.flagCount + 1;
		if(self.melon.flagCount == 100){
			self.melonListSetUp();
		}
	})
}


function noSearchResult(){

}

function errorNoti(data) {
	console.log("Video Search Error");
}


function setThumbnail(url){
	var xhr = new XMLHttpRequest();
	xhr.open('GET', url, true);
	xhr.responseType = 'blob';
	xhr.onload = function(e) {
	  var img = document.getElementById('thumbnailImg');
	  img.src = window.URL.createObjectURL(this.response);
	  // document.body.appendChild(img);
	};
	xhr.send();	
}