/**
 * Normalises lists of values to fit inside a graph.
 *
 * @param {Array} data A list of values
 * @param {Object} options Can be used to set the `start_value`
 */
Ico.Normaliser = function(data, options) {
  this.options = {
    start_value: null
  };

  if (typeof options !== 'undefined') {
    this.options = options;
  }

  this.min = Helpers.min(data);
  this.max = Helpers.max(data);
  this.standard_deviation = Helpers.standard_deviation(data);
  this.range = 0;
  this.step = this.labelStep(this.max - this.min);
  this.start_value = this.calculateStart();
  this.process();
};

Ico.Normaliser.prototype = {
  /**
   * Calculates the start value.  This is often 0.
   * @returns {Float} The start value 
   */
  calculateStart: function() {
    var min = typeof this.options.start_value !== 'undefined' && this.min >= 0 ? this.options.start_value : this.min,
        start_value = this.round(min, 1);

    /* This is a boundary condition */
    if (this.min > 0 && start_value > this.min) {
      return 0;
    }

    if (this.min === this.max) {
      return 0;
    }

    return start_value;
  },

  /* Given a value, this method rounds it to the nearest good value for an origin */
  round: function(value, offset) {
    offset = offset || 1;
    var roundedValue = value;

    if (this.standard_deviation > 0.1) {
      var multiplier = Math.pow(10, -offset);
      roundedValue = Math.round(value * multiplier) / multiplier;

      if (roundedValue > this.min) {
        return this.round(value - this.step);
      }
    }
    return roundedValue;
  },

  /**
   * Calculates the range and step values.
   */
  process: function() {
    this.range = this.max - this.start_value;
    this.step = this.labelStep(this.range);
  },

  /**
   * Calculates the label step value.
   *
   * @param {Float} value A value to convert to a label position
   * @returns {Float} The rounded label step result
   */
  labelStep: function(value) {
    return Math.pow(10, Math.round((Math.log(value) / Math.LN10)) - 1);
  }
};


