var pureknob = {
	createKnob: function(width, height) {
		var canvas = document.createElement('canvas');
		var ctx = canvas.getContext('2d');
		var width = width;
		var height = height;
		var angleStart = Math.PI;
		var angleEnd = 2 * Math.PI;
		var angleOffset = 0;
		var valMin = 0;
		var valMax = 100;
		var val = 0;
		var colorBG = '#181818';
		var colorFG = '#ffc000';
		var colorLabel = '#ffffff';
		var label = '';
		var fnValueToString = function(v) { return v.toString(); };
		var trackWidth = 0.4;
		var textScale = 1.0;
		var listeners = [];
		
		canvas.width = width;
		canvas.height = height;
		
		var draw = function() {
			var cx = width / 2;
			var cy = height / 2;
            
            // --- FIX STARTS HERE ---
            // Calculate available radius
            var maxRadius = Math.min(width, height) / 2;
            
            // Calculate stroke thickness
            var lw_track = maxRadius * trackWidth;
            
            // Adjust radius so the outer edge of the stroke hits exactly the canvas edge
            // We subtract (lw_track / 2) because stroke is drawn center-aligned
            // We subtract 2 extra pixels for padding/anti-aliasing safety
			var r_track = maxRadius - (lw_track / 2) - 2; 
            // --- FIX ENDS HERE ---
			
			ctx.clearRect(0, 0, width, height);
			
			// Draw background (track)
			ctx.beginPath();
			ctx.arc(cx, cy, r_track, angleStart + angleOffset, angleEnd + angleOffset);
			ctx.strokeStyle = colorBG;
			ctx.lineWidth = lw_track;
			ctx.lineCap = 'round';
			ctx.stroke();
			
			// Draw foreground (value)
			var angle = (val - valMin) / (valMax - valMin) * (angleEnd - angleStart) + angleStart;
			
			if (val > valMin) {
				ctx.beginPath();
				ctx.arc(cx, cy, r_track, angleStart + angleOffset, angle + angleOffset);
				ctx.strokeStyle = colorFG;
				ctx.lineWidth = lw_track;
				ctx.lineCap = 'round';
				ctx.stroke();
			}
			
			// Draw text
			if (textScale > 0.01) {
				var fontSize = Math.round(maxRadius * 0.4 * textScale);
				ctx.font = 'bold ' + fontSize + 'px Arial';
				ctx.fillStyle = colorLabel;
				ctx.textAlign = 'center';
				ctx.textBaseline = 'middle';
				ctx.fillText(fnValueToString(val), cx, cy);
			}
		};
		
		var notifyListeners = function() {
			for (var i = 0; i < listeners.length; i++) {
				listeners[i](knob, val);
			}
		};
		
		var knob = {
			setProperty: function(name, value) {
				if (name === 'angleStart') angleStart = value;
				else if (name === 'angleEnd') angleEnd = value;
				else if (name === 'angleOffset') angleOffset = value;
				else if (name === 'valMin') valMin = value;
				else if (name === 'valMax') valMax = value;
				else if (name === 'colorBG') colorBG = value;
				else if (name === 'colorFG') colorFG = value;
				else if (name === 'colorLabel') colorLabel = value;
				else if (name === 'label') label = value;
				else if (name === 'fnValueToString') fnValueToString = value;
				else if (name === 'trackWidth') trackWidth = value;
				else if (name === 'textScale') textScale = value;
				else if (name === 'trackColor') colorBG = value; 
				draw();
			},
			setValue: function(v) {
				val = Math.max(valMin, Math.min(valMax, v));
				draw();
				notifyListeners();
			},
			getValue: function() {
				return val;
			},
			addListener: function(f) {
				listeners.push(f);
			},
			node: function() {
				return canvas;
			},
			resize: function(w, h) {
				width = w;
				height = h;
				canvas.width = width;
				canvas.height = height;
				draw();
			}
		};
		
		// Initial draw
		draw();
		return knob;
	}
};