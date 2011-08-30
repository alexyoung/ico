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

