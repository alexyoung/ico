  /**
   * Assign the Ico object as a global property.
   */
  global.Ico = Ico;

  if (typeof exports !== 'undefined') {
    module.exports = Ico;
  }
})(typeof window === 'undefined' ? this : window);

