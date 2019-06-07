d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson", geodata => {


    // function to make popup markers
    function onEachFeature(feature, layer) {
        // check that there is something to pop up first
        if (feature.properties) {
            layer.bindPopup('<h3> Description: ' + feature.properties.title + '</h3>');
        }
    };
    // function to make circle markers
    function makeCircles(feature, latlng) {
        return L.circleMarker(
            latlng,
            {
                radius: feature.properties.mag * 3,
                fillColor: getColor(feature.properties.mag),
                color: '#000',
                weight: 0.5,
                opacity: 1,
                fillOpacity: 0.9
            }
        )
    }
    // function to set colors for legend
    function getColor(d) {
        return d > 5 ? '#F90003' :
               d > 4 ? '#FA6704' :
               d > 3 ? '#FBCF08' :
               d > 2 ? '#C3FC0D' :
               d > 1 ? '#62FD11' :
                       '#15FE26';
    }
    // initiate legend in bottom right corner
    var legend = L.control({position: 'bottomright'});
    // make numbers for legend and add to legend, boilerplate
    legend.onAdd = function() {
        var div = L.DomUtil.create('div', 'info legend'),
            grades = [0, 1, 2, 3, 4, 5],
            labels = [];

        // loop through our density intervals and generate a label with a colored square for each interval
        for (var i = 0; i < grades.length; i++) {
            div.innerHTML +=
                '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
                grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<hr>' : '+');
        }

        return div;
    };
    // get earthquake data and apply circle and popup functions
    var earthquakes = L.geoJSON(geodata.features, {
        onEachFeature: onEachFeature,
        pointToLayer: makeCircles
    });
    // make light background layer
    var streets = new L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        noWrap: true,
        bounds: [[-180, -180], [180, 180]],
        id: "mapbox.streets",
        accessToken: API_KEY
    });
    // make dark background layer
    var darkmap = new L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        noWrap: true,
        bounds: [[-180, -180], [180, 180]],
        id: "mapbox.dark",
        accessToken: API_KEY
    });
    // make satellite background layer
    var satellite = new L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        noWrap: true,
        bounds: [[-180, -180], [180, 180]],
        id: "mapbox.satellite",
        accessToken: API_KEY
    });

    // make map, initiated with earthquake info and background layer
    var myMap = L.map("map", {
        center: [39.00, -50.0],
        zoom: 3,
        minZoom: 2,
        layers: [satellite, earthquakes]
    });

    
    // add tectonic plate info
    d3.json('https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json', tectonic => {
        faultlines = L.geoJson(tectonic.features, {
            color: 'orange',
        }).addTo(myMap);
        // Define a baseMaps object to hold base layers
        var baseMaps = {
            "Street Map": streets,
            "Dark Map": darkmap,
            "Satellite": satellite
        };

        // Create overlay object to hold overlay layers
        var overlayMaps = {
            Earthquakes: earthquakes,
            'Fault Lines': faultlines
        };
        // make control in top right corner
        L.control.layers(baseMaps, overlayMaps, {
            collapsed: false
        }).addTo(myMap);
        // finally, add color code legend in bottom right corner
        legend.addTo(myMap);
    });
});