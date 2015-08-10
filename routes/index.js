var express = require('express');
var router = express.Router();

var Deferred = require('Deferred');
var http = require('http');
var request = require('request');

var weekDays = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá'];


/*var getTransformCoords = function(x, y)
{
	var coord = {};
	coord.x = x.replace(/\./, '').substr(0, 9);
	coord.y = y.replace(/\./, '').substr(0, 7);

	return coord;
};*/


/* URL: request-route */
router.get('/', function(req, res, next)
{
  var data;

	if(Object.keys(req).length !== 0 && Object.keys(req.query).length !== 0)
	{
		data = req.query;
		//console.log(req.query);

		var startCoordTransformed = getTransformCoords(req.query.x1, req.query.y1);
		var endCoordTransformed = getTransformCoords(req.query.x2, req.query.y2);

		var DataTravel = {
			start: {
				x: startCoordTransformed.x,
				y: startCoordTransformed.y
			},

			end: {
				x: endCoordTransformed.x,
				y: endCoordTransformed.y
			},

			mode: req.query.mode || 'lessBuses'
		};

		nuevoProc(DataTravel, res);
	}

	else
	{
		res.write('No se enviaron las coordenadas');
		res.end();

		return;
	}
});

module.exports = router;


/******************/

/*var getData = function(url, data, method) {

	var deferred = new Deferred();

	var respStr = '';

	// Petición HTTP

	var options = {
		host: '190.216.202.34',
		port: 8080,
		path: url,
		method: method || 'GET',
		agent: false
	};

	// Cargar URL a partir del origen y los destinos
	var endRequest;

	http.request(options, function(resp){
		resp.setEncoding('utf8');

		resp.on('data', function(chunk){
			respStr += String(chunk);
		});

		resp.on('end', function(){
			deferred.resolve(respStr);
		});
	}).on("error", function(e){
		console.error('Error la función "getData" con los parametros: ', arguments);
		console.log( e.stack );
	}).end();

	return deferred.promise();
};*/


function getDate()
{
	var date = new Date();
	var fullDate = weekDays[date.getDay()] + ', ' + (( (date.getDate() < 10) ? '0':'' )+date.getDate()) + '.' + (( ((date.getMonth()+1) < 10) ? '0':'' )+(date.getMonth()+1)) + '.' + (date.getFullYear()-2000);

	return fullDate;
}

function getTime()
{
	var date = new Date();
	var fullTime = date.getHours() + ':' + date.getMinutes();//(date.getMinutes()-5 < 0) ? (date.getMinutes()-5)+5 : date.getMinutes()-5;

	return fullTime;
}


