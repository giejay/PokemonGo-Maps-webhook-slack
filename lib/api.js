'use strict';

var restify = require('restify');

module.exports = documentApi;

function documentApi(slackService, log) {
  var server = restify.createServer({name: 'PoGo Extension Server', log: log});

  /** Server config - THIS MUST BE ON TOP TO WORK **/
  server
    .use(restify.fullResponse())
    .use(restify.bodyParser())
    .use(restify.queryParser());

  /** Logging shizzle */
  server.pre(function (req, res, next) {
    // allows trailing slashes
    restify.pre.sanitizePath();
    req.log.debug({req: req}, 'start');
    return next();
  });

  server.on('after', function (req, res) {
    req.log.debug({res: res}, 'finished');
  });

  /** End-Point configuration */
  server.post('/', addPokemon);
  

  function _notify(appearance) {
    return slackService.sendMessage(appearance);
  }

  /**
   * WebHook CallBack
   * Request body contains:
   *  - type: String ("pokemon")
   *  - message: Object
   *    - disappear_time: Long
   *    - encounter_id: String (B64?, e.g. MTA0NTI4NzU4MzE0ODQzMDIwNjE=)
   *    - pokemon_id: Integer (e.g. 11)
   *    - spawnpoint_id: String (e.g. 47c3c2a0e33)
   *    - longitude
   *    - latitude
   */
  function addPokemon(req, res, next) {
    if (req.params.type && req.params.type == "pokemon") {
        _notify(req.params.message);
    }
    res.send();
    return next();
  }
  
  return server;
}