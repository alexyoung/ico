module('Normalisation');

test('test_0_to_1', function() {
  var normaliser = new Ico.Normaliser([0.1, 0.5, 0.9, 1.0]);
  equal(0.1, normaliser.step);
  equal(0.0, normaliser.start_value);
});

test('test_really_small', function() {
  var normaliser = new Ico.Normaliser([0.9999, 0.994, 0.93, 0.92]);
  equal(0.1, Ico.round(normaliser.step, 2));
});

test('test_1095_to_1100', function() {
  /* Specifying the start_value is done by bar graphs -- they don't really make sense with non-zero origins */
  var normaliser = new Ico.Normaliser([1095, 1099, 1100, 1096], { start_value: 0 });
  equal(100, normaliser.step);
  equal(0, normaliser.start_value);
});

test('test_1_to_33', function() {
  var normaliser = new Ico.Normaliser([10, 9, 3, 30, 1, 10, 5, 33, 33]);
  equal(10, normaliser.step);
});

test('test_negative_large_range', function() {
  var normaliser = new Ico.Normaliser([-57,-31,-87,66,-30,-77,-88,-75,-20,-48,-56,-91,16,-41,-87,-69,-65,-62,58,-15,-49,-75,-42,-78,-79]);
  equal(10, normaliser.step);
  equal(-91, normaliser.min);

  /* The start value should round down to the nearest readable value */
  equal(-100, normaliser.start_value);
});

test('test_negative_medium_range', function() {
  var normaliser = new Ico.Normaliser([10, 10, 10, 10, 10, 10, 5, 6, 9, 11, 14, -25]);
  equal(10, normaliser.step);
  equal(-25, normaliser.min);
  equal(-30, normaliser.start_value);
});

test('test_90_100', function() {
  var normaliser = new Ico.Normaliser([90, 95, 100], { start_value: 0 });
  equal(10, normaliser.step);
  equal(0, normaliser.start_value);
});

test('test_same_values', function() {
  var normaliser = new Ico.Normaliser([20, 20], { start_value: 0 });
  equal(1, normaliser.step);
  equal(20, normaliser.range);
  equal(0, normaliser.start_value);
});

test('test_19_20', function() {
  var normaliser = new Ico.Normaliser([19, 20], { start_value: 0 });
  equal(0, normaliser.start_value);
  equal(1, normaliser.step);
});

test('test_negative_values', function() {
  /* Negative values are the only case where start_value should be ignored */
  var normaliser = new Ico.Normaliser([-10, 1, 20], { start_value: 0 });
  equal(-10, normaliser.start_value);
});

test('test_rre_bug', function() {
  var normaliser = new Ico.Normaliser([10, 10, 10, 5, 5, 5]);
  equal(1, normaliser.step);
  equal(0, normaliser.start_value);
});

test('test_max_has_headrom', function() {
  var normaliser = new Ico.Normaliser([30, 5, 1, 10, 15, 18, 20, 25, 1, 10, 9, 3, 30, 1, 10, 5, 33, 33, 5, 4, 10, 1, 30, 11, 33, 12, 22]);
});

test('A set of the same values gives a sensible start_value', function() {
  var normaliser = new Ico.Normaliser([20, 20, 20, 20, 20]);
  equal(0, normaliser.start_value);
});

test('test_normalisation_floats', function() {
  var normaliser = new Ico.Normaliser([100.3, 100.4, 101.3, 100.4, 101.2, 101.8, 102.0, 103.5, 103.7, 103.1, 104.1, 103.0, 102.6, 104.2, 104.1, 103.3, 103.9, 104.6, 103.4, 104.5, 103.5, 103.6, 104.6, 104.4, 104.5, 103.7, 103.8, 102.9, 102.5, 102.3, 101.8, 103.1, 102.0, 100.8, 100.4, 100.3, 100.7, 100.7, 101.3, 101.6, 102.6, 98.0, 100.1, 100.8, 100.7, 100.3, 100.1, 100.9, 99.2, 100.1, 99.8, 99.9, 99.8, 99.3, 100.1, 100.2, 99.5, 99.8, 99.7, 100.8, 100.7, 100.0, 101.2, 101.2, 100.7, 101.3, 102.0, 101.6, 101.4, 101.1, 101.4, 100.3, 100.2, 100.6, 99.8, 100.0, 101.1, 100.6, 100.8, 100.3, 100.2, 100.7, 99.6, 100.2, 100.4, 100.4, 100.5, 100.3, 99.6, 99.5, 99.1, 98.3, 99.0, 99.1, 99.6, 100.2, 100.6, 100.3, 101.2, 100.0, 100.5, 100.4, 100.6, 100.1, 100.7, 100.7, 101.2, 100.3, 100.6, 100.3, 100.1, 100.5, 100.2, 99.8, 100.3, 100.5, 101.1, 101.5, 101.5, 101.2, 101.1, 100.9, 100.8, 101.4, 101.2, 101.3, 101.2, 100.9, 101.0, 100.6, 100.6, 99.9, 99.8, 99.5, 98.8, 98.6]);
  equal(10, normaliser.step);
});
