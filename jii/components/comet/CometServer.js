/**
 * @copyright Copyright 2013 <a href="http://www.extpoint.com">ExtPoint</a>
 * @author <a href="http://www.affka.ru">Vladimir Kozhin</a>
 * @license MIT
 */

var http = require('http');
var sockjs = require('sockjs');

/**
 * @class Jii.components.comet.CometServer
 * @extends Jii.components.router.BaseRouter
 */
var self = Joints.defineClass('Jii.components.comet.CometServer', Jii.components.router.BaseRouter, {

    host: null,
    port: null,
    redisHost: null,
    redisPort: null,

    serverUid: null,

    /**
     * Jii.components.Redis
     */
    _redisHub: null,

    /**
     * Jii.components.Redis
     */
    _redisSubscriber: null,

    /**
     * @type {object}
     */
    _server: null,

    /**
     * @type {object}
     */
    _httpServer: null,

    /**
     * @type {object}
     */
    _connections: {},

    /**
     * @type {object}
     */
    _subscribes: {},

    init: function () {
        // Generate unique server uid
        this.serverUid = Jii.app.string.generateUid();

        // Create sockjs server
        this._server = sockjs.createServer();

        var redisConfig = {
            host: this.redisHost,
            port: this.redisPort
        };

        // Redis connection for outbox messages
        this._redisHub = new Jii.components.Redis();
        this._redisHub.setConfiguration(redisConfig);
        this._redisHub.init();

        // Redis connection for inbox messages
        this._redisSubscriber = new Jii.components.Redis();
        this._redisSubscriber.setConfiguration(redisConfig);
        this._redisSubscriber.init();
    },

    /**
     * Start listen income comet connections and wait messages from redis hub
     */
    start: function () {
        this._server.on('connection', this._addConnection.bind(this));
        this._redisSubscriber.on('message', this._onHubMessage.bind(this));

        this._httpServer = http.createServer();
        this._server.installHandlers(this._httpServer, {prefix: '/comet'});
        this._httpServer.listen(this.port || 3100, this.host || '0.0.0.0');
    },

    end: function() {
        this._redisHub.end();
        this._redisSubscriber.end();

        if (this._httpServer) {
            this._httpServer.end();
        }
    },

    /**
     *
     * @param {string} channel
     * @param {*} data
     * @param {string|array} [users] ACCESS_TYPE_ALL OR ACCESS_TYPE_SUBSCRIBERS OR [userUid, ...]
     */
    send: function (channel, data, users) {
        users = users || self.ACCESS_TYPE_SUBSCRIBERS;

        if (_.isArray(users)) {
            // Skip empty dispatch
            if (users.length === 0) {
                return;
            }

            users = users.join('|');
        }

        data = JSON.stringify(data);

        Jii.app.logger.debug('Server send to comet channel `%s`:', channel, users + ' ' + data);

        this._redisHub.publish(channel, users + ' ' + data);
    },

    /**
     * Store client connection
     * @param {object} connection
     * @private
     */
    _addConnection: function (connection) {
        this._connections[connection.id] = connection;

        Jii.app.logger.debug('User connected (connection uid: `%s`).', connection.id);

        // Proxy all messages to redis hub
        connection.on('data', function (message) {
            this._onClientMessage(connection, message);
        }.bind(this));

        // Remove connection on close
        connection.on('close', function () {
            this._removeConnection(connection);
            this.trigger('connection:close', connection.id);
        }.bind(this));

        this.trigger('connection:open', connection.id);
    },

    /**
     * Remove client connection from store
     * @param {object} connection
     * @private
     */
    _removeConnection: function (connection) {
        Jii.app.logger.debug('User disconnected (connection uid: `%s`).', connection.id);

        // Unsubscribe from connection subscribed channels
        _.each(this._subscribes, function(connectionIds, channel) {
            if (_.indexOf(connectionIds, connection.id) !== -1) {
                this._commands.unsubscribe.call(this, connection, channel);
            }
        }.bind(this));

        // Remove connection
        delete this._connections[connection.id];
    },

    /**
     * Income messages from clients (browsers, ..)
     * Data formats:
     *  - init {json...
     *  - subscribe channel
     *  - message channel {json...
     *  - unsubscribe channel
     * @param {object} connection
     * @param {string} data
     * @private
     */
    _onClientMessage: function (connection, data) {
        var i = data.indexOf(' ');
        var command = data.substr(0, i);

        Jii.app.logger.debug('Comet client income:', data);

        // Run command
        if (this._commands[command]) {
            var message = data.substr(i + 1);
            this._commands[command].call(this, connection, message);
        }
    },

    _commands: {
        /**
         * Run server action by client
         * @param {object} connection
         * @param {string} message
         */
        action: function (connection, message) {
            var i = message.indexOf(' ');
            var path = message.substr(0, i);
            var params = JSON.parse(message.substr(i + 1));

            if (!_.has(this.routes, path)) {
                throw new Jii.exceptions.ApplicationException('Path `' + path + '` is not registered in config.');
            }

            // @todo
            var request = {
                query: params
            };
            request.query.connectionUid = connection.id;

            var route = this.routes[path];

            this.runAction(route, request).always(function(action) {
                Joints.when(action.deferred).always(function() {
                    this._sendAction(action);
                }.bind(this));
            }.bind(this));
        },

        /**
         * Subscribe client from channel
         * @param {object} connection
         * @param {string} channel
         */
        subscribe: function (connection, channel) {
            if (!this._subscribes[channel]) {
                this._subscribes[channel] = [];

                // Check already subscribe
                if (_.indexOf(this._subscribes[channel], connection.id) !== -1) {
                    return;
                }

                this._redisSubscriber.subscribe(channel);
            }

            this._subscribes[channel].push(connection.id);
        },

        /**
         * Send client message to redis hub
         * @param {object} connection
         * @param {string} message
         */
        message: function (connection, message) {
            var i = message.indexOf(' ');
            var channel = message.substr(0, i);
            var data = message.substr(i + 1);

            this._redisHub.publish(channel, data);
        },

        /**
         * Unsubscribe client from channel
         * @param {object} connection
         * @param {string} channel
         */
        unsubscribe: function (connection, channel) {
            // Trigger `online` event on user initialize
            /*if (self._isUserChannel(channel)) {
                var channelData = self._parseUserChannel(channel);
                this.trigger('offline', channelData.userUid, connection.id);
            }*/

            // Delete connection
            if (this._subscribes[channel]) {
                var i = _.indexOf(this._subscribes[channel], connection.id);
                delete this._subscribes[channel][i];
            }

            // Delete subscribe, if no connections
            if (!this._subscribes[channel]) {
                delete this._subscribes[channel];
                this._redisSubscriber.unsubscribe(channel);
            }
        }
    },

    _sendAction: function(action) {
        var connectionUid = action.params.connectionUid;
        var requestUid = action.params.requestUid;
        var connection = this._connections[connectionUid];

        if (connection && requestUid) {
            action.data = action.data || {};
            action.data.requestUid = requestUid;
            connection.write('action ' + JSON.stringify(action.data));
        }
    },

    /**
     * Income message from redis hub
     * @param {string} channel
     * @param {string} data
     * @private
     */
    _onHubMessage: function (channel, data) {
        var i = data.indexOf(' ');
        var accessType = data.substr(0, i);
        var message = data.substr(i + 1);

        Jii.app.logger.debug('Comet hub income, channel `%s`:', channel, data);

        switch (accessType) {
            // @todo
            /*case self.ACCESS_TYPE_ALL:
                // Send message to all online users
                _.each(this._connections, function(connection) {
                    connection.write(channel + ' ' + message);
                }.bind(this));
                break;*/

            case self.ACCESS_TYPE_SUBSCRIBERS:
                // Send message to subscribers
                _.each(this._subscribes[channel] || [], function(connectionId) {
                    var connection = this._connections[connectionId];
                    if (connection) {
                        connection.write('channel ' + channel + ' ' + message);
                    }
                }.bind(this));
                break;

            default: // users list
                _.each(accessType.split('|'), function(userUid) {
                    // Get formatted user channel name
                    var userChannel = self._getUserChannel(userUid);

                    // Find connections, who subscribe on user channel
                    _.each(this._subscribes[userChannel] || [], function(connectionId) {
                        var connection = this._connections[connectionId];
                        if (connection) {
                            connection.write('channel ' + channel + ' ' + message);
                        }
                    }.bind(this));
                }.bind(this));
                break;
        }
    }

}, {

    _getUserChannel: function(userUid) {
        return self.USER_CHANNEL_PREFIX + userUid;
    },

    _getCometUserKey: function(userUid) {
        return self.REDIS_COMET_PREFIX + '_' + userUid;
    },

    USER_CHANNEL_PREFIX: 'gtYqti-user-',
    REDIS_COMET_PREFIX: 'comet',

    ACCESS_TYPE_ALL: 'all',
    ACCESS_TYPE_SUBSCRIBERS: 'subscribers'

});
