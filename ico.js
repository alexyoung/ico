var Ico = {
  Base: {},
  
  SparkLine: {},
  SparkBar: {},

  BaseGraph: {},
  LineGraph: {},
  BarGraph: {},
  HorizontalBarGraph: {}
}

Ico.Base = Class.create({
  /* Returns a suitable set of labels for given data points on the Y axis */
  labelStep: function(data) {
    var min = data.min(),
        max = data.max(),
        range = max - min,
        step = 0;

    if (range < 2) {
      step = 0.1;
    } else if (range < 3) {
      step = 0.2;
    } else if (range < 5) {
      step = 0.5;
    } else if (range < 11) {
      step = 1;
    } else if (range < 50) {
      step = 5;
    } else if (range < 100) {
      step = 10;
    } else {
      step = Math.pow(10, (Math.log(range) / Math.LN10).round() - 1);
    }
    
    return step;
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
    this.background.attr({fill: this.options['background_colour'], stroke: null });
    this.draw();
  },
  
  calculateStep: function() {
    return this.options['width'] / (this.data.length - 1);
  },
  
  normalisedData: function() {
    return $A(this.data).collect(function(value) {
      return this.normalise(value);
    }.bind(this))
  },
  
  normalise: function(value) {
    return (this.options['height'] / this.data.max()) * value;
  },
  
  draw: function() {
    var data = this.normalisedData();
    
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
    this.range = this.calculateRange();
    this.data_size = this.longestDataSetLength();
    this.start_value = this.calculateStartValue();

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
      meanline:               false
    };
    Object.extend(this.options, this.chartDefaults() || { });
    Object.extend(this.options, options || { });
    
    /* Sets how curvy lines are */
    this.curve_amount = 10;
    
    /* Padding around the graph area to make room for labels */
    this.x_padding_left = 10 + this.paddingLeftOffset();
    this.x_padding_right = 20;
    this.x_padding = this.x_padding_left + this.x_padding_right;
    this.y_padding_top = 20;
    this.y_padding_bottom = 20 + this.paddingBottomOffset();
    this.y_padding = this.y_padding_top + this.y_padding_bottom;
    
    this.graph_width = this.options['width'] - (this.x_padding);
    this.graph_height = this.options['height'] - (this.y_padding);
    
    this.step = this.calculateStep();
    this.label_step = this.labelStep(this.flat_data);

    /* Calculate how many y labels are required */
    this.y_label_count = (this.range / this.label_step).round() + 1;

    this.paper = Raphael(this.element, this.options['width'], this.options['height']);
    this.background = this.paper.rect(this.x_padding_left, this.y_padding_top, this.graph_width, this.graph_height);
    this.background.attr({fill: this.options['background_colour'], stroke: null });

    if (this.options['meanline'] === true) {
      this.options['meanline'] = { 'stroke-width': '2px', stroke: '#BBBBBB' };
    }

    this.setChartSpecificOptions();
    this.draw();
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
  
  calculateStartValue: function() {
    var min = this.flat_data.min();
    return this.range < min || min < 0 ? min.round() : 0;
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
  
  /* Subtract the largest and smallest values from the data sets */
  calculateRange: function() {
    var ranges = this.data_sets.collect(function(data) {
      return [data[1].max(), data[1].min()];
    });
    this.max = ranges.sort(function(a, b) { return a[0] < b[0] }).first().first();
    this.min = ranges.sort(function(a, b) { return a[1] < b[1] }).first().last();
    return this.max - this.min;
  },
  
  normaliseData: function(data) {
    return $A(data).collect(function(value) {
      return this.normalise(value);
    }.bind(this))
  },
  
  normalise: function(value) {
    var offset = this.y_padding_bottom;
    return ((value / this.range) * (this.graph_height - offset));
  },
  
  draw: function() {
    if (this.options['meanline']) {
      this.drawMeanLine(this.normaliseData(this.flat_data));
    }

    this.data_sets.each(function(data, index) {
      this.drawLines(data[0], this.options['colours'][data[0]], this.normaliseData(data[1]));
    }.bind(this));
    
    this.drawAxis();
    
    if (this.options['show_vertical_labels']) {
      this.drawVerticalLabels();
    }
    
    if (this.options['show_horizontal_labels']) {
      this.drawHorizontalLabels();
    }
    
    if (this.start_value != 0) {
      this.drawFocusHint();
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
      cursor.lineTo(x + y_offset(5), y + x_offset(5));
      this.paper.text(x + font_offsets[0], y - font_offsets[1], label).attr(font_options).toFront();
      x = x + x_offset(step);
      y = y + y_offset(step);

    }.bind(this));
  },
  
  drawVerticalLabels: function() {
    var y_step = this.graph_height / this.y_label_count, 
        y_labels = this.makeValueLabels(this.y_label_count);
    this.drawMarkers(y_labels, [0, -1], y_step, y_step, [-8, -2], { "text-anchor": 'end' });
  },
  
  drawHorizontalLabels: function() {
    this.drawMarkers(this.options['labels'], [1, 0], this.step, this.options['plot_padding'], [0, (this.options['font_size'] + 7) * -1]);
  }
});


Ico.LineGraph = Class.create(Ico.BaseGraph, {
  chartDefaults: function() {
    return { plot_padding: 10 };
  },

  setChartSpecificOptions: function() {
    this.curve_amount = 10;
  },
  
  calculateStep: function() {
    return (this.graph_width - (this.options['plot_padding'] * 2)) / (this.data_size - 1);
  },

  startPlot: function(cursor, x, y, colour) {
    cursor.moveTo(x, y);
  },

  drawPlot: function(index, cursor, x, y, colour) {
    if (index == 0) {
      return this.startPlot(cursor, x, y, colour);
    }

    if (this.curve_amount) {
      cursor.cplineTo(x, y, this.curve_amount);
    } else {
      cursor.lineTo(x, y);
    }

    if (this.options['markers'] == 'circle') {
      var circle = this.paper.circle(x, y, this.options['marker_size']);
      circle.attr({ 'stroke-width': '1px', stroke: this.options['background_colour'], fill: colour });
    }
  }
});

/* This is based on the line graph, I can probably inherit from a shared class here */
Ico.BarGraph = Class.create(Ico.BaseGraph, {
  chartDefaults: function() {
    return { plot_padding: 0 };
  },
  
  setChartSpecificOptions: function() {
    this.bar_padding = 5;
    this.bar_width = this.calculateBarWidth();
    this.options['plot_padding'] = (this.bar_width / 2);
    this.step = this.calculateStep();
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

/* This is based on the line graph, I can probably inherit from a shared class here */
Ico.HorizontalBarGraph = Class.create(Ico.BarGraph, {
  setChartSpecificOptions: function() {
    // Approximate the width required by the labels
    this.x_padding_left = 12 + this.longestLabel() * (this.options['font_size'] / 2);
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
