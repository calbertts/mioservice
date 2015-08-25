/*

  stations.js

  Module to handle all end-points regard to MIO stations info

  @author Carlos Alberto Castaño (@calbertts)
  @version 1.0
  @date 10/08/2015

*/

var express = require('express')
var router = express.Router()
var queryString = require('querystring')
var cheerio = require('cheerio')
var Deferred = require('Deferred')

var Tools = require('./tools')

/**
  End-Point to query the nearest stations relative to a point on the map

  @param lat Latitude
  @param lng Longitude
  @param max Maximum of results

  @return Returns an array with information of each near station
 */
router.get('/nearby', function (req, res, next) {
  if ('point' in req.query) {
    var pointData = req.query.point.split(',')

    if (pointData.length > 1) {
      var lat = pointData[0]
      var lng = pointData[1]

      var point = Tools.getTransformCoords(lng, lat)
      var max = req.query.max || 5

      var requestData = {
        performLocating: 2,
        tpl: 'stop2json',
        look_maxno: max,
        look_stopclass: 1023,
        look_x: point.x,
        look_y: point.y
      }

      var url = 'http://190.216.202.34:8080/bin/query.bin/hny?' + queryString.stringify(requestData)

      Tools.getData(url).done(function (resp) {
        var stationsObj = JSON.parse(resp.match(/\{[^<]*/)[0])

        res.json({
          status: 'OK',
          nearbyStations: stationsObj.stops.map(function (item, index) {
            var coords = Tools.getTransformCoordsForMaps(item.x, item.y)
            return {
              id: item.extId,
              name: item.name,
              lat: coords.y,
              lng: coords.x,
              dist: item.dist
            }
          })
        })
      })
    } else {
      res.json({
        status: 'ERROR',
        message: 'MISSING_COORDS'
      })
    }
  }
})

/**
  End-Point to query the information regard to a station

  @param id Station's id
  @param mode 'dep' to see the depart time or 'arr' to see the arrive time
  @param max Maximum of results
  @param routes If it's true all routes will be included from the time to end of day (default value is false)
  @param journeys If it's true all journeys per each route will be included (default value is false)

  @return Returns an array with information of each station
 */
router.get('/info', function (req, res, next) {
  if ('id' in req.query) {
    if (Tools.isNumber(req.query.id)) {
      var stationInfoResult, stationRoutesResult
      var stationId = req.query.id

      // Results
      var item
      var itemId
      var coords
      var routeData = []

      /*
        Get the basic station info
      */
      var stationRequestData = {
        start: 1,
        tpl: 'suggest2json',
        REQ0JourneyStopsS0A: 7,
        REQ0JourneyStopsB: 12,
        S: stationId
      }
      var stationRequestURL = 'http://190.216.202.34:8080/bin/ajax-getstop.bin/hny?' + queryString.stringify(stationRequestData)

      stationInfoResult = Tools.getData(stationRequestURL).done(function (resp) {
        var stationInfo = JSON.parse(resp.replace('SLs.sls=', '').replace(';SLs.showSuggestion();', ''))

        console.log('length', stationInfo.suggestions.length)

        if (stationInfo.suggestions.length > 0) {
          item = stationInfo.suggestions[0]
          itemId = item.id.match(/L=0([^@]*)/)[1]

          coords = Tools.getTransformCoordsForMaps(item.xcoord, item.ycoord)
        }
      })

      /*
        Get the routes and journeys info
      */
      var routesRequestData = {
        ld: 'std',
        input: stationId,
        boardType: req.query.mode || 'dep',
        time: Tools.getTime(),
        maxJourneys: req.query.max || '',
        dateBegin: Tools.getDate(),
        dateEnd: '31.12.15',
        selectDate: 'today',
        productsFilter: '0',
        start: 'yes',
        dirInput: ''
      }
      var routesRequestURL = 'http://190.216.202.34:8080/bin/stboard.bin/hn?' + queryString.stringify(routesRequestData)

      if (req.query.routes && req.query.routes === 'true') {
        stationRoutesResult = Tools.getData(routesRequestURL).done(function (resp) {
          var $ = cheerio.load(resp)
          var table = $('.resultTable').first()

          table.find('tr').each(function (index) {
            var row = $(this)

            if (row.find('td.product > a').html() != null) {
              var time = row.find('td.time').text()
              var journeyId = row.find('td.product > a').attr('href').match(/hn\/([^?]*)/)[1]
              var bus = row.find('td.product > a').text().trim()
              var newJourneys = []

              if (req.query.journeys && req.query.journeys === 'true') {
                var journeys = []
                var stationsIDs = {}

                row.find('td.timetable > a').each(function (index) {
                  var id = $(this).attr('href').match(/input=([^&]*)/)[1]
                  var name = $(this).text().replace(/\r?\n|\r/g, '')

                  stationsIDs[name] = id
                })

                row.find('td.timetable').each(function (index) {
                  journeys.push($(this).text().split('\n\n'))
                })

                // Remove trash
                journeys = journeys[0].slice(3)
                journeys.pop()
                journeys.pop()

                journeys.map(function (journey, index) {
                  if (((index + 1) % 2) === 1) {
                    var stationName = journeys[index].replace(/\r?\n|\r/g, '')
                    var time = journeys[index + 1].replace('-', '').replace(/\r?\n|\r/g, '')

                    newJourneys.push({id: stationsIDs[stationName], name: stationName, time: time})
                  }
                })
              }

              routeData.push({
                journeyId: journeyId,
                bus: bus,
                time: time,
                journeys: newJourneys
              })
            }
          })
        })
      }

      Deferred.when(stationInfoResult, stationRoutesResult).then(function () {
        if (itemId) {
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
          })
        } else {
          res.json({
            status: 'ERROR',
            message: 'INVALID_STATION_ID'
          })
        }
      })
    } else {
      res.json({
        status: 'ERROR',
        message: 'INVALID_FORMAT_STATION_ID'
      })
    }
  } else {
    res.json({
      status: 'ERROR',
      message: 'MISSING_STATION_ID'
    })
  }
})

/**
  End-Point to query the suggestions from a clue word

  @param search Clue word used to load the suggestions

  @return Returns an array with each occurence of the clue word
 */
router.get('/suggestions', function (req, res, next) {
  if ('search' in req.query) {
    var data = req.query.search

    var suggestionsRequestData = {
      start: 1,
      tpl: 'suggest2json',
      REQ0JourneyStopsS0A: 7,
      REQ0JourneyStopsB: 12,
      S: encodeURIComponent(data)
    }

    var url = 'http://190.216.202.34:8080/bin/ajax-getstop.bin/hny?' + queryString.stringify(suggestionsRequestData)

    Tools.getData(url).done(function (resp) {
      var stationInfo = JSON.parse(resp.replace('SLs.sls=', '').replace(';SLs.showSuggestion();', ''))

      res.json({
        status: 'OK',
        suggestions: stationInfo.suggestions.map(function (item, index) {
          var coords = Tools.getTransformCoordsForMaps(item.xcoord, item.ycoord)

          return {
            id: item.id.match(/L=0([^@]*)/)[1],
            name: item.value,
            lat: coords.y,
            lng: coords.x,
            weight: item.weight
          }
        })
      })
    })
  } else {
    res.json({
      status: 'ERROR',
      message: 'MISSING_SEARCH'
    })
  }
})

module.exports = router
