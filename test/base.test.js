var assert = require('assert')
  , Ico = require(__dirname + '/../ico.js');

module.exports = {
  'test a simple graph': function() {
    var element = { style: { width: 100, height: 100, backgroundColor: 'blue' } },
        graph   = new Ico.BaseGraph(element, [10, 20, 15, 25, 40, 35, 50, 5, 15], { draw: false });

    assert.deepEqual(graph.options.labels, [1, 2, 3, 4, 5, 6, 7, 8, 9]);
  }
};
