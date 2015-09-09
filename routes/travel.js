/*

  travel.js

  Module to handle all end-points related with travels

  @author Carlos Alberto Castaño (@calbertts)
  @version 1.0
  @date 13/08/2015

*/

var express = require('express')
var router = express.Router()
var queryString = require('querystring')
var request = require('request')
var Deferred = require('Deferred')

var Tools = require('./tools')

/**
  End-Point to create a travel plan

  @param lat Latitude
  @param lng Longitude

  @return Returns an array with all connections found
 */
router.get('/connections', function (req, res, next) {
  if ('startAddress' in req.query && 'endAddress' in req.query) {
    Deferred.when(queryGMapsFromAddress(req.query.startAddress), queryGMapsFromAddress(req.query.endAddress)).then(
      function sucess (addresses) {
        getConnections(res, arguments['0'], arguments['1'])
      },
      function error (error) {
        res.json({
          status: 'ERROR',
          message: 'ERROR_QUERING_ADDRESSES',
          details: error
        })
      }
    )
  } else if ('startPoint' in req.query && 'endPoint' in req.query) {
    var startPointData = req.query.startPoint.split(',')
    var endPointData = req.query.endPoint.split(',')

    var startPoint = {
      location: Tools.getTransformCoords(startPointData[1] + '', startPointData[0] + '')
    }

    var endPoint = {
      location: Tools.getTransformCoords(endPointData[1] + '', endPointData[0] + '')
    }

    getConnections(res, startPoint, endPoint)
  }
})

function queryGMapsFromAddress (address) {
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

  request(url, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      var place = JSON.parse(body).results[0]

      var address1 = ''
      var address2 = ''
      if (place && place.address_components) {
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
          location: Tools.getTransformCoords(place.geometry.location.lng + '', place.geometry.location.lat + '')
        })
      } else {
        deferred.reject({
          error: 'ADDRESSES_NOT_FOUND',
          details: address
        })
      }
    } else {
      deferred.reject(error)
    }
  })

  return deferred.promise()
}

function getConnections (res, startAddress, endAddress) {
  var startPointURL = 'http://190.216.202.34:8080/bin/query.bin/hn?' + queryString.stringify({
    ld: 'std'
  })

  var startPointForm = {
    queryPageDisplayed: 'yes',
    REQ0JourneyStopsS0A: '255',
    REQ0JourneyStopsS0G: '',
    REQ0JourneyStopsS0ID: 'ujm=1&MapCenter=DEFAULT&SetGlobalOptionGO_callMapFromPosition=tp_query_from&OK:Mapa',
    REQ0JourneyStopsZ0A: '255',
    REQ0JourneyStopsZ0G: '',
    REQ0JourneyStopsZ0ID: '',
    REQ0HafasUnsharpSearch: '1',
    existUnsharpSearch: 'yes',
    REQ0JourneyDate: Tools.getDate(),
    wDayExt0: 'Lu|Ma|Mi|Ju|Vi|Sá|Do',
    REQ0JourneyTime: Tools.getTime(),
    REQ0HafasSearchForw: '1'
  }

  // Form to plan a travel
  request.post(
      startPointURL,
      {form: startPointForm},
      function (error, response, body) {
        if (!error && response.statusCode === 200) {
          var seqnr = 1 // body.match(/seqnr=([^&]*)/)[1]
          var ident = body.match(/ident=([^&]*)/)[1]

          // console.log(seqnr)

          // Select the start position
          var firstMapURL = decodeURIComponent('http://190.216.202.34:8080/bin/query.bin/hn?' + queryString.stringify({
            ld: 'std',
            seqnr: seqnr,
            ident: ident,
            SID: 'A=16@O=Seleccionar%C2%A0en%C2%A0el%C2%A0mapa@X=' + startAddress.location.x + '@Y=' + startAddress.location.y,
            getstop: 'true'
          }))

          Tools.getData(firstMapURL).done(function (resp) {
            seqnr = 2 // resp.match(/seqnr=([^&]*)/)[1]

            var endPointForm = {
              queryPageDisplayed: 'yes',
              REQ0JourneyStopsS0A: '16',
              REQ0JourneyStopsS0K: 'depTupel:' + startAddress.location.x,
              REQ0JourneyStopsZ0A: '255',
              REQ0JourneyStopsZ0G: '',
              REQ0JourneyStopsZ0ID: 'ujm=1&MapCenter=DEFAULT&SetGlobalOptionGO_callMapFromPosition=tp_query_to&OK:Mapa',
              REQ0HafasUnsharpSearch: '1',
              existUnsharpSearch: 'yes',
              REQ0JourneyDate: Tools.getDate(),
              wDayExt0: 'Lu|Ma|Mi|Ju|Vi|Sá|Do',
              REQ0JourneyTime: Tools.getTime(),
              REQ0HafasSearchForw: '1'
            }

            var endPointURL = 'http://190.216.202.34:8080/bin/query.bin/hn?' + queryString.stringify({
              ld: 'std',
              seqnr: seqnr,
              ident: ident
            })

            request.post(
                endPointURL,
                {form: endPointForm},
                function (error, response, body) {
                  if (!error && response.statusCode === 200) {
                    seqnr = 3 // body.match(/seqnr=([^&]*)/)[1]

                    // Select the end position
                    var secondMapURL = decodeURIComponent('http://190.216.202.34:8080/bin/query.bin/hn?' + queryString.stringify({
                      ld: 'std',
                      seqnr: seqnr,
                      ident: ident,
                      ZID: 'A=16@O=Seleccionar%C2%A0en%C2%A0el%C2%A0mapa@X=' + endAddress.location.x + '@Y=' + endAddress.location.y,
                      getstop: 'true'
                    }))

                    Tools.getData(secondMapURL).done(function (resp) {
                      getConn(res, ident, startAddress, endAddress)
                    })
                  }
                }
            )
          })
        }
      }
  )
}

