var Ico = {
  Base: {},

  Normaliser: {},

  SparkLine: {},
  SparkBar: {},

  BaseGraph: {},
  LineGraph: {},
  BarGraph: {},
  HorizontalBarGraph: {}
}

/* Supporting methods to make dealing with arrays easier */
/* Note that some of this work to reduce framework dependencies */
Array.prototype.sum = function() {
	for (var i = 0, sum = 0; i < this.length; sum += this[i++]);
	return sum;
}

if (typeof Array.prototype.max == 'undefined') {
  Array.prototype.max = function() {
    return Math.max.apply({}, this)
  }
}

if (typeof Array.prototype.min == 'undefined') {
  Array.prototype.min = function() {
    return Math.min.apply({}, this)
  }
}

Array.prototype.mean = function() {
  return this.sum() / this.length;
}

Array.prototype.variance = function() {
  var mean = this.mean(),
      variance = 0;
  for (var i = 0; i < this.length; i++) {
    variance += Math.pow(this[i] - mean, 2);
  }
  return variance / (this.length - 1);
}

Array.prototype.standard_deviation = function() {
  return Math.sqrt(this.variance());
}

Ico.Normaliser = Class.create({
  initialize: function(data, options) {
    this.options = {
      start_value: null
    };
    Object.extend(this.options, options || { });

    this.min = data.min();
    this.max = data.max();
    this.standard_deviation = data.standard_deviation();
    this.range = 0;
    this.step = this.labelStep(this.max - this.min);
    this.start_value = this.calculateStart();
    this.process();
  },

  calculateStart: function() {
    var min = this.options.start_value != null && this.min >= 0 ? this.options.start_value : this.min;
    start_value = this.round(min, 1);

    /* This is a boundary condition */
    if (this.min > 0 && start_value > this.min) {
      return 0;
    }

    return start_value;
  },

  /* Given a value, this method rounds it to the nearest good value for an origin */
  round: function(value, offset) {
    offset = offset || 1;
    roundedValue = value;

    if (this.standard_deviation > 0.1) {
      var multiplier = Math.pow(10, -offset);
      roundedValue = Math.round(value * multiplier) / multiplier;

      if (roundedValue > this.min) {
        return this.round(value - this.step);
      }
    }
    return roundedValue;
  },

  process: function() {
    this.range = this.max - this.start_value;
    this.step = this.labelStep(this.range);
  },

  labelStep: function(value) {
    return Math.pow(10, (Math.log(value) / Math.LN10).round() - 1)
  }
});

Ico.Base = Class.create({
  normaliseData: function(data) {
    return $A(data).collect(function(value) {
      return this.normalise(value);
    }.bind(this))
  }
});

Ico.SparkLine = Class.create(Ico.Base, {
  initialize: function(element, data, options) {
    this.element = element;
    this.data = data;

    this.options = {
      width:                  parseInt(element.getStyle('width')),
      height:                 parseInt(element.getStyle('height')),
      highlight:              false,
      background_colour:      element.getStyle('backgroundColor'),
      colour:                 '#036'
    };
    Object.extend(this.options, options || { });

    this.step = this.calculateStep();
    this.paper = Raphael(this.element, this.options['width'], this.options['height']);
    if (this.options['acceptable_range']) {
      this.background = this.paper.rect(0, this.options['height'] - this.normalise(this.options['acceptable_range'][1]),
                                        this.options['width'], this.options['height'] - this.normalise(this.options['acceptable_range'][0]));
    } else {
      this.background = this.paper.rect(0, 0, this.options['width'], this.options['height']);
    }
    this.background.attr({fill: this.options['background_colour'], stroke: 'none' });
    this.draw();
  },
  
  calculateStep: function() {
    return this.options['width'] / (this.data.length - 1);
  },

  normalise: function(value) {
    return (this.options['height'] / this.data.max()) * value;
  },
  
  draw: function() {
    var data = this.normaliseData(this.data);
    
    this.drawLines('', this.options['colour'], data);
    
    if (this.options['highlight']) {
      this.showHighlight(data);
    }
  },
  
  drawLines: function(label, colour, data) {
    var line = this.paper.path({ stroke: colour }).moveTo(0, this.options['height'] - data.first());
    var x = 0;
    data.slice(1).each(function(value) {
      x = x + this.step;
      line.lineTo(x, this.options['height'] - value);
    }.bind(this))
  },
  
  showHighlight: function(data) {
    var size = 2,
        x = this.options['width'] - size,
        i = this.options['highlight']['index'] || data.length - 1,
        y = data[i] + ((size / 2).round());

    // Find the x position if it's not the last value
    if (typeof(this.options['highlight']['index']) != 'undefined') {
      x = this.step * this.options['highlight']['index'];
    }

    var circle = this.paper.circle(x, this.options['height'] - y, size);
    circle.attr({ stroke: false, fill: this.options['highlight']['colour']})
  }
});

