module('Base');

test('a one-dimensional array', function() {
  var values = [10, 20, 15];
  deepEqual(Ico.Base.flatten(values), values);
});

test('an array containing arrays', function() {
  var values = [10, [20, 3], [1, 2, 3]];
  deepEqual(Ico.Base.flatten(values), [10, 20, 3, 1, 2, 3]);
});

test('a deeper set of arrays', function() {
  var values = [10, [20, [1, 2, [4, 5, 3]]], [1, 2, 3]];
  deepEqual(Ico.Base.flatten(values), [10, 20, 1, 2, 4, 5, 3, 1, 2, 3]);
});
