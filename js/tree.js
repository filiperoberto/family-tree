Raphael.fn.connection = function (obj1, obj2, line, bg) {
    if (obj1.line && obj1.from && obj1.to) {
        line = obj1;
        obj1 = line.from;
        obj2 = line.to;
    }
    var bb1 = obj1.getBBox(),
        bb2 = obj2.getBBox(),
        p = [{x: bb1.x + bb1.width / 2, y: bb1.y - 1},
        {x: bb1.x + bb1.width / 2, y: bb1.y + bb1.height + 1},
        {x: bb1.x - 1, y: bb1.y + bb1.height / 2},
        {x: bb1.x + bb1.width + 1, y: bb1.y + bb1.height / 2},
        {x: bb2.x + bb2.width / 2, y: bb2.y - 1},
        {x: bb2.x + bb2.width / 2, y: bb2.y + bb2.height + 1},
        {x: bb2.x - 1, y: bb2.y + bb2.height / 2},
        {x: bb2.x + bb2.width + 1, y: bb2.y + bb2.height / 2}],
        d = {}, dis = [];
    for (var i = 0; i < 4; i++) {
        for (var j = 4; j < 8; j++) {
            var dx = Math.abs(p[i].x - p[j].x),
                dy = Math.abs(p[i].y - p[j].y);
            if ((i == j - 4) || (((i != 3 && j != 6) || p[i].x < p[j].x) && ((i != 2 && j != 7) || p[i].x > p[j].x) && ((i != 0 && j != 5) || p[i].y > p[j].y) && ((i != 1 && j != 4) || p[i].y < p[j].y))) {
                dis.push(dx + dy);
                d[dis[dis.length - 1]] = [i, j];
            }
        }
    }
    if (dis.length == 0) {
        var res = [0, 4];
    } else {
        res = d[Math.min.apply(Math, dis)];
    }
    var x1 = p[res[0]].x,
        y1 = p[res[0]].y,
        x4 = p[res[1]].x,
        y4 = p[res[1]].y;
    dx = Math.max(Math.abs(x1 - x4) / 2, 10);
    dy = Math.max(Math.abs(y1 - y4) / 2, 10);
    var x2 = [x1, x1, x1 - dx, x1 + dx][res[0]].toFixed(3),
        y2 = [y1 - dy, y1 + dy, y1, y1][res[0]].toFixed(3),
        x3 = [0, 0, 0, 0, x4, x4, x4 - dx, x4 + dx][res[1]].toFixed(3),
        y3 = [0, 0, 0, 0, y1 + dy, y1 - dy, y4, y4][res[1]].toFixed(3);
    var path = ["M", x1.toFixed(3), y1.toFixed(3), "C", x2, y2, x3, y3, x4.toFixed(3), y4.toFixed(3)].join(",");
    if (line && line.line) {
        line.bg && line.bg.attr({path: path});
        line.line.attr({path: path});
    } else {
        var color = typeof line == "string" ? line : "#000";
        return {
            bg: bg && bg.split && this.path(path).attr({stroke: bg.split("|")[0], fill: "none", "stroke-width": bg.split("|")[1] || 3}),
            line: this.path(path).attr({stroke: color, fill: "none"}),
            from: obj1,
            to: obj2
        };
    }
};

