/**
 * @author <a href="http://www.affka.ru">Vladimir Kozhin</a>
 * @license MIT
 */

/**
 * @class Jii.components.comet.CometClient
 * @extends Jii.base.Component
 */
var self = Joints.defineClass('Jii.components.comet.CometClient', Jii.base.Component, {

    /**
     * Url to comet server
     * @type {string}
     */
    serverUrl: '',

    autoReconnect: true,

    deferred: null,

    stationUid: null,

    _noSendMessages: [],

    _subscribeChannels: [],

    /**
     * @type {SockJS}
     */
    _websocket: null,

    init: function () {
        this._noSendMessages = [];
        this.deferred = $.Deferred();

        // Generate or get stationUid
        if (this.stationUid === null) {
            // @todo
            //this.stationUid = HelpOnClick.clientStorage.get(self.CLIENT_STORAGE_STATION_UID);
        }
        if (this.stationUid === null) {
            this.stationUid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {var r = Math.random()*16|0,v=c=='x'?r:r&0x3|0x8;return v.toString(16);});
            //HelpOnClick.clientStorage.set(self.CLIENT_STORAGE_STATION_UID, this.stationUid);
        }

        //Jii.app.logger.info('Connect to comet server on `%s`...', this.serverUrl);
        this._websocket = new SockJS(this.serverUrl, null, {
            debug: true
        });

        this._websocket.onopen = _.bind(this._onOpen, this);
        this._websocket.onmessage = _.bind(this._onMessage, this);
        this._websocket.onclose = _.bind(this._onClose, this);
    },

    /**
     *
     * @param {string} method
     * @param {object} data
     */
    request: function (method, data) {
        this._send('action ' + method + ' ' + JSON.stringify(data));
    },

    /**
     *
     * @param {string} channel
     * @param {*} data
     * @param {String|Array} [users] ACCESS_TYPE_ALL OR ACCESS_TYPE_SUBSCRIBERS OR [userUid, ...]
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

        this._send('message ' + channel + ' ' + users + ' ' + JSON.stringify(data));
    },

    on: function(events) {
        // Subscribe on comet channel
        _.each(events.split(' '), _.bind(function(event) {
            if (_.indexOf(this._subscribeChannels, event) === -1) {
                // Skip other events
                if (event.indexOf('channel:') !== 0) {
                    return;
                }

                var channel = event.replace('channel:', '');
                this.subscribe(channel);
            }
        }, this));

        this._super.apply(this, arguments);
    },

    off: function(events, handler) {
        // Unsubscribe from comet, if delete all handlers
        if (_.isUndefined(handler)) {
            _.each(events.split(' '), _.bind(function(event) {
                // Skip other events
                if (event.indexOf('channel:') !== 0) {
                    return;
                }

                var channel = event.replace('channel:', '');
                if (_.indexOf(this._subscribeChannels, channel) !== -1) {
                    this.unsubscribe(channel);
                }
            }, this));
        }

        this._super.apply(this, arguments);
    },

    /**
     *
     * @param {string} channel
     */
    subscribe: function (channel) {
        // Skip already subscribed channels
        if (_.indexOf(this._subscribeChannels, channel) !== -1) {
            return;
        }

        this._send('subscribe ' + channel);
        this._subscribeChannels.push(channel);
    },

    /**
     *
     * @param {string} channel
     */
    unsubscribe: function (channel) {
        this._send('unsubscribe ' + channel);
        var index = _.indexOf(this._subscribeChannels, channel);
        delete this._subscribeChannels[index];
    },

    _send: function(message) {
        // If comet is not initialized, then stored messages
        if (this.deferred.state() === 'pending') {
            this._noSendMessages.push(message);
            return;
        }

        this._websocket.send(message);
    },

    _onOpen: function () {
        this.deferred.resolve();
        this.trigger('open');

        // Set online status
        this.request('online.update', {
            stationUid: this.stationUid,
            platform: 'browser'
        });

        // Send messages, which sending before open connection
        _.each(this._noSendMessages, _.bind(this._send, this));
        this._noSendMessages = [];
    },

    _onClose: function () {
        this.trigger('close');

        if (this.autoReconnect === true) {
            // Retry connect after 1 sec
            setTimeout(_.bind(function() {
                this.init();

                this.deferred.done(_.bind(function() {
                    // Check subscribes from previous connection
                    var channels = this._subscribeChannels;
                    this._subscribeChannels = [];
                    _.each(channels, _.bind(function(channel) {
                        this.subscribe(channel);
                    }, this));
                }, this));
            }, this), 1000);
        }
    },

    _onMessage: function (event) {
        switch (event.type) {
            case 'message':
                var i = event.data.indexOf(' ');
                var channel = event.data.substr(0, i);
                var message = event.data.substr(i + 1);

                this.trigger('channel:' + channel, JSON.parse(message));

                break;
        }
    }

}, {

    _isUserChannel: function(channel) {
        return channel.indexOf(self.USER_CHANNEL_PREFIX) === 0;
    },

    _parseUserChannel: function(channel) {
        return channel.substr(self.USER_CHANNEL_PREFIX.length, channel.length);
    },

    _getUserChannel: function(userUid) {
        return self.USER_CHANNEL_PREFIX + userUid;
    },

    CLIENT_STORAGE_STATION_UID: 'cometStationUid',

    USER_CHANNEL_PREFIX: 'gtYqti-user-',

    ACCESS_TYPE_ALL: 'all',
    ACCESS_TYPE_SUBSCRIBERS: 'subscribers'


});

