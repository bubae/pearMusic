

function View(playerModel) {
	this.calcElement = $('#calc');
	this.buttonsElement = $('#buttons');
	this.displayElement = $('#display');
	this.lastDisplayElement = null;
	this.BuildWidgets();
	var calc = this;	
}