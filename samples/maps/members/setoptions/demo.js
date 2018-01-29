

Highcharts.setOptions({
    chart: {
        backgroundColor: '#272822'
    },
    title: {
        style: {
            color: 'white'
        }
    },
    legend: {
        title: {
            style: {
                color: 'silver'
            }
        }
    },
    colorAxis: {
        minColor: '#373832',
        maxColor: '#baFF55'
    }

});

$.getJSON('https://cdn.rawgit.com/highcharts/highcharts/2c6e896/samples/data/world-population-density.json', function (data) {

    // Initiate the chart
    Highcharts.mapChart('container', {

        title: {
            text: 'Set general theme options'
        },

        mapNavigation: {
            enabled: true,
            buttonOptions: {
                verticalAlign: 'bottom'
            }
        },

        colorAxis: {
            min: 1,
            max: 1000,
            type: 'logarithmic'
        },

        legend: {
            title: {
                text: 'Population density (/km²)'
            }
        },

        series: [{
            data: data,
            mapData: Highcharts.maps['custom/world'],
            joinBy: ['iso-a2', 'code'],
            name: 'Population density',
            tooltip: {
                valueSuffix: '/km²'
            }
        }]
    });
});