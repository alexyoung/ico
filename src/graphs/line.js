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

