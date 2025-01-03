QUnit.test('Test Price Channel indicator.', function (assert) {
    var chart = Highcharts.stockChart('container', {
        series: [
            {
                id: 'main',
                type: 'candlestick',
                data: [
                    [0, 183.4, 184.92, 180.73, 182.17],
                    [1, 182.69, 186.53, 182.54, 184.43],
                    [2, 185.25, 187.28, 184.03, 184.16],
                    [3, 183.94, 186.21, 183.8, 185.5],
                    [4, 186.38, 187.19, 182.91, 185.11],
                    [5, 183.68, 187.3, 183.42, 187.18],
                    [6, 187.77, 187.95, 183.54, 183.92],
                    [7, 185.33, 186.41, 184.28, 185.4],
                    [8, 185.42, 188.43, 185.2, 187.97],
                    [9, 189.44, 190.68, 189.3, 190.58],
                    [10, 190.8, 191.28, 190.18, 190.35],
                    [11, 188.69, 189.77, 187.61, 187.88],
                    [12, 189.49, 191.41, 189.31, 191.11],
                    [13, 191.16, 191.84, 190.9, 191.33],
                    [14, 191.65, 192.65, 190.41, 190.91],
                    [15, 189.75, 191.87, 189.2, 191.45],
                    [16, 191.76, 191.8, 189.93, 190.4],
                    [17, 189.79, 192.55, 189.69, 191.88],
                    [18, 191.93, 192.43, 190.17, 191.44],
                    [19, 190.64, 191.96, 189.56, 191.61],
                    [20, 192.2, 193.66, 192.05, 193],
                    [21, 193, 194.85, 192.43, 194.82],
                    [22, 194.6, 195.96, 193.61, 194.21],
                    [23, 195, 195.19, 190.1, 190.98],
                    [24, 191.9, 192.2, 189.07, 189.91],
                    [25, 190.31, 192.14, 189.14, 189.34],
                    [26, 199.02, 201.76, 197.31, 201.5],
                    [27, 200.38, 208.38, 200.35, 207.39],
                    [28, 207.05, 208.74, 205.48, 207.99],
                    [29, 207.93, 209.25, 207.07, 209.07],
                    [30, 209.45, 209.5, 206.76, 207.11],
                    [31, 206.05, 207.81, 204.52, 207.25],
                    [32, 207.5, 209.78, 207.2, 208.88],
                    [33, 207.31, 209.1, 206.67, 207.53],
                    [34, 207.7, 210.95, 207.7, 208.87],
                    [35, 210.15, 210.56, 208.26, 209.75],
                    [36, 209, 210.74, 208.33, 210.24],
                    [37, 211.93, 213.81, 211.47, 213.32],
                    [38, 213.47, 217.95, 213.16, 217.58]
                ]
            },
            {
                type: 'pc',
                linkedTo: 'main'
            }
        ]
    });

    function arrToPrecision(arr) {
        return arr.map(function (point) {
            return point.map(function (value) {
                return Math.round(value * 100) / 100;
            });
        });
    }

    assert.strictEqual(
        chart.series[0].points.length,
        chart.series[1].points.length +
            chart.series[1].options.params.period -
            1,
        'Initial number of Price Channel points is correct'
    );
    chart.series[0].addPoint([39, 218.17, 219.18, 215.11, 215.46]);

    assert.strictEqual(
        chart.series[0].points.length,
        chart.series[1].points.length +
            chart.series[1].options.params.period -
            1,
        'After addPoint number of Price Channel points is correct'
    );

    chart.series[1].update({
        color: 'green'
    });


    const getValues = series => (

        series.getColumn('x').map((x, i) => [
            series.getColumn('top')[i],
            series.getColumn('middle')[i],
            series.getColumn('bottom')[i]
        ])
    );

    assert.deepEqual(
        arrToPrecision(getValues(chart.series[1])),
        [
            [192.65, 186.69, 180.73],
            [193.66, 188.1, 182.54],
            [194.85, 188.88, 182.91],
            [195.96, 189.44, 182.91],
            [195.96, 189.44, 182.91],
            [195.96, 189.69, 183.42],
            [195.96, 189.75, 183.54],
            [201.76, 193.02, 184.28],
            [208.38, 196.79, 185.2],
            [208.74, 198.18, 187.61],
            [209.25, 198.43, 187.61],
            [209.5, 198.56, 187.61],
            [209.5, 199.29, 189.07],
            [209.78, 199.43, 189.07],
            [209.78, 199.43, 189.07],
            [210.95, 200.01, 189.07],
            [210.95, 200.01, 189.07],
            [210.95, 200.01, 189.07],
            [213.81, 201.44, 189.07],
            [217.95, 203.51, 189.07],
            [219.18, 204.13, 189.07]
        ],
        'Correct values'
    );
    assert.strictEqual(
        chart.series[1].graph.attr('stroke'),
        'green',
        'Middle line color changed'
    );

    chart.series[1].update({
        topLine: {
            styles: {
                lineColor: 'red'
            }
        },
        bottomLine: {
            styles: {
                lineColor: 'blue'
            }
        }
    });

    assert.strictEqual(
        chart.series[1].graphtopLine.attr('stroke'),
        'red',
        'Top line color changed'
    );

    assert.strictEqual(
        chart.series[1].graphbottomLine.attr('stroke'),
        'blue',
        'Bottom line color changed'
    );
    chart.series[0].points[39].remove();

    assert.deepEqual(
        arrToPrecision(getValues(chart.series[1])),
        [
            [192.65, 186.69, 180.73],
            [193.66, 188.1, 182.54],
            [194.85, 188.88, 182.91],
            [195.96, 189.44, 182.91],
            [195.96, 189.44, 182.91],
            [195.96, 189.69, 183.42],
            [195.96, 189.75, 183.54],
            [201.76, 193.02, 184.28],
            [208.38, 196.79, 185.2],
            [208.74, 198.18, 187.61],
            [209.25, 198.43, 187.61],
            [209.5, 198.56, 187.61],
            [209.5, 199.29, 189.07],
            [209.78, 199.43, 189.07],
            [209.78, 199.43, 189.07],
            [210.95, 200.01, 189.07],
            [210.95, 200.01, 189.07],
            [210.95, 200.01, 189.07],
            [213.81, 201.44, 189.07],
            [217.95, 203.51, 189.07]
        ],
        'Correct values after point.remove()'
    );
});