Ico.SparkBar = Class.create(Ico.SparkLine, {
  calculateStep: function() {
    return this.options['width'] / this.data.length;
  },

  drawLines: function(label, colour, data) {
    var width = this.step > 2 ? this.step - 1 : this.step;
    var x = width;
    var line = this.paper.path({ stroke: colour, 'stroke-width': width });
    data.each(function(value) {
      line.moveTo(x, this.options['height'] - value)
      line.lineTo(x, this.options['height']);
      x = x + this.step;
    }.bind(this))
  }
})

Ico.BaseGraph = Class.create(Ico.Base, {
  initialize: function(element, data, options) {
    this.element = element;

    this.data_sets = Object.isArray(data) ? new Hash({ one: data }) : $H(data);
    this.flat_data = this.data_sets.collect(function(data_set) { return data_set[1] }).flatten();

    this.normaliser = new Ico.Normaliser(this.flat_data, this.normaliserOptions());
    this.label_step = this.normaliser.step;
    this.range = this.normaliser.range;
    this.start_value = this.normaliser.start_value;
    this.data_size = this.longestDataSetLength();

    /* If one colour is specified, map it to a compatible set */
    if (options && options['colour']) {
      options['colours'] = {};
      this.data_sets.keys().each(function(key) {
        options['colours'][key] = options['colour'];
      });
    }

    this.options = {
      width:                  parseInt(element.getStyle('width')),
      height:                 parseInt(element.getStyle('height')),
      labels:                 $A($R(1, this.data_size)),            // Label data
      plot_padding:           10,                                   // Padding for the graph line/bar plots
      font_size:              10,                                   // Label font size
      show_horizontal_labels: true,
      show_vertical_labels:   true,
      colours:                this.makeRandomColours(),             // Line colours
      background_colour:      element.getStyle('backgroundColor'),
      label_colour:           '#666',                               // Label text colour
      markers:                false,                                // false, circle
      marker_size:            5,
      meanline:               false,
      grid:                   false,
      grid_colour:            '#ccc',
      y_padding_top:          20
    };
    Object.extend(this.options, this.chartDefaults() || { });
    Object.extend(this.options, options || { });
    
    /* Padding around the graph area to make room for labels */
    this.x_padding_left = 10 + this.paddingLeftOffset();
    this.x_padding_right = 20;
    this.x_padding = this.x_padding_left + this.x_padding_right;
    this.y_padding_top = this.options['y_padding_top'];
    this.y_padding_bottom = 20 + this.paddingBottomOffset();
    this.y_padding = this.y_padding_top + this.y_padding_bottom;
    
    this.graph_width = this.options['width'] - (this.x_padding);
    this.graph_height = this.options['height'] - (this.y_padding);

    this.step = this.calculateStep();

    /* Calculate how many labels are required */
    this.y_label_count = (this.range / this.label_step).ceil();
    if ((this.normaliser.min + (this.y_label_count * this.normaliser.step)) < this.normaliser.max) {
      this.y_label_count += 1;
    }
    this.value_labels = this.makeValueLabels(this.y_label_count);
    this.top_value = this.value_labels.last();

    /* Grid control options */
    this.grid_start_offset = -1;

    /* Drawing */
    this.paper = Raphael(this.element, this.options['width'], this.options['height']);
    this.background = this.paper.rect(this.x_padding_left, this.y_padding_top, this.graph_width, this.graph_height);
    this.background.attr({fill: this.options['background_colour'], stroke: 'none' });

    if (this.options['meanline'] === true) {
      this.options['meanline'] = { 'stroke-width': '2px', stroke: '#BBBBBB' };
    }

    this.setChartSpecificOptions();
    this.draw();
  },

  normaliserOptions: function() {
    return {};
  },
  
  chartDefaults: function() {
    /* Define in child class */
  },
 
  drawPlot: function(index, cursor, x, y, colour) {
    /* Define in child class */
  },
  
  drawHorizontalLabels: function() {
    /* Define in child class */
  },

  calculateStep: function() {
    /* Define in child classes */
  },
  
  makeRandomColours: function(number) {
    var colours = {};
    this.data_sets.each(function(data) {
      colours[data[0]] = Raphael.hsb2rgb(Math.random(), 1, .75).hex;
    });
    return colours;
  },
  
  longestDataSetLength: function() {
    var length = 0;
    this.data_sets.each(function(data_set) { 
      length = data_set[1].length > length ? data_set[1].length : length;
    });
    return length;
  },
  
  roundValue: function(value, length) {
    var multiplier = Math.pow(10, length);
    value *= multiplier;
    value = Math.round(value) / multiplier;
    return value;
  },
  
  roundValues: function(data, length) {
    return $A(data).collect(function(value) { return this.roundValue(value, length) }.bind(this));
  },
  
  paddingLeftOffset: function() {
    /* Find the longest label and multiply it by the font size */
    var data = this.flat_data;

    // Round values
    data = this.roundValues(data, 2);
    
    var longest_label_length = $A(data).sort(function(a, b) { return a.toString().length < b.toString().length }).first().toString().length;
    longest_label_length = longest_label_length > 2 ? longest_label_length - 1 : longest_label_length;
    return longest_label_length * this.options['font_size'];
  },
  
  paddingBottomOffset: function() {
    /* Find the longest label and multiply it by the font size */
    return this.options['font_size'];
  },
  
  normalise: function(value) {
    var total = this.start_value == 0 ? this.top_value : this.range;
    return ((value / total) * (this.graph_height));
  },
  
  draw: function() {
    if (this.options['grid']) {
      this.drawGrid();
    }

    if (this.options['meanline']) {
      this.drawMeanLine(this.normaliseData(this.flat_data));
    }

    this.drawAxis();
    
    if (this.options['show_vertical_labels']) {
      this.drawVerticalLabels();
    }
    
    if (this.options['show_horizontal_labels']) {
      this.drawHorizontalLabels();
    }

    this.data_sets.each(function(data, index) {
      this.drawLines(data[0], this.options['colours'][data[0]], this.normaliseData(data[1]));
    }.bind(this));
    
    if (this.start_value != 0) {
      this.drawFocusHint();
    }
  },

  drawGrid: function() {
    var path = this.paper.path({ stroke: this.options['grid_colour'], 'stroke-width': '1px' });

    if (this.options['show_vertical_labels']) {
      var y = this.graph_height + this.y_padding_top;
      for (i = 0; i < this.y_label_count; i++) {
        y = y - (this.graph_height / this.y_label_count);
        path.moveTo(this.x_padding_left, y);
        path.lineTo(this.x_padding_left + this.graph_width, y);
      }
    }
 
    if (this.options['show_horizontal_labels']) {
      var x = this.x_padding_left + this.options['plot_padding'] + this.grid_start_offset,
          x_labels = this.options['labels'].length;
      for (i = 0; i < x_labels; i++) {
        path.moveTo(x, this.y_padding_top);
        path.lineTo(x, this.y_padding_top + this.graph_height);
        x = x + this.step;
      }

      x = x - this.options['plot_padding'] - 1;
      path.moveTo(x, this.y_padding_top);
      path.lineTo(x, this.y_padding_top + this.graph_height);
    }
  },

  drawLines: function(label, colour, data) {
    var coords = this.calculateCoords(data);
    var cursor = this.paper.path({stroke: colour, 'stroke-width': '3px'});

    $A(coords).each(function(coord, index) {
      var x = coord[0],
          y = coord[1];
      
      this.drawPlot(index, cursor, x, y, colour);
    }.bind(this))
  },

  calculateCoords: function(data) {
    var x = this.x_padding_left + this.options['plot_padding'] - this.step;
    var y_offset = (this.graph_height + this.y_padding_top) + this.normalise(this.start_value);

    return $A(data).collect(function(value) {
      var y = y_offset - value;
      x = x + this.step;
      return [x, y];
    }.bind(this))
  },

  drawFocusHint: function() {
    var length = 5,
        x = this.x_padding_left + (length / 2) - 1,
        y = this.options['height'] - this.y_padding_bottom;
    var cursor = this.paper.path({stroke: this.options['label_colour'], 'stroke-width': 2});
    
    cursor.moveTo(x, y);
    cursor.lineTo(x - length, y - length);
    cursor.moveTo(x, y - length);
    cursor.lineTo(x - length, y - (length * 2));
  },

  drawMeanLine: function(data) {
    var cursor = this.paper.path(this.options['meanline']);
    var offset = $A(data).inject(0, function(value, sum) { return sum + value }) / data.length;
 
    cursor.moveTo(this.x_padding_left - 1, this.options['height'] - this.y_padding_bottom - offset);
    cursor.lineTo(this.graph_width + this.x_padding_left, this.options['height'] - this.y_padding_bottom - offset);
  },

  drawAxis: function() {
    var cursor = this.paper.path({stroke: this.options['label_colour']});

    cursor.moveTo(this.x_padding_left - 1, this.options['height'] - this.y_padding_bottom);
    cursor.lineTo(this.graph_width + this.x_padding_left, this.options['height'] - this.y_padding_bottom);
    
    cursor.moveTo(this.x_padding_left - 1, this.options['height'] - this.y_padding_bottom);
    cursor.lineTo(this.x_padding_left - 1, this.y_padding_top);
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
        y = this.options['height'] - this.y_padding_bottom + y_offset(start_offset);
    
    var cursor = this.paper.path({stroke: this.options['label_colour']});
    
    font_options = {"font": this.options['font_size'] + 'px "Arial"', stroke: "none", fill: "#000"};
    Object.extend(font_options, extra_font_options || {});
    
    labels.each(function(label) {
      cursor.moveTo(x, y);
      if (label != null && (label + '').length > 0) {
        cursor.lineTo(x + y_offset(5), y + x_offset(5));
        this.paper.text(x + font_offsets[0], y - font_offsets[1], label).attr(font_options).toFront();
      }
      x = x + x_offset(step);
      y = y + y_offset(step);
    }.bind(this));
  },
  
  drawVerticalLabels: function() {
    var y_step = this.graph_height / this.y_label_count; 
    this.drawMarkers(this.value_labels, [0, -1], y_step, y_step, [-8, -2], { "text-anchor": 'end' });
  },
  
  drawHorizontalLabels: function() {
    this.drawMarkers(this.options['labels'], [1, 0], this.step, this.options['plot_padding'], [0, (this.options['font_size'] + 7) * -1]);
  }
});

