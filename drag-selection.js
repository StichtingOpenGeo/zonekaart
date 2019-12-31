function setupSelection(map, source_layer, highlight_layer, attribute) {
	// Setup the event
	var event = new Event('selection-' + attribute);

	// Disable default box zooming.
	map.boxZoom.disable();
	 
	var canvas = map.getCanvasContainer();
	 
	// Variable to hold the starting xy coordinates
	// when `mousedown` occured.
	var start;
	 
	// variable to hold the current xy coordinates
	// when `mousemove` or `mouseup` occurs.
	var current;
	 
	// Variable for the draw box element.
	var box;

	// Set `true` to dispatch the event before other functions
	// call it. This is necessary for disabling the default map
	// dragging behaviour.
	canvas.addEventListener('mousedown', mouseDown, true);
	 
	// Return the xy coordinates of the mouse position
	function mousePos(e) {
		var rect = canvas.getBoundingClientRect();
		return new mapboxgl.Point(
			e.clientX - rect.left - canvas.clientLeft,
			e.clientY - rect.top - canvas.clientTop
		);
	}
 
	function mouseDown(e) {
		// Continue the rest of the function if the shiftkey is pressed.
		if (!(e.shiftKey && e.button === 0)) return;
 
		// Disable default drag zooming when the shift key is held down.
		map.dragPan.disable();
		map.dragRotate.disable();
 
		// Call functions for the following events
		document.addEventListener('mousemove', onMouseMove);
		document.addEventListener('mouseup', onMouseUp);
		document.addEventListener('keydown', onKeyDown);
		 
		// Capture the first xy coordinates
		start = mousePos(e);
	}
 
	function onMouseMove(e) {
		// Capture the ongoing xy coordinates
		current = mousePos(e);
	 
		// Append the box element if it doesnt exist
		if (!box) {
			box = document.createElement('div');
			box.classList.add('boxdraw');
			canvas.appendChild(box);
		}
	 
		var minX = Math.min(start.x, current.x),
		maxX = Math.max(start.x, current.x),
		minY = Math.min(start.y, current.y),
		maxY = Math.max(start.y, current.y);
	 
		// Adjust width and xy position of the box element ongoing
		var pos = 'translate(' + minX + 'px,' + minY + 'px)';
		box.style.transform = pos;
		box.style.WebkitTransform = pos;
		box.style.width = maxX - minX + 'px';
		box.style.height = maxY - minY + 'px';
	}
	 
	function onMouseUp(e) {
		// Remove these events now that finish has been called.
		document.removeEventListener('mousemove', onMouseMove);
		document.removeEventListener('keydown', onKeyDown);
		document.removeEventListener('mouseup', onMouseUp);
		 
		if (box) {
			box.parentNode.removeChild(box);
			box = null;
		}

		// Capture xy coordinates
		finish([start, mousePos(e)]);

		map.dragPan.enable();
		map.dragRotate.enable();
	}
	 
	function onKeyDown(e) {
		// If the ESC key is pressed
		if (e.keyCode === 27) finish();
	}
	 
	function finish(bbox) {
		var xor = window.event.ctrlKey;
			 
		// If bbox exists. use this value as the argument for `queryRenderedFeatures`
		if (bbox) {
			var features = map.queryRenderedFeatures(bbox, { layers: [source_layer] });
		 
			// Run through the selected features and set a filter
			// to match features with its unique attriubte codes to activate
			// the highlighted layer.
			var filter = features.reduce(function(memo, feature) {
				memo.push(feature.properties[attribute]);
				return memo;
			}, []);

			if (xor) {
				var current = map.getFilter(highlight_layer).slice(2);
				if (current.length > 0) {
					filter = arrayXor(current, filter)
				}
			}

			window.dispatchEvent(new CustomEvent('selection-' + attribute, { detail: filter }));
			map.setFilter(highlight_layer, ['in', attribute].concat(filter));
		}
		 
	}
 
	map.on('click', function click(e) {
		// set bbox as 0px reactangle area around clicked point
		var delta = 0;
		var bbox = [[e.point.x - delta, e.point.y - delta], [e.point.x + delta, e.point.y + delta]];
		finish(bbox);
	});
}
