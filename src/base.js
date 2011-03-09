/*!
 * Ico
 * Copyright (C) 2009-2011 Alex R. Young
 * MIT Licensed
 */

/**
 * The Ico.Base object which contains useful generic functions.
 */
Ico.Base = {
  /**
   * Runs this.normalise on each value.
   *
   * @param {Array} data Values to normalise
   * @returns {Array} Normalised values
   */
  normaliseData: function(data) {
    var values = [],
        i      = 0;
    for (i = 0; i < data.length; i++) {
      values.push(this.normalise(data[i]));
    }
    return values;
  },

  /**
   * Flattens objects into an array.
   *
   * @param {Object} data Values to flatten
   * @returns {Array} Flattened values
   */
  flatten: function(data) {
    var flat_data = [];

    if (typeof data.length === 'undefined') {
      if (typeof data === 'object') {
        for (var key in data) {
          if (data.hasOwnProperty(key))
            flat_data = flat_data.concat(this.flatten(data[key]));
        }
      } else {
        return [];
      }
    }

    for (var i = 0; i < data.length; i++) {
      if (typeof data[i].length === 'number') {
        flat_data = flat_data.concat(this.flatten(data[i]));
      } else {
        flat_data.push(data[i]);
      }
    }
    return flat_data;
  },

  /**
   * Handy method to produce an array of numbers.
   *
   * @param {Integer} start A number to start at
   * @param {Integer} end A number to end at
   * @returns {Array} An array of values
   */
  makeRange: function(start, end) {
    var values = [], i;
    for (i = start; i < end; i++) {
      values.push(i);
    }
    return values;
  }
};
