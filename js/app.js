(function(){

	$.fn.myPaint=function(options){

		var defaults = 
		{
			width: 600,
			height : 300,
			pencil: true,
			brush: true,
			eraser: true,
			line: true,
			rect: true,
			circle: true,
			save: true,
			clear: true,
			filled : true,
			minLineWidth : 1,
			maxLineWidth : 50,
			linecap : 'butt',
			colors : ['black', 'gray', 'red', 'orange', 'yellow', 'brown', 'yellowgreen', 'green', 'blue', 'deepskyblue', 'cyan',  'indigo', 'violet',  'pink'],
			patterns : ['bg.png', 'pattern.png']
		}
		

		var parametres = $.extend(defaults, options);

		return this.each(function(){



			$('#paint').parent().append($('<div id="toolbar"></div>').css({width : parametres.width}));
			$('#toolbar').before('<p> Outils :</p>');
			$('#paint').parent().append('<input type="range" min="'+parametres.minLineWidth+'" max="'+parametres.maxLineWidth+'" id="linewidth">');
			$('#linewidth').before('<p> Epaisseur :</p>');
			$('#paint').parent().append($('<span id="lineWidthVal"></span>'));
			$('#lineWidthVal').html($('#linewidth').val());
			$('#paint').parent().append('<div id="colors"></div>');
			$('#colors').css({width : parametres.width}).before('<p> Couleurs :</p>');
			$('#paint').parent().append('<div id="patterns"></div>');
			$('#patterns').before('<p> Motifs :</p>');

			$('#paint').parent().append('<div id="saveImg"></div>');
			$('#saveImg').css({width : parametres.width, height : parametres.height}).append('<p>Clic droit => Enregistrer sous</p>').append($('<img>').attr('id', 'image')).hide();

			

			// creation de la balise canvas
			var canvas = $('<canvas>Votre navigateur ne supporte pas la balise canvas ! :(</canvas>');
			canvas[0].width = parametres.width;
			canvas[0].height = parametres.height;
			var ctx = canvas[0].getContext('2d');


			$(this).append(canvas);

			var tmpCanvas = $('<canvas></canvas>');
			tmpCanvas[0].width = canvas[0].width; 
			tmpCanvas[0].height = canvas[0].height; 
			tmpCanvas[0].id = 'tmpCanvas';
			var color = '#000';
			var tmpCtx = tmpCanvas[0].getContext('2d');
		

			$(this).append(tmpCanvas);

			$('#linewidth').on('mousemove', function(){
				$('#lineWidthVal').html($('#linewidth').val());
				setLineWidth($('#linewidth').val());
			})

			tmpCtx.lineWidth = $('#linewidth').val();
			tmpCtx.lineCap = parametres.linecap;
			var radius = tmpCtx.lineWidth/2;


			var mouse = {x:0, y:0},
			startMouse = {x:0, y:0};

			var tool = 'pencil';
			
			var idPattern = 'pattern';
			var checked = false;



			tmpCanvas.on('mousemove', function(e){
				mouse.x = e.pageX - $('#paint')[0].offsetLeft;
				mouse.y = e.pageY - $('#paint')[0].offsetTop;
				

			});
			tmpCanvas.on('mousedown', function(e){
				mouse.x = e.pageX - $('#paint')[0].offsetLeft;
				mouse.y = e.pageY - $('#paint')[0].offsetTop;

				startMouse.x = mouse.x;
				startMouse.y = mouse.y;



				switch(tool){
					case 'pencil' : 
						tmpCtx.beginPath();
						tmpCtx.moveTo(mouse.x, mouse.y);
						pencil();
						tmpCanvas.bind('mousemove', pencil);
						break;
					case 'brush' :
						tmpCtx.beginPath();
						brush();
						tmpCanvas.bind('mousemove', brush);

						break;

					case 'eraser': 
						tmpCtx.beginPath();
						eraser();
						tmpCanvas.bind('mousemove', eraser);
						break;
					case 'line' :
						tmpCanvas.bind('mousemove', drawLine);
						drawLine();
						break;
					case 'rectangle' :
						tmpCanvas.bind('mousemove', drawRect);
						drawLine();
						break;
					case 'circle' : 
						tmpCanvas.bind('mousemove', drawCircle);
						break;
					case 'pattern' : 
						tmpCtx.beginPath();

						tmpCanvas.bind('mousemove', pattern);
						break;

				}
			})


			tmpCanvas.on('mouseup', function(e){

				tmpCanvas.unbind('mousemove', pencil);
				tmpCanvas.unbind('mousemove', brush);
				
				tmpCanvas.unbind('mousemove', eraser);
				tmpCanvas.unbind('mousemove', drawLine);
				tmpCanvas.unbind('mousemove', drawRect);
				tmpCanvas.unbind('mousemove', drawCircle);
				tmpCanvas.unbind('mousemove', pattern);
				tmpCtx.fillStyle = color;
				tmpCtx.strokeStyle = color;
				imageUpdate();
			})



			function pencil(){

				tmpCtx.lineTo(mouse.x, mouse.y);
				tmpCtx.stroke();
			}

			function brush(){
				tmpCtx.lineTo(mouse.x, mouse.y);
				tmpCtx.stroke();
				tmpCtx.beginPath();
				tmpCtx.arc(mouse.x, mouse.y, radius, 0, Math.PI*2);
				tmpCtx.fill();
				tmpCtx.beginPath();
				tmpCtx.moveTo(mouse.x, mouse.y);
			}

			function eraser(){
				tmpCtx.fillStyle = 'white';
				tmpCtx.strokeStyle = 'white';
				brush();
			}

			function pattern(){
				console.log(idPattern);
				var img = document.getElementById(idPattern);
				var pat = tmpCtx.createPattern(img, "repeat");
				tmpCtx.fillStyle = pat;
				tmpCtx.strokeStyle = pat;
				brush();
			}



			function drawLine(){
				tmpCtx.clearRect(0,0, parametres.width, parametres.height);
				tmpCtx.beginPath();
				tmpCtx.moveTo(startMouse.x, startMouse.y);
				tmpCtx.lineTo(mouse.x, mouse.y);
				tmpCtx.stroke();
				tmpCtx.closePath();

			}
			
			function drawRect(){

				tmpCtx.clearRect(0,0, parametres.width, parametres.height);
				var x = Math.min(mouse.x, startMouse.x);
				var y = Math.min(mouse.y, startMouse.y);
				var width = Math.abs(mouse.x - startMouse.x);
				var height = Math.abs(mouse.y - startMouse.y);
				if(checked){
					tmpCtx.fillRect(x, y, width, height);
				}
				else{
					tmpCtx.strokeRect(x, y, width, height);
				}
				
			}

			function drawCircle(){

				tmpCtx.clearRect(0,0, parametres.width, parametres.height);

				var x = (startMouse.x + mouse.x) / 2;
				var y = (startMouse.y + mouse.y) / 2;

				var radius  = Math.max(
					Math.abs(mouse.x - startMouse.x),
					Math.abs(mouse.y - startMouse.y)
				) / 2
				tmpCtx.beginPath();
				tmpCtx.arc(x, y, radius, 0, Math.PI*2, false);
				if(checked){
					tmpCtx.fill();
				}
				else{
					tmpCtx.stroke();
				}
				tmpCtx.closePath();
				
			}


			

			
			$('#rectangle').on('click', function(){
				drawRect();
			});


			if(parametres.pencil){
				$('#toolbar').append($('<button class="btn-tool" id="pencil"></button>')
					.append($('<i>&nbsp;</i>')
						.css('background', 'url(\'img/icons/pencil.png\') no-repeat')
					));
			}
			if(parametres.brush){
				$('#toolbar').append($('<button class="btn-tool" id="brush"></button>')
					.append($('<i>&nbsp;</i>')
						.css('background', 'url(\'img/icons/brush.png\') no-repeat')
					));
			}
			if(parametres.eraser){
				$('#toolbar').append($('<button class="btn-tool" id="eraser"></button>')
					.append($('<i>&nbsp;</i>')
						.css('background', 'url(\'img/icons/eraser.png\') no-repeat')
					));
			}
			if(parametres.line){
				$('#toolbar').append($('<button class="btn-tool" id="line"></button>')
					.append($('<i>&nbsp;</i>')
						.css('background', 'url(\'img/icons/line.png\') no-repeat')
					));
			}
			if(parametres.rect){
				$('#toolbar').append($('<button class="btn-tool" id="rect"></button>')
					.append($('<i>&nbsp;</i>')
						.css('background', 'url(\'img/icons/rect.png\') no-repeat')
					));
			}
			if(parametres.circle){
				$('#toolbar').append($('<button class="btn-tool" id="circle"></button>')
					.append($('<i>&nbsp;</i>')
						.css('background', 'url(\'img/icons/circle.png\') no-repeat')
					));
			}
			if(parametres.save){
				$('#toolbar').append($('<button class="btn-tool" id="save"></button>')
					.append($('<i>&nbsp;</i>')
						.css('background', 'url(\'img/icons/save.png\') no-repeat')
					));
			}
			if(parametres.clear){
				$('#toolbar').append($('<button class="btn-tool" id="clear"></button>')
					.append($('<i>&nbsp;</i>')
						.css('background', 'url(\'img/icons/remove.png\') no-repeat')
					));
			}
			if(parametres.filled){
				$('#toolbar').append($('<label for="filled">Remplir ? <label><input type="checkbox" id="filled">'));
					
			}



			$('#pencil').on('click', function(){
				tool = 'pencil';
			});

			$('#brush').on('click', function(){
				tool = 'brush';
			});

			$('#eraser').on('click', function(){
				tool = 'eraser';
			});

			$('#line').on('click', function(){
				tool = 'line';
			});

			$('#rect').on('click', function(){
				tool = 'rectangle'
			});

			$('#circle').on('click', function(){
				tool = 'circle'
			});

			$('#save').on('click', saveImage);
			
			$('#clear').on('click', function(){
				ctx.clearRect(0,0, parametres.width, parametres.height);
			});

			$('#filled').on('change', function(){
				checked = $('#filled').prop('checked');
				console.log(checked);
			});

			$.each(parametres.colors, function(index, value){
				$('#colors').append($('<div></div>').addClass('color').css({
					'background-color': value,
					'width' : '30px',
					'height' : '30px',
					'display' : 'inline-block',
					'margin-right' : '2px'
				}))
			})

			$.each(parametres.patterns, function(index, value){
				$('#patterns').append($('<img>').addClass('pattern').attr('src', 'img/'+ value).attr('id', index).css({
					'height' : '60px',
					'width' : '60px',
					'display' : 'inline-block',
					'margin-right' : '2px'
				}))
				$('#' + index).on('click', function(){
					tool = 'pattern';
					console.log(index);
					console.log(value);
					idPattern = index;
				});
			})

			$('.color').on('click', setColor);

			function setColor(e){
				color = e.target.style.backgroundColor;
				tmpCtx.strokeStyle = color;
				tmpCtx.fillStyle = color;
			}

			// Canvas temporaire
			function imageUpdate(){
				ctx.drawImage(tmpCanvas[0],0,0); // écrit le contenu du canvas temporaire dans le canvas
				tmpCtx.clearRect(0,0, tmpCanvas[0].width, tmpCanvas[0].height); // efface le canvas temporaire
			}

			function setLineWidth(value){
				console.log(value);
				tmpCtx.lineWidth =  value;
				ctx.lineWidth =  value;
				radius = value/2
			}

			function saveImage(){
				var data = canvas[0].toDataURL();

				$('#image').attr('src', data);
				$('#saveImg').fadeIn();
			}


		})
	}

})(jQuery);