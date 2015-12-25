all: dev prod

prod: static/app.min.js static/style.min.css static/index.html
dev: static/app.js static/style.css static/index_dev.html

JS_COMPILER = node_modules/browserify/bin/cmd.js
JS_COMPILE_DEV = --debug -g reactify
JS_COMPILE_PROD = -g reactify -g uglifyify

components/${JS_COMPILER}:
	cd components && npm install

static/%.js: components/%.js components/${JS_COMPILER} components/*.js
	cd components && ${JS_COMPILER} ${JS_COMPILE_DEV} -o ../$@ ../$<

static/%.min.js: components/%.js components/${JS_COMPILER} components/*.js
	cd components && ${JS_COMPILER} ${JS_COMPILE_PROD} -o ../$@ ../$<

static/%.html: templates/%.haml
	haml -qf html5 -t ugly $< | tr -d '\n' > $@

static/%_dev.html: templates/%.haml
	haml -qf html5 $< | sed -E 's/"(.+)\.min\.(js|css)"/"\1.\2"/g' > $@

static/%.css: templates/%.sass
	sass -t expanded $< > $@

static/%.min.css: templates/%.sass
	sass -t compressed $< > $@

clean:
	rm -f static/*.js static/*.css static/*.html

mrproper: clean
	rm -rf components/node_modules
