/**
 * Copyright (c) 2016 Pearman. All rights reserved.
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
	chrome.app.window.create('views/pear_music.html', {
			'outerBounds': {
			'width': 1200,
			'height': 800,
			left: Math.round((screenWidth-width)/2),
			top: Math.round((screenHeight-height)/2)
		}
	});
});