Ico.LineGraph = Class.create(Ico.BaseGraph, {
  normalise: function(value) {
    var total = this.start_value == 0 ? this.top_value : this.top_value - this.start_value;
    return ((value / total) * (this.graph_height));
  },

  chartDefaults: function() {
    return { plot_padding: 10 };
  },

  setChartSpecificOptions: function() {
    if (typeof(this.options['curve_amount']) == 'undefined') {
      this.options['curve_amount'] = 10;
    }
  },
  
  calculateStep: function() {
    return (this.graph_width - (this.options['plot_padding'] * 2)) / (this.data_size - 1);
  },

  startPlot: function(cursor, x, y, colour) {
    cursor.moveTo(x, y);
  },

  drawPlot: function(index, cursor, x, y, colour) {
    if (this.options['markers'] == 'circle') {
      var circle = this.paper.circle(x, y, this.options['marker_size']);
      circle.attr({ 'stroke-width': '1px', stroke: this.options['background_colour'], fill: colour });
    }
    
    if (index == 0) {
      return this.startPlot(cursor, x, y, colour);
    }

    if (this.options['curve_amount']) {
      cursor.cplineTo(x, y, this.options['curve_amount']);
    } else {
      cursor.lineTo(x, y);
    }
  }
});

Ico.BarGraph = Class.create(Ico.BaseGraph, {
  chartDefaults: function() {
    return { plot_padding: 0 };
  },

  normaliserOptions: function() {
    return { start_value: 0 };
  },
  
  setChartSpecificOptions: function() {
    this.bar_padding = 5;
    this.bar_width = this.calculateBarWidth();
    this.options['plot_padding'] = (this.bar_width / 2);
    this.step = this.calculateStep();
    this.grid_start_offset = this.bar_padding - 1;
  },
  
  calculateBarWidth: function() {
    return (this.graph_width / this.data_size) - this.bar_padding;
  },
  
  calculateStep: function() {
    return (this.graph_width - (this.options['plot_padding'] * 2) - (this.bar_padding * 2)) / (this.data_size - 1);
  },
 
  drawPlot: function(index, cursor, x, y, colour) {
    var start_y = this.options['height'] - this.y_padding_bottom;
    x = x + this.bar_padding;
    cursor.moveTo(x, start_y);
    cursor.attr({stroke: colour, 'stroke-width': this.bar_width + 'px'});
    cursor.lineTo(x, y);
    x = x + this.step;
    cursor.moveTo(x, start_y);
  },

  /* Change the standard options to correctly offset against the bars */
  drawHorizontalLabels: function() {
    var x_start = this.bar_padding + this.options['plot_padding'];
    this.drawMarkers(this.options['labels'], [1, 0], this.step, x_start, [0, (this.options['font_size'] + 7) * -1]);
  }
});

