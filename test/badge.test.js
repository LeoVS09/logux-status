var BaseSync = require('logux-sync').BaseSync
var TestPair = require('logux-sync').TestPair
var TestTime = require('logux-core').TestTime

var badge = require('../badge')

function findBadgeNode () {
  return document.querySelector('.logux-status-badge')
}

function createTest () {
  var pair = new TestPair()
  pair.leftSync = new BaseSync('client', TestTime.getLog(), pair.left)
  pair.leftSync.catch(function () { })
  return pair.left.connect().then(function () {
    return pair
  })
}

afterEach(function () {
  var node = findBadgeNode()
  if (node) {
    document.body.removeChild(node)
  }
})

it('show notification when state disconnect', function () {
  return createTest().then(function (test) {
    badge({ sync: test.leftSync })

    test.leftSync.setState('connecting')
    test.leftSync.setState('disconnected')
    expect(findBadgeNode()).not.toBeFalsy()
  })
})

it('show notification when state wait', function () {
  return createTest().then(function (test) {
    badge({ sync: test.leftSync })
    test.leftSync.setState('wait')
    expect(findBadgeNode()).not.toBeFalsy()
  })
})

it('show notification when state connect or sending after wait', function () {
  return createTest().then(function (test) {
    badge({ sync: test.leftSync })

    test.leftSync.setState('wait')
    test.leftSync.connected = true
    test.leftSync.setState('connected')
    expect(findBadgeNode()).not.toBeFalsy()

    test.leftSync.setState('wait')
    test.leftSync.setState('sending')
    expect(findBadgeNode()).not.toBeFalsy()
  })
})

it('don\'t show notification ' +
  'when state connect or sending not after wait', function () {
  return createTest().then(function (test) {
    badge({ sync: test.leftSync })

    test.leftSync.connected = true
    test.leftSync.setState('connected')
    expect(findBadgeNode()).toBeFalsy()

    test.leftSync.setState('sending')
    expect(findBadgeNode()).toBeFalsy()
  })
})

it('show notification ' +
  'when state synchronised after connection lost', function () {
  return createTest().then(function (test) {
    badge({ sync: test.leftSync })

    test.leftSync.connected = false
    test.leftSync.setState('wait')

    test.leftSync.connected = true
    test.leftSync.setState('synchronised')
    expect(findBadgeNode()).not.toBeFalsy()
  })
})

it('don\'t show notification when state ' +
  'synchronised not after connection lost', function () {
  return createTest().then(function (test) {
    badge({ sync: test.leftSync })

    test.leftSync.connected = true
    test.leftSync.setState('connected')
    expect(findBadgeNode()).toBeFalsy()
  })
})

it('show notification when error wrong-subprotocol', function () {
  return createTest().then(function (test) {
    badge({ sync: test.leftSync })

    test.leftSync.emitter.emit('error', { type: 'wrong-subprotocol' })
    expect(findBadgeNode()).not.toBeFalsy()
  })
})

it('show notification when error wrong-protocol', function () {
  return createTest().then(function (test) {
    badge({ sync: test.leftSync })

    test.leftSync.emitter.emit('error', { type: 'wrong-protocol' })
    expect(findBadgeNode()).not.toBeFalsy()
  })
})

it('show error when syncing error', function () {
  return createTest().then(function (test) {
    badge({ sync: test.leftSync })

    test.leftSync.emitter.emit('error', { type: 'some error' })
    expect(findBadgeNode()).not.toBeFalsy()
  })
})

it('should return unbind function', function () {
  return createTest().then(function (test) {
    var unbind = badge({ sync: test.leftSync })
    test.leftSync.connected = false
    test.leftSync.setState('disconnected')

    test.leftSync.connected = true
    test.leftSync.setState('connected')

    unbind()
    expect(findBadgeNode()).toBeFalsy()
  })
})

it('should change style notification', function () {
  return createTest().then(function (test) {
    badge({ sync: test.leftSync }, {
      style: {
        div: { color: 'red' },
        p: { color: 'green' }
      }
    })

    test.leftSync.setState('connecting')
    test.leftSync.setState('disconnected')
    expect(findBadgeNode().querySelector('div').style.color).toBe('red')
    expect(findBadgeNode().querySelector('p').style.color).toBe('green')
  })
})

it('should change position notification', function () {
  return createTest().then(function (test) {
    var unbind = badge(
      { sync: test.leftSync },
      { position: badge.positions.topRight }
    )

    test.leftSync.setState('connecting')
    test.leftSync.setState('disconnected')
    expect(findBadgeNode().style.top).not.toBeFalsy()
    expect(findBadgeNode().style.right).not.toBeFalsy()
    expect(findBadgeNode().style.left).toBeFalsy()

    unbind()
    unbind = badge(
      { sync: test.leftSync },
      { position: badge.positions.bottom }
    )

    test.leftSync.setState('connecting')
    test.leftSync.setState('disconnected')
    expect(findBadgeNode().style.top).toBeFalsy()
    expect(findBadgeNode().style.bottom).not.toBeFalsy()
    expect(findBadgeNode().querySelector('div').style.marginLeft)
      .not.toBeFalsy()

    unbind()
    unbind = badge(
      { sync: test.leftSync },
      { position: badge.positions.bottomLeft }
    )

    test.leftSync.setState('connecting')
    test.leftSync.setState('disconnected')
    expect(findBadgeNode().style.right).toBeFalsy()
    expect(findBadgeNode().style.bottom).not.toBeFalsy()
    expect(findBadgeNode().style.left).not.toBeFalsy()
  })
})

it('should change language notification', function () {
  return createTest().then(function (test) {
    badge({ sync: test.leftSync }, { language: 'ru' })

    test.leftSync.setState('connecting')
    test.leftSync.setState('disconnected')
    expect(findBadgeNode().querySelector('p').innerText)
      .toBe('Нет соединения.\n Ваши данные не сохранены.')
  })
})
