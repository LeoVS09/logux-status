var ru = require('./ru')
var en = require('./en')

/**
 * Show custom badge, when state changed.
 *
 * @param {Syncable|Client} client Observed Client instance
 *                                 or object with `sync` property.
 * @param {Object} [options] Style and position to show badge
 * @param {string} [options.position] Where to show badge
 * @param {string} [options.div.style] Inline style of badge wrapper
 * @param {string} [options.p.style] Inline style of badge text
 * @param {string} [options.language] Language text of badge
 *
 * @return {Function} Unbind show listener and hide badge.
 *
 * @example
 * import confirm from 'logux-status/badge.js'
 * badge(client)
 */

var types = objFromItems([
  'disconnected',
  'wait',
  'connecting',
  'sending',
  'synchronized',
  'refresh',
  'error'
])
var positions = objFromItems([
  'top',
  'topLeft',
  'topRight',
  'bottom',
  'bottomLeft',
  'bottomRight'
])
var notificationTimeout = 300000

function badge (client, options) {
  options = Object.assign({ position: positions.topRight }, options)
  var sync = client.sync

  var lastState
  var unbind = []
  unbind.push(sync.on('state', function () {
    console.log('badge recive new state: ' + sync.state)
    if (
      sync.state === types.disconnected ||
      sync.state === types.wait ||
      (
        lastState === types.wait &&
        (sync.state === types.connecting || sync.state === types.sending)
      ) ||
      (sync.state === types.synchronized && timeoutId)
    ) {
      show(sync.state)
    }
    lastState = sync.state
  }))

  unbind.push(sync.on('error', function (error) {
    console.log('badge recive new error: ' + error)
    if (error &&
      (error.type === 'wrong-protocol ' || error.type === 'wrong-subprotocol')
    ) {
      show(types.refresh)
      lastState = types.refresh
    } else {
      show(types.error)
      lastState = types.error
    }
  }))

  var timeoutId = false
  var notification
  function show (type) {
    console.log('show badge')
    if (timeoutId) {
      change(type)
    } else {
      notification = createPopup(type, options)
      // TODO: Show popup
      document.body.appendChild(notification)
      timeoutId = setTimeout(hide, notificationTimeout)
    }
  }

  function change (type) {
    console.log('change badge')
    if (timeoutId) {
      timeoutId = clearTimeout(timeoutId)
      // TODO: check if text not need change
      setText(notification, type, options.language)
      // TODO: Change type and text showed popup
      timeoutId = setTimeout(hide, notificationTimeout)
    } else {
      show(type)
    }
  }

  function hide () {
    // TODO: Hide popup
    document.body.removeChild(notification)
    if (timeoutId) {
      timeoutId = clearTimeout(timeoutId)
    }
  }

  return function () {
    for (var i = 0; i < unbind.length; i++) {
      unbind[i]()
    }
    hide()
  }
}

badge.positions = positions

module.exports = badge

function createPopup (type, options) {
  var node = document.createElement('div')
  node.appendChild(document.createElement('p'))
  setStyle(node, {
    div: options.div && options.div.style,
    p: options.p && options.p.style
  })
  setPosition(node, options.position)
  setText(node, type, options.language)
  return node
}

function setStyle (node, definedStyle) {
  var style = {
    position: 'fixed',
    backgroundColor: '#212121',
    borderRadius: '0.3em',
    height: '4em',
    width: '20em',
    display: 'flex',
    opacity: '0.9'
  }
  if (definedStyle.div) {
    Object.assign(style, definedStyle.div)
  }
  Object.assign(node.style, style)
  style = {
    color: '#cecece',
    padding: '0',
    margin: 'auto',
    fontSize: '1.1em',
    fontFamily: 'Roboto,sans-serif'
  }
  if (definedStyle.p) {
    Object.assign(style, definedStyle.p)
  }
  Object.assign(node.querySelector('p').style, style)
}

function setPosition (node, position) {
  var style
  switch (position) {
    case positions.bottomLeft:
    default:
      style = {
        bottom: '1em',
        left: '4em'
      }
  }
  Object.assign(node.style, style)
}

function setText (node, type, language) {
  var p = node.querySelector('p')
  switch (language && language.toLowerCase()) {
    case 'ru':
      p.innerText = ru[type]
      break
    case 'en':
    default:
      p.innerText = en[type]
  }
}

function objFromItems (array) {
  var result = {}
  for (var i = 0; i < array.length; i++) {
    result[array[i]] = array[i]
  }
  return result
}
