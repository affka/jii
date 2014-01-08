/**
 * @copyright Copyright 2013 <a href="http://www.extpoint.com">ExtPoint</a>
 * @author <a href="http://www.affka.ru">Vladimir Kozhin</a>
 * @license MIT
 */

var util = require('util');
var redis = require('redis');
var net = require('net');

/**
 * @class Jii.components.Redis
 * @extends Jii.base.Component
 */
var self = Joints.defineClass('Jii.components.Redis', Jii.base.Component, {

    host: '127.0.0.1',
    port: 6379,
    stream: null,

    //_subscribes: null,

    init: function () {
        this.stream = net.createConnection(this.port, this.host);
        redis.RedisClient.call(this, this.stream);
    },

    createCommand: function(method, attributes) {
        var command = new Jii.data.redis.Command();
        command.connection = this;
        command.method = method;
        command.attributes = attributes;

        return command;
    },

    /*initSubscribes: function() {
        this._subscribes = {};
        this.
    },

    on: function(channels, callback) {
        if (this._subscribes === null) {
            this.initSubscribes();
        }

        _.each(channels.split(' '), function(channel) {
            if (_.has(this._subscribes, channel)) {
                return;
            }

        }.bind(this));

        this._super(channels, callback);
    },
*/
    /**
     * Get the value of a hash field
     * @param {string} key
     * @param {string} value
     * @param {function} [callback]
     */
    hget: function (key, value, callback) {
    }
});

_.extend(Jii.components.Redis.prototype, redis.RedisClient.prototype);
