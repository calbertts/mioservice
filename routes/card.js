/*****

	card.js

	Module to handle all queries related to smart card

	@author Carlos Alberto Castaño (@calbertts)
	@version 1.0
	@date 11/08/2015

*****/


var express = require('express')
var router = express.Router()
var request = require('request')
var queryString = require('querystring')
var cheerio = require('cheerio')

var Tools = require('./tools')


/**
	End-Point to query card's balance

	@param identifier Card's identifier

	@return Returns a string with the balance
 */
router.get('/balance', function(req, res, next)
{
	if('identifier' in req.query)
	{
		var url = 'http://190.216.202.35/saldo/pruebasaldo.php';
		var form = {
			numero: req.query.identifier,
			Enviar: 'Saldo'
		}

		request.post(
			url,
			{form: form},
			function (error, response, body) {
				if (!error && response.statusCode == 200)
				{
					var balance = body.match(/\$ ([^<]*)/)

					if(balance)
					{
						res.json({
							identifier: req.query.identifier,
							balance: balance[1]
						})
					}
					else
					{
						res.json({
							status: 'ERROR',
							message: 'INVALID_CARD_ID'
						})
					}
				}
			}
		)
	}
	else
	{
		res.json({
			status: 'ERROR',
			message: 'MISSING_CARD_ID'
		})
	}
})


module.exports = router
