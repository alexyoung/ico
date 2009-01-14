/* Returns a suitable set of labels for given data points on the Y axis */
function labelStep(data) {
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

var Sparkline = Class.create({
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

var SparkBar = Class.create(Sparkline, {
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

var BaseGraph = Class.create({
  initialize: function(element, data, options) {
    this.element = element;

    this.data_sets = Object.isArray(data) ? new Hash({ one: data }) : $H(data);
    this.flat_data = this.data_sets.collect(function(data_set) { return data_set[1] }).flatten();
    this.range = this.calculateRange();
    this.data_size = this.longestdata_setLength();
    
    this.options = {
      width:                  parseInt(element.getStyle('width')),
      height:                 parseInt(element.getStyle('height')),
      labels:                 $A($R(1, this.data_size)),             // Label data
      plot_padding:           10,                                   // Padding for the graph line/bar plots
      font_size:              10,                                   // Label font size
      show_horizontal_labels: true,
      show_vertical_labels:   true,
      colours:                this.makeRandomColours(),             // Line colours
      background_colour:      element.getStyle('backgroundColor'),
      label_colour:           '#666'                                // Label text colour
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
    this.paper = Raphael(this.element, this.options['width'], this.options['height']);
    this.background = this.paper.rect(this.x_padding_left, this.y_padding_top, this.graph_width, this.graph_height);
    this.background.attr({fill: this.options['background_colour'], stroke: null });
    
    this.setChartSpecificOptions();
    this.draw();
  },
  
  chartDefaults: function() {
    /* Define in child class */
  },
  
  drawLines: function(label, colour, data) {
    /* Define in child class */
  },
  
  drawVerticalLabels: function() {
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
  
  longestdata_setLength: function() {
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
    this.max = ranges.sort(function(a, b) { return a[0] > b[0] }).first().first();
    this.min = ranges.sort(function(a, b) { return a[1] < b[1] }).first().last();

    return this.max - this.min;
  },
  
  normaliseData: function(data) {
    return $A(data).collect(function(value) {
      return this.normalise(value);
    }.bind(this))
  },
  
  normalise: function(value) {
    if (this.range  < 5) {
      return (this.graph_height - this.options['plot_padding']) * value;
    } else {
      return ((this.graph_height - this.options['plot_padding']) / this.max) * value;
    }
  },
  
  draw: function() {
    this.data_sets.each(function(data, index) {
      this.drawLines(data[0], this.options['colours'][data[0]], this.normaliseData(data[1]));
    }.bind(this));
    
    if (this.options['show_vertical_labels']) {
      this.drawVerticalLabels();
    }
    
    if (this.options['show_horizontal_labels']) {
      this.drawHorizontalLabels();
    }
  }
});


var LineGraph = Class.create(BaseGraph, {
  chartDefaults: function() {
    return { plot_padding: 10 };
  },

  setChartSpecificOptions: function() {
    this.curve_amount = 10;
  },
  
  calculateStep: function() {
    return (this.graph_width - (this.options['plot_padding'] * 2)) / (this.data_size - 1);
  },
  
  drawLines: function(label, colour, data) {
    var x = this.x_padding_left + this.options['plot_padding'];
    var cursor = this.paper.path({stroke: colour, 'stroke-width': '3px'}).moveTo(x, this.options['height'] - data.first() - this.y_padding_bottom);
    
    $A(data.slice(1)).each(function(value) {
      x = x + this.step;
      if (this.curve_amount) {
        cursor.cplineTo(x, this.options['height'] - value - this.y_padding_bottom, this.curve_amount);
      } else {
        cursor.lineTo(x, this.options['height'] - value - this.y_padding_bottom);
      }
    }.bind(this))
  },
  
  drawVerticalLabels: function() {
    var step = labelStep(this.flat_data),
        normalised_step = this.normalise(step),
        x = this.x_padding_left - 1,
        y = this.options['height'] - this.y_padding_bottom,
        top = this.y_padding_top + normalised_step,
        label = 0;
    var cursor = this.paper.path({stroke: this.options['label_colour']});
    
    cursor.moveTo(x, y + 1);
    cursor.lineTo(x, this.y_padding_top);
    
    while (y > top) {
      y = y - normalised_step;
      label = this.roundValue((label + step), 2);

      cursor.moveTo(x, y);
      cursor.lineTo(x - 5, y);
      this.paper.text(x - 8, y + 2, label).attr({"text-anchor": 'end', "font": this.options['font_size'] + 'px "Arial"', stroke: "none", fill: "#000"}).toBack();
    }
  },
  
  drawHorizontalLabels: function() {
    var limit = this.graph_width + this.x_padding_left,
        x = this.x_padding_left + this.options['plot_padding'],
        y = this.options['height'] - this.y_padding_bottom + 1;
    var cursor = this.paper.path({stroke: this.options['label_colour']});
    
    cursor.moveTo(this.x_padding_left - 1, y);
    cursor.lineTo(this.graph_width + this.x_padding_left, y);
      
    for (var i = 0; x < limit; i++) {
      cursor.moveTo(x, y);
      cursor.lineTo(x, y + 5);
      this.paper.text(x, y + this.options['font_size'] + 7, this.options['labels'][i]).attr({"font": this.options['font_size'] + 'px "Arial"', stroke: "none", fill: "#000"}).toBack();
      x = x + this.step;
    }
  }
});

/* This is based on the line graph, I can probably inherit from a shared class here */
var BarGraph = Class.create(BaseGraph, {
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
  
  drawLines: function(label, colour, data) {
    var x = this.x_padding_left + this.options['plot_padding'] + this.bar_padding;
    var start_y = this.options['height'] - this.y_padding_bottom;
    var cursor = this.paper.path({stroke: colour, 'stroke-width': this.bar_width + 'px'}).moveTo(x, start_y);
    
    $A(data).each(function(value) {
      cursor.lineTo(x, this.options['height'] - value - this.y_padding_bottom);
      x = x + this.step;
      cursor.moveTo(x, start_y)
    }.bind(this))
  },
  
  drawVerticalLabels: function() {
    var step = labelStep(this.flat_data),
        normalised_step = this.normalise(step),
        x = this.x_padding_left - 1,
        y = this.options['height'] - this.y_padding_bottom,
        top = this.y_padding_top + normalised_step,
        label = 0;
    var cursor = this.paper.path({stroke: this.options['label_colour']});
    
    cursor.moveTo(x, y + 1);
    cursor.lineTo(x, this.y_padding_top);
    
    while (y > top) {
      y = y - normalised_step;
      label = this.roundValue((label + step), 2);
      
      cursor.moveTo(x, y);
      cursor.lineTo(x - 5, y);
      this.paper.text(x - 8, y + 2, label).attr({"text-anchor": 'end', "font": this.options['font_size'] + 'px "Arial"', stroke: "none", fill: "#000"}).toBack();
    }
  },
  
  drawHorizontalLabels: function() {
    var limit = this.graph_width + this.x_padding_left,
        x = this.x_padding_left + this.options['plot_padding'] + this.bar_padding,
        y = this.options['height'] - this.y_padding_bottom + 1;
    var cursor = this.paper.path({stroke: this.options['label_colour']});
    
    cursor.moveTo(this.x_padding_left - 1, y);
    cursor.lineTo(this.graph_width + this.x_padding_left, y);
      
    for (var i = 0; x < limit; i++) {
      cursor.moveTo(x, y);
      cursor.lineTo(x, y + 5);
      this.paper.text(x, y + this.options['font_size'] + 7, this.options['labels'][i]).attr({"font": this.options['font_size'] + 'px "Arial"', stroke: "none", fill: "#000"}).toBack();
      x = x + this.step;
    }
  }
});

/* This is based on the line graph, I can probably inherit from a shared class here */
var HorizontalBarGraph = Class.create(BarGraph, {
  setChartSpecificOptions: function() {
    // Approximate the width required by the labels
    this.x_padding_left = 12 + this.longestLabel() * (this.options['font_size'] / 2);
    this.bar_padding = 5;
    this.bar_width = this.calculateBarHeight();
    this.options['plot_padding'] = 0;
    this.step = this.calculateStep();
  },

  normalise: function(value) {
    if (this.range  < 5) {
      return (this.graph_width - this.options['plot_padding'] - this.x_padding_left) * value;
    } else {
      return ((this.graph_width - this.options['plot_padding'] - this.x_padding_left) / this.max) * value;
    }
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
      cursor.lineTo(x + value, y);
      y = y - this.step;
      cursor.moveTo(x, y)
    }.bind(this))
  },

  drawVerticalLabels: function() {
    var step = this.step,
        x = this.x_padding_left - 1,
        y = this.options['height'] - this.y_padding_bottom;
    var cursor = this.paper.path({stroke: this.options['label_colour']});
    
    cursor.moveTo(x, y + 1);
    cursor.lineTo(x, this.y_padding_top);

    for (var i = 0; i < this.options['labels'].length; i++) {
      var offset_y = y - (step / 2);
      var label = this.options['labels'][i];

      cursor.moveTo(x, offset_y);
      cursor.lineTo(x - 5, offset_y);
      
      this.paper.text(x - 8, offset_y, label).attr({"text-anchor": 'end', "font": this.options['font_size'] + 'px "Arial"', stroke: "none", fill: "#000"});
      
      y = y - step;
    }
  },
  
  drawHorizontalLabels: function() {
    var step = labelStep(this.flat_data),
        normalised_step = this.normalise(step),
        limit = this.graph_width - normalised_step,
        x = this.x_padding_left,
        y = this.options['height'] - this.y_padding_bottom + 1,
        label = 0;
    var cursor = this.paper.path({stroke: this.options['label_colour']});
    
    cursor.moveTo(this.x_padding_left - 1, y);
    cursor.lineTo(this.graph_width + this.x_padding_right, y);

    for (var i = 0; x < limit; i++) {
      x += normalised_step;

      label = this.roundValue(label + step, 2);
      cursor.moveTo(x, y);
      cursor.lineTo(x, y + 5);
      this.paper.text(x, y + this.options['font_size'] + 7, label).attr({"font": this.options['font_size'] + 'px "Arial"', stroke: "none", fill: "#000"}).toBack();
    }
  }
});