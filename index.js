var attention = require('./attention')
var confirm = require('./confirm')
var log = require('./log')
var favicon = require('./favicon')
var badge = require('./badge')

module.exports = {
  attention: attention,
  confirm: confirm,
  log: log,
  favicon: favicon,
  badge: badge
}

/**
 * Any object with Sync instance in `sync` property.
 * For example, `logux-client` instance.
 *
 * @typedef {object} Syncable
 * @property {BaseSync} sync The sync instance.
 */
