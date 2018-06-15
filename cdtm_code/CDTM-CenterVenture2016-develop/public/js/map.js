var map;

var app = angular.module("mapview", ['leaflet-directive']);

app.config(function($logProvider){
    $logProvider.debugEnabled(false);
});

app.controller("MapController",  [ '$scope', '$http', 'leafletData', function($scope, $http, leafletData) {
    angular.extend($scope, {
        center: {
            lat: 48.143763,
            lng: 11.557979,
            zoom: 8
        },
        defaults: {
            scrollWheelZoom: false
        },
        tiles: {
            url: 'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiYnJhbmRuZXJiIiwiYSI6ImNpdTQzYWZqNjAwMjQyeXFqOWR2a2tnZ2MifQ.LrcRwH1Vm-JsYR1zBb0Q9Q',
            options: {
                maxZoom: 18,
                attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
                '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
                'Imagery © <a href="http://mapbox.com">Mapbox</a>',
                id: 'mapbox.streets'
            }
        }
    });

    $http.get('/map/plugins').then(function(resp) {
        $scope.datasets = resp.data;
    });
    $scope.datasetClicked = function (dataset) {
        // console.log('datasetclicked', dataset);
        var datasetId = dataset.name;
        var actions = {
            'Districts': loadDistricts,
            'Test': loadUrl.bind(undefined, dataset.url, markers),
            'Rents': loadUrl.bind(undefined, dataset.url, rent),
            'Playgrounds': loadUrl.bind(undefined, dataset.url, cluster)
        };

        if(!(datasetId in actions)) {
            console.error('dataset ' + datasetId + ' has no action!');
        } else {
            actions[datasetId](dataset.checked);
        }
    };

    var map;
    leafletData.getMap('map').then(function (res) {
        map = window.map = res;
        // map.addLayer(L.mapbox.tileLayer('mapbox.streets'));
        $(document).ready(function () {
            setTimeout(function () {
                map.setZoom(11, {animate: true});
            }, 1000)
        });
        // console.log('got map', res);
    });
    var layers = {};

    function loadDistricts(load) {
        if(load) {
            var customLayer = L.geoJson(null, {
                // http://leafletjs.com/reference.html#geojson-style
                onEachFeature: function (feature, layer) {
                    var getCentroid2 = function (arr) {
                        var twoTimesSignedArea = 0;
                        var cxTimes6SignedArea = 0;
                        var cyTimes6SignedArea = 0;

                        var length = arr.length;

                        var x = function (i) { return arr[i % length][1] };
                        var y = function (i) { return arr[i % length][0] };

                        for ( var i = 0; i < arr.length; i++) {
                            var twoSA = x(i)*y(i+1) - x(i+1)*y(i);
                            twoTimesSignedArea += twoSA;
                            cxTimes6SignedArea += (x(i) + x(i+1)) * twoSA;
                            cyTimes6SignedArea += (y(i) + y(i+1)) * twoSA;
                        }
                        var sixSignedArea = 3 * twoTimesSignedArea;
                        return [ cxTimes6SignedArea / sixSignedArea, cyTimes6SignedArea / sixSignedArea];
                    };
                    var getTop = function (arr) {
                        // get highest latitude = northest point
                        var maxL, index = null;
                        arr.forEach(function (elem, idx) {
                            if(!index || elem[1] > maxL) {
                                maxL = elem[1];
                                index = idx;
                            }
                        });

                        var swapped = arr[index];
                        return [swapped[1], swapped[0]];
                    };

                    var popup = L.popup()
                        .setContent('<p class="nomouse">' + feature.properties.description + " " + feature.properties.name + '</p>');
                    layer.on('mouseover', function(e) {
                        var coords = getTop(feature.geometry.coordinates[0]);
                        // console.log(coords);
                        popup.d_id = feature.properties.description;
                        popup.setLatLng(coords).openOn(map);
                    });
                    layer.on('mouseout', function(e) {
                        function inside(x, y, rect) {
                            return ((x <= rect.right) && (x >= rect.left) && (y <= rect.bottom) && (y >= rect.top));
                        }
                        // if(popup.d_id == feature.properties.description &&
                        //     inside(e.originalEvent.pageX, e.originalEvent.pageY, popup._container.getBoundingClientRect())) {
                        //     return;
                        // }
                        map.closePopup(popup);
                    });
                }
            });

            var layer = omnivore.kml('/maps/public/munich-districts.kml', null, customLayer);
            layers['districts'] = layer;
            layer.addTo(map);
        } else {
            map.removeLayer(layers['districts']);
            layers['districts'] = undefined;
        }
    }

    var data = [];
    // load & cache (or hide) a resource and visualize with callback then(data)
    function loadUrl(url, then, load) { // then: function(data)
        var existing = data.filter(function (element, index, array) {
            return element.srcUrl == url;
        });
        if(load) {
            if(existing.length > 0) {
                existing[0].layer = then(existing[0].data);
            } else {
                // download fresh
                $http.get(url).then(function (response) {
                    data.push({
                        srcUrl: url,
                        data: response.data,
                        layer: then(response.data)
                    });
                });
            }
        } else {
            var layer = existing[0].layer;
            map.removeLayer(layer);
            existing[0].layer = undefined;
        }
    }

    function cluster(data) {
        var layer = new L.MarkerClusterGroup({
            animateAddingMarkers: true,
            disableClusteringAtZoom: 14
        });

        for (var i = 0; i < data.length; i++) {
            var latlong = data[i].latlong;
            var title = data[i].properties.name;
            var marker = L.marker(new L.LatLng(latlong[0], latlong[1]), {
                icon: L.mapbox.marker.icon({'marker-symbol': 'playground', 'marker-color': '0044FF'}),
                title: title
            });
            marker.bindPopup(title);
            layer.addLayer(marker);
        }

        map.addLayer(layer);
        return layer;
    }

    function markers(data) {
        var layer = L.layerGroup().addTo(map);
        data.forEach(function (val, idx, arr) {
            var tooltip = val.badge ? (val.badge) : val.match ? (((val.match * 100) % 100) + '%') : '';
            var badge = '<div class="marker-badge"><span class="standalone no-wrap">' + tooltip + '</span></div>';
            var html = (tooltip ? badge : '') + '<img class="marker-img" src="https://unpkg.com/leaflet@1.0.1/dist/images/marker-icon-2x.png" style="bottom:' + (tooltip ? 11 : 0) + 'px;"/>';
            var marker = L.marker(val.latlong, {
                riseOnHover: true,
                icon: L.divIcon({
                    className: 'label autosize-label marker',
                    html: html,
                    iconSize: [30, tooltip ? 60 : 41],
                    iconAnchor: [15, tooltip ? 60 : 41]
                })
            });
            if(val.popup) {
                marker.bindPopup(val.popup);
            }
            marker.addTo(layer);
        });
        return layer;
    }

    function rent(data) {
        return coloredArea(data, '€');
    }

    function coloredArea(data, suffix) {
        // we expect data to be an array of { district: <id>, value: <v>  ... } objects, then pull in
        // district kml and color features based on values
        var values = data.map(function (x) {
            return x.rent;
        });
        var max = Math.max.apply(null, values);
        var min = Math.min.apply(null, values);

        function color(value) {
            var normalized = (value - min) / (max - min);
            var colors = ['#FFEDA0', '#FED976', '#FEB24C', '#FD8D3C', '#FC4E2A', '#E31A1C', '#BD0026', '#800026' ];
            var idx = Math.round(normalized * colors.length);
            return colors[Math.max(0, Math.min(colors.length - 1, idx))];
        }

        var valueMap = {};
        data.forEach(function (x, idx, arr) {
            valueMap[x._id] = x.rent;
        });

        // pull districts (stolen from loadDistricts())
        var customLayer = L.geoJson(null, {
            // http://leafletjs.com/reference.html#geojson-style
            onEachFeature: function (feature, layer) {
                var value = valueMap[parseInt(feature.properties.description)];
                var formatted = Math.round(value);
                layer.bindPopup(feature.properties.name + ': <strong>' + formatted + suffix + '</strong>');
            },
            style: function (feature) {
                var value = valueMap[parseInt(feature.properties.description)];
                return {
                    weight: 2,
                    opacity: 0.7,
                    color: 'white',
                    dashArray: '3',
                    fillOpacity: 0.5,
                    fillColor: color(value)
                };
            }
        });

        return omnivore.kml('/maps/public/munich-districts.kml', null, customLayer).addTo(map);
    }
}]);



(function($){
    $(function(){
        $('#sidebartoggle').click(function (btn) {
            var sidebar = $('.sidebar');
            var invisible = sidebar.is(':hidden');
            if(invisible) {
                sidebar.fadeIn();
            } else {
                sidebar.fadeOut();
            }
            $('#menu-btn').css('right', (invisible ? 310 : 10) + 'px');
        });
    }); // end of document ready

})(jQuery); // end of jQuery name space
