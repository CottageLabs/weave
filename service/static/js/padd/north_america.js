var world = {
    activeEdge : false,

    create : function() {

        var e = edges.newEdge({
            selector: "#world",
            template: world.newTemplate(),
            search_url: octopus.config.search_base_url + "constituencies/_search", // FIXME: we're actually not going to need to do any queries for this one
            baseQuery : es.newQuery({
                size: 0
            }),
            components : [
                edges.newRegionDataMap({
                    id: "world-map",
                    regionData : {
                        AFG : {
                            "Consumption" : 1000,
                            "Production" : 2000
                        },
                        AUS : {
                            "Consumption" : 3000,
                            "Production" : 4000
                        },
                        Canada : {
                            "Consumption" : 3000,
                            "Production" : 4000
                        },
                        "United States of America":{
                            "Consumption" : 3000,
                            "Production" : 4000
                        }
                    },
                    defaultRegionData : {
                        "Consumption" : 1,
                        "Production" : 2
                    },
                    superRegions : edges.d3.regions.COUNTRIES_BY_CONTINENT,
                    renderer : edges.d3.newGenericVectorMap({
                        width : 1100,
                        height : 700,
                        projectionType : "mercator",
                        geojson : "/static/data/padd/countries.geo.json",
                        center: {"lat" : 55, "lon" : 40},
                        rotate: {"lambda": 150, "phi": 0},
                        mapScaleFit : "best",
                        mapScaleBorder : -3.0,
                        dataOnRender: true,
                        superRegionStyles : {
                            "Africa" : {"fill" : "#00ff00"},
                            "Asia" : {"fill" : "#ff0000"},
                            "Europe" : {"fill" : "#0000ff"},
                            "North America" : {"fill" : "#999999"},
                            "Oceana" : {"fill" : "#ff00ff"},
                            "South America" : {"fill" : "#00ffff"}
                        }
                    })
                })
            ]
        });

        world.activeEdge = e;
    },

    newTemplate : function(params) {
        if (!params) { params = {} }
        world.Template.prototype = edges.newTemplate(params);
        return new world.Template(params);
    },
    Template : function(params) {
        var id = edges.getParam(params.id, "world-map");

        this.namespace = "world-template";

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
    world.create();
});