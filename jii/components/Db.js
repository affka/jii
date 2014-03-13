/**
 * @author <a href="http://www.affka.ru">Vladimir Kozhin</a>
 * @license MIT
 */

var mysql = require('mysql');

/**
 * @class Jii.components.Db
 * @extends Jii.base.Component
 */
var self = Joints.defineClass('Jii.components.Db', Jii.base.Component, {

    host: '127.0.0.1',
    port: 3306,
    username: 'root',
    password: '',
    database: '',
    timezone: 'local',

    _isConnected: false,
    _connection: null,

    /**
     * Connect to mysql server
     */
    connect: function () {
        if (this._isConnected) {
            return;
        }

        this._connection = mysql.createConnection({
            host: this.host,
            port: this.port,
            user: this.username,
            password: this.password,
            database: this.database,
            timezone: this.timezone,
            typeCast: this._typeCast
        });
        this._connection.on('error', this._onError);
        this._connection.connect();

        this._isConnected = true;
    },

    /**
     * Close mysql connection
     */
    close: function () {
        if (this._connection) {
            this._connection.end();
        }
    },

    /**
     * Execute INSERT, UPDATE and DELETE queries
     * @param {string} query
     * @param {array|*} [values]
     * @param {function} [callback]
     * @return {Joints.Deferred}
     */
    execute: function(query, values, callback) {
        return this._typeQuery('execute', query, values, callback);
    },

    /**
     * Get row by query
     * @param {string} query
     * @param {array|*} [values]
     * @param {function} [callback]
     * @return {Joints.Deferred}
     */
    queryRow: function(query, values, callback) {
        return this._typeQuery('row', query, values, callback);
    },

    /**
     * Get first value from first fined row
     * @param {string} query
     * @param {array|*} [values]
     * @param {function} [callback]
     * @return {Joints.Deferred}
     */
    queryScalar: function(query, values, callback) {
        return this._typeQuery('scalar', query, values, callback);
    },

    /**
     * Get row list
     * @param {string} query
     * @param {array|*} [values]
     * @param {function} [callback]
     * @return {Joints.Deferred}
     */
    queryAll: function (query, values, callback) {
        return this._typeQuery('all', query, values, callback);
    },

    /**
     * Default query method for node-mysql module
     * @param {string} query
     * @param {array|*} [values]
     * @param {function} [callback]
     */
    query: function (query, values, callback) {
        this.connect();
        this._connection.query.apply(this._connection, arguments);
    },

    _typeQuery: function(queryType, query, values, callback) {
        var deferred = new Joints.Deferred();

        if (_.isFunction(values)) {
            callback = values;
            values = [];
        }

        if (!_.isArray(values)) {
            values = [values];
        }

        callback = this._wrapCallback(callback, deferred, queryType);
        this.query(query, values, callback);

        return deferred.promise();
    },

    _wrapCallback: function(callback, deferred, returnValueType) {
        return function(err, rows) {
            if (err) {
                Jii.app.logger.error('Database query error: `%s`.', err);
                deferred.reject();
                return;
            }

            var value = null;

            // Check return value format
            switch (returnValueType) {
                case 'execute':
                    // @todo
                    value = 1;
                    break;

                case 'all':
                    value = rows;
                    break;

                case 'row':
                    if (rows.length > 0) {
                        value = rows[0];
                    }
                    break;

                case 'scalar':
                    if (rows.length > 0) {
                        value = _.values(rows[0])[0] || null;
                    }
                    break;
            }

            if (_.isFunction(callback)) {
                callback.call(this._connection, value);
            }
            deferred.resolve(value);
        };
    },

    /**
     * Отключаем автоматическое преобразование типов
     * @returns {string}
     * @private
     */
    _typeCast: function (field, next) {
        return field.string();
    },

    /**
     * @param message {string}
     * @private
     */
    _onError: function (message) {
        Jii.app.logger.error('Database error: ' + message);
    }

});
