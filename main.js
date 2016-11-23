/**
 * Copyright (c) 2012 The Chromium Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style license that can be
 * found in the LICENSE file.
 **/


/**
 * Listens for the app launching then creates the window
 *
 * @see http://developer.chrome.com/apps/app.window.html
 */
chrome.app.runtime.onLaunched.addListener(function() {
	var screenWidth = screen.availWidth;
	var screenHeight = screen.availHeight;
	width = 1150;
	height = 720;

	var _minWidth = 764;
	var _minHeight = 590;
	if (navigator.appVersion.indexOf('Linux') > -1){
		_minHeight = 550;
	}
	chrome.app.window.create('pear_music.html', {
		id: "pearMusicID",
		outerBounds: {
			'width': width,
			'height': height,
			minWidth: _minWidth,
			minHeight: _minHeight,
			left: Math.round((screenWidth-width)/2),
			top: Math.round((screenHeight-height)/2)
		}
	});
});