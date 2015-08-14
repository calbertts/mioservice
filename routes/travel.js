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
var GoogleMapsAPI = require('googlemaps')
var request = require('request')

var Tools = require('./tools')


/**
	End-Point to create a travel plan

	@param lat Latitude
	@param lng Longitude

	@return Returns an array with all connections found
 */
router.get('/connections', function(req, res, next)
{
	if('lat' in req.query && 'lng' in req.query)
	{
		/*var enterpriseConfig = {
		  google_client_id:   '259286454011-crssajo0mvtpq0sbjlq4sep651gfcaj3.apps.googleusercontent.com',
		  google_private_key: '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDrvcfSP6IL7bA6\ndtYsaDRH/uVFI1s6UjRzf7+GFOI1ZevEi4N1O04Hdq7dLEJhWRJG0IfBUhrhXQZ+\nBRaResNou4alk0GMCXp1NUaaO8ye6xYlNgcdVGkRVJ61+Q/Quzek1SWuNYNZELq/\n/wGF2dURFrtZRyCP8wJrG3Ay3uA3t93W8FDW8ZOKvj4Uw6/kf5yMycn9ZGuIWVyj\njYE7QcBL9GUoUI0Z/ErecO6W4rqC5EMtFQTIBCP1dZGHEGZEL7irYeTjH4mvnRmN\naBAn4sNlTzFIpD4rFUZ/a9uea3EIi/k0/bWpIOa/Y1O7PQNs6yz2XC3WI8DBBva0\nruql5S6vAgMBAAECggEAahs/p3iQvYG8gnQerlowvf8Svu3NEBEUHrBvSjB4KMS5\nO/v3rXqGAoH+7voO3rYyrcEKeY81Hh6631n28IArGCbf0gLXy+owPjU+lAk6boUt\nsI4C4caui+hkj0+NOMwrnXt6vFDFz/7hr61dyBtl9Y0fwm1rUJ92hTMSazM6BJlW\njDSzFjhcbUoTzTBR4Z5+6eXGDL3yP1UHKuCni/OMIM6n0nCMy1+iDp1Ld6NI+g2h\ngnLwHrpp5PIMPAb4RYn5n19l5tREDHdGLGuEoBpZP8n+jC1hK4WUVbSBvJ6dUJy7\nVTd6uVp2cBqF/sAd+GrFszLc3fX/4O6ZWf30l+vD8QKBgQD42jVR0rn/FWNvkaZL\nGjl7vFioJqsuXiMw9F9NVHeMphLEl2ZRfaaSEwt8+aQffaUXE4rjMd0ybmps6W3t\nCOuL0J3J6W/NkhqyVnu9UkeHBi/Ezq/U8GS3SnGljpUfNuw0UiZYgW5S+MWNmRJF\n1sB+EJuesNEYkoSamdDByGuNHQKBgQDygyr0pXO76gZa2cuQIaEF0gzX4Cp31pLw\np1G6o7Zlh3t1MtGgiv3LsbsQ0qnHxdpz58pLpUzdBFhR4eg2OokA4JbTtH/kGYXr\nzuMmYtmfdk0R7EB+MFaduUQWfzKFaS+boPJWXHhhc+JMiS4wOcS1i6WEJs7dpp3D\noo3pol79OwKBgGUdHM8rZYHdKfMaZkxb0oGRbSCd3a5Qd9IbaWHdcVoH3NZegieY\ne4cdD+zu7p4RCnSO7z8TcsJcFQg97PmER1kfIg35uQD5Xbma5FpvxTp67Av2w4Et\nUG8dY4IWpkbxpRY5TvVlWfOCu5qmWMNh2AMhMmpPhBaM6i57U1R54CGNAoGBAInp\n2kXiyZx2DEMiVMeUuFPtDmy+CKi6GDpPjQUNES9QCv+tdNVN9eMfIfkBNJhthjwf\n90VprfqK/Ack57/fLgaXsm6W2ZxIf4aI01kDIiuzRUUKC+s3ZiqwL25zy7FfDjn9\nH5PJZpRVKL7JzMCUOa/cyLYMs9wNYu7cxMO3GTn9AoGANui72tDBDXtFUKYZORCY\np8uJQphzM4f28vnWb06gPb6sRYS2raALvq/ao06m6ege4We9nBMkkLW743rIuj68\nWe+gQKiy35eB0Jo6iQfPbXGh2fzBiaL7Jkfk0929o//XL2x2PGOgWTZGq/RlUgB7\nQBGh61C1KNTuCC4dcEH3i7g\u003d\n-----END PRIVATE KEY-----\n',
		  stagger_time:       1000, // for elevationPath
		  encode_polylines:   false,
		  secure:             false // use https
		  //proxy:              'http://127.0.0.1:9999' // optional, set a proxy for HTTP requests
		}
		var gmAPI = new GoogleMapsAPI(enterpriseConfig)

		// reverse geocode API
		var reverseGeocodeParams = {
		  "latlng":        req.query.lat + "," + req.query.lng,
		  "result_type":   "street_address",
		  "language":      "es",
		  "location_type": "ROOFTOP"
		}

		gmAPI.reverseGeocode(reverseGeocodeParams, function(err, result){
		  console.log(result)
		})

		res.end()*/

		var url = 'https://maps.googleapis.com/maps/api/geocode/json?latlng='+req.query.lat+','+req.query.lng + '&location_type=ROOFTOP&result_type=street_address&key=AIzaSyBYH2V8tBXPKOAO9lCLjp7kj6mc5Hph6vU'
		console.log(url)

		request(url, function (error, response, body)
		{
			console.log(body)
			var place = JSON.parse(body).results[0]

			address = '';
			if (place.address_components)
			{
				address = [
					(place.address_components[0] && place.address_components[0].short_name || ''),
			        (place.address_components[1] && place.address_components[1].short_name || ''),
			        (place.address_components[2] && place.address_components[2].short_name || '')
			    ].join(' ')
			}

			place["ADDRESS"] = address
			place["ALL"] = JSON.parse(body)
			res.json(place)
		})
	}
})


module.exports = router