function nuevoProc(data, res, socket)
{
	// Pendiente manejo de fechas

	//console.log(data);

	//console.log('LO QUE DEVUELVE getDate: ', getDate());
	//console.log('LO QUE DEVUELVE getTime: ', getTime());

	console.log('Se solicitó el trazado de un recorrido');
	console.log('Coordenadas del recorrido: ', data);

	var dataForm1 = {
		queryPageDisplayed:'yes',
		REQ0JourneyStopsS0A:'255',
		REQ0JourneyStopsS0G:'',
		REQ0JourneyStopsS0ID: 'ujm=1&MapCenter=DEFAULT&SetGlobalOptionGO_callMapFromPosition=tp_query_from&OK:Mapa',
		REQ0JourneyStopsZ0A:'255',
		REQ0JourneyStopsZ0G:'',
		REQ0JourneyStopsZ0ID:'',
		REQ0HafasUnsharpSearch:'1',
		existUnsharpSearch:'yes',
		//REQ0JourneyDate:'Mi, 26.02.14',
		REQ0JourneyDate: getDate(),
		wDayExt0:'Lu|Ma|Mi|Ju|Vi|Sá|Do',
		REQ0JourneyTime: getTime(),
		REQ0HafasSearchForw:'1',
	};

	//console.log('PRIMER FORMULARIO: ', dataForm1);

	// Ir al formulario de planear viaje
	request.post(
			'http://190.216.202.34:8080/bin/query.bin/hn?ld=std&OK',
			{form: dataForm1},
			function (error, response, body) {
				if (!error && response.statusCode == 200) {
					var seqnr = body.match(/seqnr=[^&]*/)[0];
					var ident = body.match(/ident=[^&]*/)[0];

					// Seleccionar el primer punto del mapa
					var firstMapURL = 'http://190.216.202.34:8080/bin/query.bin/hn?ld=std&'+seqnr+'&'+ident+'&SID=A=16@O=Seleccionar%C2%A0en%C2%A0el%C2%A0mapa@X='+data.start.x+'@Y='+data.start.y+'&getstop=true';

					//console.log('MAPA 1: ', firstMapURL);

					getData(firstMapURL).done(function(resp){
						
						// Ya en el formulario principal
						var seqnr = resp.match(/seqnr=[^&]*/)[0];

						var dataForm2 = {
							queryPageDisplayed: 'yes',
							REQ0JourneyStopsS0A: '16',
							REQ0JourneyStopsS0K: 'depTupel:'+data.start.x,
							REQ0JourneyStopsZ0A: '255',
							REQ0JourneyStopsZ0G: '',
							REQ0JourneyStopsZ0ID: 'ujm=1&MapCenter=DEFAULT&SetGlobalOptionGO_callMapFromPosition=tp_query_to&OK:Mapa',
							REQ0HafasUnsharpSearch: '1',
							existUnsharpSearch: 'yes',
							REQ0JourneyDate: getDate(),
							wDayExt0:'Lu|Ma|Mi|Ju|Vi|Sá|Do',
							REQ0JourneyTime: getTime(),
							REQ0HafasSearchForw: '1',
						};

						// Seleccionar el segundo punto del mapa
						request.post(
								'http://190.216.202.34:8080/bin/query.bin/hn?ld=std&'+seqnr+'&'+ident+'&OK',
								{form: dataForm2},
								function (error, response, body) {
									if (!error && response.statusCode == 200) {

										var seqnr = body.match(/seqnr=[^&]*/)[0];
										var secondMapURL = 'http://190.216.202.34:8080/bin/query.bin/hn?ld=std&'+seqnr+'&'+ident+'&ZID=A=16@O=Seleccionar%C2%A0en%C2%A0el%C2%A0mapa@X='+data.end.x+'@Y='+data.end.y+'&getstop=true';

										//console.log('MAPA 2: ', secondMapURL);

										getData(secondMapURL).done(function(resp){

											var connectionsForm = {
												queryPageDisplayed: 'yes',
												REQ0JourneyStopsS0A: '16',
												REQ0JourneyStopsS0K: 'depTupel:'+data.start.x,
												REQ0JourneyStopsZ0A: '16',
												REQ0JourneyStopsZ0K: 'arrTupel:'+data.end.x,
												REQ0HafasUnsharpSearch: '1',
												existUnsharpSearch: 'yes',
												REQ0JourneyDate: getDate(),
												wDayExt0:'Lu|Ma|Mi|Ju|Vi|Sá|Do',
												REQ0JourneyTime: getTime(),
												REQ0HafasSearchForw: '1',
												start:'Buscar+conexión'
											};

											var actionURL = 'http://190.216.202.34:8080' + resp.match(/action="[^]*#focus"/)[0].replace(/action=|"/g, '');

											// Solicitar las conexiones
											request.post(
													actionURL,
													{form: connectionsForm},
													function (error, response, body) {
														if (!error && response.statusCode == 200) {

															var seqnr = body.match(/seqnr=[^&]*/)[0];
															var connsPrefix = body.match(/guiVCtrl_connection_detailsOut_select_[^\"]*/gm);

															//console.log('HEY: ', connsPrefix);

															// Validar si se obtuvieron las conexiones
															if(connsPrefix)
															{
																connsPrefix = connsPrefix.map(function(conn){
																	return conn.replace(/guiVCtrl_connection_detailsOut_select_/, '');
																});

																var cheerio = require('cheerio');
																$ = cheerio.load(body);

																var tableConns = $('.resultTable').first();

																// Elegir la opcion con menos conexiones o la que requiera caminar menos
																var connFinal = 0;

																if(data.mode === 'lessBuses')
																{
																	var max = 100;

																	tableConns.find(':checked').closest('tr').each(function(item){
																		var conns = Number($(this).find('td:nth-child(7)').text());

																		if(conns < max)
																		{
																			max = conns;
																			connFinal = $(this).find('input').first().parent().html().match(/guiVCtrl_connection_detailsOut_select_[^\"]*/)[0].replace(/guiVCtrl_connection_detailsOut_select_/, '');
																		}
																	});

																	console.log('\nConexión con menos integraciones: ', connFinal, ' #', max);
																}

																else if(data.mode === 'lessWalk')
																{
																	connFinal = tableConns.find(':checked').closest('tr').first().find('input').first().parent().html().match(/guiVCtrl_connection_detailsOut_select_[^\"]*/)[0].replace(/guiVCtrl_connection_detailsOut_select_/, '');

																	console.log('\nConexión para caminar menos: ', connFinal);
																}

																// Retornar las coordenadas de la primera conexión
																var mapURL = 'http://190.216.202.34:8080/bin/query.bin/hn?ld=std&'+seqnr+'&'+ident+'&ujm=1&&MapConnectionId='+connFinal+'&SetGlobalOptionGO_callMapFromPosition=tpDetailsRouteComplete';
																//console.log('FINAL MAP:', mapURL);

																request.post(
																	mapURL,
																	function (error, response, body) {
																		var dataRoute = body.match(/function init_jsmapconnection[^\;]*/gm)[0].replace(/\n/g, '').replace(/function init_jsmapconnection\(Map\)\{var conn=eval\(/, '').replace(/(\)|\(|\'\+\')/g, '');

																		var wholeRoute = eval('('+dataRoute+')');

																		var route = eval('('+wholeRoute+')');
																		var sections = route.sections;

																		// Analisis de tiempos para caminar
																		for(var x=0; x<sections.length; x++)
																		{
																			var _section = sections[x];

																			if(_section.type === 'GIS_ROUTE' || _section.type === 'WALK')
																			{
																				var locations = _section.locations;

																				var loct1 = locations[0].dep;
																				var loct2 = locations[1].arr;

																				var _data = loct1.split(':');
																				var depH = Number(_data[0]);
																				var depM = Number(_data[1]);

																				var _data2 = loct2.split(':');
																				var arrH = Number(_data2[0]);
																				var arrM = Number(_data2[1]);

																				_section.timeToWalk = (arrH - depH)+':'+(arrM - depM);
																			}
																		}

																		console.log('\nPlan de viaje retornado: \n');
																		for(var i=0; i<sections.length; i++)
																		{
																			var section = sections[i];

																			if('name' in section)
																			{
																				console.log('\nToma el bus: ', section.name);
																			}

																			// Mostrar paradas
																			var stops = section.locations;

																			for(var j=0; j<stops.length; j++)
																			{
																				var stop = stops[j];

																				if('name' in stop)
																				{
																					console.log('Parada: ', stop.name);
																				}
																			}
																		}

																		console.log(sections);
																		console.log(wholeRoute);
																		route.sections = sections;
																		console.log(wholeRoute);

																		if(res)
																		{
																			res.write(JSON.stringify({status: true, route: route}));
																			res.end();
																		}

																		else{
																			socket.emit('route', {status: true, route: route});
																		}
																	}
																);
															}

															else
															{
																var msgError = 'No se pudieron obtener las conexiones';
																console.error(msgError);

																if(res)
																{
																	res.write(JSON.stringify({status: false, msg: msgError}));
																	res.end();
																}

																else
																{
																	// Crear evento en el cliente para el manejo de los errores
																	socket.emit('route', {status: false, msg: msgError});
																}
															}
														}
													}
											);
										});
									}
								}
						);
					});
				}
			}
	);
}

exports.bySocket = function(data, socket)
{
	nuevoProc(data, null, socket);
};


exports.nearbyStations = function(req, res)
{
	console.log('Se solicitaron las paradas más cercanas a la siguiente coordenada: ', req.query);

	if('x1' in req.query && 'y1' in req.query)
	{
		var point = getTransformCoords(req.query.x1, req.query.y1);
		var max = req.query.max || 5;

		var url = 'http://190.216.202.34:8080/bin/query.bin/hny?&performLocating=2&tpl=stop2json&look_maxno='+max+'&look_stopclass=1023&look_x='+point.x+'&look_y='+point.y+'&';

		getData(url).done(function(resp){
			var stationsObj = JSON.parse(resp.match(/\{[^<]*/)[0]);

			console.log('Paradas encontradas: ', stationsObj);

			res.write(JSON.stringify(stationsObj));
			res.end();
		});
	}

	else
	{
		res.write('Error al realizar la consulta');
		res.end();
	}
};

exports.stationInfo = function(req, res)
{
	var url = 'http://190.216.202.34:8080/bin/stboard.bin/hn?ld=std&';

	if('station' in req.query)
	{
		console.log(req.query.station);

		var form = {
			sqQueryPageDisplayed: 'yes',
			input: req.query.station,
			//REQ0JourneyStopsSID: 'A=1@O=San Pascual@X=-76527300@Y=3442634@U=86@L=0001008@B=1@p=1282147099@',
			//REQ0JourneyStopsSID: 'A=1@O=San Pascual A1@X=-76527147@Y=3442697@U=4095@L=0501400@B=1@p=1400085934@',
			selectDate: 'today',
			dateBegin: getDate(),
			dateEnd: '31.12.14',
			time: getTime(),
			timeselect: 'Seleccionar hora',
			boardType: 'dep',
			start: 'Mostrar',
			distance: 1
		};

		request.post(
			url,
			{form: form},
			function (error, response, body) {
				if (!error && response.statusCode == 200)
				{
					var cheerio = require('cheerio');
					$ = cheerio.load(body);
					var finalItems = {};

					$('.resultTable tr td:nth-child(2)').each(function(){
						var aTag = $.parseHTML($(this).html());

						if(aTag[1] && 'href' in aTag[1].attribs)
						{
							var bus = $(this).text().replace(/^\s+|\s+$/g, '');

							if(! (bus in finalItems))
							{
								var busInfo = aTag[1].attribs.href;
								busInfo = busInfo.replace(/(\/bin\/traininfo.bin\/hn\/)/g, '').replace(/\?[^]*/g, '');

								finalItems[bus] = busInfo;
							}
						}
					});

					res.write(JSON.stringify(finalItems));
					res.end();
				}
			}
		);
	}

	else
	{
		res.write('Error al realizar la consulta');
		res.end();
	}
};

exports.busInfo = function(req, res)
{
	if('bus' in req.query && 'code' in req.query)
	{
		console.log(req.query.code);
		var bus = req.query.bus;
			code = req.query.code;

		var url = 'http://190.216.202.34:8080/bin/traininfo.bin/hn/'+code+'?ld=std&date='+getDate()+'&station_type=dep&boardType=dep&time='+getTime()+'&maxJourneys=&dateBegin='+getDate()+'&dateEnd=31.12.14&selectDate=today&productsFilter=0&dirInput=&backLink=sq&';

		console.log(url);

		getData(url).done(function(resp){
			var cheerio = require('cheerio');
			$ = cheerio.load(resp);
			var items = [];
			var finalItems = [];

			$('.resultTable tr td:nth-child(2)').each(function(){
				items.push($(this).text());
			});

			var deferred = new Deferred();
			var finalR = '';
			var counter = 0;

			for(var i=0; i<items.length; i++)
			{
				var text = items[i];

				var url = '/bin/ajax-getstop.bin/hny?start=1&tpl=suggest2json&REQ0JourneyStopsS0A=7&REQ0JourneyStopsB=100&S='+text.replace(/(\r\n|\n|\r)/gm, '').replace(/ /gm, '%20');
				
				var respProcessing = function(resp)
				{
					text = items[counter].replace(/(\r\n|\n|\r)/gm, '');

					finalR = resp.replace(/SLs\.sls=/, '').replace(/;SLs\.showSuggestion\(\);/, '');//;

					resp = JSON.parse(finalR);

					var x = resp.suggestions[0].xcoord;
					var y = resp.suggestions[0].ycoord;

					var dataStop = {
						stop: text,
						xcoord: x.substr(0, 3) + '.' + x.substr(4, x.length),
						ycoord: y.substr(0, 1) + '.' + y.substr(2, y.length),
					};

					finalItems.push(dataStop);
					counter++;

					if(counter===items.length)
					{
						deferred.resolve(finalItems);
					}
				};

				getData(url).done(respProcessing);
			}

			deferred.done(function(finalItems){
				
				var finalObject = {
					bus: bus,
					route: finalItems
				};

				res.write(JSON.stringify(finalObject));
				res.end();
			});
		});
	}

	else
	{
		res.write('Error al realizar la consulta');
		res.end();
	}
};

module.exports = router;