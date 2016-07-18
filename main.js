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
	chrome.app.window.create('pear_music.html', {
		id: "pearMusicID",
		outerBounds: {
			'width': width,
			'height': height,
			minWidth: 764,
			minHeight: 585,
			left: Math.round((screenWidth-width)/2),
			top: Math.round((screenHeight-height)/2)
		}
	});
});

