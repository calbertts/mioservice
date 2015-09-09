/*

  buses.js

  Module to handle all end-points regard to MIO buses info

  @author Carlos Alberto Castaño (@calbertts)
  @version 1.0
  @date 11/08/2015

*/

var express = require('express')
var router = express.Router()
var queryString = require('querystring')
var cheerio = require('cheerio')

var Tools = require('./tools')

/**
  End-Point to query the complete bus' journey

  @param journeyId Identifier for the journey
  @param mode 'dep' to see the depart time or 'arr' to see the arrive time
  @param max Maximum of results

  @return Returns an object with information of the regard journey
 */
router.get('/journey', function (req, res, next) {
  if ('journeyId' in req.query) {
    var journeyRequestData = {
      ld: 'std',
      date: Tools.getDate(),
      station_type: req.query.mode || 'dep',
      boardType: req.query.mode || 'dep',
      time: Tools.getTime(),
      maxJourneys: req.query.max || '',
      dateBegin: Tools.getDate(),
      dateEnd: '31.12.15',
      selectDate: 'today',
      productsFilter: 0,
      dirInput: '',
      backLink: 'sq'
    }

    var url = 'http://190.216.202.34:8080/bin/traininfo.bin/hn/' + req.query.journeyId + '/4095?' + queryString.stringify(journeyRequestData)

    console.log(url)

    Tools.getData(url).done(function (resp) {
      var $ = cheerio.load(resp)
      var table = $('.resultTable').first()

      var bus
      var journeys = []
      table.find('tr').each(function (index) {
        var row = $(this)
        var id = row.find('td:nth-child(2) > a').attr('href')

        if (id) {
          var idJourney = row.find('td:nth-child(2) > a').attr('href').match(/input=([^&]*)/)[1]
          var name = row.find('td:nth-child(2) > a').text()
          var arrived = row.find('td:nth-child(3)').text().replace(/\r?\n|\r/g, '')
          var departed = row.find('td:nth-child(4)').text().replace(/\r?\n|\r/g, '')
          bus = (!bus) ? row.find('td:nth-child(5)').text().replace(/\r?\n|\r/g, '') : bus

          journeys.push({
            id: idJourney,
            name: name,
            arrived: arrived,
            departed: departed
          })
        }
      })

      res.json({
        status: 'OK',
        bus: bus,
        journeys: journeys
      })
    })
  } else {
    res.json({
      status: 'ERROR',
      message: 'MISSING_JOURNEY_ID'
    })
  }
})

module.exports = router
