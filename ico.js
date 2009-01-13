/* Returns a suitable set of labels for given data points on the Y axis */
function labelStep(data) {
  var min = data.min(),
      max = data.max(),
      range = max - min,
      step = 0;

  if (range < 2) {
    step = 0.1;
  } else if (range < 5) {
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
  initialize: function(element, data) {
    this.element = element;
    this.data = data;
    this.width = 30;
    this.height = 12;
    this.step = this.calculateStep();
    this.paper = Raphael(this.element, this.width, this.height);
    this.background = this.paper.rect(0, 0, this.width, this.height);
    this.background.attr({fill: "#ccc", stroke: null });
    this.draw();
  },
  
  calculateStep: function() {
    return this.width / (this.data.length - 1);
  },
  
  normalisedData: function() {
    return $A(this.data).collect(function(value) {
      return this.normalise(value);
    }.bind(this))
  },
  
  normalise: function(value) {
    return (this.height / this.data.max()) * value;
  },
  
  draw: function() {
    var data = this.normalisedData();
    var line = this.paper.path({stroke: "#036"}).moveTo(0, this.height - data.first());
    var x = 0;
    $A(data.slice(1)).each(function(value) {
      x = x + this.step;
      line.lineTo(x, this.height - value);
    }.bind(this))
  }
});


