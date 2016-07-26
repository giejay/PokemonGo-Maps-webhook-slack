'use strict';

startServer(process.env.port || 3000);

function startServer(port) {
  // Configure some logging so we can pretend to know whats going on
  var Logger = require('bunyan');
  var logger = new Logger({
    name: "Pokemon Slack Extension",
    src: false,
    streams: [{
      // let's just write to the trusty STDOUT
      name: 'stdout',
      stream: process.stdout,
      level: 'debug'
    }],
    // makes the REST requests and responses appear in the log
    serializers: {
      req: Logger.stdSerializers.req,
      res: Logger.stdSerializers.res
    }
  });

  // Get our API up so it can be called from PoGo-Maps
  var slackService = require('./lib/slack')(logger);
  var webhookApi = require('./lib/api')(slackService, logger);
  webhookApi.listen(port, function (err) {
    if (err) throw err;
    logger.info('Pokemon Slack Extension listening on port ' + port);
  });
}

