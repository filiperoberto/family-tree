Raphael.prototype.rectText = function(x,y,width,height,text) {

	var rect = this.rect(x,y,width,height).attr({
		fill:"white",
		cursor:"move"
	});

	var text = this.text(x+(width/2),y+(height/2),text);

	var st = this.set();
	
	st.push(rect, text);
	rect.mySet = st;
		
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
	}
	var onEnd = function() {}
		
	rect.drag(onMove,onStart,onEnd);
}

Raphael.prototype.connector = function(x,y) {

	this.rect(x,y,10,10).attr({
		fill:"black"
	});

}

function FamilyTree(context,width,height) {

	this.ctx = context;
	this.width = width;
	this.height = height;
	this.connections = new Array();

	this.rectHeight = 50;
	this.rectWidth = 100;

	this.verticalGrid = 6;
	this.horizontalGrid = 12;

	this.addElders = function(father,mother) {

		if(!father && !mother)
			return this.ctx;
		if(!father || !mother) {

			var elder = father || mother;

			var x = (this.width / 2) - (this.rectWidth / 2);
			var y = this.height / this.verticalGrid;
			this.ctx.rectText(x,y,this.rectWidth,this.rectHeight,elder.name);

			return this.ctx;
		}

		var fx = (this.width / 2) - (this.rectWidth / 2) - (this.width/this.horizontalGrid);
		var fy = this.height / this.verticalGrid;

		var mx = (this.width / 2) - (this.rectWidth / 2) + (this.width/this.horizontalGrid);
		var my = this.height / this.verticalGrid;

		this.ctx.rectText(fx,fy,this.rectWidth,this.rectHeight,father.name);
		this.ctx.rectText(mx,my,this.rectWidth,this.rectHeight,mother.name);

		this.ctx.connector((this.width / 2),fy);

		//connections.push({father.id})
	}
}