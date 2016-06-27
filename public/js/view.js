var app_key = "AIzaSyBjSx3cD_ArNqKRGFGlVzBQl-N7h16EU8Q";

function View() {
	var self = this;

	this.searchBox = $('#searchBox');
	this.searchResult = $('#searchResult');
	this.searchContent = $('#searchContent');
	this.playListContent = $('#playlist-content');
	this.pageWapper = $('#page-wrapper');
	this.videoWapper = $('#video-wrapper');
	this.videoPlayerDOM = $('#video-player');
	this.videoSizeBtn = $('#video-size-btn');
	this.videoControllerDOM = $('#video-controller');

	this.playListContextMenuDOM = $('#playListContextMenu');
	this.videoListContextMenuDOM = $('#videoListContextMenu');

	this.sizeBtnSmall = $('.video-size-icon.small');
	this.sizeBtnBig = $('.video-size-icon.big');
	this.sizeBtnFull = $('.video-size-icon.full');
	this.addListBtnDOM = $('#addListBtn');
	this.renameListBtnDOM = $('#renameListBtn');

	this.selectedItem = null;
	this.lastDisplayElement = null;
	this.currentPlayList = null;
	this.numPlayEntry = null;
	this.store = new listStorage(this);
	this.videoPlayer = new videoPlayer(this);
	
	// this.melon = new Melon('8821b706-32bb-3892-8bc6-7b4540b08581');

	// this.melon.TopDailySongs(50, 1, function(json){
		// console.log(json);
	// })
	$(document).click(function(evt){
        self.contextMenuClear();
	});

	// $(document).contextmenu(function(evt){
	// 	if (self.playListContextMenuDOM.addClass("display") == "inline")
 //        self.playListContextMenuDOM.addClass("display", "none");
	// });

	$(document).keydown(function(event) {
		if (event.keyCode == 27) {
			self.searchContent[0].innerHTML = '';
		}
	});

	$("#searchBox").keydown(function(event){
	    if(event.keyCode == 13){
	    	if ($("#searchBox")[0].value.length > 1) {
		        self.videoSearch($("#searchBox")[0].value);
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

View.prototype.videoSearch = function(searchText){
	template_url = "https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q={{searchText}}&key={{app_key}}";

	search_url = template_url.replace("{{searchText}}", searchText).replace("{{app_key}}", app_key);

	jQuery.ajax({
		type: "GET", 
		dataType: "json",
		url: search_url,
		// data: “id=”+id.val()+”&password=”+password.val()+”&name=”+name.val(),
		success: this.searchResultShow,
		error: errorNoti
	}); 	
};

View.prototype.searchResultShow = function(searchData){
	searchContent = $('#searchContent');
	searchContentTemplate = '<li data-id="{{videoID}}" data-title="{{title}}" data-artist="{{artist}}"><div class="title">{{title}}</div><div class="desc">{{desc}}</div></li>';
	if (searchData == []){
		core.noSearchResult();
		return;
	}

	searchContent[0].innerHTML = '';
	var vidoeInfos = searchData.items;
	allContent = "";
	for (i = 0; i < vidoeInfos.length; i++) {
		title = vidoeInfos[i].snippet.title;
		desc = vidoeInfos[i].snippet.description;
		artist = vidoeInfos[i].snippet.channelTitle;
		videoID = vidoeInfos[i].id.videoId;
		addItem = searchContentTemplate.replace(/{{title}}/g, title).replace("{{videoID}}",videoID).replace("{{desc}}", desc).replace("{{artist}}", artist);
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
	var listKeys = Object.keys(playLists);
	var numList = listKeys.length;

	if (numList==0)
		return;

	var liClass = "";
	var defaultListName = "";
	var liInnerHTML = "";

	for (i=0;i<numList;i++){
		liClass = "";
		if (i==0){
			liClass="active";
			defaultListName = playLists[listKeys[i]].name;
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
	var trTemplate = '<tr data-videoID="{{videoID}}" data-name="{{videoName}}" data-artist="{{artist}}">'
	    + '<th scope="row" class="table-rank">{{index}}</th>'
        + '<td class="table-name">{{videoName}}</td>'
        + '<td class="table-artist">{{artist}}</td>'
        + '</tr>';
    var playListTableDOM = $('#playlist-table tbody');
	var playLists = this.store.playlistContainer;
	var selectedPlayList = playLists[playListName].videoContainer;
	var listKeys = Object.keys(selectedPlayList).reverse();
	var numList = listKeys.length;

	var tableInnerHTML = "";

	if (numList==0){
		playListTableDOM[0].innerHTML = tableInnerHTML;
		return;
	}

	for (i=0;i<numList;i++){
		item = selectedPlayList[listKeys[i]];
		tableInnerHTML = tableInnerHTML + trTemplate.replace(/{{videoID}}/g,item.id).replace(/{{index}}/g, i+1).replace(/{{videoName}}/g, item.name).replace(/{{artist}}/g, item.artist);
	}

	this.numPlayEntry = numList;
	playListTableDOM[0].innerHTML = tableInnerHTML;

	this.videoPlayer.setPlayList(playLists[playListName]);
	this.videoListEventSetUp();
};

View.prototype.videoListAdd = function(id, title, artist){
	var trTemplate = '<tr data-videoID="{{videoID}}" data-name="{{videoName}}" data-artist="{{artist}}">'
	    + '<th scope="row" class="table-rank">{{index}}</th>'
        + '<td class="table-name">{{videoName}}</td>'
        + '<td class="table-artist">{{artist}}</td>'
        + '</tr>';

    var playListTableDOM = $('#playlist-table tbody');

	playListTableDOM[0].innerHTML = playListTableDOM[0].innerHTML + trTemplate.replace(/{{videoID}}/g,id).replace(/{{index}}/g, this.numPlayEntry+1).replace(/{{videoName}}/g, title).replace(/{{artist}}/g, artist);
	this.numPlayEntry = this.numPlayEntry + 1;
	this.videoListEventSetUp();
}

View.prototype.searchContentEventSetUp = function(){
	var self = this;
	var dataset;

	$("#searchContent li").click(function() {
		dataset = $(this)[0].dataset;
		self.searchContent[0].innerHTML = '';
		self.currentPlayList.addVideo(dataset.id, dataset.title, dataset.artist);
		self.store.saveStorage();

		// self.videoListAdd(dataset.id, dataset.title, dataset.artist)		
		self.videoListSetUp(self.currentPlayList.name);
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

View.prototype.videoListEventSetUp = function(){
	var self = this;

	$("#playlist-table tbody tr").click(function() {
		self.videoPlayer.loadVideo($(this)[0].dataset.videoid);
	});	

	$("#playlist-table tbody tr").contextmenu(function(evt){
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
		self.store.removeList(listName);
		self.currentPlayList = null;
		self.playListSetUp();
	});

	$('#videoListContextMenu .addVideo').on('click', function(){
		var dataset = self.selectedItem[0].dataset;
		self.currentPlayList.addVideo(dataset.videoid, dataset.name, dataset.artist);
		self.videoListSetUp(self.currentPlayList.name);
	});

	$('#videoListContextMenu .removeVideo').on('click', function(){
		var dataset = self.selectedItem[0].dataset;
		self.currentPlayList.removeVideo(dataset.videoid);
		self.videoListSetUp(self.currentPlayList.name);
	});

}

function noSearchResult(){

}

function errorNoti(data) {
	console.log("Video Search Error");
}
