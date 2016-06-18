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
    },

    conProdSync : function(component) {
        var resources = component.edge.resources;
        var consumption = resources.consumption;
        var production = resources.production;

        component.regionData = {};
        var con_totals = {};
        var prod_totals = {};

        var coniter = consumption.iterator();
        var res = coniter.next();
        while (res) {
            var area = res["Area"];
            if (area !== "") {
                res = coniter.next();
                continue;
            }
            var val = res["Value"];
            if (val === "") {
                res = coniter.next();
                continue;
            }
            var int = parseInt(val.replace(/,/g, ""));
            var id = res["Country"];
            var from = res["From"];
            var key = "Consumption (" + from + ")";
            id = na.COUNTRY_ID_MAP[id];
            component.regionData[id] = {};
            component.regionData[id][key] = val;

            con_totals[id] = int;
            res = coniter.next();
        }

        var proditer = production.iterator();
        var res = proditer.next();
        while (res) {
            var area = res["Area"];
            if (area !== "") {
                res = proditer.next();
                continue;
            }
            var val = res["Value"];
            if (val === "") {
                res = proditer.next();
                continue;
            }
            var int = parseInt(val.replace(/,/g, ""));
            var id = res["Country"];
            var type = res["Production source"];
            type = type.trim();
            var from = res["From"];
            var key = "Production, " + type + " (" + from  + ")";
            id = na.COUNTRY_ID_MAP[id];
            if (!component.regionData[id]) {
                component.regionData[id] = {};
            }
            component.regionData[id][key] = val;

            if (type === "Total") {
                prod_totals[id] = int;
            }
            res = proditer.next();
        }

        for (var id in con_totals) {
            var ct = con_totals[id];
            var pt = prod_totals[id];
            if (pt) {
                var bal = pt - ct;
                component.regionData[id]["Balance"] = bal;
            }
        }
    },

    paddSync : function(component) {
        var resources = component.edge.resources;
        var consumption = resources.consumption;
        var production = resources.production;

        component.regionData = {};
        var con_totals = {};
        var prod_totals = {};

        var coniter = consumption.iterator();
        var res = coniter.next();
        while (res) {
            var area = res["Area"];
            if (area.substring(0, 4) !== "PADD") {
                res = coniter.next();
                continue;
            }
            var val = res["Value"];
            if (val === "") {
                res = coniter.next();
                continue;
            }
            var int = parseInt(val.replace(/,/g, ""));
            var from = res["From"];
            var key = "Consumption (" + from + ")";

            component.regionData[area] = {};
            component.regionData[area][key] = val;

            if (!isNaN(int)) {
                con_totals[area] = int;
            }
            res = coniter.next();
        }

        var proditer = production.iterator();
        var res = proditer.next();
        while (res) {
            var area = res["Area"];
            if (area.substring(0, 4) !== "PADD") {
                res = proditer.next();
                continue;
            }
            var val = res["Value"];
            if (val === "") {
                res = proditer.next();
                continue;
            }
            var int = parseInt(val.replace(/,/g, ""));
            var type = res["Production source"];
            var from = res["From"];
            var key = "Production, " + type + " (" + from  + ")";

            if (!component.regionData[area]) {
                component.regionData[area] = {};
            }
            component.regionData[area][key] = val;

            if (!isNaN(int)) {
                prod_totals[area] = int;
            }
            res = proditer.next();
        }

        for (var id in con_totals) {
            var ct = con_totals[id];
            var pt = prod_totals[id];
            if (pt) {
                var bal = pt - ct;
                component.regionData[id]["Balance"] = bal;
            }
        }
    },

    renderRegionData : function(params) {
        var regionData = params.regionData;
        var d = params.d;
        var superRegionId = edges.getParam(params.superRegionId, false);

        var title = "";
        if (d) {
            title = d.properties.name;
        }
        if (superRegionId) {
            title = superRegionId;
        }
        var frag = '<h4>'+ title + '</h4>';

        frag += "<table class='tooltip-table'><tbody>";
        for (var field in regionData) {
            var val = regionData[field];
            frag += "<tr><td>" + edges.escapeHtml(field) + "</td><td>" + edges.escapeHtml(val) + "</td></tr>";
        }
        frag += "</tbody></table>";

        return frag;
    },

    create : function() {

        var padds = edges.d3.regions.PADDS;
        padds["PADD 4 & 5"] = padds["PADD 4"].concat(padds["PADD 5"]);
        delete padds["PADD 4"];
        delete padds["PADD 5"];

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
                        enableTooltipInteractions: false,
                        renderRegionData : na.renderRegionData
                    })
                }),
                edges.newRegionDataMap({
                    id: "us-map",
                    superRegions : padds,
                    synchronise: na.paddSync,
                    defaultRegionData : {"No Production or Consumption data for this year" : ""},
                    renderer : edges.d3.newGenericVectorMap({
                        width : 1100,
                        height : 700,
                        projectionType : "albersUsa",
                        geojson : "/static/data/padd/us-states.json",
                        mapScaleFit : "best",
                        mapScaleBorder : 0,
                        superRegionStyles : {
                            "PADD 1" : {"stroke" : "#ffffff", "stroke-width" : 1, "fill" : "#6699ff"},
                            "PADD 2" : {"stroke" : "#ffffff", "stroke-width" : 1, "fill" : "#99cc00"},
                            "PADD 3" : {"stroke" : "#ffffff", "stroke-width" : 1, "fill" : "#9966ff"},
                            "PADD 4 & 5" : {"stroke" : "#ffffff", "stroke-width" : 1, "fill" : "#ff6666"}
                        },
                        tooltipsBySuperRegion: true,
                        renderRegionData : na.renderRegionData
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

            var frag = '<div class="row"><div class="col-md-offset-5 col-md-2"><div id="year-selector" style="margin-bottom: 20px;"></div></div></div><div class="row">\
                <div class="col-md-12">\
                    <div id="' + id + '"></div>\
                    <div id="us-map"></div>\
                </div>\
            </div>';

            edge.context.html(frag);
        }
    }
};


jQuery(document).ready(function($) {
    na.create();
});