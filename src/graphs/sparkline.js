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

