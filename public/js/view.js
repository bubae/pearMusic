var app_key = "AIzaSyBjSx3cD_ArNqKRGFGlVzBQl-N7h16EU8Q";

function View() {
	var player = this;

	this.searchBox = $('#searchBox');
	this.searchResult = $('#searchResult');
	this.searchContent = $('#searchContent');
	this.playListContent = $('#playlist-content');
	this.lastDisplayElement = null;
	this.currentPlayList = null;
	this.numPlayEntry = null;
	this.store = new listStorage(this);
	this.sandbox = new SandboxMessenger();
	
	$(document).keydown(function(event) {
		if (event.keyCode == 27) {
			// player.searchContent[0].innerHTML = '';
		}
	});

	$("#searchBox").keydown(function(event){
	    if(event.keyCode == 13){
	    	if ($("#searchBox")[0].value.length > 1) {
		        player.videoSearch($("#searchBox")[0].value);
		        $("#searchBox")[0].value = "";
	    	}
	    }
	});

	this.videoListEventSetUp();
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
		// console.log(vidoeInfos[i])
	}
	searchContent[0].innerHTML = allContent;
	core.searchContentEventSetUp();
	searchContent.show();
};


View.prototype.playListSetUp = function(){
	var liTemplate = '<li class="{{class}}"><a href="#">{{listName}}</a></li>'
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
		liInnerHTML = liInnerHTML + liTemplate.replace("{{class}}", liClass).replace("{{listName}}",playLists[listKeys[i]].name);
	}
	this.playListContent[0].innerHTML = liInnerHTML;
	this.playListContent.collapse()
	playListEventSetUp();

	this.currentPlayList = playLists[defaultListName];
	this.videoListSetUp(defaultListName);
};

View.prototype.videoListSetUp = function(playListName){
	var trTemplate = '<tr data-videoID="{{videoID}}">'
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
		tableInnerHTML = tableInnerHTML + trTemplate.replace("{{videoID}}",item.id).replace("{{index}}", i+1).replace("{{videoName}}", item.name).replace("{{artist}}", item.artist);
	}

	this.numPlayEntry = numList
	playListTableDOM[0].innerHTML = tableInnerHTML;
	this.videoListEventSetUp();
};

View.prototype.videoListAdd = function(id, title, artist){
	var trTemplate = '<tr data-videoID="{{videoID}}">'
	    + '<th scope="row" class="table-rank">{{index}}</th>'
        + '<td class="table-name">{{videoName}}</td>'
        + '<td class="table-artist">{{artist}}</td>'
        + '</tr>';

    var playListTableDOM = $('#playlist-table tbody');

	playListTableDOM[0].innerHTML = playListTableDOM[0].innerHTML + trTemplate.replace("{{videoID}}",id).replace("{{index}}", this.numPlayEntry+1).replace("{{videoName}}", title).replace("{{artist}}", artist);
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
		self.videoListAdd(dataset.id, dataset.title, dataset.artist)
	});
};

function playListEventSetUp(){

}

View.prototype.videoListEventSetUp = function(){
	$("#playlist-table tbody tr").click(function() {
		console.log($(this)[0].dataset);
	});	
}

function noSearchResult(){

}

function errorNoti(data) {
	// console.log("Video Search Error");
	// console.log(data);
}
