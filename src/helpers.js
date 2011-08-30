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
  if (typeof window === 'undefined') return;

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

var Helpers = {};

Helpers.sum = function(a) {
  for (var i = 0, sum = 0; i < a.length; sum += a[i++]) {}
  return sum;
};

if (typeof Array.prototype.max === 'undefined') {
  Helpers.max = function(a) {
    return Math.max.apply({}, a);
  };
} else {
  Helpers.max = function(a) {
    return a.max();
  };
}

if (typeof Array.prototype.min === 'undefined') {
  Helpers.min = function(a) {
    return Math.min.apply({}, a);
  };
} else {
  Helpers.min = function(a) {
    return a.min();
  };
}

Helpers.mean = function(a) {
  return Helpers.sum(a) / a.length;
};

Helpers.variance = function(a) {
  var mean = Helpers.mean(a),
      variance = 0;
  for (var i = 0; i < a.length; i++) {
    variance += Math.pow(a[i] - mean, 2);
  }
  return variance / (a.length - 1);
};

Helpers.standard_deviation = function(a) {
  return Math.sqrt(Helpers.variance(a));
};

if (typeof Object.extend === 'undefined') {
  Helpers.extend = function(destination, source) {
    for (var property in source) {
      if (source.hasOwnProperty(property)) {
        destination[property] = source[property];
      }
    }
    return destination;
  };
} else {
  Helpers.extend = Object.extend;
}
