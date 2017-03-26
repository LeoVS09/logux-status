var attention = require('../attention')
var confirm = require('../confirm')
var log = require('../log')
var favicon = require('../favicon')
var badge = require('../badge')
var index = require('../')

it('has attention function', function () {
  expect(index.attention).toBe(attention)
})

it('has confirm function', function () {
  expect(index.confirm).toBe(confirm)
})

it('has log function', function () {
  expect(index.log).toBe(log)
})

it('has favicon function', function () {
  expect(index.favicon).toBe(favicon)
})

it('has badge function', function () {
  expect(index.badge).toBe(badge)
})