Ico.HorizontalBarGraph = Class.create(Ico.BarGraph, {
  setChartSpecificOptions: function() {
    // Approximate the width required by the labels
    this.x_padding_left = 20 + this.longestLabel() * (this.options['font_size'] / 2);
    this.bar_padding = 5;
    this.bar_width = this.calculateBarHeight();
    this.options['plot_padding'] = 0;
    this.step = this.calculateStep();
  },

  normalise: function(value) {
    var offset = this.x_padding_left;
    return ((value / this.range) * (this.graph_width - offset));
  },

  longestLabel: function() {
    return $A(this.options['labels']).sort(function(a, b) { return a.toString().length < b.toString().length }).first().toString().length;
  },

  /* Height */
  calculateBarHeight: function() {
    return (this.graph_height / this.data_size) - this.bar_padding;
  },
  
  calculateStep: function() {
    return (this.graph_height - (this.options['plot_padding'] * 2)) / (this.data_size);
  },
  
  drawLines: function(label, colour, data) {
    var x = this.x_padding_left + this.options['plot_padding'];
    var y = this.options['height'] - this.y_padding_bottom - (this.step / 2);
    var cursor = this.paper.path({stroke: colour, 'stroke-width': this.bar_width + 'px'}).moveTo(x, y);

    $A(data).each(function(value) {;
      cursor.lineTo(x + value - this.normalise(this.start_value), y);
      y = y - this.step;
      cursor.moveTo(x, y)
    }.bind(this))
  },

  /* Horizontal version */
  drawFocusHint: function() {
    var length = 5,
        x = this.x_padding_left + (this.step * 2),
        y = this.options['height'] - this.y_padding_bottom;
    var cursor = this.paper.path({stroke: this.options['label_colour'], 'stroke-width': 2});
    
    cursor.moveTo(x, y);
    cursor.lineTo(x - length, y + length);
    cursor.moveTo(x - length, y);
    cursor.lineTo(x - (length * 2), y + length);
  },
  
  drawVerticalLabels: function() {
    var y_start = (this.step / 2) - this.options['plot_padding'];
    this.drawMarkers(this.options['labels'], [0, -1], this.step, y_start, [-8, -(this.options['font_size'] / 5)], { "text-anchor": 'end' });
  },
  
  drawHorizontalLabels: function() {
    var x_step = this.graph_width / this.y_label_count,
        x_labels = this.makeValueLabels(this.y_label_count);
    this.drawMarkers(x_labels, [1, 0], x_step, x_step, [0, (this.options['font_size'] + 7) * -1]);
  }
});
