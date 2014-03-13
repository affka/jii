/**
 * @author <a href="http://www.affka.ru">Vladimir Kozhin</a>
 * @license MIT
 */

/**
 * @class Jii.components.Time
 * @extends Jii.base.Component
 */
var self = Joints.defineClass('Jii.components.Time', Jii.base.Component, {

    timezone: null,

    init: function() {
        // Auto detect timezone
        if (this.timezone === null) {
            var hoursOffset = new Date().getTimezoneOffset() / 60;
            this.timezone = (-1 * hoursOffset < 0 ? '-' : '+') + this._withZero(Math.abs(hoursOffset)) + '00';
        }
    },

    /**
     * Текущее время в секундах
     * @todo Без учёта часового пояса! Сейчас он выставлен в UTC
     * @param {string|number} [time]
     * @returns {number}
     */
    getTimestamp: function (time) {
        return Math.round(this.getMicroTimestamp(time) / 1000);
    },

    /**
     * Текущее время в миллисекундах
     * @todo Без учёта часового пояса! Сейчас он выставлен в UTC
     * @param {string|number} [time]
     * @returns {number}
     */
    getMicroTimestamp: function(time) {
        if (_.isString(time) && time.indexOf('GMT') === -1) {
            time += ' GMT' + this.timezone;
        }
        return time ? new Date(time).getTime() : new Date().getTime() + (new Date().getTimezoneOffset() * 60 * 1000);
    },

    /**
     * Возвращаем время в формате YYYY-MM-DD HH:MM:SS
     * @param {integer} [time]
     * @returns {string}
     */
    getSqlTime: function (time) {
        return this.format('Y-m-d H:i:s', time);
    },

    /**
     * Форматирует время согласно правилах date() из php
     * @todo Сделать поддержку прочих букв
     * @param {string} format
     * @param {number} [time]
     * @returns {string}
     */
    format: function (format, time) {
        if (time == parseInt(time) && time.toString().length === 10) {
            time = time * 1000;
        }

        var date = new Date(time || this.getTimestamp() * 1000);
        return format
            .replace('Y', date.getFullYear())
            .replace('m', this._withZero(date.getMonth() + 1))
            .replace('d', this._withZero(date.getDate()))
            .replace('h', date.getHours())
            .replace('H', this._withZero(date.getHours()))
            .replace('i', this._withZero(date.getMinutes()))
            .replace('s', this._withZero(date.getSeconds()));
    },

    /**
     * @param {integer} number
     * @returns {string}
     * @private
     */
    _withZero: function (number) {
        return number < 10 ? '0' + number : number.toString();
    }

});
