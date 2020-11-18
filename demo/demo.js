// Innotrade enapso GraphDB Client Example
// (C) Copyright 2019-2020 Innotrade GmbH, Herzogenrath, NRW, Germany
// Author: Alexander Schulze

// require the enapso GraphDB Client and the enapso Logger package
require('@innotrade/enapso-config');
const fs = require('fs'),
    { EnapsoGraphDBClient } = require('../index'),
    { EnapsoLogger, EnapsoLoggerFactory } = require('@innotrade/enapso-logger');
EnapsoLoggerFactory.createGlobalLogger('enLogger');
enLogger.setLevel(EnapsoLogger.ALL);

// connection data to the running GraphDB instance
const GRAPHDB_BASE_URL = encfg.getConfig(
        'enapsoDefaultGraphDB.baseUrl',
        'http://localhost:7200'
    ),
    GRAPHDB_REPOSITORY = encfg.getConfig(
        'enapsoDefaultGraphDB.repository',
        'Test'
    ),
    GRAPHDB_USERNAME = encfg.getConfig(
        'enapsoDefaultGraphDB.userName',
        'admin'
    ),
    GRAPHDB_PASSWORD = encfg.getConfig('enapsoDefaultGraphDB.password', 'root'),
    GRAPHDB_CONTEXT_TEST = encfg.getConfig(
        'enapsoDefaultGraphDB.contextTest',
        'http://ont.enapso.com/test'
    );

const DEFAULT_PREFIXES = [
    EnapsoGraphDBClient.PREFIX_OWL,
    EnapsoGraphDBClient.PREFIX_RDF,
    EnapsoGraphDBClient.PREFIX_RDFS,
    EnapsoGraphDBClient.PREFIX_XSD,
    EnapsoGraphDBClient.PREFIX_PROTONS,
    {
        prefix: encfg.getConfig('enapsoDefaultGraphDB.prefix', 'entest'),
        iri: encfg.getConfig(
            'enapsoDefaultGraphDB.iri',
            'http://ont.enapso.com/test#'
        )
    }
];

