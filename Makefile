SRC = src/start.js src/helpers.js src/normaliser.js src/base.js src/graphs/base.js src/graphs/bar.js src/graphs/horizontal_bar.js src/graphs/line.js src/graphs/sparkline.js src/graphs/sparkbar.js src/end.js

docs: build
	./node_modules/.bin/dox --title Ico src/*.js --intro docs/intro.md > docs/index.html

lint: build
	./node_modules/.bin/jslint --onevar false ico.js

build: $(SRC)
	@cat $^ > ico.js

min: build
	./node_modules/.bin/uglifyjs --no-mangle ico.js > ico.min.js

test: build
	./node_modules/.bin/expresso

.PHONY: lint docs test
