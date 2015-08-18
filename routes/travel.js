/*****

	travel.js

	Module to handle all end-points related with travels

	@author Carlos Alberto Castaño (@calbertts)
	@version 1.0
	@date 13/08/2015

*****/


var express = require('express')
var router = express.Router()
var queryString = require('querystring')
var cheerio = require('cheerio')
var request = require('request')
var Deferred = require('Deferred')

var Tools = require('./tools')


/**
	End-Point to create a travel plan

	@param lat Latitude
	@param lng Longitude

	@return Returns an array with all connections found
 */
router.get('/connections', function(req, res, next)
{
	if('startAddress' in req.query && 'endAddress' in req.query)
	{
		Deferred.when(queryGMapsFromAddress(req.query.startAddress), queryGMapsFromAddress(req.query.endAddress)).then(
			function sucess(addresses)
			{
				getConnections(arguments['0'], arguments['1']).then(function(resp)
				{
					res.write(resp)
					res.end()
				})
			},
			function error(error)
			{
				res.json({
					status: 'ERROR',
					message: 'ERROR_QUERING_ADDRESSES',
					details: error
				})
			}
		)
	}

	else if('startPoint' in req.query && 'endPoint' in req.query)
	{
		res.json({
			ok: 'ok'
		})
		/*var startPoint = {
			lat: req.query.startPoint.split(',')[0],
			lng: req.query.startPoint.split(',')[1]
		}

		var endPoint = {
			lat: req.query.endPoint.split(',')[0],
			lng: req.query.endPoint.split(',')[1]
		}

		Deferred.when(queryGMapsFromCoords(startPoint), queryGMapsFromCoords(endPoint)).then(
			function sucess(addresses)
			{
				res.json({
					startPoint: arguments['0'],
					endPoint: arguments['1']
				})
			},
			function error(error)
			{
				res.json({
					status: 'ERROR',
					message: 'ERROR_QUERING_ADDRESSES',
					details: error
				})
			}
		)*/
	}
})

function queryGMapsFromAddress(address)
{
	var deferred = new Deferred()

	var requestParameters = {
		address: address,
		location_type: 'ROOFTOP',
		result_type: 'street_address',
		components: 'country:co',
		bounds: '3.292243,-76.587119|3.504729,-76.464896',
		key: 'AIzaSyBYH2V8tBXPKOAO9lCLjp7kj6mc5Hph6vU'
	}

	var url = 'https://maps.googleapis.com/maps/api/geocode/json?' + queryString.stringify(requestParameters)

	request(url, function (error, response, body)
	{
		if (!error && response.statusCode == 200)
		{
			var place = JSON.parse(body).results[0]

			address1 = '';
			address2 = '';
			if (place && place.address_components)
			{
				address1 = [
					(place.address_components[1] && place.address_components[1].short_name || ''),
					(place.address_components[0] && place.address_components[0].short_name || '')
				].join(' ')

				address2 = [
						(place.address_components[0] && place.address_components[0].short_name || ''),
						(place.address_components[1] && place.address_components[1].short_name || ''),
						(place.address_components[2] && place.address_components[2].short_name || '')
					].join(' ')

				var _address = address1 + '(' + address2 + ')'

				deferred.resolve({
					address: _address,
					location: Tools.getTransformCoords(place.geometry.location.lng+"", place.geometry.location.lat+"")
				})
			}
			else
			{
				deferred.reject({
					error: 'ADDRESSES_NOT_FOUND',
					details: address
				})
			}
		}
		else
		{
			deferred.reject(error)
		}
	})

	return deferred.promise()
}

function getConnections(startAddress, endAddress)
{
	var requestParams = {
		SID: 'A=16@O= ' + startAddress.address + '@X=' + startAddress.location.x + '@Y=' + startAddress.location.y,
		getstop: 'true',
		ZID: 'A=16@O= ' + endAddress.address + '@X=' + endAddress.location.x + '@Y=' + endAddress.location.y,
	}

	var url = 'http://190.216.202.34:8080/bin/query.bin/hn?' + queryString.stringify(requestParams)

	console.log(url)

	return Tools.getData(url).done(function(resp)
	{
		return url
	})
}


module.exports = router
