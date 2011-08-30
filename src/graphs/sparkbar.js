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