const EnapsoGraphDBClientDemo = {
    graphDBEndpoint: null,
    authentication: null,

    demoQuery: async function () {
        try {
            let query = await this.graphDBEndpoint.query(`
select * 
	from <${GRAPHDB_CONTEXT_TEST}>
where {
	?class rdf:type owl:Class
	filter(regex(str(?class), "http://ont.enapso.com/test#TestClass", "i")) .
}`);
            if (query.success) {
                let resp = await this.graphDBEndpoint.transformBindingsToResultSet(
                    query
                );
                enLogger.debug(
                    'Query succeeded:\n' + JSON.stringify(resp, null, 2)
                );
            } else {
                let lMsg = query.message;
                if (400 === query.statusCode) {
                    lMsg += ', check your query for potential errors';
                } else if (403 === query.statusCode) {
                    lMsg +=
                        ', check if user "' +
                        GRAPHDB_USERNAME +
                        '" has appropriate access rights to the Repository ' +
                        '"' +
                        this.graphDBEndpoint.getRepository() +
                        '"';
                }
                enLogger.debug(
                    'Query failed (' +
                        lMsg +
                        '):\n' +
                        JSON.stringify(query, null, 2)
                );
            }
            return query;
        } catch (err) {
            console.log(err);
        }
    },

    demoInsert: async function () {
        try {
            let resp = await this.graphDBEndpoint.update(`
insert data {
	graph <${GRAPHDB_CONTEXT_TEST}> {
		entest:TestClass rdf:type owl:Class
	}
}`);
            enLogger.debug(
                'Insert ' +
                    (resp.success ? 'succeeded' : 'failed') +
                    ':\n' +
                    JSON.stringify(resp, null, 2)
            );
        } catch (err) {
            console.log(err);
        }
    },

    demoUpdate: async function () {
        try {
            let resp = await this.graphDBEndpoint.update(`
with <${GRAPHDB_CONTEXT_TEST}>
delete {
	entest:TestClass rdf:type owl:Class
}
insert {
	entest:TestClassUpdated rdf:type owl:Class
}
where {
	entest:TestClass rdf:type owl:Class
}`);
            enLogger.debug(
                'Update ' +
                    (resp.success ? 'succeeded' : 'failed') +
                    ':\n' +
                    JSON.stringify(resp, null, 2)
            );
        } catch (err) {
            console.log(err);
        }
    },

    demoDelete: async function () {
        try {
            let resp = await this.graphDBEndpoint.update(`
with <${GRAPHDB_CONTEXT_TEST}>
delete {
	entest:TestClassUpdated rdf:type owl:Class
}
where {
	entest:TestClassUpdated rdf:type owl:Class
}`);
            enLogger.debug(
                'Delete ' +
                    (resp.success ? 'succeeded' : 'failed') +
                    ':\n' +
                    JSON.stringify(resp, null, 2)
            );
        } catch (err) {
            console.log(err);
        }
    },

    demo: async function () {
        try {
            /*
				let prefixes = EnapsoGraphDBClient.parsePrefixes(sparql);
				enLogger.debug(JSON.stringify(prefixes, null, 2));
				return;
        */

            this.graphDBEndpoint = new EnapsoGraphDBClient.Endpoint({
                baseURL: GRAPHDB_BASE_URL,
                repository: GRAPHDB_REPOSITORY,
                prefixes: DEFAULT_PREFIXES
            });
            this.authentication = await this.graphDBEndpoint.login(
                GRAPHDB_USERNAME,
                GRAPHDB_PASSWORD
            );
            enLogger.debug(
                '\nLogin successful' +
                    ':\n' +
                    JSON.stringify(this.authentication, null, 2)
            );

            enLogger.debug('The initial repository should be empty:');
            await this.demoQuery();
            await this.demoInsert();

            enLogger.debug(
                'The query should return one row with the new TestClass:'
            );
            var res = await this.demoQuery();
            // if query successful, write csv to file
            if (res.success) {
                let csv = this.graphDBEndpoint.transformBindingsToCSV(res, {
                    delimiter: '"',
                    delimiterOptional: false
                });
                enLogger.debug('CSV:\n' + JSON.stringify(csv, null, 2));
                fs.writeFileSync(
                    'example1.csv',
                    // optionally add headers
                    csv.headers.join('\r\n') +
                        '\r\n' +
                        // add the csv records to the file
                        csv.records.join('\r\n')
                );
            }
            await this.demoUpdate();
            enLogger.debug(
                'The query should return one row with TestClassUpdated:'
            );
            res = await this.demoQuery();
            if (res.success) {
                let csv = this.graphDBEndpoint.transformBindingsToSeparatedValues(
                    res,
                    {
                        // replace IRIs by prefixes for easier
                        // resultset readability (optional)
                        replacePrefixes: true,
                        // drop the prefixes for easier
                        // resultset readability (optional)
                        // "dropPrefixes": true,
                        separator: ',',
                        separatorEscape: '\\,',
                        delimiter: '"',
                        delimiterEscape: '\\"'
                    }
                );
                fs.writeFileSync(
                    'example2.csv',
                    // optionally add headers
                    csv.headers.join('\r\n') +
                        '\r\n' +
                        // add the csv records to the file
                        csv.records.join('\r\n')
                );
            }
            await this.demoDelete();
            enLogger.debug('The query should return no rows anymore:');
            await this.demoQuery();
            enLogger.debug('The demo accomplished.');
        } catch (err) {
            console.log(err);
        }
    }
};

enLogger.info(
    'enapso GraphDB Client Demo\n(C) Copyright 2019-2020 Innotrade GmbH, Herzogenrath, NRW, Germany\n'
);

(async () => {
    await EnapsoGraphDBClientDemo.demo();
})();
