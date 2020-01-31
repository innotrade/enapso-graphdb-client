// Innotrade Enapso GraphDB Client Example
// (C) Copyright 2019-2020 Innotrade GmbH, Herzogenrath, NRW, Germany
// Author: Alexander Schulze

// require the Enapso GraphDB Client package
const
	fs = require('fs'),
	{ EnapsoGraphDBClient } = require('../index'),
	{ EnapsoLogger } = require('@innotrade/enapso-logger');

global.enlogger = new EnapsoLogger();
enlogger.setLevel(EnapsoLogger.ALL);

// connection data to the running GraphDB instance
const
	GRAPHDB_BASE_URL = 'http://localhost:7200',
	GRAPHDB_REPOSITORY = 'Test',
	GRAPHDB_USERNAME = 'Test',
	GRAPHDB_PASSWORD = 'Test',
	GRAPHDB_CONTEXT_TEST = 'http://ont.enapso.com/test'
	;

// the default prefixes for all SPARQL queries
const DEFAULT_PREFIXES = [
	EnapsoGraphDBClient.PREFIX_OWL,
	EnapsoGraphDBClient.PREFIX_RDF,
	EnapsoGraphDBClient.PREFIX_RDFS,
	EnapsoGraphDBClient.PREFIX_XSD,
	EnapsoGraphDBClient.PREFIX_PROTONS,
	EnapsoGraphDBClient.PREFIX_ENTEST
];

const EnapsoGraphDBClientDemo = {

	graphDBEndpoint: null,
	authentication: null,

	demoQuery: async function () {
		let query = await this.graphDBEndpoint.query(`
select * 
	from <${GRAPHDB_CONTEXT_TEST}>
where {
	?class rdf:type owl:Class
	filter(regex(str(?class), "http://ont.enapso.com/test#TestClass", "i")) .
}`
		);
		if (query.success) {
			let resp = await this.graphDBEndpoint.transformBindingsToResultSet(query);
			enlogger.debug("Query succeeded:\n" + JSON.stringify(resp, null, 2));
		} else {
			let lMsg = query.message;
			if (400 === query.statusCode) {
				lMsg += ', check your query for potential errors';
			} else if (403 === query.statusCode) {
				lMsg += ', check if user "' + GRAPHDB_USERNAME +
					'" has appropriate access rights to the Repository ' +
					'"' + this.graphDBEndpoint.getRepository() + '"';
			}
			enlogger.debug("Query failed (" + lMsg + "):\n" +
				JSON.stringify(query, null, 2));
		}
		return query;
	},

	demoInsert: async function () {
		let resp = await this.graphDBEndpoint.update(`
insert data {
	graph <${GRAPHDB_CONTEXT_TEST}> {
		entest:TestClass rdf:type owl:Class
	}
}`
		);
		enlogger.debug('Insert ' +
			(resp.success ? 'succeeded' : 'failed') +
			':\n' + JSON.stringify(resp, null, 2));
	},

	demoUpdate: async function () {
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
}`
		);
		enlogger.debug('Update ' +
			(resp.success ? 'succeeded' : 'failed') +
			':\n' + JSON.stringify(resp, null, 2));
	},

	demoDelete: async function () {
		let resp = await this.graphDBEndpoint.update(`
with <${GRAPHDB_CONTEXT_TEST}>
delete {
	entest:TestClassUpdated rdf:type owl:Class
}
where {
	entest:TestClassUpdated rdf:type owl:Class
}`
		);
		enlogger.debug('Delete ' +
			(resp.success ? 'succeeded' : 'failed') +
			':\n' + JSON.stringify(resp, null, 2));
	},

	demo: async function () {
		/*
				let prefixes = EnapsoGraphDBClient.parsePrefixes(sparql);
				enlogger.debug(JSON.stringify(prefixes, null, 2));
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

		if (!this.authentication.success) {
			let lMsg = this.authentication.message;
			if (500 === this.authentication.statusCode) {
				if ('ECONNREFUSED' === this.authentication.code) {
					lMsg += ', check if GraphDB is running at ' +
						this.graphDBEndpoint.getBaseURL();
				}
			} else if (401 === this.authentication.statusCode) {
				lMsg += ', check if user "' + GRAPHDB_USERNAME +
					'" is set up in your GraphDB at ' +
					this.graphDBEndpoint.getBaseURL();
			}
			enlogger.debug("Login failed: " + lMsg);
			return;
		}

		// verify authentication
		if (!this.authentication.success) {
			enlogger.debug("\nLogin failed:\n" +
				JSON.stringify(this.authentication, null, 2));
			return;
		}
		enlogger.debug("\nLogin successful"
			// + ':\n' + JSON.stringify(this.authentication, null, 2)
		);

		enlogger.debug('The initial repository should be empty:')
		await this.demoQuery();
		await this.demoInsert();

		enlogger.debug('The query should return one row with the new TestClass:')
		var res = await this.demoQuery();
		// if query successful, write csv to file
		if (res.success) {
			let csv = this.graphDBEndpoint.
				transformBindingsToCSV(res, {
					delimiter: '"',
					delimiterOptional: false
				});
			enlogger.debug("\CSV:\n" +
				JSON.stringify(csv, null, 2));
			fs.writeFileSync(
				'examples/example1.csv',
				// optionally add headers
				csv.headers.join('\r\n') + '\r\n' +
				// add the csv records to the file
				csv.records.join('\r\n'));
		}
		await this.demoUpdate();
		enlogger.debug('The query should return one row with TestClassUpdated:')
		res = await this.demoQuery();
		if (res.success) {
			let csv = this.graphDBEndpoint.
				transformBindingsToSeparatedValues(res, {
					// replace IRIs by prefixes for easier 
					// resultset readability (optional)
					"replacePrefixes": true,
					// drop the prefixes for easier 
					// resultset readability (optional)
					// "dropPrefixes": true,
					"separator": ',',
					"separatorEscape": '\\,',
					"delimiter": '"',
					"delimiterEscape": '\\"'
				}
				);
			fs.writeFileSync(
				'examples/example2.csv',
				// optionally add headers
				csv.headers.join('\r\n') + '\r\n' +
				// add the csv records to the file
				csv.records.join('\r\n'));
		}
		await this.demoDelete();
		enlogger.debug('The query should return no rows anymore:')
		await this.demoQuery();
		enlogger.debug('The demo accomplished.')
	}

}

enlogger.info("Enapso GraphDB Client Demo\n(C) Copyright 2019-2020 Innotrade GmbH, Herzogenrath, NRW, Germany");

(async () => {
	await EnapsoGraphDBClientDemo.demo();
})();
