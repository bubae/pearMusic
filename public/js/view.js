function View(playerModel) {
	this.searchBox = $('#searchBox');
	this.buttonsElement = $('#buttons');
	this.displayElement = $('#display');
	this.lastDisplayElement = null;
	this.BuildWidgets();
	var player = this;
}