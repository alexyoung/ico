/**
 * The BarGraph class.
 *
 * Example:
 * 
 *         new Ico.BarGraph($('bargraph'), [100, 10, 90, 20, 80, 30]);
 *
 */
Ico.BarGraph = function() { this.initialize.apply(this, arguments); };
Helpers.extend(Ico.BarGraph.prototype, Ico.BaseGraph.prototype);
Helpers.extend(Ico.BarGraph.prototype, {
  // Overridden to handle grouped bar graphs
  buildDataSets: function(data, options) {
    if (typeof data.length !== 'undefined') {
      if (typeof data[0].length !== 'undefined') {
        this.grouped = true;

        // TODO: Find longest?
        this.group_size = data[0].length;
        var o = {}, k, i = 0;
        for (k in options.labels) {
          k = options.labels[k];
          o[k] = data[i];
          i++;
        }
        return o;
      } else {
        return { 'one': data };
      }
    } else {
      return data;
    }
  },

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
    // Make sure the true largest value is used for max
    return this.options.line ? { start_value: 0, max: Helpers.max([Helpers.max(this.options.line), Helpers.max(this.flat_data)]) } : { start_value: 0 };
  },

  /**
   * Options specific to BarGraph.
   */
  setChartSpecificOptions: function() {
    this.bar_padding = this.options.bar_padding || 5;
    this.bar_width = this.options.bar_size || this.calculateBarWidth();

    if (this.options.bar_size && !this.options.bar_padding) {
      this.bar_padding = this.graph_width / this.data_size;
    }

    this.options.plot_padding = (this.bar_width / 2) - (this.bar_padding / 2);
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
    var width = (this.graph_width / this.data_size) - this.bar_padding;

    if (this.grouped) {
      //width = width / this.group_size - (this.bar_padding * this.group_size);
    }

    if (this.options.max_bar_size && width > this.options.max_bar_size) {
      width = this.options.max_bar_size;
      this.bar_padding = this.graph_width / this.data_size;
    }

    return width;
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
    if (this.options.highlight_colours && this.options.highlight_colours.hasOwnProperty(index)) {
      colour = this.options.highlight_colours[index];
    }

    x = x + this.bar_padding;
    pathString += 'M' + x + ',' + this.start_y;
    pathString += 'L' + x + ',' + y;
    this.paper.path(pathString).attr({ stroke: colour, 'stroke-width': this.bar_width + 'px' });
    pathString = '';
    x = x + this.step;
    pathString += 'M' + x + ',' + this.start_y;
    return pathString;
  },

  /* Change the standard options to correctly offset against the bars */
  drawHorizontalLabels: function() {
    var x_start = this.bar_padding + this.options.plot_padding,
        step = this.step;
    if (this.grouped) {
      step = step * this.group_size;
      x_start = ((this.bar_width * this.group_size) + (this.bar_padding * this.group_size)) / 2
      x_start = this.roundValue(x_start, 0);
    }
    this.drawMarkers(this.options.labels, [1, 0], step, x_start, [0, (this.options.font_size + 7) * -1]);
  },

  drawBarMarkers: function() {
    if (this.plottedCoords.length === 0) {
      return;
    }

    var i, length = this.flat_data.length, x, y, label, font_options = {};
    Helpers.extend(font_options, this.font_options);
    font_options['text-anchor'] = 'center';

    for (i = 0; i < length; i++) {
      label = this.roundValue(this.flat_data[i], 2).toString();
      x = this.plottedCoords[i][0];
      y = this.roundValue(this.plottedCoords[i][1], 0);
      this.paper.text(x, y - this.options.font_size, label).attr(font_options).toFront();
    }
  }
});

