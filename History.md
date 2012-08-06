0.3.10 / 2012-02-06
==================

  * Fixed issue 16: When defining labels, the vertical lines are incorrect

0.3.9 / 2012-02-06
==================

  * Added `stroke_width` option (defaults to `3px`, can be set to `0` to make scatter plots)
  * Clarified documentation
  * Added support for jQuery objects passed in as the graph's container element option
  * Improves handling of graphs with all zero values

0.3.8 / 2012-02-06
==================

  * Grouped `BarGraph` will now generate random colours correctly
  * Added line to `BarGraph`

0.3.7 / 2011-11-28
==================

  * If `labels` is manually supplied, the number of items will be used to determine the horizontal grid positions

0.3.6 / 2011-11-28
==================

  * Added grouped bar graphs, for documentation see [Grouped Bar Graphs](http://alexyoung.github.com/ico/)
  * Updated documentation to include details on each graph's options

0.3.5 / 2011-11-26
==================

  * Added `max_bar_width` option for controlling the maximum width a bar can be
  * Added `bar_padding` for controlling the padding between bars
  * Added `bar_width` for forcing a given bar width

  These options also apply to horizontal bar graphs.

0.3.4.1 / 2011-11-08
====================

  * Added `bar_labels` option that displays values above the standard bar graphs

0.3.3 / 2011-09-30
==================

  * Added `label_step` and `label_count` options so numerical labels can be controlled

0.3.2 / 2011-08-30
==================

  * No longer extending native prototypes

0.3.1 / 2011-08-24
==================

  * Bug fix for LineGraph, migrated tests to QUnit, moved Jakefile.js to Makefile

0.3.0 / 2011-03-09
==================

  * Passing default JSHint, and a minified version is now available
  * Added documentation and published it to [alexyoung.github.com/ico/](http://alexyoung.github.com/ico/)
  * Split project into separate files, added build script, fixes for `HorizontalBarGraph`

0.2.2 / 2011-03-01
==================

  * `Ico.SparkLine` will now work correctly, particularly in IE6