var LineGraph = Class.create({
  initialize: function(element, data, colours) {
    this.element = element;

    this.dataSets = Object.isArray(data) ? new Hash({ one: data }) : $H(data);
    this.flatData = this.dataSets.collect(function(dataSet) { return dataSet[1] }).flatten();
    this.range = this.calculateRange();
    this.dataSize = this.longestDataSetLength();
    this.showHorizontalLabels = true;
    this.showVerticalLabels = true;
    
    this.labels = $A($R(1, this.dataSize));
    
    this.width = parseInt(element.getStyle('width'));
    this.height = parseInt(element.getStyle('height'));
    
    /* Sets how curvy lines are */
    this.curve_amount = 10;
    
    /* Padding for the chart lines */
    this.plot_padding = 10;
    
    /* Label font size */
    this.fontSize = 10;
    
    /* Line colours */
    this.colours = colours ? colours : this.makeRandomColours();

    /* Padding around the graph area to make room for labels */
    this.x_padding_left = 10 + this.paddingLeftOffset();
    this.x_padding_right = 20;
    this.x_padding = this.x_padding_left + this.x_padding_right;
    this.y_padding_top = 20;
    this.y_padding_bottom = 20 + this.paddingBottomOffset();
    this.y_padding = this.y_padding_top + this.y_padding_bottom;
    
    this.label_colour = '#666';
    
    this.graph_width = this.width - (this.x_padding);
    this.graph_height = this.height - (this.y_padding);
    
    this.step = this.calculateStep();
    this.paper = Raphael(this.element, this.width, this.height);
    this.background = this.paper.rect(this.x_padding_left, this.y_padding_top, this.graph_width, this.graph_height);
    this.background.attr({fill: "#fff", stroke: null });
    this.draw();
  },
  
  makeRandomColours: function(number) {
    var colours = {};
    this.dataSets.each(function(data) {
      colours[data[0]] = Raphael.hsb2rgb(Math.random(), 1, .75).hex;
    });
    return colours;
  },
  
  longestDataSetLength: function() {
    var length = 0;
    this.dataSets.each(function(dataSet) { 
      length = dataSet[1].length > length ? dataSet[1].length : length;
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
    var data = this.flatData;
    if (this.range < 2) {
      // Round values
      data = this.roundValues(data, 2);
    }
    
    var longest_label_length = $A(data).sort(function(a, b) { return a.toString().length < b.toString().length }).first().toString().length;
    longest_label_length = longest_label_length > 2 ? longest_label_length - 1 : longest_label_length;
    return longest_label_length * this.fontSize;
  },
  
  paddingBottomOffset: function() {
    /* Find the longest label and multiply it by the font size */
    return this.fontSize;
  },
  
  calculateStep: function() {
    return (this.graph_width - (this.plot_padding * 2)) / (this.dataSize - 1);
  },
  
  /* Subtract the largest and smallest values from the data sets */
  calculateRange: function() {
    var ranges = this.dataSets.collect(function(data) {
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
      return (this.graph_height - this.plot_padding) * value;
    } else {
      return ((this.graph_height - this.plot_padding) / this.max) * value;
    }
  },
  
  draw: function() {
    this.dataSets.each(function(data, index) {
      this.drawLines(data[0], this.colours[data[0]], this.normaliseData(data[1]));
    }.bind(this));
    
    if (this.showVerticalLabels) {
      this.drawVerticalLabels();
    }
    
    if (this.showHorizontalLabels) {
      this.drawHorizontalLabels();
    }
  },
  
  drawLines: function(label, colour, data) {
    var x = this.x_padding_left + this.plot_padding;
    var cursor = this.paper.path({stroke: colour, 'stroke-width': '3px'}).moveTo(x, this.height - data.first() - this.y_padding_bottom);
    
    $A(data.slice(1)).each(function(value) {
      x = x + this.step;
      if (this.curve_amount) {
        cursor.cplineTo(x, this.height - value - this.y_padding_bottom, this.curve_amount);
      } else {
        cursor.lineTo(x, this.height - value - this.y_padding_bottom);
      }
    }.bind(this))
  },
  
  drawVerticalLabels: function() {
    var step = labelStep(this.flatData),
        normalised_step = this.normalise(step),
        x = this.x_padding_left - 1,
        y = this.height - this.y_padding_bottom,
        top = this.y_padding_top + normalised_step,
        label = 0;
    var cursor = this.paper.path({stroke: this.label_colour});
    
    cursor.moveTo(x, y + 1);
    cursor.lineTo(x, this.y_padding_top);
    
    while (y > top) {
      y = y - normalised_step;
      label = this.roundValue((label + step), 2);
      var textOffset = (this.paddingLeftOffset()) - (label.toString().length * (this.fontSize / 4).round());
      
      cursor.moveTo(x, y);
      cursor.lineTo(x - 5, y);
      this.paper.text(textOffset, y + 2, label).attr({"font": this.fontSize + 'px "Arial"', stroke: "none", fill: "#000"}).toBack();
    }
  },
  
  drawHorizontalLabels: function() {
    var limit = this.graph_width + this.x_padding_left,
        x = this.x_padding_left + this.plot_padding,
        y = this.height - this.y_padding_bottom + 1;
    var cursor = this.paper.path({stroke: this.label_colour});
    
    cursor.moveTo(this.x_padding_left - 2, y);
    cursor.lineTo(this.graph_width + this.x_padding_left, y);
      
    for (var i = 0; x < limit; i++) {
      cursor.moveTo(x, y);
      cursor.lineTo(x, y + 5);
      this.paper.text(x, y + this.fontSize + 7, this.labels[i]).attr({"font": this.fontSize + 'px "Arial"', stroke: "none", fill: "#000"}).toBack();
      x = x + this.step;
    }
  }
});

/* This is based on the line graph, I can probably inherit from a shared class here */
var BarGraph = Class.create({
  initialize: function(element, data, colours) {
    this.element = element;

    this.dataSets = Object.isArray(data) ? new Hash({ one: data }) : $H(data);
    this.flatData = this.dataSets.collect(function(dataSet) { return dataSet[1] }).flatten();
    this.range = this.calculateRange();
    this.dataSize = this.longestDataSetLength();
    this.showHorizontalLabels = true;
    this.showVerticalLabels = true;
    
    this.labels = $A($R(1, this.dataSize));
    
    this.width = parseInt(element.getStyle('width'));
    this.height = parseInt(element.getStyle('height'));

    /* Padding for the chart lines */
    this.plot_padding = 10;
    
    /* Label font size */
    this.fontSize = 10;
    
    /* Line colours */
    this.colours = colours ? colours : this.makeRandomColours();

    /* Padding around the graph area to make room for labels */
    this.x_padding_left = 10 + this.paddingLeftOffset();
    this.x_padding_right = 20;
    this.x_padding = this.x_padding_left + this.x_padding_right;
    this.y_padding_top = 20;
    this.y_padding_bottom = 20 + this.paddingBottomOffset();
    this.y_padding = this.y_padding_top + this.y_padding_bottom;
    
    this.label_colour = '#666';
    
    this.graph_width = this.width - (this.x_padding);
    this.graph_height = this.height - (this.y_padding);
    
    this.bar_padding = 10;
    this.step = this.calculateStep();
    this.bar_width = this.step - this.bar_padding;
    
    this.paper = Raphael(this.element, this.width, this.height);
    this.background = this.paper.rect(this.x_padding_left, this.y_padding_top, this.graph_width, this.graph_height);
    this.background.attr({fill: "#fff", stroke: null });
    this.draw();
  },
  
  makeRandomColours: function(number) {
    var colours = {};
    this.dataSets.each(function(data) {
      colours[data[0]] = Raphael.hsb2rgb(Math.random(), 1, .75).hex;
    });
    return colours;
  },
  
  longestDataSetLength: function() {
    var length = 0;
    this.dataSets.each(function(dataSet) { 
      length = dataSet[1].length > length ? dataSet[1].length : length;
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
    var data = this.flatData;
    if (this.range < 2) {
      // Round values
      data = this.roundValues(data, 2);
    }
    
    var longest_label_length = $A(data).sort(function(a, b) { return a.toString().length < b.toString().length }).first().toString().length;
    longest_label_length = longest_label_length > 2 ? longest_label_length - 1 : longest_label_length;
    return longest_label_length * this.fontSize;
  },
  
  paddingBottomOffset: function() {
    /* Find the longest label and multiply it by the font size */
    return this.fontSize;
  },
  
  calculateStep: function() {
    return (this.graph_width - (this.plot_padding * 2) - (this.bar_padding / 2)) / (this.dataSize - 1);
  },
  
  /* Subtract the largest and smallest values from the data sets */
  calculateRange: function() {
    var ranges = this.dataSets.collect(function(data) {
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
    if (this.range < 5) {
      return (this.graph_height - this.plot_padding) * value;
    } else {
      return ((this.graph_height - this.plot_padding) / this.max) * value;
    }
  },
  
  draw: function() {
    this.dataSets.each(function(data, index) {
      this.drawLines(data[0], this.colours[data[0]], this.normaliseData(data[1]));
    }.bind(this));
    
    if (this.showVerticalLabels) {
      this.drawVerticalLabels();
    }
    
    if (this.showHorizontalLabels) {
      this.drawHorizontalLabels();
    }
  },
  
  drawLines: function(label, colour, data) {
    var x = this.x_padding_left + this.plot_padding + (this.bar_padding / 2);
    var start_y = this.height - this.y_padding_bottom;
    var cursor = this.paper.path({stroke: colour, 'stroke-width': this.bar_width + 'px'}).moveTo(x, start_y);
    
    $A(data).each(function(value) {
      cursor.lineTo(x, this.height - value - this.y_padding_bottom);
      x = x + this.step;
      cursor.moveTo(x, start_y)
    }.bind(this))
  },
  
  drawVerticalLabels: function() {
    var step = labelStep(this.flatData),
        normalised_step = this.normalise(step),
        x = this.x_padding_left - 1,
        y = this.height - this.y_padding_bottom,
        top = this.y_padding_top + normalised_step,
        label = 0;
    var cursor = this.paper.path({stroke: this.label_colour});
    
    cursor.moveTo(x, y + 1);
    cursor.lineTo(x, this.y_padding_top);
    
    while (y > top) {
      y = y - normalised_step;
      label = this.roundValue((label + step), 2);
      var textOffset = (this.paddingLeftOffset()) - (label.toString().length * (this.fontSize / 4).round());
      
      cursor.moveTo(x, y);
      cursor.lineTo(x - 5, y);
      this.paper.text(textOffset, y + 2, label).attr({"font": this.fontSize + 'px "Arial"', stroke: "none", fill: "#000"}).toBack();
    }
  },
  
  drawHorizontalLabels: function() {
    var limit = this.graph_width + this.x_padding_left - (this.bar_padding / 2),
        x = this.x_padding_left + this.plot_padding + (this.bar_padding / 2),
        y = this.height - this.y_padding_bottom + 1;
    var cursor = this.paper.path({stroke: this.label_colour});
    
    cursor.moveTo(this.x_padding_left - 2, y);
    cursor.lineTo(this.graph_width + this.x_padding_left, y);
      
    for (var i = 0; x < limit; i++) {
      cursor.moveTo(x, y);
      cursor.lineTo(x, y + 5);
      this.paper.text(x, y + this.fontSize + 7, this.labels[i]).attr({"font": this.fontSize + 'px "Arial"', stroke: "none", fill: "#000"}).toBack();
      x = x + this.step;
    }
  }
});