'use strict';

var yahooFinance = require('yahoo-finance');

function StocksHandler(io) {
  var stocks = ['GOOG'];

  function fetch() {
    console.log('Fetching data');
    var now = new Date();
    var then = new Date();
    then.setMonth(now.getMonth() - 6);
    return yahooFinance.historical({
      symbols: stocks,
      from: then,
      to: now
    });
  }

  var lastData = {
    time: new Date(0),
    data: undefined
  };

  function getData(force) {
    // wait for at least an hour
    if (force || Date.now() - lastData.time.getTime() > 1000 * 60 * 60) {
      return fetch().then(data => {
        lastData.time = new Date();
        lastData.data = data;
        return data;
      });
    }
    return Promise.resolve(lastData.data);
  }

  io.on('connection', socket => {
    var update = d => {
      socket.emit('stocks list', stocks);
      socket.emit('stocks data', d);
    };

    getData(false).then(update);
    socket.on('stocks add', newStock => {
      stocks.push(newStock);
      getData(true).then(update);
    });
    socket.on('stocks remove', oldStock => {
      stocks = stocks.filter(s => s !== oldStock);
      getData(true).then(update);
    });
  });

  this.getData = function (req, res) {
    res.json(stocks);
  };
}

module.exports = StocksHandler;
