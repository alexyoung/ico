/**
 * Ico.BaseGraph is extended by most of the other graphs.  It
 * uses a simple pattern with methods that can be overridden.
 */
Ico.BaseGraph = function() { this.initialize.apply(this, arguments); };
Helpers.extend(Ico.BaseGraph.prototype, Ico.Base);
Helpers.extend(Ico.BaseGraph.prototype, {
  /**
   * This base class is used by the other graphs in Ico.
   * 
   * Options:
   *
   *   `width`: The width of the container element
   *   `height`: The height of the container element
   *   `labels`: The textual labels
   *   `label_count`: The number of numerical labels to display
   *   `label_step`: The value to increment each numerical label
   *   `start_value`: The value to start plotting from (generally 0)
   *
   * @param {Object} A DOM element
   * @param {Array|Object} Data to display
   * @param {Object} Options
   *
   */
  initialize: function(element, data, options) {
    options = options || {};
    this.element = element;
    this.data_sets = this.buildDataSets(data, options);
    this.flat_data = this.flatten(data);
    this.data_size = this.longestDataSetLength();

    /* If one colour is specified, map it to a compatible set */
    if (options && options.colour) {
      options.colours = {};
      for (var key in this.data_sets) {
        if (this.data_sets.hasOwnProperty(key))
          options.colours[key] = options.colour;
      }
    }

    this.options = {
      width:                  parseInt(getStyle(element, 'width'), 10),
      height:                 parseInt(getStyle(element, 'height'), 10),
      labels:                 this.makeRange(1, this.data_size + 1), // Label data
      plot_padding:           10,                                    // Padding for the graph line/bar plots
      font_size:              10,                                    // Label font size
      show_horizontal_labels: true,
      show_vertical_labels:   true,
      background_colour:      getStyle(element, 'backgroundColor') || '#ffffff',
      label_colour:           '#666',                                // Label text colour
      markers:                false,                                 // false, circle
      marker_size:            5,
      meanline:               false,
      grid:                   false,
      grid_colour:            '#ccc',
      y_padding_top:          20,
      draw:                   true
    };
    Helpers.extend(this.options, this.chartDefaults() || {});
    Helpers.extend(this.options, options);

    this.normaliser = new Ico.Normaliser(this.flat_data, this.normaliserOptions());
    this.label_step = options.label_step || this.normaliser.step;

    this.range = this.normaliser.range;
    this.start_value = options.start_value || this.normaliser.start_value;

    /* Padding around the graph area to make room for labels */
    this.x_padding_left = 10 + this.paddingLeftOffset();
    this.x_padding_right = 20;
    this.x_padding = this.x_padding_left + this.x_padding_right;
    this.y_padding_top = this.options.y_padding_top;
    this.y_padding_bottom = 20 + this.paddingBottomOffset();
    this.y_padding = this.y_padding_top + this.y_padding_bottom;
    
    this.graph_width = this.options.width - (this.x_padding);
    this.graph_height = this.options.height - (this.y_padding);

    this.step = this.calculateStep();

    /* Calculate how many labels are required */
    if (options.label_count) {
      this.y_label_count = options.label_count;
    } else {
      this.y_label_count = Math.ceil(this.range / this.label_step);
      if ((this.normaliser.min + (this.y_label_count * this.normaliser.step)) < this.normaliser.max) {
        this.y_label_count += 1;
      }
    }
    this.value_labels = this.makeValueLabels(this.y_label_count);
    this.top_value = this.value_labels[this.value_labels.length - 1];

    /* Grid control options */
    this.grid_start_offset = -1;

    /* Drawing */
    if (this.options.draw) {
      if (typeof this.options.colours === 'undefined') {
        this.options.colours = this.makeRandomColours();
      }

      this.paper = Raphael(this.element, this.options.width, this.options.height);
      this.background = this.paper.rect(0, 0, this.options.width, this.options.height);
      this.background.attr({fill: this.options.background_colour, stroke: 'none' });

      if (this.options.meanline === true) {
        this.options.meanline = { 'stroke-width': '2px', stroke: '#BBBBBB' };
      }

      this.setChartSpecificOptions();
      this.lastPoint = { x: 0, y: 0 };
      this.draw();
    }
  },

  buildDataSets: function(data, options) {
    return (typeof data.length !== 'undefined') ? { 'one': data } : data;
  },

  normaliserOptions: function() {
    return {};
  },
  
  chartDefaults: function() {
    /* Define in child class */
    return {};
  },
 
  drawPlot: function(index, pathString, x, y, colour) {
    /* Define in child class */
  },
  
  calculateStep: function() {
    /* Define in child classes */
  },
  
  makeRandomColours: function() {
    var colours = {};
    for (var key in this.data_sets) {
      if (!colours.hasOwnProperty(key))
        colours[key] = Raphael.hsb2rgb(Math.random(), 1, 0.75).hex;
    }
    return colours;
  },
  
  longestDataSetLength: function() {
    var length = 0;
    for (var key in this.data_sets) {
      if (this.data_sets.hasOwnProperty(key)) {
        length = this.data_sets[key].length > length ? this.data_sets[key].length : length;
      }
    }
    return length;
  },
  
  roundValue: function(value, length) {
    var multiplier = Math.pow(10, length);
    value *= multiplier;
    value = Math.round(value) / multiplier;
    return value;
  },
  
  roundValues: function(data, length) {
    var roundedData = [];
    for (var i = 0; i < data.length; i++) {
      roundedData.push(this.roundValue(data[i], length));
    }
    return roundedData;
  },

  longestLabel: function(values) {
    var labels = Array.prototype.slice.call(values || this.options.labels, 0);
    if (labels.length) {
      return labels.sort(function(a, b) { return a.toString().length < b.toString().length; })[0].toString().length;
    }
    return 0;
  },

  paddingLeftOffset: function() {
    /* Find the longest label and multiply it by the font size */
    var data = this.roundValues(this.flat_data, 2),
        longest_label_length = 0;

    longest_label_length = data.sort(function(a, b) { 
      return a.toString().length < b.toString().length;
    })[0].toString().length;

    longest_label_length = longest_label_length > 2 ? longest_label_length - 1 : longest_label_length;
    return 10 + (longest_label_length * this.options.font_size);
  },
  
  paddingBottomOffset: function() {
    /* Find the longest label and multiply it by the font size */
    return this.options.font_size;
  },
  
  normalise: function(value) {
    var total = this.start_value === 0 ? this.top_value : this.range;
    return ((value / total) * (this.graph_height));
  },
  
  draw: function() {
    if (this.options.grid) {
      this.drawGrid();
    }

    if (this.options.meanline) {
      this.drawMeanLine(this.normaliseData(this.flat_data));
    }

    this.drawAxis();
    
    if (this.options.show_vertical_labels) {
      this.drawVerticalLabels();
    }
    
    if (this.options.show_horizontal_labels) {
      this.drawHorizontalLabels();
    }

    for (var key in this.data_sets) {
      if (this.data_sets.hasOwnProperty(key)) {
        var data = this.data_sets[key];
        this.drawLines(key, this.options.colours[key], this.normaliseData(data));
      }
    }
    
    if (this.start_value !== 0) {
      this.drawFocusHint();
    }
  },

  drawGrid: function() {
    var pathString = '', i;

    if (this.options.show_vertical_labels) {
      var y = this.graph_height + this.y_padding_top;
      for (i = 0; i < this.y_label_count; i++) {
        y = y - (this.graph_height / this.y_label_count);
        pathString += 'M' + this.x_padding_left + ',' + y;
        pathString += 'L' + (this.x_padding_left + this.graph_width) + ',' + y;
      }
    }
 
    if (this.options.show_horizontal_labels) {
      var x = this.x_padding_left + this.options.plot_padding + this.grid_start_offset,
          x_labels = this.options.labels.length;

      for (i = 0; i < x_labels; i++) {
        pathString += 'M' + x + ',' + this.y_padding_top;
        pathString += 'L' + x +',' + (this.y_padding_top + this.graph_height);
        x = x + this.step;
      }

      x = x - this.options.plot_padding - 1;
      pathString += 'M' + x + ',' + this.y_padding_top;
      pathString += 'L' + x + ',' + (this.y_padding_top + this.graph_height);
    }

    this.paper.path(pathString).attr({ stroke: this.options.grid_colour, 'stroke-width': '1px'});
  },

  drawLines: function(label, colour, data) {
    var coords = this.calculateCoords(data),
        pathString = '';

    for (var i = 0; i < coords.length; i++) {
      var x = coords[i][0] || 0,
          y = coords[i][1] || 0;
      pathString = this.drawPlot(i, pathString, x, y, colour);
    }

    this.paper.path(pathString).attr({stroke: colour, 'stroke-width': '3px'});
  },

  calculateCoords: function(data) {
    var x = this.x_padding_left + this.options.plot_padding - this.step,
        y_offset = (this.graph_height + this.y_padding_top) + this.normalise(this.start_value),
        y = 0,
        coords = [];
    for (var i = 0; i < data.length; i++) {
      y = y_offset - data[i];
      x = x + this.step;
      coords.push([x, y]);
    }
    return coords;
  },

  drawFocusHint: function() {
    var length = 5,
        x = this.x_padding_left + (length / 2) - 1,
        y = this.options.height - this.y_padding_bottom,
        pathString = '';

    pathString += 'M' + x + ',' + y;
    pathString += 'L' + (x - length) + ',' + (y - length);
    pathString += 'M' + x + ',' + (y - length);
    pathString += 'L' + (x - length) + ',' + (y - (length * 2));
    this.paper.path(pathString).attr({stroke: this.options.label_colour, 'stroke-width': 2});
  },

  drawMeanLine: function(data) {
    var offset = Helpers.sum(data) / data.length,
        pathString = '';
 
    pathString += 'M' + (this.x_padding_left - 1) + ',' + (this.options.height - this.y_padding_bottom - offset);
    pathString += 'L' + (this.graph_width + this.x_padding_left) + ',' + (this.options.height - this.y_padding_bottom - offset);
    this.paper.path(pathString).attr(this.options.meanline);
  },

  drawAxis: function() {
    var pathString = '';

    pathString += 'M' + (this.x_padding_left - 1) + ',' + (this.options.height - this.y_padding_bottom);
    pathString += 'L' + (this.graph_width + this.x_padding_left) + ',' + (this.options.height - this.y_padding_bottom); 
    pathString += 'M' + (this.x_padding_left - 1) + ',' + (this.options.height - this.y_padding_bottom); 
    pathString += 'L' + (this.x_padding_left - 1) + ',' + (this.y_padding_top);

    this.paper.path(pathString).attr({ stroke: this.options.label_colour });
  },
  
  makeValueLabels: function(steps) {
    var step = this.label_step,
        label = this.start_value,
        labels = [];

    for (var i = 0; i < steps; i++) {
      label = this.roundValue((label + step), 2);
      labels.push(label);
    }
    return labels;
  },
 
  /* Axis label markers */
  drawMarkers: function(labels, direction, step, start_offset, font_offsets, extra_font_options) {
    function x_offset(value) {
      return value * direction[0];
    }
    
    function y_offset(value) {
      return value * direction[1];
    }
    
    /* Start at the origin */
    var x = this.x_padding_left - 1 + x_offset(start_offset),
        y = this.options.height - this.y_padding_bottom + y_offset(start_offset),
        pathString = '',
        font_options = {"font": this.options.font_size + 'px "Arial"', stroke: "none", fill: "#000"};
    Helpers.extend(font_options, extra_font_options || {});
    
    for (var i = 0; i < labels.length; i++) {
      pathString += 'M' + x + ',' + y;
      if (typeof labels[i] !== 'undefined' && (labels[i] + '').length > 0) {
        pathString += 'L' + (x + y_offset(5)) + ',' + (y + x_offset(5));
        this.paper.text(x + font_offsets[0], y - font_offsets[1], labels[i]).attr(font_options).toFront();
      }
      x = x + x_offset(step);
      y = y + y_offset(step);
    }

    this.paper.path(pathString).attr({ stroke: this.options.label_colour });
  },
  
  drawVerticalLabels: function() {
    var y_step = this.graph_height / this.y_label_count; 
    this.drawMarkers(this.value_labels, [0, -1], y_step, y_step, [-8, -2], { "text-anchor": 'end' });
  },
  
  drawHorizontalLabels: function() {
    this.drawMarkers(this.options.labels, [1, 0], this.step, this.options.plot_padding, [0, (this.options.font_size + 7) * -1]);
  }
});

