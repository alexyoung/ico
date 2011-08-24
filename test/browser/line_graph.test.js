module('LineGraph');

test('LineGraph creation', function() {
  var element   = document.getElementById('linegraph'),
      linegraph = new Ico.LineGraph(element, {
        one:   [30, 5, 1, 10, 15, 18, 20, 25, 1],
        two:   [10, 9, 3, 30, 1, 10, 5, 33, 33],
        three: [5, 4, 10, 1, 30, 11, 33, 12, 22]},
        { markers: 'circle',
          colours: { one: '#990000', two: '#009900', three: '#000099'},
          labels: ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'], 
          meanline: true,
          grid: true,
          width: 600,
          height: 345,
          background_colour: '#fff'
      });

  ok(linegraph);
});
