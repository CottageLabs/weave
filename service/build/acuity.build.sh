#!/usr/bin/env bash

# nvm use 5.0

EDGES_VEND="../../magnificent-octopus/octopus/static/vendor/edges_build/vendor"
EDGES_IN_JS="../../magnificent-octopus/octopus/static/vendor/edges_build/src"
EDGES_IN_CSS="../../magnificent-octopus/octopus/static/vendor/edges_build/css"
R_FILE="../../magnificent-octopus/octopus/static/vendor/edges_build/build/r.js"
UGLIFY="/home/richard/node_modules/uglify-js/bin/uglifyjs"
ACUITY_IN_JS="../static/js/padd"
ACUITY_IN_CSS="../static/css/padd"
GEO="../static/data/padd"
ACUITY_DATA="../static/data/acuity"

OUT="acuity/"
SRC=$OUT/src
COMP=$OUT/comp
DEPLOY=$OUT/deploy

JS_SRC=$SRC/js
CSS_SRC=$SRC/css
JS_COMP=$COMP/js
CSS_COMP=$COMP/css

DEV="../static/acuity"
DEV_JS="../static/js/acuity.min.js"
DEV_CSS="../static/css/acuity.min.css"

rm -r $OUT
mkdir $OUT
mkdir $SRC
mkdir $COMP
mkdir $JS_SRC
mkdir $JS_COMP
mkdir $CSS_SRC
mkdir $CSS_COMP
mkdir $DEPLOY

# copy all the necessary files from edges
cp $EDGES_IN_JS/edges.js $JS_SRC
cp $EDGES_IN_JS/edges.csv.js $JS_SRC
cp $EDGES_IN_JS/edges.jquery.js $JS_SRC
cp $EDGES_IN_JS/es.js $JS_SRC
cp $EDGES_IN_JS/components/tables.js $JS_SRC
cp $EDGES_IN_JS/components/maps.js $JS_SRC
cp $EDGES_IN_JS/renderers/d3.edges.js $JS_SRC
cp $EDGES_IN_JS/renderers/bs3.NSeparateORTermSelectorRenderer.js $JS_SRC
cp $ACUITY_IN_JS/acuity.js $JS_SRC

cp $EDGES_IN_CSS/bs3.NSeparateORTermSelectorRenderer.css $CSS_SRC
cp $EDGES_IN_CSS/d3.edges.css $CSS_SRC
cp $ACUITY_IN_CSS/acuity.css $CSS_SRC

# this command minifies the entire js source into the OUT directory
node $UGLIFY -o $JS_COMP/edges.js $JS_SRC/edges.js
node $UGLIFY -o $JS_COMP/edges.csv.js $JS_SRC/edges.csv.js
node $UGLIFY -o $JS_COMP/edges.jquery.js $JS_SRC/edges.jquery.js
node $UGLIFY -o $JS_COMP/es.js $JS_SRC/es.js
node $UGLIFY -o $JS_COMP/tables.js $JS_SRC/tables.js
node $UGLIFY -o $JS_COMP/maps.js $JS_SRC/maps.js
node $UGLIFY -o $JS_COMP/d3.edges.js $JS_SRC/d3.edges.js
node $UGLIFY -o $JS_COMP/bs3.NSeparateORTermSelectorRenderer.js $JS_SRC/bs3.NSeparateORTermSelectorRenderer.js
node $UGLIFY -o $JS_COMP/acuity.js $ACUITY_IN_JS/acuity.js

# these commands individually minify the CSS
node $R_FILE -o cssIn=$CSS_SRC/bs3.NSeparateORTermSelectorRenderer.css out=$CSS_COMP/bs3.NSeparateORTermSelectorRenderer.css baseUrl=.
node $R_FILE -o cssIn=$CSS_SRC/d3.edges.css out=$CSS_COMP/d3.edges.css baseUrl=.
node $R_FILE -o cssIn=$CSS_SRC/acuity.css out=$CSS_COMP/acuity.css baseUrl=.

# now concatenate all the js output
cat $JS_COMP/es.js <(echo) \
    $JS_COMP/edges.jquery.js <(echo) \
    $JS_COMP/edges.js <(echo) \
    $JS_COMP/edges.csv.js <(echo) \
    $JS_COMP/maps.js <(echo) \
    $JS_COMP/tables.js <(echo) \
    $JS_COMP/bs3.NSeparateORTermSelectorRenderer.js <(echo) \
    $JS_COMP/d3.edges.js <(echo) \
    $JS_COMP/acuity.js <(echo) \
    > $DEPLOY/acuity.min.js

# and concatenate the css output
cat $CSS_COMP/d3.edges.css <(echo) \
    $CSS_COMP/bs3.NSeparateORTermSelectorRenderer.css <(echo) \
    $CSS_COMP/acuity.css <(echo) \
    > $DEPLOY/acuity.min.css

# copy in all the other static dependencies
cp $GEO/countries.geo.json $DEPLOY
cp $GEO/us-states.json $DEPLOY
cp $ACUITY_DATA/production.csv $DEPLOY
cp $ACUITY_DATA/consumption.csv $DEPLOY
cp $EDGES_VEND/bootstrap-3.3.1/css/bootstrap.min.css $DEPLOY
cp $EDGES_VEND/jquery-1.11.1/jquery-1.11.1.js $DEPLOY
cp $EDGES_VEND/d3-3.5.17/d3.min.js $DEPLOY
cp $EDGES_VEND/PapaParse-4.1.2/papaparse.min.js $DEPLOY

echo "Build $(date -u +"%Y-%m-%dT%H:%M:%SZ")" > $OUT/build.txt

rm $DEV
mkdir $DEV
cp $DEPLOY/* $DEV

#cp $DEPLOY/acuity.min.js $DEV_JS
#cp $DEPLOY/acuity.min.css $DEV_CSS