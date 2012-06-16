### Ico

Ico (GitHub: [alexyoung / ico](https://github.com/alexyoung/ico), License: _MIT_) is a JavaScript graph library.

The [Ico Example Page](http://alexyoung.github.com/ico/examples.html) has a lot of examples that demonstrate Ico's usage.

### Usage

Graphs are created by instantiated classes.  The available classes are:

* `Ico.SparkLine`: Creates a small line graph intended for use within text
* `Ico.SparkBar`: Creates a small bar graph intended for use within text
* `Ico.BarGraph`: Creates a bar graph
* `Ico.HorizontalBarGraph`: Creates a horizontal bar graph
* `Ico.LineGraph`: Creates a line graph

Each of these classes can be instantiated with the same arguments.  The following examples use jQuery, but jQuery is not required to use Ico.

<pre class="prettyprint lang-js"><code>
// Basic signature
new Ico.SparkLine(element, data, options);

// Real examples
new Ico.SparkLine($('#sparkline'),
  [21, 41, 32, 1, 10, 5, 32, 10, 23],
  { width: 30, height: 14, background_colour: '#ccc' }
);

new Ico.BarGraph($('#bargraph'), { one: [44, 12, 17, 30, 11] }, { bar_labels: true });
</code></pre>

The third argument, `options`, may vary between graphs.

### Live Example

<pre class="prettyprint lang-js"><code>
new Ico.LineGraph($('#linegraph'), {
    one: [30, 5, 1, 10, 15, 18, 20, 25, 1],
    two: [10, 9, 3, 30, 1, 10, 5, 33, 33],
    three: [5, 4, 10, 1, 30, 11, 33, 12, 22]
  }, {
    markers: 'circle',
    colours: { one: '#990000', two: '#009900', three: '#000099'},
    labels: ['one', 'two', 'three', 'four',
             'five', 'six', 'seven', 'eight', 'nine'],
    meanline: true,
    grid: true
  }
);
</code></pre>

<script type="text/javascript" src="raphael.js"></script>
<script type="text/javascript" src="ico.min.js"></script>
<div id="linegraph" class="graph"></div>
<script type="text/javascript">
new Ico.LineGraph(document.getElementById('linegraph'), {
  one: [30, 5, 1, 10, 15, 18, 20, 25, 1],
  two: [10, 9, 3, 30, 1, 10, 5, 33, 33],
  three: [5, 4, 10, 1, 30, 11, 33, 12, 22]
}, {
  markers: 'circle',
  colours: { one: '#990000', two: '#009900', three: '#000099'},
  labels: ['one', 'two', 'three', 'four',
           'five', 'six', 'seven', 'eight', 'nine'],
  meanline: true,
  grid: true
}
);
</script>

### Options for `Ico.SparkLine`

* `width`: Width of the graph, defaults to the element's width
* `height`: Height of the graph, defaults to the element's height
* `highlight`: Highlight options `highlight: { colour: '#ff0000' }` -- used to pick out the last value
* `background_colour`: The graph's background colour, defaults to the element's background colour if set
* `colour`: The colour for drawing lines
* `acceptable_range`: An array of two values, `[min, max]`, for setting the size of the background rectangle

### Options for `Ico.SparkBar`

`Ico.SparkBar` options are the same as `Ico.SparkLine`.

### Shared Options for `Ico.BarGraph`, `Ico.HorizontalBarGraph`, and `Ico.LineGraph` 

* `width`: The width of the container element, defaults to the element's width
* `height`: The height of the container element, defaults to the element's height
* `background_colour`: The graph's background colour, defaults to the element's background colour if set
* `labels`: An array of text labels (for each bar or line)
* `show_horizontal_labels`: Set to `false` to hide horizontal labels
* `show_vertical_labels`: Set to `false` to hide vertical labels
* `label_count`: The number of numerical labels to display
* `label_step`: The value to increment each numerical label
* `start_value`: The value to start plotting from (generally 0).  This can be used to force 0 in cases where the normaliser starts from another value
* `font_size`: The size of the fonts used in the graph
* `meanline`: Display a line through the mean value
* `grid`: Display a grid to make reading values easier
* `grid_colour`: Change the colour of the grid

### Options for `Ico.BarGraph`

* `colour`: The colour for the bars
* `colours`: An array of colours for each bar
* `highlight_colours`: An object with the index of a bar (starting from 0) and a colour, like this `{ 3: '#ff0000' }`
* `bar_size`: Set the size for a bar in a bar graph
* `max_bar_size`: Set the maximum size for a bar in a bar graph
* `bar_labels`: Display the actual value of each bar in a bar graph
* `line`: Provide an array to plot a line alongside a bar graph

### Options for `Ico.LineGraph`

* `stroke_width`: Sets the stroke width, defaults to `3px`.  Set to `0` to get a scatter plot

### Grouped Bar Graphs

Multidimensional arrays will be rendered as 'grouped' bar graphs.  Notice that two colours are specified, one for each bar in the group.  This is still a work in progress and hasn't been tested thoroughly yet.

In grouped bar graphs, the index for `highlight_colours` is the index from left to right, starting from zero.

<pre class="prettyprint lang-js"><code>
new Ico.BarGraph(
  $('grouped_bars'),
  [[10, 15], [18, 19], [17, 23], [11, 22]],
  { grid: true, font_size: 10,
    colours: ['#ff0099', '#339933'],
    labels: ['Winter', 'Spring', 'Summer', 'Autumn']
  }
);
</code></pre>    

<div id="grouped_bars" class="graph"></div>
<script type="text/javascript">
new Ico.BarGraph(
  document.getElementById('grouped_bars'),
  [[10, 15], [18, 19], [17, 23], [11, 22]],
  { grid: true, font_size: 10,
    colours: ['#ff0099', '#339933'],
    labels: ['Winter', 'Spring', 'Summer', 'Autumn']
  }
);
</script>

### Options for `Ico.HorizontalBarGraph`

* `bar_size`: Set the size for a bar in a bar graph
* `max_bar_size`: Set the maximum size for a bar in a bar graph

### Options for `Ico.LineGraph`

* `markers`: Set to `'circle'` to display markers at each point on a line graph
* `marker_size`: The size of each marker

### Data Normalisation

Data is mapped to plottable values by `Ico.Normaliser`.  In addition, this class attempts to calculate a sensible value to start plotting from on the X axis, and also calculates the width for each item (the "step").

These values can be overridden by setting `start_value` and `label_step`.  This can help display data that is difficult to plot, but you can raise issues through GitHub to report such data.

