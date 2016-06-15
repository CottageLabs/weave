var na = {
    activeEdge : false,

    COUNTRY_ID_MAP : {
        "US" : "USA",
        "Canada" : "CAN"
    },

    preFilterCSVs : function(params) {
        var resource = params.resource;
        var year = (new Date()).getUTCFullYear().toString();
        resource.add_filter({filter: {field: "From", value: year, type: "exact"}});
        resource.add_filter({filter: {field: "Area", value: "", type: "exact"}});
    },

    conProdSync : function(component) {
        // FIXME: right now this function is just a demo of the sync feature, we need to pay more attention to the
        // filtering and the values
        var resources = component.edge.resources;
        var consumption = resources.consumption;
        var production = resources.production;

        var coniter = consumption.iterator();
        var res = coniter.next();
        while (res) {
            var val = res["Value"];
            var id = res["Country"];
            var from = res["From"];
            var key = "Consumption (" + from + ")";
            id = na.COUNTRY_ID_MAP[id];
            component.regionData[id] = {};
            component.regionData[id][key] = val;
            res = coniter.next();
        }

        var proditer = production.iterator();
        var res = proditer.next();
        while (res) {
            var val = res["Value"];
            var id = res["Country"];
            var type = res["Production source"];
            var from = res["From"];
            var key = "Production, " + type + " (" + from  + ")";
            id = na.COUNTRY_ID_MAP[id];
            component.regionData[id][key] = val;
            res = proditer.next();
        }
    },

    create : function() {

        var e = edges.newEdge({
            selector: "#world",
            template: na.newTemplate(),
            staticFiles : [
                {id : "consumption", url : "/static/data/acuity/consumption.csv", processor : edges.csv.newObjectByRow, datatype : "text", opening: na.preFilterCSVs},
                {id : "production", url : "/static/data/acuity/production.csv", processor : edges.csv.newObjectByRow, datatype : "text", opening: na.preFilterCSVs}
            ],
            components : [
                edges.newStaticDataSelector({
                    id: "year-selector",
                    resourceId: "consumption",
                    filterResourceIds : ["consumption", "production"],
                    field: "From",
                    display: "Year",
                    renderer : edges.bs3.newNSeparateORTermSelectorRenderer({
                        n: 1,
                        properties : [
                            {label: "Year", unselected: "<select a year>"}
                        ]
                    })
                }),
                edges.newRegionDataMap({
                    id: "na-map",
                    synchronise: na.conProdSync,
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

            var frag = '<div class="row"><div class="col-md-offset-5 col-md-2"><div id="year-selector"></div></div></div><div class="row">\
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