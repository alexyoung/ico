module('Ico.SparkLine');

test('an inline sparkline', function() {
  var element   = document.getElementById('sparkline'),
      sparkline = new Ico.SparkLine(element,
                                    [21, 41, 32, 1, 10, 5, 32, 10, 23],
                                    { width: 30, height: 14, background_colour: '#ccc' });
  ok(sparkline);
});

test('a sparkbar', function() {
  var element   = document.getElementById('sparkline_2'),
      sparkbar  = new Ico.SparkBar(element,
                                   [1, 5, 10, 15, 20, 15, 10, 15, 30, 15, 10],
                                   { width: 30, height: 14, background_colour: '#ccc' });
  ok(sparkbar);
});

test('a sparkline that needs highlights', function() {
  var element   = document.getElementById('sparkline_3'),
      sparkline = new Ico.SparkLine(element,
                                    [10, 1, 12, 3, 4, 8, 5],
                                    { width: 60, height: 14, highlight: { colour: '#ff0000' },
                                      acceptable_range: [5, 9], background_colour: '#ccc' });
  ok(sparkline);
});
