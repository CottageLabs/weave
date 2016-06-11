var na = {
    activeEdge : false,

    create : function() {

        var e = edges.newEdge({
            selector: "#world",
            template: na.newTemplate(),
            staticFiles : [
                {"id" : "consumption", "url" : "/static/data/acuity/consumption.csv", "processor" : edges.csv.newObjectByRow, "datatype" : "text"},
                {"id" : "production", "url" : "/static/data/acuity/production.csv", "processor" : edges.csv.newObjectByRow, "datatype" : "text"}
            ],
            components : [
                edges.newRegionDataMap({
                    id: "na-map",
                    renderer : edges.d3.newGenericVectorMap({
                        width : 1100,
                        height : 700,
                        projectionType : "mercator",
                        geojson : "/static/data/padd/countries.geo.json",
                        center: {"lat" : 55, "lon" : 40},
                        rotate: {"lambda": 150, "phi": 0},
                        mapScaleFit : "best",
                        mapScaleBorder : -3.0,
                        preDisplayToolTips : ["CAN", "USA"],
                        toolTipOffsets : {
                            "USA" : {left: -100, top: 120},
                            "CAN" : {left: -50, top: 100}
                        },
                        regionStyles : {
                            "CAN" : {"stroke" : "#ffffff", "stroke-width" : 1, "fill" : "#FF0000"},
                            "USA" : {"stroke" : "#ffffff", "stroke-width" : 1, "fill" : "#0000FF"}
                        },
                        enableTooltipInteractions: false
                    })
                })
            ]
        });

        na.activeEdge = e;
    },

    newTemplate : function(params) {
        if (!params) { params = {} }
        na.Template.prototype = edges.newTemplate(params);
        return new na.Template(params);
    },
    Template : function(params) {
        var id = edges.getParam(params.id, "na-map");

        this.namespace = "na-template";

        this.draw = function(edge) {
            this.edge = edge;

            var frag = '<div class="row">\
                <div class="col-md-12">\
                    <div id="' + id + '"></div>\
                </div>\
            </div>';

            edge.context.html(frag);
        }
    }
};


jQuery(document).ready(function($) {
    na.create();
});