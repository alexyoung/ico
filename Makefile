SRC = src/start.js src/helpers.js src/normaliser.js src/base.js src/graphs/base.js src/graphs/bar.js src/graphs/horizontal_bar.js src/graphs/line.js src/graphs/sparkline.js src/graphs/sparkbar.js src/end.js

lint: build
	./node_modules/.bin/jslint --onevar false ico.js

build: $(SRC)
	@cat $^ > ico.js

min: build
	./node_modules/.bin/uglifyjs --no-mangle ico.js > ico.min.js

test: build
	./node_modules/.bin/expresso

docs: min
	@markdown docs/index.md \
	  | cat docs/layout/begin.html - docs/layout/end.html \
	  > docs/index.html
	@cp ico-min.js docs/ico-min.js
	@cp raphael.js docs/raphael.js

.PHONY: lint docs test publishdocs
