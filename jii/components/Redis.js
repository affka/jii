/**
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

    start: function () {
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
