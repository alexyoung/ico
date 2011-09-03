/*!
 * Ico
 * Copyright (C) 2009-2011 Alex R. Young
 * MIT Licensed
 */

/**
 * The Ico object.
 */
(function(global) {
  var Ico = {
    VERSION: '0.3.3',

    /**
     * Rounds a float to the specified number of decimal places.
     *
     * @param {Float} num A number to round
     * @param {Integer} dec The number of decimal places
     * @returns {Float} The rounded result
     */
    round: function(num, dec) {
      var result = Math.round(num * Math.pow(10, dec)) / Math.pow(10, dec);
      return result;
    }
  };

/**
 * Determines if a value is valid as a 'step' value.
 * Steps are the increments between each bar or line.
 *
 * @param {Integer} value A number to test
 * @returns {Integer} A valid step value
 */
function validStepDivider(value) {
  return value > 1 ? value - 1 : 1;
}

/**
 * Gets a CSS style property.
 *
 * @param {Object} el A DOM element
 * @param {String} styleProp The name of a style property
 * @returns {Object} The style value
 */
function getStyle(el, styleProp) {
  if (typeof window === 'undefined') return;

  var style;
  if (el.currentStyle) {
    style = el.currentStyle[styleProp];
  } else if (window.getComputedStyle) {
    style = document.defaultView.getComputedStyle(el, null).getPropertyValue(styleProp);
  }
  if (style && style.length === 0) {
    style = null;
  }
  return style;
}

var Helpers = {};

Helpers.sum = function(a) {
  for (var i = 0, sum = 0; i < a.length; sum += a[i++]) {}
  return sum;
};

if (typeof Array.prototype.max === 'undefined') {
  Helpers.max = function(a) {
    return Math.max.apply({}, a);
  };
} else {
  Helpers.max = function(a) {
    return a.max();
  };
}

if (typeof Array.prototype.min === 'undefined') {
  Helpers.min = function(a) {
    return Math.min.apply({}, a);
  };
} else {
  Helpers.min = function(a) {
    return a.min();
  };
}

Helpers.mean = function(a) {
  return Helpers.sum(a) / a.length;
};

Helpers.variance = function(a) {
  var mean = Helpers.mean(a),
      variance = 0;
  for (var i = 0; i < a.length; i++) {
    variance += Math.pow(a[i] - mean, 2);
  }
  return variance / (a.length - 1);
};

Helpers.standard_deviation = function(a) {
  return Math.sqrt(Helpers.variance(a));
};

if (typeof Object.extend === 'undefined') {
  Helpers.extend = function(destination, source) {
    for (var property in source) {
      if (source.hasOwnProperty(property)) {
        destination[property] = source[property];
      }
    }
    return destination;
  };
} else {
  Helpers.extend = Object.extend;
}
/**
 * Normalises lists of values to fit inside a graph.
 *
 * @param {Array} data A list of values
 * @param {Object} options Can be used to set the `start_value`
 */
Ico.Normaliser = function(data, options) {
  this.options = {
    start_value: null
  };

  if (typeof options !== 'undefined') {
    this.options = options;
  }

  this.min = Helpers.min(data);
  this.max = Helpers.max(data);
  this.standard_deviation = Helpers.standard_deviation(data);
  this.range = 0;
  this.step = this.labelStep(this.max - this.min);
  this.start_value = this.calculateStart();
  this.process();
};

Ico.Normaliser.prototype = {
  /**
   * Calculates the start value.  This is often 0.
   * @returns {Float} The start value 
   */
  calculateStart: function() {
    var min = typeof this.options.start_value !== 'undefined' && this.min >= 0 ? this.options.start_value : this.min,
        start_value = this.round(min, 1);

    /* This is a boundary condition */
    if (this.min > 0 && start_value > this.min) {
      return 0;
    }

    if (this.min === this.max) {
      return 0;
    }

    return start_value;
  },

  /* Given a value, this method rounds it to the nearest good value for an origin */
  round: function(value, offset) {
    offset = offset || 1;
    var roundedValue = value;

    if (this.standard_deviation > 0.1) {
      var multiplier = Math.pow(10, -offset);
      roundedValue = Math.round(value * multiplier) / multiplier;

      if (roundedValue > this.min) {
        return this.round(value - this.step);
      }
    }
    return roundedValue;
  },

  /**
   * Calculates the range and step values.
   */
  process: function() {
    this.range = this.max - this.start_value;
    this.step = this.labelStep(this.range);
  },

  /**
   * Calculates the label step value.
   *
   * @param {Float} value A value to convert to a label position
   * @returns {Float} The rounded label step result
   */
  labelStep: function(value) {
    return Math.pow(10, Math.round((Math.log(value) / Math.LN10)) - 1);
  }
};


/*!
 * Ico
 * Copyright (C) 2009-2011 Alex R. Young
 * MIT Licensed
 */

/**
 * The Ico.Base object which contains useful generic functions.
 */
Ico.Base = {
  /**
   * Runs this.normalise on each value.
   *
   * @param {Array} data Values to normalise
   * @returns {Array} Normalised values
   */
  normaliseData: function(data) {
    var values = [],
        i      = 0;
    for (i = 0; i < data.length; i++) {
      values.push(this.normalise(data[i]));
    }
    return values;
  },

  /**
   * Flattens objects into an array.
   *
   * @param {Object} data Values to flatten
   * @returns {Array} Flattened values
   */
  flatten: function(data) {
    var flat_data = [];

    if (typeof data.length === 'undefined') {
      if (typeof data === 'object') {
        for (var key in data) {
          if (data.hasOwnProperty(key))
            flat_data = flat_data.concat(this.flatten(data[key]));
        }
      } else {
        return [];
      }
    }

    for (var i = 0; i < data.length; i++) {
      if (typeof data[i].length === 'number') {
        flat_data = flat_data.concat(this.flatten(data[i]));
      } else {
        flat_data.push(data[i]);
      }
    }
    return flat_data;
  },

  /**
   * Handy method to produce an array of numbers.
   *
   * @param {Integer} start A number to start at
   * @param {Integer} end A number to end at
   * @returns {Array} An array of values
   */
  makeRange: function(start, end) {
    var values = [], i;
    for (i = start; i < end; i++) {
      values.push(i);
    }
    return values;
  }
};
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

/**
 * The BarGraph class.
 *
 * Example:
 * 
 *         new Ico.LineGraph($('linegraph_2'),
 *           [100, 10, 90, 20, 80, 30],
 *           { meanline: { stroke: '#AA0000' },
 *             grid: true } );
 *
 */
Ico.BarGraph = function() { this.initialize.apply(this, arguments); };
Helpers.extend(Ico.BarGraph.prototype, Ico.BaseGraph.prototype);
Helpers.extend(Ico.BarGraph.prototype, {
  /**
   * Sensible defaults for BarGraph.
   */
  chartDefaults: function() {
    return { plot_padding: 0 };
  },

  /**
   * Ensures the normalises is always 0.
   */
  normaliserOptions: function() {
    return { start_value: 0 };
  },

  /**
   * Options specific to BarGraph.
   */
  setChartSpecificOptions: function() {
    this.bar_padding = 5;
    this.bar_width = this.calculateBarWidth();
    this.options.plot_padding = (this.bar_width / 2);
    this.step = this.calculateStep();
    this.grid_start_offset = this.bar_padding - 1;
    this.start_y = this.options.height - this.y_padding_bottom;
  },

  /**
   * Calculates the width of each bar.
   *
   * @returns {Integer} The bar width
   */
  calculateBarWidth: function() {
    return (this.graph_width / this.data_size) - this.bar_padding;
  },

  /**
   * Calculates step used to move from one bar to another.
   * 
   * @returns {Float} The start value 
   */
  calculateStep: function() {
    return (this.graph_width - (this.options.plot_padding * 2) - (this.bar_padding * 2)) / validStepDivider(this.data_size);
  },

  /**
   * Generates paths for Raphael.
   *
   * @param {Integer} index The index of the data value to plot
   * @param {String} pathString The pathString so far
   * @param {Integer} x The x-coord to plot 
   * @param {Integer} y The y-coord to plot 
   * @param {String} colour A string that represents a colour
   * @returns {String} The resulting path string 
   */
  drawPlot: function(index, pathString, x, y, colour) {
    x = x + this.bar_padding;
    pathString += 'M' + x + ',' + this.start_y;
    pathString += 'L' + x + ',' + y;
    this.paper.path(pathString).attr({stroke: colour, 'stroke-width': this.bar_width + 'px'});
    pathString = '';
    x = x + this.step;
    pathString += 'M' + x + ',' + this.start_y;
    return pathString;
  },

  /* Change the standard options to correctly offset against the bars */
  drawHorizontalLabels: function() {
    var x_start = this.bar_padding + this.options.plot_padding;
    this.drawMarkers(this.options.labels, [1, 0], this.step, x_start, [0, (this.options.font_size + 7) * -1]);
  }
});

/**
 * Draws horizontal bar graphs.
 *
 * Example:
 *
 *       new Ico.HorizontalBarGraph(element,
 *          [2, 5, 1, 10, 15, 33, 20, 25, 1],
 *          { font_size: 14 });        
 * 
 */
Ico.HorizontalBarGraph = function() { this.initialize.apply(this, arguments); };
Helpers.extend(Ico.HorizontalBarGraph.prototype, Ico.BaseGraph.prototype);
Helpers.extend(Ico.HorizontalBarGraph.prototype, {
  setChartSpecificOptions: function() {
    // Approximate the width required by the labels
    this.y_padding_top = 0;
    this.x_padding_left = 20 + this.longestLabel() * (this.options.font_size / 2);
    this.bar_padding = 5;
    this.bar_width = this.calculateBarHeight();
    this.options.plot_padding = 0;
    this.step = this.calculateStep();
  },

  normalise: function(value) {
    var offset = this.x_padding_left;
    return ((value / this.range) * (this.graph_width - offset));
  },

  /* Height */
  calculateBarHeight: function() {
    return (this.graph_height / this.data_size) - this.bar_padding;
  },
  
  calculateStep: function() {
    return (this.options.height - this.y_padding_bottom) / validStepDivider(this.data_size);
  },
  
  drawLines: function(label, colour, data) {
    var x = this.x_padding_left + (this.options.plot_padding * 2),
        y = this.options.height - this.y_padding_bottom - (this.step / 2),
        pathString = 'M' + x + ',' + y,
        i;

    for (i = 0; i < data.length; i++) {
      pathString += 'L' + (x + data[i] - this.normalise(this.start_value)) + ',' + y;
      y = y - this.step;
      pathString += 'M' + x + ',' + y;
    }
    this.paper.path(pathString).attr({stroke: colour, 'stroke-width': this.bar_width + 'px'});
  },

  /* Horizontal version */
  drawFocusHint: function() {
    var length = 5,
        x = this.x_padding_left + (this.step * 2),
        y = this.options.height - this.y_padding_bottom,
        pathString = '';
    
    pathString += 'M' + x + ',' + y;
    pathString += 'L' + (x - length) + ',' + (y + length);
    pathString += 'M' + (x - length) + ',' + y;
    pathString += 'L' + (x - (length * 2)) + ',' + (y + length);
    this.paper.path(pathString).attr({stroke: this.options.label_colour, 'stroke-width': 2});
  },
  
  drawVerticalLabels: function() {
    var y_start = (this.step / 2) - (this.options.plot_padding * 2);
    this.drawMarkers(this.options.labels, [0, -1], this.step, y_start, [-8, (this.options.font_size / 8)], { 'text-anchor': 'end' });
  },
  
  drawHorizontalLabels: function() {
    var x_step = this.graph_width / this.y_label_count,
        x_labels = this.makeValueLabels(this.y_label_count);
    this.drawMarkers(x_labels, [1, 0], x_step, x_step, [0, (this.options.font_size + 7) * -1]);
  }
});

/**
 * Draws line graphs.
 *
 * Example:
 *
 *        new Ico.LineGraph(element, [10, 5, 22, 44, 4]); 
 * 
 */
Ico.LineGraph = function() { this.initialize.apply(this, arguments); };
Helpers.extend(Ico.LineGraph.prototype, Ico.BaseGraph.prototype);
Helpers.extend(Ico.LineGraph.prototype, {
  normalise: function(value) {
    var total = this.start_value === 0 ? this.top_value : this.top_value - this.start_value;
    return ((value / total) * (this.graph_height));
  },

  chartDefaults: function() {
    return { plot_padding: 10 };
  },

  setChartSpecificOptions: function() {
    // Approximate the width required by the labels
    var longestLabel = this.longestLabel(this.value_labels);
    this.x_padding_left = 30 + longestLabel * (this.options.font_size / 2);

    if (typeof this.options.curve_amount === 'undefined') {
      this.options.curve_amount = 10;
    }
  },

  normaliserOptions: function() {
    return { start_value: this.options.start_value };
  },

  calculateStep: function() {
    return (this.graph_width - (this.options.plot_padding * 2)) / validStepDivider(this.data_size);
  },

  startPlot: function(pathString, x, y, colour) {
    this.lastPoint = { x: x, y: y }; 
    return pathString + 'M' + x + ',' + y;
  },

  drawPlot: function(index, pathString, x, y, colour) {
    var w = this.options.curve_amount;

    if (this.options.markers === 'circle') {
      var circle = this.paper.circle(x, y, this.options.marker_size);
      circle.attr({ 'stroke-width': '1px', stroke: this.options.background_colour, fill: colour });
    }
    
    if (index === 0) {
      return this.startPlot(pathString, x, y, colour);
    }

    if (w) {
      pathString += ['C', this.lastPoint.x + w, this.lastPoint.y, x - w, y, x, y];
    } else {
      pathString += 'L' + x + ',' + y;
    }

    this.lastPoint = { x: x, y: y };
    return pathString;
  }
});

/**
 * Draws spark line graphs.
 *
 * Example:
 *
 *         new Ico.SparkLine(element,
 *           [21, 41, 32, 1, 10, 5, 32, 10, 23],
 *           { width: 30, height: 14,
 *             background_colour: '#ccc' });
 *        
 * 
 */
Ico.SparkLine = function() { this.initialize.apply(this, arguments); };
Ico.SparkLine.prototype = {
  initialize: function(element, data, options) {
    this.element = element;
    this.data = data;
    this.options = {
      width:             parseInt(getStyle(element, 'width'), 10),
      height:            parseInt(getStyle(element, 'height'), 10),
      highlight:         false,
      background_colour: getStyle(element, 'backgroundColor') || '#ffffff',
      colour:            '#036'
    };
    Helpers.extend(this.options, options || { });

    this.step = this.calculateStep();
    this.paper = Raphael(this.element, this.options.width, this.options.height);

    if (this.options.acceptable_range) {
      this.background = this.paper.rect(0, this.options.height - this.normalise(this.options.acceptable_range[1]),
                                           this.options.width,
                                           this.options.height - this.normalise(this.options.acceptable_range[0]));
    } else {
      this.background = this.paper.rect(0, 0, this.options.width, this.options.height);
    }

    this.background.attr({fill: this.options.background_colour, stroke: 'none' });
    this.draw();
  },

  calculateStep: function() {
    return this.options.width / validStepDivider(this.data.length);
  },

  normalise: function(value) {
    return (this.options.height / Helpers.max(this.data)) * value;
  },
  
  draw: function() {
    var data = this.normaliseData(this.data);
    this.drawLines('', this.options.colour, data);
    
    if (this.options.highlight) {
      this.showHighlight(data);
    }
  },
  
  drawLines: function(label, colour, data) {
    var pathString = '',
        x = 0,
        values = data.slice(1),
        i = 0;

    pathString = 'M0,' + (this.options.height - data[0]);
    for (i = 1; i < data.length; i++) {
      x = x + this.step;
      pathString += 'L' + x +',' + Ico.round(this.options.height - data[i], 2);
    }
    this.paper.path(pathString).attr({stroke: colour});
    this.lastPoint = { x: 0, y: this.options.height - data[0] };
  },
  
  showHighlight: function(data) {
    var size = 2,
        x = this.options.width - size,
        i = this.options.highlight.index || data.length - 1,
        y = data[i] + (Math.round(size / 2));

    if (typeof(this.options.highlight.index) !== 'undefined') {
      x = this.step * this.options.highlight.index;
    }

    var circle = this.paper.circle(x, this.options.height - y, size);
    circle.attr({ stroke: false, fill: this.options.highlight.colour});
  }
};
Helpers.extend(Ico.SparkLine.prototype, Ico.Base);

/**
 * Draws spark bar graphs.
 *
 * Example:
 *
 *         new Ico.SparkBar($('sparkline_2'),
 *           [1, 5, 10, 15, 20, 15, 10, 15, 30, 15, 10],
 *           { width: 30, height: 14, background_colour: '#ccc' });
 * 
 */
Ico.SparkBar = function() { this.initialize.apply(this, arguments); };
Helpers.extend(Ico.SparkBar.prototype, Ico.SparkLine.prototype);
Helpers.extend(Ico.SparkBar.prototype, {
  calculateStep: function() {
    return this.options.width / validStepDivider(this.data.length);
  },

  drawLines: function(label, colour, data) {
    var width = this.step > 2 ? this.step - 1 : this.step,
        x = width,
        pathString  = '',
        i = 0;
    for (i = 0; i < data.length; i++) {
      pathString += 'M' + x + ',' + (this.options.height - data[i]);
      pathString += 'L' + x + ',' + this.options.height;
      x = x + this.step;
    }
    this.paper.path(pathString).attr({ stroke: colour, 'stroke-width': width });
  }
});

  /**
   * Assign the Ico object as a global property.
   */
  global.Ico = Ico;

  if (typeof exports !== 'undefined') {
    module.exports = Ico;
  }
})(typeof window === 'undefined' ? this : window);

