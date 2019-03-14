// Innotrade Enapso GraphDB Client Example
// (C) Copyright 2019 Innotrade GmbH, Herzogenrath, NRW, Germany
// Author: Alexander Schulze

// require the Enapso GraphDB Client package
const { EnapsoGraphDBClient } = require("../index");
const fs = require("fs");

// demo SPARQL query
let DEMO_QUERY = `
select * 
where {?s ?p ?o}
limit 2
`;

// query to get all individuals of the class Person
let DEMO_QUERY_INDIVIDUALS = `
select ?iri ?firstName ?lastName
where {
    ?iri a et:Person
    optional {
        ?iri et:firstName ?firstName .
        ?iri et:lastName ?lastName .
    }
}
limit 2
`;

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
	{
		"prefix": "et",
		"iri": "http://ont.enapso.com/test#"
	}
];

const EnapsoGraphDBClientDemo = {

	graphDBEndpoint: null,
	authentication: null,

	createEndpoint: async function () {
		// instantiate a new GraphDB endpoint
		return new EnapsoGraphDBClient.Endpoint({
			baseURL: GRAPHDB_BASE_URL,
			repository: GRAPHDB_REPOSITORY,
			prefixes: DEFAULT_PREFIXES
		});
	},

	login: async function () {
		// login into GraphDB using JWT
		let lRes = await this.graphDBEndpoint.login(
			GRAPHDB_USERNAME,
			GRAPHDB_PASSWORD
		);
		return lRes;
	},

	demoQuery: async function () {
		// perform a query
		let query = `
select * 
	from <${GRAPHDB_CONTEXT_TEST}>
where {
	?class rdf:type owl:Class
	filter(regex(str(?class), "http://ont.enapso.com/test#TestClass", "i")) .
} `;
		let binding = await this.graphDBEndpoint.query(query);
		// if a result was successfully returned
		if (binding.success) {
			// transform the bindings into a more convenient result format (optional)
			let resp = EnapsoGraphDBClient.transformBindingsToResultSet(binding, {
				// drop the prefixes for easier resultset readability (optional)
				dropPrefixes: false
			});
			console.log("Query succeeded:\n" + JSON.stringify(resp, null, 2));
		} else {
			console.log("Query failed:\n" + JSON.stringify(binding, null, 2));
		}
	},

	demoInsert: async function () {
		// perform an update (insert operation)
		let update = `
insert data {
	graph <${GRAPHDB_CONTEXT_TEST}> {
		et:TestClass rdf:type owl:Class
	}
}
		`;
		let resp = await this.graphDBEndpoint.update(update);
		// if a result was successfully returned
		if (resp.success) {
			console.log("Insert succeeded:\n" + JSON.stringify(resp, null, 2));
		} else {
			console.log("Insert failed:\n" + JSON.stringify(resp, null, 2));
		}
	},

	demoUpdate: async function () {
		// perform an update (update operation)
		let update = `
with <${GRAPHDB_CONTEXT_TEST}>
delete {
	et:TestClass rdf:type owl:Class
}
insert {
	et:TestClassUpdated rdf:type owl:Class
}
where {
	et:TestClass rdf:type owl:Class
}
		`;
		let resp = await this.graphDBEndpoint.update(update);
		// if a result was successfully returned
		if (resp.success) {
			console.log("Update succeeded:\n" + JSON.stringify(resp, null, 2));
		} else {
			console.log("Update failed:\n" + JSON.stringify(resp, null, 2));
		}
	},

	demoDelete: async function () {
		// perform an update (delete operation)
		let update = `
with <http://ont.enapso.com/test>
delete {
	et:TestClassUpdated rdf:type owl:Class
}
where {
	et:TestClassUpdated rdf:type owl:Class
}
		`;
		let resp = await this.graphDBEndpoint.update(update);
		// if a result was successfully returned
		if (resp.success) {
			console.log("Delete succeeded:\n" + JSON.stringify(resp, null, 2));
		} else {
			console.log("Delete failed:\n" + JSON.stringify(resp, null, 2));
		}
	},

	demo: async function () {
		this.graphDBEndpoint = await this.createEndpoint();
		this.authentication = await this.login();
		// verify authentication
		if (!this.authentication.success) {
			console.log("\nLogin failed:\n" +
				JSON.stringify(this.authentication, null, 2));
			return;
		}
		console.log("\nLogin successful"
			// + ':\n' + JSON.stringify(this.authentication, null, 2)
		);

		await this.demoQuery();
		await this.demoInsert();
		await this.demoQuery();
		await this.demoUpdate();
		await this.demoQuery();
		await this.demoDelete();
		await this.demoQuery();
	}

}

