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

