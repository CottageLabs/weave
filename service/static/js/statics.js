jQuery(document).ready(function($) {

    //////////////////////////////////////////////////////
    // test loading static files

    e4 = edges.newEdge({
        selector: "#statics",
        staticFiles: [
            {
                id: "lantern",
                url: "/static/data/lantern.csv",
                datatype: "text",
                processor: edges.csv.newObjectByRow
            }
        ],
        components: [
            edges.newStaticDataSelector({
                id : "dataselector",
                resourceId: "lantern",
                field: "Publisher",
                display: "Publisher",
                renderer : edges.bs3.newRefiningANDTermSelectorRenderer({
                    controls: false,
                    open: true
                })
            }),
            edges.newStaticDataGrid({
                id: "datagrid",
                resourceId: "lantern",
                renderer : edges.bs3.newTabularResultsRenderer({
                    fieldDisplay : [
                        {field : "PMCID", display : "PMCID"},
                        {field : "PMID", display : "PMID"},
                        {field : "DOI", display : "DOI"},
                        {field : "Publisher", display : "Publisher"},
                        {field : "Journal title", display : "Journal title"},
                        {field : "ISSN", display : "ISSN"},
                        {field : "Article title", display : "Article title"}
                    ]
                })
            })
        ]
    });

});