console.log("Enapso GraphDB Client Demo");

(async () => {
	await EnapsoGraphDBClientDemo.demo();
})();

	// // demonstrate a SPARQL query against GraphDB
	// (async () => {
	// 	// instantiate the GraphDB endpoint
	// 	var graphDBEndpoint = new EnapsoGraphDBClient.Endpoint({
	// 		baseURL: GRAPHDB_BASE_URL,
	// 		repository: GRAPHDB_REPOSITORY,
	// 		// username and password are required here only 
	// 		// if you want to use basic authentication
	// 		// however, for security reasons it is 
	// 		// strongly recommended to use JWT
	// 		// username: GRAPHDB_USERNAME,
	// 		// password: GRAPHDB_PASSWORD,
	// 		prefixes: DEFAULT_PREFIXES
	// 	});

	// 	// use the preferred way to login via JWT
	// 	// and persist returned access token internally
	// 	// for future requests using this endpoint
	// 	let login = await graphDBEndpoint.login(
	// 		GRAPHDB_USERNAME, GRAPHDB_PASSWORD
	// 	);
	// 	if (!login.success) {
	// 		// if login was not successful, exit
	// 		let lMsg = login.message;
	// 		if (500 === login.statusCode) {
	// 			if ('ECONNREFUSED' === login.code) {
	// 				lMsg += ', check if GraphDB is running at ' +
	// 					graphDBEndpoint.getBaseURL();
	// 			}
	// 		} else if (401 === login.statusCode) {
	// 			lMsg += ', check if user "' + GRAPHDB_USERNAME +
	// 				'" is set up in your GraphDB at ' +
	// 				graphDBEndpoint.getBaseURL();
	// 		}
	// 		console.log("Login failed: " + lMsg);
	// 		return;
	// 	}
	// 	console.log("Login successful"
	// 		// the "login" object exposes more details on demand
	// 		// especially the authentication token and the
	// 		// user's roles configured in GraphDB for
	// 		// subsequent requests in case of JWT authentication
	// 		// + ": " + JSON.stringify(login, null, 2)
	// 	);

	// 	// execute the SPARQL query against the GraphDB endpoint
	// 	// the access token is used to authorize the request
	// 	let query = await graphDBEndpoint.query(DEMO_QUERY);

	// 	if (!query.success) {
	// 		let lMsg = query.message;
	// 		if (403 === query.statusCode) {
	// 			lMsg += ', check if user "' + GRAPHDB_USERNAME +
	// 				'" has appropriate access rights to the Repository ' +
	// 				'"' + graphDBEndpoint.getRepository() + '"';
	// 		}
	// 		console.log("Query failed: " + lMsg);
	// 		return;
	// 	}

	// 	// if a result was successfully returned
	// 	// log original SPARQL result and 
	// 	// beautified result set to the console
	// 	console.log("\nBinding:\n" +
	// 		JSON.stringify(query, null, 2));

	// 	// transform the bindings into a 
	// 	// more convenient result format (optional)
	// 	resultset = graphDBEndpoint.
	// 		transformBindingsToResultSet(
	// 			query, {
	// 				// drop or replace the prefixes for easier 
	// 				// resultset readability (optional)
	// 				replacePrefixes: true
	// 				// dropPrefixes: true
	// 			}
	// 		);
	// 	console.log("\nResultset:\n" +
	// 		JSON.stringify(resultset, null, 2));

	// 	csv = graphDBEndpoint.
	// 		transformBindingsToCSV(query);
	// 	/*
	// 		transformBindingsToSeparatedValues(
	// 			query, {
	// 				// replace IRIs by prefixes for easier 
	// 				// resultset readability (optional)
	// 				"replacePrefixes": true,
	// 				// drop the prefixes for easier 
	// 				// resultset readability (optional)
	// 				// "dropPrefixes": true,
	// 				"separator": ',',
	// 				"separatorEscape": '\\,',
	// 				"delimiter": '"',
	// 				"delimiterEscape": '\\"'
	// 			}
	// 		);
	// 	*/
	// 	console.log("\CSV:\n" +
	// 		JSON.stringify(csv, null, 2));
	// 	fs.writeFileSync(
	// 		'examples/examples.csv',
	// 		// optionally add headers
	// 		csv.headers.join('\r\n') + '\r\n' +
	// 		// add the csv records to the file
	// 		csv.records.join('\r\n')
	// 	);

	// })();
