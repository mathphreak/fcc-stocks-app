/* global io:false ajaxFunctions:false document:false d3:false */

'use strict';

ajaxFunctions.ready(function () {
  var stockList = document.querySelector('#stock-list');
  var addStock = document.querySelector('#add-stock');
  var addStockSymbol = document.querySelector('#add-stock input[name="symbol"]');

  var socket = io();
  socket.on('stocks list', function (stocks) {
    stockList.innerHTML = '';
    stocks.map(buildStockLI).forEach(function (li) {
      stockList.appendChild(li);
    });
  });
  socket.on('stocks data', function (data) {
    drawChart(data);
  });

  addStock.addEventListener('submit', function (evt) {
    socket.emit('stocks add', addStockSymbol.value);
    addStockSymbol.value = '';
    evt.preventDefault();
  });

  function buildStockLI(symbol) {
    var result = document.createElement('li');
    result.innerText = symbol;

    var remove = document.createElement('button');
    remove.className = 'remove';
    remove.innerText = 'X';
    remove.addEventListener('click', function (evt) {
      socket.emit('stocks remove', symbol);
      evt.preventDefault();
    });

    result.appendChild(remove);
    return result;
  }

  function drawChart(rawData) {
    var margin = {
      top: 20,
      right: 20,
      left: 50,
      bottom: 20
    };
    var width = 950 - margin.left - margin.right;
    var height = 350 - margin.top - margin.bottom;

    function fixDate(o) {
      o.date = new Date(o.date);
      return o;
    }

    function getter(x) {
      return function (y) {
        return y[x];
      };
    }

    function randomColor() {
      return 'hsl(' + (Math.random() * 360) + ', 50%, 50%)';
    }

    var data = [];
    var allDataPoints = [];
    var stocks = [];
    for (var stock in rawData) {
      if ({}.hasOwnProperty.call(rawData, stock)) {
        if (rawData[stock].length !== 0) {
          stocks.push(stock);
          data.push(rawData[stock].map(fixDate));
          [].push.apply(allDataPoints, rawData[stock].map(fixDate));
        }
      }
    }

    var xScale = d3.scaleTime()
        .domain(d3.extent(allDataPoints, getter('date')))
        .range([0, width]);

    var yScale = d3.scaleLinear()
        .domain([0, d3.max(allDataPoints, getter('close'))])
        .range([height, 0]);

    var xAxis = d3.axisBottom()
        .scale(xScale)
        .ticks(10);

    var yAxis = d3.axisLeft()
        .scale(yScale)
        .ticks(10, ',d');

    var colorScale = d3.scaleOrdinal()
        .domain(stocks)
        .range(stocks.map(randomColor));

    var chartWrapper = d3.select('.chart-wrapper')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom);

    var cwNode = chartWrapper.node();
    while (cwNode.firstChild) {
      cwNode.removeChild(cwNode.firstChild);
    }

    var chart = chartWrapper.append('g')
        .attr('class', 'chart')
        .attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')');

    // Lines
    chart.selectAll('path')
        .data(data)
      .enter().append('path')
        .attr('stroke', function (d) {
          return colorScale(d[0].symbol);
        })
        .attr('d', d3.line()
          .x(function (d) {
            return xScale(d.date);
          })
          .y(function (d) {
            return yScale(d.close);
          })
        );

    // Colors
    d3.selectAll('#stock-list li')
        .style('color', function () {
          var symbol = this.innerText.replace(/X$/, '');
          if (stocks.indexOf(symbol) > -1) {
            return colorScale(symbol);
          }
        });

    // Axes
    chartWrapper.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(' + margin.left + ', ' + (margin.top + height) + ')')
        .call(xAxis);

    chartWrapper.append('g')
        .attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')')
        .attr('class', 'y axis')
        .call(yAxis)
      .append('text')
        .attr('transform', 'translate(-50, 0) rotate(-90)')
        .attr('fill', '#000')
        .attr('y', 6)
        .attr('dy', '.71em')
        .style('text-anchor', 'end')
        .text('Closing price');
  }
});