function drawTree(element,width,height,json,callback) {

	var colors = {0:"#B33D63",1:"#214367",couple:"#182B41",parents:'#182B41',siblings:'#182B41',jesus:'#E6D486'};
	var lineWidth = 4;
    var r = Raphael(element, width, height),
        connections = [],
		
		mainPerson = buildPessoaSet(
			{ 
				x:width/2,
				y:height/3
			} , json.Pessoa);
        shapes = [mainPerson];
		
		var pais = {};
		pais[json.Pessoa.id] = mainPerson;
		pais.position = {};
		
		for(var i=0;i<json.Casamento.length;i++)
		{
			var lineColor = json.Casamento[i].linhagem_de_jesus?colors['jesus']:colors.couple;
			var newShape = buildPessoaSet(
				{ 
					x:json.Casamento.length%2?(i+2)*(width/(json.Casamento.length+2)):(i+1)*(width/(json.Casamento.length+1)),
					y:(height/3)
				},json.Casamento[i]);
				
			connections.push(r.connection(shapes[0][0], newShape, lineColor,lineColor+"|"+lineWidth));
			shapes.push(newShape);
			pais[json.Casamento[i].id] = newShape;
			pais.position[json.Casamento[i].id] = json.Casamento.length%2?(i+2)*(width/(json.Casamento.length+2)):(i+1)*(width/(json.Casamento.length+1));
		}
		
		var lineColor = json.Pessoa.linhagem_de_jesus?colors['jesus']:colors.parents;
		
		if(!!json.Pai.id && !!json.Mae.id)
		{
			var pai = buildPessoaSet({x:width/10*4,y:height/10},json.Pai);
			shapes.push(newShape);
			var mae = buildPessoaSet({x:width-width/10*4,y:height/10},json.Mae);
			shapes.push(newShape);
			
			var joint = buildSet({x:width/2,y:height/10,text:'',color:lineColor,lineColor:lineColor,textColor:'rgba(0,0,0,0)',height:10});
			shapes.push(joint);
			connections.push(r.connection(joint[0], pai, lineColor,lineColor+"|"+lineWidth));
			connections.push(r.connection(joint[0], mae, lineColor,lineColor+"|"+lineWidth));
			connections.push(r.connection(joint[0], shapes[0][0], lineColor,lineColor+"|"+lineWidth));
		}
		else if(!!json.Pai.id || !!json.Mae.id)
		{
			var parent = json.Pai.id == null? json.Mae : json.Pai ; 
			var parentObject = buildPessoaSet({x:width/2,y:height/10},parent);
			shapes.push(newShape);
			connections.push(r.connection(shapes[0][0], parentObject[0], lineColor,lineColor+"|"+lineWidth));
		}

		var joins = {};
		var childrenPositions = {};
		childrenPositions['index'] = {};
		var par = true;

		for(var i=0;i<json.filhos.length;i++) {

			var filho = json.filhos[i].Pessoa;

			if(childrenPositions[filho.pai+filho.mae] === undefined) {
					childrenPositions[filho.pai+filho.mae] = 0;
			}
			childrenPositions[filho.pai+filho.mae]++;
		}

		var newShape;
		var containsAllParents = false;
		var position = {};

		for(var i=0;i<json.filhos.length;i++)
		{
			var filho = json.filhos[i].Pessoa;
			
			var lineColor = filho.linhagem_de_jesus?colors['jesus']:colors['siblings'];

			if(pais[filho.pai] !== undefined && pais[filho.mae] !== undefined) {

				containsAllParents = true;

				if(childrenPositions.index[filho.pai+filho.mae] === undefined) {
					childrenPositions.index[filho.pai+filho.mae] = 0;
				}

				var positionX;
				if(filho.pai === json.Pessoa.id) {
					positionX = pais.position[filho.mae];
				} else {
					positionX = pais.position[filho.pai];
				}

				if(position[filho.pai+filho.mae] === undefined) {
					var totalChildren = childrenPositions[filho.pai+filho.mae];
					position[filho.pai+filho.mae] = positionX-100;
					position[filho.pai+filho.mae] /= 2;
				}

				newShape = buildPessoaSet({
					//x: childrenPositions.index[filho.pai+filho.mae]<childrenPositions[filho.pai+filho.mae]/2?childrenPositions.index[filho.pai+filho.mae]*(300/childrenPositions[filho.pai+filho.mae]) + positionX:positionX - childrenPositions.index[filho.pai+filho.mae]*(300/childrenPositions[filho.pai+filho.mae]),
					x: position[filho.pai+filho.mae]+positionX,
					y: json.filhos.length<=2?height-height/4:(i%2?(height-height/4):(height-height/3)) },filho);
				childrenPositions.index[filho.pai+filho.mae] ++;

				position[filho.pai+filho.mae] += newShape[0].node.width.animVal.value + 5;

				if(joins[filho.pai+filho.mae] === undefined) {
					joins[filho.pai+filho.mae] = buildSet({x:positionX,y:height/2,text:'',color:lineColor,lineColor:lineColor,textColor:'rgba(0,0,0,0)',height:10});
					shapes.push(joins[filho.pai+filho.mae]);
					
					connections.push(r.connection(joins[filho.pai+filho.mae][0], pais[filho.pai], lineColor,lineColor+"|"+lineWidth));
					connections.push(r.connection(joins[filho.pai+filho.mae][0], pais[filho.mae], lineColor,lineColor+"|"+lineWidth));
				}
				
				connections.push(r.connection(joins[filho.pai+filho.mae][0], newShape[0], lineColor,lineColor+"|"+lineWidth));
			}
			else if (pais[filho.pai] !== undefined || pais[filho.mae] !== undefined) {

				if(position[filho.pai+filho.mae] === undefined) {
					var totalChildren = childrenPositions[filho.pai+filho.mae];
					position[filho.pai+filho.mae] = width - (totalChildren*100);
					position[filho.pai+filho.mae] /= 2;
				}

				var parentShape = pais[filho.pai] || pais[filho.mae];
				if(childrenPositions.index[filho.pai+filho.mae] === undefined) {
					childrenPositions.index[filho.pai+filho.mae] = 0;
				}

				var heightplus = height+150;

				newShape = buildPessoaSet({
					//x: childrenPositions.index[filho.pai+filho.mae]<childrenPositions[filho.pai+filho.mae]/2?childrenPositions.index[filho.pai+filho.mae]*(500/childrenPositions[filho.pai+filho.mae]) + (width/2):(width/2) - childrenPositions.index[filho.pai+filho.mae]*(500/childrenPositions[filho.pai+filho.mae]),
					x: position[filho.pai+filho.mae],
					//y: json.filhos.length<=2?heightplus-heightplus/4:(i%2?(heightplus-heightplus/4):(heightplus-heightplus/3)) },filho);
					y:heightplus-heightplus/3},filho);

				childrenPositions.index[filho.pai+filho.mae] ++;

				position[filho.pai+filho.mae] += newShape[0].node.width.animVal.value + 5;

				if(containsAllParents) {
					if(joins[json.Pessoa.id] === undefined) {
						joins[json.Pessoa.id] = buildSet({x:width/2,y:height-height/4,text:'',color:lineColor,lineColor:lineColor,textColor:'rgba(0,0,0,0)',height:10});
						shapes.push(joins[json.Pessoa.id]);

						connections.push(r.connection(parentShape, joins[json.Pessoa.id][0], lineColor,lineColor+"|"+lineWidth));
					}

					connections.push(r.connection(joins[json.Pessoa.id][0], newShape[0], lineColor,lineColor+"|"+lineWidth));
				}
				else {
					connections.push(r.connection(parentShape[0], newShape[0], lineColor,lineColor+"|"+lineWidth));
				}			
			};
			shapes.push(newShape);
		}
		
		for(var i=shapes.length-1;i>=0;i--)
		{
			if(!!shapes[i])
			{
				shapes[i][0].toFront();
				shapes[i][1].toFront();
			}			
		}	
	
	function buildPessoaSet( options , pessoa)
	{
		var settings = $.extend({
			text: pessoa.nome,
			id : pessoa.id,
			title:pessoa.citacoes,
			color:colors[pessoa.sexo],
			lineColor:pessoa.linhagem_de_jesus?colors['jesus']:'#000',
			idade_morte:pessoa.idade_morte,
			descricao:pessoa.descricao,
			sinonimos:pessoa.sinonimos
        }, options );
		
		return buildSet( settings );
	}
	
	function buildSet( options )
	{
		var settings = $.extend({
            x: 0,
            y: 0,
			text: 'text',
			color : '#0f0',
			id : undefined,
			textColor:'#fff',
			height:40,
			minWidth:10,
			'stroke-width':2,
			lineColor:'#000',
			title:''
        }, options );
		
		var width = settings.text.length?settings.text.length*20*Math.pow(2,-(settings.text.length/10)):settings.minWidth;
		var rect = r.rect(settings.x,settings.y,width,settings.height,1).attr({
			cursor:'move',
			fill:settings.color,
			stroke:settings.lineColor,
			'stroke-width':settings['stroke-width'],
			title:settings.title
		});
		
		t = r.text(settings.x+(width/2),settings.y+20,settings.text).attr({
            "font-size":16, 
            "font-family": "Arial, Helvetica, sans-serif",
			fill:settings.textColor,
			cursor:'pointer',
			title:settings.title
		}).click(function(e){
			if(settings.id)
				window.top.location = '/id/'+settings.id;
		}).mousedown(onmousedown).hover(function(){
			if(callback)
				callback(settings.text,settings.title,settings.descricao,settings.idade_morte,settings.id,settings.sinonimos);
		});
		
		var st = r.set();
		st.push(rect, t);
		rect.mySet = st;
		rect.drag(onMove, onStart, onEnd);
		rect.mousedown(onmousedown);
		
		var onStart = function () {
			positions = new Array();
			this.mySet.forEach(function(e) {
				var ox = e.attr("x");
				var oy = e.attr("y");
				positions.push([e, ox, oy]);
			});
		}
		var onMove = function (dx, dy) {
			for (var i = 0; i < positions.length; i++) {//you can use foreach but I want to                 show that is a simple array
				positions[i][0].attr({x: positions[i][1] + dx, y: positions[i][2] + dy});
			}
			for (var i = 0;i<connections.length; i++) {
				r.connection(connections[i]);
			}
		}
		var onEnd = function() {}
		
		rect.drag(onMove, onStart, onEnd);
		return st;
	}
};
