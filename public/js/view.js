var app_key = "AIzaSyBjSx3cD_ArNqKRGFGlVzBQl-N7h16EU8Q"

function View(playerModel) {
	this.searchBox = $('#searchBox');
	this.searchResult = $('#searchResult');
	this.searchContent = $('#searchContent')
	this.buttonsElement = $('#buttons');
	this.displayElement = $('#display');
	this.lastDisplayElement = null;
	var player = this;


	var tag = document.createElement('script');

	tag.src = "https://www.youtube.com/iframe_api";
	var firstScriptTag = document.getElementsByTagName('script')[0];
	firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

	$(document).keydown(function(event) {
		if (event.keyCode == 27) {
			// console.log(this.searchContent)
			player.searchContent[0].innerHTML = '';
		}
	});

	$("#searchBox").keydown(function(event){
	    if(event.keyCode == 13){
	    	if ($("#searchBox")[0].value.length > 1) {
		        player.videoSearch($("#searchBox")[0].value)
		        $("#searchBox")[0].value = ""
	    	}
	    }
	});
}

View.prototype.videoSearch = function(searchText){
	template_url = "https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q={{searchText}}&key={{app_key}}"

	search_url = template_url.replace("{{searchText}}", searchText).replace("{{app_key}}", app_key)

	jQuery.ajax({
		type: "GET", 
		dataType: "json",
		url: search_url,
		// data: “id=”+id.val()+”&password=”+password.val()+”&name=”+name.val(),
		success: this.searchResultShow,
		error: errorNoti
	}); 	
}

View.prototype.searchResultShow = function(searchData){

	searchContent = $('#searchContent')
	searchContentTemplate = '<li><a href="#">{{title}}</a></li>'
	if (searchData == []){
		this.noSearchResult();
		return;
	}

	searchContent[0].innerHTML = '';
	var vidoeInfos = searchData.items;
	allContent = ""
	for (i = 0; i < vidoeInfos.length; i++) {
		title = vidoeInfos[i].snippet.title
		addItem = searchContentTemplate.replace("{{title}}", title)
		allContent = allContent + addItem;		
	}
	searchContent[0].innerHTML = allContent
	contentEventSetUp();
	searchContent.show();
}

function contentEventSetUp(){
	$("#searchContent li").click(function() {
		console.log($(this))
	});
}

function noSearchResult(){

}

function errorNoti(data) {
	console.log("Video Search Error")
	console.log(data)
}

function onYouTubeIframeAPIReady() {
	player = new YT.Player('video-player', {
		height: '240',
		width: '300',
		videoId: 'M7lc1UVf-VE',
		events: {
			'onReady': onPlayerReady,
			'onStateChange': onPlayerStateChange
		}
	});
}

// 4. The API will call this function when the video player is ready.
function onPlayerReady(event) {
	event.target.playVideo();
}

// 5. The API calls this function when the player's state changes.
//    The function indicates that when playing a video (state=1),
//    the player should play for six seconds and then stop.
var done = false;
function onPlayerStateChange(event) {
	if (event.data == YT.PlayerState.PLAYING && !done) {
		setTimeout(stopVideo, 6000);
		done = true;
	}
}
function stopVideo() {
	player.stopVideo();
}