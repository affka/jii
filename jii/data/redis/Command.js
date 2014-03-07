/**
 * @copyright Copyright 2013 <a href="http://www.extpoint.com">ExtPoint</a>
 * @author <a href="http://www.affka.ru">Vladimir Kozhin</a>
 * @license MIT
 */

// Available commands list from http://redis.io/commands.json
var commands = require('./commands.json');

/**
 * @class Jii.data.redis.Command
 * @extends Jii.base.Object
 */
Joints.defineClass('Jii.data.redis.Command', Jii.base.Object, {

    connection: null,
    method: null,
    attributes: null,

    execute: function() {
        // Check method
        if (this.method === null || !_.has(commands, this.method.toUpperCase())) {
            throw new Jii.exceptions.ApplicationException('Unknown method `' + this.method + '` for redis request.');
        }

        var attributes = [];
        var deferred = new Joints.Deferred();

        // Get query arguments
        _.each(commands[this.method.toUpperCase()].arguments, function(params) {
            var names = _.isArray(params.name) ? params.name : [params.name];
            // @todo format "name": ["field", "value"],
            // @todo check type
            _.each(names, function(name) {
                // @todo Write error, if wrong schema
                var attribute = _.has(this.attributes, name) ? this.attributes[name] : null;

                // Skip empty, if optional
                if (params.optional === true && attribute === null) {
                    return;
                }

                if (params.multiple && _.isArray(attribute)) {
                    _.each(attribute, function(value) {
                        attributes.push(value);
                    });
                } else {
                    attributes.push(attribute);
                }
            }.bind(this));
        }.bind(this));

        // Send query
        this.connection.send_command(this.method, attributes, function(err) {
            if (err) {
                Jii.app.logger.error('Redis error: ' + err + ', request: ' + this.method + ' ' + attributes.join(' '));
            }

            //Jii.app.logger.debug('Redis command: ', this.method, attributes.join(' '), _.rest(arguments));

            // Return result
            deferred.resolve.apply(this, _.rest(arguments));
        });

        return deferred.promise();
    }

});
