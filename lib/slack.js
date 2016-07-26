var Slack = require('slack-node');
var fs = require('fs');
var dateFormat = require('dateformat');

module.exports = slackService;

function slackService(log) {

  var webhookUri = process.env.slackUri;

  var slack = new Slack();
  slack.setWebhook(webhookUri);


  // list of appearances for which notifications have already been sent
  var encounters = [];

  // list of pokemon we want to ignore
  var ignorablePokemons = [10, 13, 16, 19, 41];

  // list of pokemon names, by number
  var pokedex = JSON.parse(fs.readFileSync('lib/pokemon.en.json', 'utf8'));

  /**
   * Helper method to filter out common appearances of pokemons like Pidgeys and Zubats
   * @param appearance
   * @private
   */
  function _filterPokemon(appearance) {
    return appearance && ignorablePokemons.indexOf(appearance.pokemon_id) > -1
  }

  /**
   * Send actual message to Slack
   * @param appearance
   * @private
   */
  function _sendMessageToSlack(appearance) {
    // Create message
    var date = new Date(appearance.disappear_time);
    var msg = pokedex[appearance.pokemon_id] + " available for "+dateFormat(date, "MM:ss")+" at LAT: " + appearance.latitude + ", LON: " + appearance.longitude;

    // Send message via Slack Webhook
    slack.webhook({text: msg},
      function (err) {
        if (err) {
          log.err(err);
        }
        // Save that we sent a message for this encounter so that next scans don't continously keep sending same encounters
        encounters.push(appearance.encounter_id);
      });
  }

  var sendMessage = function (appearance) {
    // Check if we already sent a message for this encounter before
    if (encounters.indexOf(appearance.encounter_id) == -1) {
      // We're not interested in common pokemons, so filter out those messages
      // (dev note: yes, this can be done better, but it's done like this for clarity)
      if (!_filterPokemon(appearance)) {
        // Only interesting pokemon left, message slack!
        _sendMessageToSlack(appearance)
      }
    }
  };

  return {
    sendMessage: sendMessage
  }
}