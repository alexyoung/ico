/*!
 * Ico
 * Copyright (C) 2009-2011 Alex R. Young
 * MIT Licensed
 */

/**
 * The Ico object.
 */
(function(global) {
  var Ico = {
    VERSION: '0.3.3',

    /**
     * Rounds a float to the specified number of decimal places.
     *
     * @param {Float} num A number to round
     * @param {Integer} dec The number of decimal places
     * @returns {Float} The rounded result
     */
    round: function(num, dec) {
      var result = Math.round(num * Math.pow(10, dec)) / Math.pow(10, dec);
      return result;
    }
  };

