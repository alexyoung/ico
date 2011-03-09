/**
 * Determines if a value is valid as a 'step' value.
 * Steps are the increments between each bar or line.
 *
 * @param {Integer} value A number to test
 * @returns {Integer} A valid step value
 */
function validStepDivider(value) {
  return value > 1 ? value - 1 : 1;
}

/**
 * Gets a CSS style property.
 *
 * @param {Object} el A DOM element
 * @param {String} styleProp The name of a style property
 * @returns {Object} The style value
 */
function getStyle(el, styleProp) {
  var style;
  if (el.currentStyle) {
    style = el.currentStyle[styleProp];
  } else if (window.getComputedStyle) {
    style = document.defaultView.getComputedStyle(el, null).getPropertyValue(styleProp);
  }
  if (style && style.length === 0) {
    style = null;
  }
  return style;
}

// TODO: Move
Array.prototype.sum = function() {
  for (var i = 0, sum = 0; i < this.length; sum += this[i++]) {}
  return sum;
};

// TODO: Move
if (typeof Array.prototype.max === 'undefined') {
  Array.prototype.max = function() {
    return Math.max.apply({}, this);
  };
}

// TODO: Move
if (typeof Array.prototype.min === 'undefined') {
  Array.prototype.min = function() {
    return Math.min.apply({}, this);
  };
}

// TODO: Move
Array.prototype.mean = function() {
  return this.sum() / this.length;
};

// TODO: Move
Array.prototype.variance = function() {
  var mean = this.mean(),
      variance = 0;
  for (var i = 0; i < this.length; i++) {
    variance += Math.pow(this[i] - mean, 2);
  }
  return variance / (this.length - 1);
};

// TODO: Move
Array.prototype.standard_deviation = function() {
  return Math.sqrt(this.variance());
};

// TODO: Move
if (typeof Object.extend === 'undefined') {
  Object.extend = function(destination, source) {
    for (var property in source) {
      if (source.hasOwnProperty(property)) {
        destination[property] = source[property];
      }
    }
    return destination;
  };
}


