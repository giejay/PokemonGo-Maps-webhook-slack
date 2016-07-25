'use strict';

var restify = require('restify');

module.exports = documentApi;

function documentApi(log) {
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
  server.get('/', listPokemon);
  server.get('/:id', getPokemon);

  /**
   * Let's do something very simple:
   * Keep a list of pokemon and their appereances on the map
   */
  var pokemon = {};

  function _addPokemon(appearance) {
    var id = appearance.pokemon_id;
    if (!pokemon[id]) {
      pokemon[id] = [];
    }
    pokemon[id].push(appearance)
  }

  function addPokemon(req, res, next) {
    _addPokemon(req.params);
    res.send();
    return next();
  }

  function listPokemon(req, res, next) {
    res.send(pokemon);
    return next();
  }

  function getPokemon(req, res, next) {
    if (req.params.id && pokemon[req.params.id]) {
      res.send(pokemon[req.params.id]);
    } else {
      res.statusCode = 204
    }
    return next();
  }

  return server;
}