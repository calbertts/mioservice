/*

  tools.js

  Useful functions

  @author Carlos Alberto Castaño (@calbertts)
  @version 1.0
  @date 13/08/2015

*/

var Deferred = require('Deferred')
var http = require('http')
var iconv = require('iconv-lite')

var weekDays = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá']

exports.getTransformCoords = function (x, y) {
  var coord = {}
  coord.x = x.replace(/\./, '').substr(0, 9)
  coord.y = y.replace(/\./, '').substr(0, 7)

  return coord
}

exports.getTransformCoordsForMaps = function (x, y) {
  var coord = {}
  coord.x = x.slice(0, 3) + '.' + x.slice(3)
  coord.y = y.slice(0, 1) + '.' + y.slice(1)

  return coord
}

exports.getData = function (url, data, method) {
  var deferred = new Deferred()
  var respStr = ''

  // HTTP Request
  var options = {
    host: '190.216.202.34',
    port: 8080,
    path: url,
    method: method || 'GET',
    agent: false
  }

  http.request(options, function (resp) {
    var converterStream = iconv.decodeStream('ISO88591')
    resp.pipe(converterStream)

    converterStream.on('data', function (chunk) {
      respStr += String(chunk)
    })

    converterStream.on('end', function () {
      deferred.resolve(respStr)
    })
  }).on('error', function (e) {
    console.log(e.stack)
  }).end()

  return deferred.promise()
}

exports.getDate = function () {
  var date = new Date()
  var fullDate = weekDays[date.getDay()] + ', ' + (((date.getDate() < 10) ? '0' : '') + date.getDate()) + '.' + ((((date.getMonth() + 1) < 10) ? '0' : '') + (date.getMonth() + 1)) + '.' + (date.getFullYear() - 2000)

  return fullDate
}

exports.getTime = function () {
  var date = new Date()
  var fullTime = date.getHours() + ':' + date.getMinutes()

  return fullTime
}

exports.isNumber = function (n) {
  return !isNaN(parseFloat(n)) && isFinite(n)
}

exports.formatCardNumber = function (cardNumber) {
  var cardNumberFormatted = cardNumber.slice(0, 2) + '.' + cardNumber.slice(2, 4) + '-' + cardNumber.slice(4, 12) + '-' + cardNumber.slice(12)
  console.log(cardNumberFormatted)
  return cardNumberFormatted
}
