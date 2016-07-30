'use strict';

var path = process.cwd();
var StocksHandler = require(path + '/app/controllers/stocks-handler.server.js');

module.exports = function (app) {
  var stocksHandler = new StocksHandler();

  app.route('/')
    .get((req, res) => res.sendFile(path + '/public/index.html'));

  app.route('/api/data.json')
    .get(stocksHandler.getData);
};
