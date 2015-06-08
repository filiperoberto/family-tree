Raphael.prototype.rectText = function(x,y,width,height,text) {

	var rect = this.rect(x,y,width,height).attr({
		fill:"white",
		cursor:"move"
	});

	var text = this.text(x+(width/2),y+(height/2),text);

	var st = this.set();
	
	st.push(rect, text);
	rect.mySet = st;
	
	//rect.mousedown(onmousedown);
		
	var positions;

	var onStart = function () {
		positions = new Array();
		this.mySet.forEach(function(e) {
			var ox = e.attr("x");
			var oy = e.attr("y");
			positions.push([e, ox, oy]);
		});
	}
	var onMove = function (dx, dy) {
		for (var i = 0; i < positions.length; i++) {
			positions[i][0].attr({x: positions[i][1] + dx, y: positions[i][2] + dy});
		}
		/*for (var i = 0;i<connections.length; i++) {
			r.connection(connections[i]);
		}*/
	}
	var onEnd = function() {}
		
	rect.drag(onMove,onStart,onEnd);
}