/**
 * @author <a href="http://www.affka.ru">Vladimir Kozhin</a>
 * @license MIT
 */

/**
 * Обёртка для вывода сообщений в лог. Пользоваться нужно обёрткой, т.к. не во всех
 * браузерх имеется console.log либо приложения вообще может запускать не в браузере (nodejs).
 * Так же данный класс умеет правильно отобразить сообщение в зависимости от его
 * уровня (error/info/..). Через конфигурацию (в зависимости от профиля настроек, например)
 * можно отключать вывод info сообщений или вообще всего лога.
 *
 * @class Jii.components.Logger
 * @extends Jii.base.Component
 * @author Vladimir Kozhin <affka@affka.ru>
 */
var self = Joints.defineClass('Jii.components.Logger', Jii.base.Component, {
    enable: true,
    level: 'info',
    _timers: {},

    levels: {
        debug: 1,
        info: 2,
        warning: 3,
        error: 4
    },

    init: function () {
        /*setInterval(_.bind(function() {
         this.debug('Memory usage: ' + Math.round(process.memoryUsage().heapTotal / 1000) / 1000 + ' Mb');
         _.each(this._timers, function(timer, name) {
         this.debug('Timer `%s`: %s sec, %s count.', name, timer.totalTime / 1000, timer.count);

         timer.totalTime = null;
         timer.count = 0;
         }, this);
         }, this), 60*1000);*/

        /*process.on('uncaughtException', _.bind(function(message) {
         this.error(message);
         }, this));*/
    },

    debug: function (message) {
        this.write('debug', message, _.rest(arguments, 1));
    },

    info: function (message) {
        this.write('info', message, _.rest(arguments, 1));
    },

    warning: function (message) {
        this.write('warning', message, _.rest(arguments, 1));
    },

    error: function (message) {
        this.write('error', message, _.rest(arguments, 1));
    },

    timerStart: function (name) {
        if (!_.has(this._timers, name)) {
            this._timers[name] = {
                lastTime: null,
                totalTime: null,
                count: 0
            };
        }

        this._timers[name].lastTime = new Date().getTime();
        this._timers[name].count++;
    },

    timerEnd: function (name) {
        if (this._timers[name].lastTime) {
            this._timers[name].totalTime += new Date().getTime() - this._timers[name].lastTime;
            this._timers[name].lastTime = null;
        }
    },

    write: function (level, message, data) {
        if (this.enable === false || this.levels[level] < this.level) {
            return;
        }

        var sysinfo = [];

        // Add process id to message
        if (Joints.root.process) {
            sysinfo.push('pid ' + process.pid);
        }

        // Add date & time
        var d = new Date();
        sysinfo.push([d.getFullYear(), d.getMonth() + 1, d.getDate()].join('.') +
            ' ' + [d.getHours(), d.getMinutes(), d.getSeconds()].join(':'));

        message = sysinfo.join(', ') + ' ' + level.toUpperCase() + ': ' + message;

        var logger;
        if (Joints.root.console) {
            logger = Joints.root.console;
        } else if (Joints.root.firebug) {
            logger = Joints.root.firebug.d.console;
        } else {
            return;
        }

        var logAttributes = data;
        logAttributes.unshift(message);

        switch (this.levels[level]) {
            case this.levels.info:
                logger.info.apply(logger, logAttributes);
                break;

            case this.levels.warning:
                logger.warn.apply(logger, logAttributes);
                break;

            case this.levels.error:
                logger.error.apply(logger, logAttributes);
                break;

            default:
                logger.log.apply(logger, logAttributes);
        }
    }
});
