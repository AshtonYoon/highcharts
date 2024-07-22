Highcharts.chart('container', {
    series: [{
        name: 'Regions',
        type: 'treemap',
        // layoutAlgorithm: 'squarified',
        // groupAreaThreshold: 1000,
        groupAreaThreshold: {
            enabled: true,
            width: 60,
            height: 25
        },
        data: [{
            name: 'Parent 1',
            id: 'par1',
            color: 'red'
        }, {
            value: 600,
            name: 'A',
            parent: 'par1'
        }, {
            value: 200,
            name: 'B',
            parent: 'par1'
        }, {
            value: 1,
            name: 'C',
            parent: 'par1'
        }, {
            value: 3,
            name: 'D',
            parent: 'par1'
        }, {
            value: 2,
            name: 'E',
            parent: 'par1'
        }, {
            value: 4,
            name: 'F',
            parent: 'par1'
        }, {
            value: 2,
            name: 'G',
            parent: 'par1'
        }, {
            value: 4,
            name: 'H',
            parent: 'par1'
        }, {
            name: 'Parent 2',
            id: 'par2',
            color: 'green'
        }, {
            value: 600,
            name: 'A2',
            parent: 'par2'
        }, {
            value: 200,
            name: 'B2',
            parent: 'par2'
        }, {
            value: 1,
            name: 'C2',
            parent: 'par2'
        }, {
            value: 3,
            name: 'D2',
            parent: 'par2'
        }, {
            value: 2,
            name: 'E2',
            parent: 'par2'
        }, {
            value: 4,
            name: 'F2',
            parent: 'par2'
        }, {
            value: 2,
            name: 'G2',
            parent: 'par2'
        }, {
            value: 4,
            name: 'H2',
            parent: 'par2'
        }]
    }]
});
