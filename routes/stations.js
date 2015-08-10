var express = require('express');
var router = express.Router();
var request = require('request');
var queryString = require('querystring');

var Tools = require('./tools');

router.get('/nearby', function(req, res, next)
{
	if('lat' in req.query && 'lng' in req.query)
	{
		var point = Tools.getTransformCoords(req.query.lng, req.query.lat);
		var max = req.query.max || 5;

		var url = 'http://190.216.202.34:8080/bin/query.bin/hny?&performLocating=2&tpl=stop2json&look_maxno='+max+'&look_stopclass=1023&look_x='+point.x+'&look_y='+point.y+'&';

		Tools.getData(url).done(function(resp){
			var stationsObj = JSON.parse(resp.match(/\{[^<]*/)[0]);

			res.json({
				status: 'OK',
				nearbyStations: stationsObj.stops.map(function(item, index)
				{
					var coords = Tools.getTransformCoordsForMaps(item.x, item.y);
					return {
						id: item.extId, 
						name: item.name, 
						lat: coords.y, 
						lng: coords.x, 
						dist: item.dist
					};
				})
			});
		});
	}

	else
	{
		res.json({
			status: 'ERROR',
			message: 'Coords are missing'
		});
	}
});

// TODO: Optimizar con un Deferred para hacer las dos peticiones al mismo tiempo
router.get('/info', function(req, res, next)
{
	if('id' in req.query)
	{
		if(Tools.isNumber(req.query.id))
		{
			var data = req.query.id;
			var url = 'http://190.216.202.34:8080/bin/ajax-getstop.bin/hny?start=1&tpl=suggest2json&REQ0JourneyStopsS0A=7&REQ0JourneyStopsB=12&S='+data;

			Tools.getData(url).done(function(resp){
				var stationInfo = JSON.parse(resp.replace('SLs.sls=', '').replace(';SLs.showSuggestion();', ''));
				var item = stationInfo.suggestions[0];
				var itemId = item.id.match(/L=[^@]*/)[0].replace('L=0', '');
				var routeData = [];

				var routesRequestData = {
					ld: 'std',
					input: data,
					boardType: 'dep',
					time: Tools.getTime(),
					maxJourneys: '',
					dateBegin: Tools.getDate(),
					dateEnd: '31.12.15',
					selectDate: 'today',
					productsFilter: '0',
					start: 'yes',
					dirInput: ''
				};

				var routesURL = 'http://190.216.202.34:8080/bin/stboard.bin/hn?' + queryString.stringify(routesRequestData);
				Tools.getData(routesURL).done(function(resp)
				{
					var cheerio = require('cheerio');
					$ = cheerio.load(resp);
					var table = $('.resultTable').first();

					table.find('tr').each(function(index) {
						var row = $(this);

						if(row.find('td.product > a').html() != null)
						{
							var time = row.find('td.time').text();
							var journeyId = row.find('td.product > a').attr('href').match(/hn[^?]*/)[0].replace('hn/', '').replace('/4095','');
							var bus = row.find('td.product > a').text().trim();

							var journey = [];
							var stationsIDs = {};

							row.find('td.timetable > a').each(function(index) {
								var id = $(this).attr('href').match(/input=[^&]*/)[0].replace('input=', '').replace('&', '');
								var name = $(this).text().replace(/\r?\n|\r/g, '');

								stationsIDs[name]  = id;
							});

							row.find('td.timetable').each(function(index) {
								journey.push( $(this).text().split('\n\n') );
							});

							// Remove trash
							journey = journey[0].slice(3);
							journey.pop();
							journey.pop();

							var newJourney = [];
							journey.map(function(item, index) {
								if( ((index+1) % 2) == 1 )
								{
									var stationName = journey[index].replace(/\r?\n|\r/g, '');
									var time = journey[index+1].replace('-', '').replace(/\r?\n|\r/g, '');

									newJourney.push({id: stationsIDs[stationName], name: stationName, time: time});
								}
							});

							routeData.push({
								journeyId: journeyId,
								bus: bus,
								time: time,
								journey: newJourney
							});
						}
					});

					var coords = Tools.getTransformCoordsForMaps(item.xcoord, item.ycoord);

					res.json({
						status: 'OK',
						stationInfo: {
							id: itemId,
							name: item.value,
							lat: coords.y,
							lng: coords.x,
							weight: item.weight,
							routes: routeData
						}
					});
				});
			});
		}
		else
		{
			res.json({
				status: 'ERROR',
				message: 'The ID provided is not valid'
			});
		}
	}
	else
	{
		res.json({
			status: 'ERROR',
			message: 'You must provide a station ID'
		});
	}
});

router.get('/suggestions', function(req, res, next)
{
	if('search' in req.query)
	{
		var data = req.query.search;
		var url = 'http://190.216.202.34:8080/bin/ajax-getstop.bin/hny?start=1&tpl=suggest2json&REQ0JourneyStopsS0A=7&REQ0JourneyStopsB=12&S='+encodeURIComponent(data);

		Tools.getData(url).done(function(resp){
			var stationInfo = JSON.parse(resp.replace('SLs.sls=', '').replace(';SLs.showSuggestion();', ''));

			res.json({
				status: 'OK',
				suggestions: stationInfo.suggestions.map(function(item, index)
				{
					var coords = Tools.getTransformCoordsForMaps(item.xcoord, item.ycoord);
					return {
						id: item.id.match(/L=[^@]*/)[0].replace('L=0', ''),
						name: item.value,
						lat: coords.y,
						lng: coords.x,
						weight: item.weight
					};
				})
			});
		});
	}
	else
	{
		res.json({
			status: 'ERROR',
			message: 'You must provide a search'
		});
	}
});

module.exports = router;