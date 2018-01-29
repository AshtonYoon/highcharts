

$.getJSON('https://cdn.rawgit.com/highcharts/highcharts/2c6e896/samples/data/world-population-density.json', function (data) {

    // Initiate the chart
    Highcharts.mapChart('container', {

        title: {
            text: 'Credits with custom text, href and position'
        },

        credits: {
            text: 'Example.com',
            href: 'http://www.example.com',
            position: {
                align: 'left',
                x: 10
            }
        },

        mapNavigation: {
            enabled: true,
            buttonOptions: {
                verticalAlign: 'bottom'
            }
        },

        legend: {
            title: {
                text: 'Population density per km²'
            }
        },

        colorAxis: {
            min: 1,
            max: 1000,
            type: 'logarithmic'
        },

        series: [{
            data: data,
            mapData: Highcharts.maps['custom/world'],
            joinBy: ['iso-a2', 'code'],
            name: 'Population density',
            states: {
                hover: {
                    color: '#a4edba'
                }
            },
            tooltip: {
                valueSuffix: '/km²'
            }
        }]
    });
});