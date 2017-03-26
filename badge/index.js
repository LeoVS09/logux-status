var ru = require('./ru')
var en = require('./en')

/**
 * Show custom badge, when state changed.
 *
 * @param {Syncable|Client} client Observed Client instance
 *                                 or object with `sync` property.
 * @param {Object} [options] Style and position to show badge
 * @param {string} [options.position] Where to show badge
 * @param {string} [options.style.div] Inline style of badge wrapper
 * @param {string} [options.style.p] Inline style of badge text
 * @param {string} [options.language] Language text of badge
 * @param {string} [options.disconnected] Set special style or
 *                                        text for disconnected
 * @param {string} [options.wait] Set special style or text for wait
 * @param {string} [options.sending] Set special style or text for sending
 * @param {string} [options.synchronized] Set special style
 *                                        or text for synchronized
 * @param {string} [options.refresh] Set special style or text for refresh
 * @param {string} [options.error] Set special style or text for error
 * @param {string} [options.timeout] Set timeout before hide notification
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
var notificationTimeout = 3000 // TODO: change time on production

function badge (client, options) {
  options = Object.assign({ position: positions.bottomLeft }, options)
  notificationTimeout = options.timeout || notificationTimeout
  var sync = client.sync

  var lastState
  var unbind = []
  unbind.push(sync.on('state', function () {
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
    if (timeoutId) {
      timeoutId = clearTimeout(timeoutId)
      // TODO: check if text not need change
      setStyle(notification,
        (options[type] && options[type].style) || options.style)
      setText(notification, type, options)
      // TODO: Change type and text showed popup
      timeoutId = setTimeout(hide, notificationTimeout)
    }
  }

  function hide () {
    // TODO: Hide popup
    if (notification) {
      document.body.removeChild(notification)
    }
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
  node.className = 'logux-status-badge'
  var div = document.createElement('div')
  div.appendChild(document.createElement('p'))
  node.appendChild(div)
  setStyle(node, (options[type] && options[type].style) || options.style)
  setPosition(node, options.position)
  setText(node, type, options)
  return node
}

function setStyle (node, definedStyle) {
  definedStyle = definedStyle || {}
  var style = {
    position: 'fixed'
  }
  Object.assign(node.style, style)
  style = {
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
  Object.assign(node.querySelector('div').style, style)
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
    case positions.top:
    case positions.topRight:
    case positions.topLeft:
      style = { top: '1em' }
      break
    case positions.bottomRight:
    case positions.bottomLeft:
    case positions.bottom:
    default:
      style = { bottom: '1em' }
  }
  if (position === positions.top || position === positions.bottom) {
    style['width'] = '100%'
    Object.assign(node.style, style)
    Object.assign(node.querySelector('div').style, {
      marginLeft: 'auto',
      marginRight: 'auto'
    })
  } else {
    switch (position) {
      case positions.bottomRight:
      case positions.topRight:
        style['right'] = '4em'
        break
      case positions.topLeft:
      case positions.bottomLeft:
      default:
        style['left'] = '4em'
    }
    Object.assign(node.style, style)
  }
}

function setText (node, type, options) {
  var p = node.querySelector('p')
  var text
  switch (options.language && options.language.toLowerCase()) {
    case 'ru':
      text = ru[type]
      break
    case 'en':
    default:
      text = en[type]
  }
  p.innerText = (options[type] && options[type].text) || text
}

function objFromItems (array) {
  var result = {}
  for (var i = 0; i < array.length; i++) {
    result[array[i]] = array[i]
  }
  return result
}
