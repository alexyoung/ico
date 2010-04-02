if (typeof load != 'undefined') {
  load('riot/riot.js');
  load('../ico.js');
}

Riot.run(function() {
  context('Ico.BaseGraph', function() {
    given('A simple graph', function() {
      var element = { style: { width: 100, height: 100, backgroundColor: 'blue' } },
          graph   = new Ico.BaseGraph(element, [10, 20, 15, 25, 40, 35, 50, 5, 15], { draw: false });

      should('have the expected labels', graph.options.labels.toString()).equals([1, 2, 3, 4, 5, 6, 7, 8].toString());
    });
  });
});

