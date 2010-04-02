if (typeof load != 'undefined') {
  load('riot/riot.js');
  load('../ico.js');
}

Riot.run(function() {
  context('Ico.Base', function() {
    given('a one-dimensional array', function() {
      var values = [10, 20, 15];
      should('return the same array', Ico.Base.flatten(values).toString()).equals(values.toString());
    });

    given('an array containing arrays', function() {
      var values = [10, [20, 3], [1, 2, 3]];
      should('return a flat array', Ico.Base.flatten(values).toString()).equals('10,20,3,1,2,3');
    });

    given('a deeper set of arrays', function() {
      var values = [10, [20, [1, 2, [4, 5, 3]]], [1, 2, 3]];
      should('return a flat array', Ico.Base.flatten(values).toString()).equals('10,20,1,2,4,5,3,1,2,3');
    });
  });
});
