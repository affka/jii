/**
 * Require relations libs and jii files
 *
 * @author <a href="http://www.affka.ru">Vladimir Kozhin</a>
 * @license MIT
 */

// Load global libraries
global._ = require('./../lib/underscore/lodash');
_.mixin(require('./../lib/underscore/underscore.string').exports());
global.Backbone = require('./../lib/backbone/backbone-events');
require('./../lib/joints/joints-v0.2');

// Load Jii files
require('./Jii');
Jii.isNode = true;
require('./base/Object');
require('./base/action/BaseAction');
require('./base/action/ServerAction');
require('./base/EventsMixin');
require('./base/Component');
require('./base/Module');
require('./base/Application');
require('./base/Enum');
require('./base/Model');
require('./base/UnitTest');
require('./exceptions/ApplicationException');
require('./exceptions/InvalidConfigException');
require('./exceptions/InvalidParamException');
require('./exceptions/InvalidRouteException');
require('./data/Schema');
require('./data/ColumnSchema');
require('./data/Query');
require('./data/DataModel');
require('./data/redis/CollectionSchema');
require('./data/redis/Command');
require('./data/redis/RedisModel');
require('./data/redis/RedisQuery');
require('./validators/Validator');
require('./validators/BooleanValidator');
require('./validators/CompareValidator');
require('./validators/DateValidator');
require('./validators/DefaultValueValidator');
require('./validators/EmailValidator');
require('./validators/FilterValidator');
require('./validators/InlineValidator');
require('./validators/NumberValidator');
require('./validators/RangeValidator');
require('./validators/RegularExpressionValidator');
require('./validators/RequiredValidator');
require('./validators/SafeValidator');
require('./validators/StringValidator');
require('./validators/UrlValidator');
require('./components/Db');
require('./components/request/JsonRpc');
require('./components/router/BaseRouter');
require('./components/Logger');
require('./components/Redis');
require('./components/String');
require('./components/Time');
require('./actions/AccessControlAction');
require('./actions/JsonRpcAction');
require('./controller/UrlRule');
require('./controller/UrlManager');
require('./controller/BaseAction');
require('./controller/BaseController');
require('./controller/BaseRequest');
require('./controller/BaseResponse');
require('./controller/InlineAction');
require('./controller/HeaderCollection');
require('./controller/httpServer/Request');
require('./controller/httpServer/Response');
require('./controller/httpServer/HttpServer');
require('./controller/cometServer/CometServer');
require('./view/View');