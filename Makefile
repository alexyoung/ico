SRC = src/start.js src/helpers.js src/normaliser.js src/base.js src/graphs/base.js src/graphs/bar.js src/graphs/horizontal_bar.js src/graphs/line.js src/graphs/sparkline.js src/graphs/sparkbar.js src/end.js

lint: build
	./node_modules/.bin/jslint --onevar false ico.js

build: $(SRC)
	@cat $^ > ico.js
	@cp ico.js docs/ico.js

min: build
	@./node_modules/.bin/uglifyjs --no-mangle ico.js > ico.min.js
	@cp ico.min.js docs/ico.min.js

test: build
	./node_modules/.bin/expresso

docs: min
	@markdown docs/index.md \
	  | cat docs/layout/begin.html - docs/layout/end.html \
	  > docs/index.html
	@cp ico.min.js docs/ico.min.js
	@cp ico.js docs/ico.js
	@cp raphael.js docs/raphael.js

publishdocs:
	$(eval PARENT_SHA := $(shell git show-ref -s refs/heads/gh-pages))
	$(eval DOC_SHA := $(shell git ls-tree -d HEAD docs | awk '{print $$3}'))
	$(eval COMMIT := $(shell echo "Auto-update docs." | git commit-tree $(DOC_SHA) -p $(PARENT_SHA)))
	@git update-ref refs/heads/gh-pages $(COMMIT)

.PHONY: lint docs test publishdocs