function getConn (res, ident, startAddress, endAddress) {
  var data = {}
  data.mode = 'lessWalk'

  var connectionsForm = {
    queryPageDisplayed: 'yes',
    REQ0JourneyStopsS0A: '16',
    REQ0JourneyStopsS0K: 'depTupel:' + startAddress.location.x,
    REQ0JourneyStopsZ0A: '16',
    REQ0JourneyStopsZ0K: 'arrTupel:' + endAddress.location.x,
    REQ0HafasUnsharpSearch: '1',
    existUnsharpSearch: 'yes',
    REQ0JourneyDate: Tools.getDate(),
    wDayExt0: 'Lu|Ma|Mi|Ju|Vi|Sá|Do',
    REQ0JourneyTime: Tools.getTime(),
    REQ0HafasSearchForw: '1',
    start: 'Buscar+conexión'
  }

  var actionURL = decodeURIComponent('http://190.216.202.34:8080/bin/query.bin/hn?' + queryString.stringify({
    ld: 'std',
    seqnr: 4,
    ident: ident
  }))

  // Solicitar las conexiones
  request.post(
      actionURL,
      {form: connectionsForm},
      function (error, response, body) {
        if (!error && response.statusCode === 200) {
          var seqnr = 5

          var connsPrefix = body.match(/guiVCtrl_connection_detailsOut_select_[^\"]*/gm)

          // Validar si se obtuvieron las conexiones
          if (connsPrefix) {
            connsPrefix = connsPrefix.map(function (conn) {
              return conn.replace(/guiVCtrl_connection_detailsOut_select_/, '')
            })

            var cheerio = require('cheerio')
            var $ = cheerio.load(body)

            var tableConns = $('.resultTable').first()

            // Elegir la opcion con menos conexiones o la que requiera caminar menos
            var connFinal = 0

            if (data.mode === 'lessBuses') {
              var max = 100

              tableConns.find(':checked').closest('tr').each(function (item) {
                var conns = Number($(this).find('td:nth-child(7)').text())

                if (conns < max) {
                  max = conns
                  connFinal = $(this).find('input').first().parent().html().match(/guiVCtrl_connection_detailsOut_select_[^\"]*/)[0].replace(/guiVCtrl_connection_detailsOut_select_/, '')
                }
              })
            } else if (data.mode === 'lessWalk') {
              connFinal = tableConns.find(':checked').closest('tr').first().find('input').first().parent().html().match(/guiVCtrl_connection_detailsOut_select_[^\"]*/)[0].replace(/guiVCtrl_connection_detailsOut_select_/, '')
            }

            var mapURL = 'http://190.216.202.34:8080/bin/query.bin/hn?' + queryString.stringify({
              ld: 'std',
              seqnr: seqnr,
              ident: ident,
              ujm: 1,
              MapConnectionId: connFinal,
              SetGlobalOptionGO_callMapFromPosition: 'tpDetailsRouteComplete'
            })

            request.post(
              mapURL,
              function (error, response, body) {
                if (!error && response.statusCode === 200) {
                  var dataRoute = body.match(/function init_jsmapconnection[^\;]*/gm)[0].replace(/\n/g, '').replace(/function init_jsmapconnection\(Map\)\{var conn=eval\(/, '').replace(/(\)|\(|\'\+\')/g, '')

                  var wholeRoute = eval('(' + dataRoute + ')')
                  var route = eval('(' + wholeRoute + ')')
                  var sections = route.sections

                  // Analisis de tiempos para caminar
                  for (var x = 0; x < sections.length; x++) {
                    var _section = sections[x]

                    if (_section.type === 'GIS_ROUTE' || _section.type === 'WALK') {
                      var locations = _section.locations

                      var loct1 = locations[0].dep
                      var loct2 = locations[1].arr

                      var _data = loct1.split(':')
                      var depH = Number(_data[0])
                      var depM = Number(_data[1])

                      var _data2 = loct2.split(':')
                      var arrH = Number(_data2[0])
                      var arrM = Number(_data2[1])

                      _section.timeToWalk = (arrH - depH) + ':' + (arrM - depM)
                    }
                  }

                  for (var i = 0; i < sections.length; i++) {
                    var section = sections[i]

                    var stops = section.locations

                    for (var j = 0; j < stops.length; j++) {
                      var stop = stops[j]

                      if ('name' in stop) {
                        console.log('Stop: ', stop.name)
                      }
                    }
                  }

                  route.sections = sections

                  if (res) {
                    res.json({status: true, route: route})
                    res.end()
                  }
                }
              })
          } else {
            var msgError = 'No se pudieron obtener las conexiones'

            if (res) {
              res.json({status: false, msg: msgError})
              res.end()
            }
          }
        }
      }
  )
}

module.exports = router
