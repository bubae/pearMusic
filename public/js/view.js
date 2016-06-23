var app_key = "AIzaSyBjSx3cD_ArNqKRGFGlVzBQl-N7h16EU8Q";

function View() {
	this.searchBox = $('#searchBox');
	this.searchResult = $('#searchResult');
	this.searchContent = $('#searchContent');
	this.buttonsElement = $('#buttons');
	this.displayElement = $('#display');
	this.lastDisplayElement = null;
	var player = this;

	// userLists = new listStorage();

	$(document).keydown(function(event) {
		if (event.keyCode == 27) {
			// console.log(this.searchContent)
			player.searchContent[0].innerHTML = '';
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
	searchContentTemplate = '<li data-id={{videoID}}><a href="#">{{title}}</a></li>';
	if (searchData == []){
		this.noSearchResult();
		return;
	}

	searchContent[0].innerHTML = '';
	var vidoeInfos = searchData.items;
	allContent = "";
	for (i = 0; i < vidoeInfos.length; i++) {
		title = vidoeInfos[i].snippet.title;
		videoID = vidoeInfos[i].id.videoId;
		addItem = searchContentTemplate.replace("{{title}}", title).replace("{{videoID}}",videoID);
		allContent = allContent + addItem;		
		console.log(vidoeInfos[i])
	}
	searchContent[0].innerHTML = allContent;
	contentEventSetUp();
	searchContent.show();
};

function contentEventSetUp(){
	$("#searchContent li").click(function() {
		// console.log($(this));
	});
}

function noSearchResult(){

}

function errorNoti(data) {
	// console.log("Video Search Error");
	// console.log(data);
}
