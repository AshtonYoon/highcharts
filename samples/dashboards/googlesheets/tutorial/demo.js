const googleApiKey = 'AIzaSyCQ0Jh8OFRShXam8adBbBcctlbeeA-qJOk';
const googleSpreadsheetKey = '1Z6vzR7EUZiqLBDZ66jf82rw5kvPBQHzmMLyY4miUVKA';

Dashboards.board('container', {
    dataPool: {
        connectors: [{
            id: 'conn-raw',
            type: 'GoogleSheets',
            options: {
                googleAPIKey: googleApiKey,
                googleSpreadsheetKey: googleSpreadsheetKey
            }
        }, {
            id: 'conn-mod',
            type: 'GoogleSheets',
            options: {
                googleAPIKey: googleApiKey,
                googleSpreadsheetKey: googleSpreadsheetKey,
                beforeParse: data => {
                    // Postfix header items with '*'
                    data.forEach(row => {
                        row[0] += '*';
                    });

                    // Special label from first header item
                    data[0][0] = '-';

                    // Supply Jane with additional pears
                    data[2][3] += 20;

                    // Deprive Joe of his bananas
                    data[3][4] = 0;

                    return data;
                }
            }
        }]
    },
    components: [{
        renderTo: 'dashboard-col-0',
        connector: {
            id: 'conn-raw'
        },
        type: 'DataGrid',
        title: 'Original sheet',
        dataGridOptions: {
            editable: false
        }
    }, {
        renderTo: 'dashboard-col-1',
        connector: {
            id: 'conn-mod'
        },
        type: 'DataGrid',
        title: 'Modified sheet',
        dataGridOptions: {
            editable: false
        }
    }]
});
