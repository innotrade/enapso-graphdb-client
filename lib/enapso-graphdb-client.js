// Innotrade Enapso GraphDB Client
// (C) Copyright 2019 Innotrade GmbH, Herzogenrath, NRW, Germany
// Author: Alexander Schulze

// For details regarding the GraphDB API please refer to the following links:
// Authentication: http://graphdb.ontotext.com/documentation/standard/authentication.html

const request = require('request-promise');
const SparqlClient = require('sparql-client-2');
const SPARQL = SparqlClient.SPARQL;
const _ = require('lodash');

const EnapsoGraphDBClient = {

	"FORMAT_JSON": {
		"name": "JSON",
		"type": "application/rdf+json",
		"extension": ".json"
	},
	"FORMAT_JSON_LD": {
		"name": "JSON-LD",
		"type": "application/ld+json",
		"extension": ".jsonld"
	},
	"FORMAT_RDF_XML": {
		"name": "RDF-XML",
		"type": "application/rdf+xml",
		"extension": ".rdf"
	},
	"FORMAT_N3": {
		"name": "N3",
		"type": "text/rdf+n3",
		"extension": ".n3"
	},
	"FORMAT_N_TRIPLES": {
		"name": "N-Triples",
		"type": "text/plain",
		"extension": ".nt"
	},
	"FORMAT_N_QUADS": {
		"name": "N-Quads",
		"type": "text/x-nquads",
		"extension": ".nq"
	},
	"FORMAT_TURTLE": {
		"name": "Turtle",
		"type": "text/turtle",
		"extension": ".ttl"
	},
	"FORMAT_TRIX": {
		"name": "TriX",
		"type": "application/trix",
		"extension": ".trix"
	},
	"FORMAT_TRIG": {
		"name": "TriG",
		"type": "application/x-trig",
		"extension": ".trig"
	},
	"FORMAT_BINARY_RDF": {
		"name": "Binary RDF",
		"type": "application/x-binary-rdf",
		"extension": ".brf"
	},

	// a valuable list of popular prefixes you'll find at
	// http://prefix.cc/popular/all.n3
	// https://gist.github.com/kwijibo/718313/5d539d83cef632e22125b148c4d16d53271c7d60

	"PREFIX_OWL": {
		"prefix": "owl",
		"iri": "http://www.w3.org/2002/07/owl#"
	},
	"PREFIX_RDF": {
		"prefix": "rdf",
		"iri": "http://www.w3.org/1999/02/22-rdf-syntax-ns#"
	},
	"PREFIX_RDFS": {
		"prefix": "rdfs",
		"iri": "http://www.w3.org/2000/01/rdf-schema#"
	},
	"PREFIX_XSD": {
		"prefix": "xsd",
		"iri": "http://www.w3.org/2001/XMLSchema#"
	},
	"PREFIX_FN": {
		"prefix": "fn",
		"iri": "http://www.w3.org/2005/xpath-functions#"
	},
	"PREFIX_SFN": {
		"prefix": "sfn",
		"iri": "http://www.w3.org/ns/sparql#"
	},
	"PREFIX_PROTONS": {
		"prefix": "protons",
		"iri": "http://proton.semanticweb.org/protonsys#"
	},
	"PREFIX_ENTEST": {
		"prefix": "entest",
		"iri": "http://ont.enapso.com/test#"
	},
	"PREFIX_ONTOFN": {
		"prefix": "ontofn",
		"iri": "http://www.ontotext.com/sparql/functions/#"
	},
	"PREFIX_SPIF": {
		"prefix": "spif",
		"iri": "http://spinrdf.org/spif#"
	},
	"PREFIX_APROPF": {
		"prefix": "aprof",
		"iri": "http://jena.hpl.hp.com/ARQ/property#"
	},
	"PREFIX_ALIST": {
		"prefix": "alist",
		"iri": "http://jena.apache.org/ARQ/list#"
	},

	// this is the GraphDB SPARQL endpoint class
	Endpoint: function (aOptions) {
		aOptions = aOptions || {};

		this.mBaseURL = aOptions.baseURL;
		this.mRepository = aOptions.repository;
		this.mQueryURL = aOptions.baseURL + '/repositories/' + aOptions.repository;
		this.mUpdateURL = aOptions.baseURL + '/repositories/' + aOptions.repository + '/statements';
		this.mDefaultContext = aOptions.defaultContext;
		this.mPrefixes = aOptions.prefixes;

		// these are the default headers required for the mClient
		let lRequestDefaults = {
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
				"Accept": "application/sparql-results+json,application/json"
			}
		};

		// set authentication header if user name and password is provided
		if (this.mAuthorization) {
			lRequestDefaults.headers.Authorization = this.mAuthorization;
		} else if (aOptions.username && aOptions.password) {
			lRequestDefaults.headers.Authorization =
				'Basic ' + Buffer.from(aOptions.username +
					':' + aOptions.password).toString('base64');
		}

		let lPrefixes = {};
		if (aOptions.prefixes) {
			_.each(aOptions.prefixes, function (item) {
				lPrefixes[item.prefix] = item.iri;
			});
		}
		this.mClient = new SparqlClient(this.mQueryURL, {
			updateEndpoint: this.mUpdateURL,
			requestDefaults: lRequestDefaults
		}).register(lPrefixes);

	},

	// transforms a JSON in the SPARQL bindings format into a result set with columns
	// optionally the IRI's can be dropped or replaced by their prefixes
	transformBindingsToResultSet: function (aBindings, aOptions) {
		aOptions = aOptions || {};
		let lItems = aBindings.results.bindings;
		// default to an empty result set
		let lRes = {
			total: 0,
			success: false,
			records: []
		}
		for (let lIdx = 0; lIdx < lItems.length; lIdx++) {
			let lItem = lItems[lIdx];
			let lResItem = {};
			for (let lKey in lItem) {
				let lValue = lItem[lKey].value;
				if (aOptions.dropPrefixes) {
					let lPrefixPos = lValue.indexOf('#');
					if (lPrefixPos >= 0) {
						lValue = lValue.substr(lPrefixPos + 1);
					}
				}
				lResItem[lKey] = lValue;
			}
			lRes.records.push(lResItem);
		}
		// set the total amount of row an return the result set
		lRes.total = lRes.records.length;
		lRes.success = true;
		return lRes;
	},

	parsePrefixes: function (sparql) {
		let prefixes = [];
		sparql = sparql.replace('/\r\n/g', '\n');
		let lines = sparql.split('\n');
		for (let line of lines) {
			let tokens = line.split(/\s/);
			if (tokens && tokens.length >= 3) {
				tokens[0] = tokens[0].trim().toLowerCase();
				if (tokens[0] === "prefix") {
					// remove all non A-Z, a-z and _
					let prefix = tokens[1].replace(/[\W]/g, '');
					// remove leading < and trailing >
					let iri = tokens[2].replace(/[\<|\>]/g, '');
					prefixes.push({ prefix, iri });
				}
			}
		}
		return prefixes;
	}

};

EnapsoGraphDBClient.Endpoint.prototype = {

	// query executes a SPARQL update statement against the update URL of GraphDB
	query: async function (aQuery) {
		let me = this;
		return new Promise(function (resolve) {
			if (me.mAuthorization && me.mClient.requestDefaults && me.mClient.requestDefaults.headers) {
				me.mClient.requestDefaults.headers.Authorization = me.mAuthorization;
			}
			me.mClient.query(aQuery)
				.execute()
				.then(function (aBindings) {
					aBindings.success = true;
					resolve(aBindings);
				})
				.catch(function (aError) {
					let lError = {
						statusCode: aError.httpStatus,
						message: aError.message,
						success: false
					};
					resolve(lError);
				});
		});
	},

	// query executes a SPARQL update statement against the update URL of GraphDB
	update: async function (aQuery, aParams) {
		let me = this;
		return new Promise(function (resolve) {
			if (me.mAuthorization && me.mClient.requestDefaults && me.mClient.requestDefaults.headers) {
				me.mClient.requestDefaults.headers.Authorization = me.mAuthorization;
			}
			me.mClient.query(aQuery)
				.execute()
				.then(function (aResponse) {
					if (null === aResponse) {
						aResponse = {
							success: true,
							statusCode: 200,
							message: 'OK',
							params: aParams
						};
					}
					resolve(aResponse);
				})
				.catch(function (aError) {
					let lError = {
						statusCode: aError.httpStatus,
						message: aError.message,
						success: false,
						params: aParams
					};
					resolve(lError);
				});
		});
	},

	login: async function (aUsername, aPassword) {
		let lHeaders = {
			"X-GraphDB-Password": aPassword
		};
		let lOptions = {
			method: 'POST',
			uri: this.mBaseURL + "/rest/login/" + aUsername,
			headers: lHeaders,
			resolveWithFullResponse: true,
			json: true
		};
		var lRes;
		try {
			lRes = await request(lOptions);
			this.mAuthorization = lRes.headers.authorization;
			lRes = {
				"success": true,
				"message": "Login successful",
				"statusCode": 200
			}
		} catch (lErr) {
			lRes = {
				"success": false,
				// "code": lErr.error.code,
				"message": lErr.message,
				"statusCode": lErr.statusCode || 500
			}
			this.mAuthorization = null;
		}
		return lRes;
	},

	logout: async function () {
		this.mAuthorization = null;
	},

	createResultset: function () {
		return {
			success: false,
			code: "OK",
			message: "Resultset is empty",
			total: 0,
			records: []
		};
	},

	getAuthorization: function () {
		return (this.mAuthorization ? this.mAuthorization : null);
	},

	getBaseURL: function () {
		return (this.mBaseURL ? this.mBaseURL : null);
	},

	getRepository: function () {
		return (this.mRepository ? this.mRepository : null);
	},

	getPrefixes: function () {
		return (this.mPrefixes ? this.mPrefixes : null);
	},

	getDefaultContext: function () {
		return (this.mDefaultContext ? this.mDefaultContext : null);
	},

	setDefaultContext: function (aDefaultContext) {
		this.mDefaultContext = aDefaultContext;
	},

	// searches through the list of used prefixes 
	// and returns the prefix for a given IRI
	replacePrefix: function (aIRI) {
		let lParts = aIRI.split('#', 2);
		if (lParts.length > 1) {
			lParts[0] += '#';
			for (let lPrefix of this.mPrefixes) {
				if (lPrefix.iri === lParts[0]) {
					return lPrefix.prefix + ':' + lParts[1];
				}
			}
		}
		return aIRI;
	},

	// transforms a JSON in the SPARQL bindings format into a result set with columns
	// optionally the IRI's can be dropped or replaced by their prefixes
	transformBindingsToResultSet: function (aBindings, aOptions) {
		aOptions = aOptions || {};
		// default to an empty result set
		let lRes = {
			total: 0,
			success: false,
			records: []
		}
		// check if proper bindings are present
		if (!(aBindings &&
			aBindings.results &&
			aBindings.results.bindings)
		) {
			return lRes;
		}
		let lItems = aBindings.results.bindings;
		for (let lItem of lItems) {
			let lResItem = {};
			for (let lKey in lItem) {
				let lValue = lItem[lKey].value;
				if (aOptions.dropPrefixes) {
					let lPrefixPos = lValue.indexOf('#');
					if (lPrefixPos >= 0) {
						lValue = lValue.substr(lPrefixPos + 1);
					}
				} else if (aOptions.replacePrefixes) {
					lValue = this.replacePrefix(lValue);
				}
				lResItem[lKey] = lValue;
			}
			lRes.records.push(lResItem);
		}
		// set the total amount of row an return the result set
		lRes.total = lRes.records.length;
		lRes.success = true;
		return lRes;
	},

	// transforms the SPARQL bindings into a value separated text format
	// optionally the IRI's can be dropped or replaced by their prefixes
	transformBindingsToSeparatedValues: function (aBindings, aOptions) {
		aOptions = aOptions || {};
		let lHeadVars = aBindings.head.vars;
		let lBindings = aBindings.results.bindings;
		// default to an empty result set
		let lRes = {
			total: 0,
			success: false,
			headers: [],
			records: []
		}

		let lSeparator = (aOptions.separator ? aOptions.separator : ',');
		let lSeparatorEscape = (aOptions.separatorEscape !== undefined ? aOptions.separatorEscape : '\\,');

		let lDelimiter = (aOptions.delimiter !== undefined ? aOptions.delimiter : '"');
		let lDelimiterOptional = (aOptions.delimiterOptional !== undefined ? aOptions.delimiterOptional : true);
		let lDelimiterEscape = (aOptions.delimiterEscape !== undefined ? aOptions.delimiterEscape : '\\"');

		let lRegExpSeparator = new RegExp(lSeparator, "g");
		let lRegExpDelimiter = new RegExp(lDelimiter, "g");

		let me = this;

		let adjustValue = function (lValue) {

			if (lValue === undefined) {
				lValue = "";
			} else if (typeof lValue !== "string") {
				lValue = String(lValue);
			}

			if (aOptions.dropPrefixes) {
				let lPrefixPos = lValue.indexOf('#');
				if (lPrefixPos >= 0) {
					lValue = lValue.substr(lPrefixPos + 1);
				}
			} else if (aOptions.replacePrefixes) {
				lValue = me.replacePrefix(lValue);
			}

			// optionally replace string delimiters in payload
			if (lDelimiterEscape && lDelimiter) {
				lValue = lValue.replace(lRegExpDelimiter, lDelimiterEscape);
			}

			// optionally add string delimiters
			if (lDelimiter) {
				// in case of optional string delimiters, 
				// only add them if a separator is part of the value
				if (!lDelimiterOptional || (lDelimiterOptional && lValue.indexOf(lSeparator) >= 0)) {
					lValue = lDelimiter + lValue + lDelimiter;
				}
			}

			// optionally replace separators in payload
			if (lSeparatorEscape && lSeparator) {
				lValue = lValue.replace(lRegExpSeparator, lSeparatorEscape);
			}

			return lValue;
		};

		let lRow = '';
		let lKeys = [];
		for (let lIdx = 0; lIdx < lHeadVars.length; lIdx++) {
			let lValue = adjustValue(lHeadVars[lIdx]);
			lKeys.push(lValue);
			lRow += (lRow.length > 0 ? lSeparator : '') + lValue;
		}
		lRes.headers.push(lRow);

		for (let lIdx = 0; lIdx < lBindings.length; lIdx++) {
			let lItem = lBindings[lIdx];
			let lRow = '';
			for (let lKey of lKeys) {
				let lValue, lField = lItem[lKey];
				if (lField !== undefined) {
					lValue = adjustValue(lField.value);
				} else {
					lValue = '';
				}
				lRow += (lRow.length > 0 ? lSeparator : '') + lValue;
			}
			lRes.records.push(lRow);
		}

		// set the total amount of row an return the result set
		lRes.total = lRes.records.length;
		lRes.success = true;
		return lRes;
	},

	transformBindingsToCSV: function (aBindings, aOptions) {
		aOptions = aOptions || {};
		aOptions.separator = aOptions.separator || ',';
		aOptions.separatorEscape = aOptions.separatorEscape !== undefined ? aOptions.separatorEscape : '\\,';
		aOptions.delimiter = aOptions.delimiter || '' /* '"' */;
		aOptions.delimiterOptional = aOptions.delimiterOptional !== undefined ? aOptions.delimiterOptional : true;
		aOptions.delimiterEscape = aOptions.delimiterEscape || '' /* '\\"' */;
		return this.transformBindingsToSeparatedValues(aBindings, aOptions);
	},

	transformBindingsToTSV: function (aBindings, aOptions) {
		aOptions = aOptions || {};
		aOptions.separator = aOptions.separator || '\t';
		aOptions.separatorEscape = aOptions.separatorEscape || '\\t';
		aOptions.delimiter = aOptions.delimiter || '';
		aOptions.delimiterOptional = aOptions.delimiterOptional !== undefined ? aOptions.delimiterOptional : true;
		aOptions.delimiterEscape = aOptions.delimiterEscape || '';
		return this.transformBindingsToSeparatedValues(aBindings, aOptions);
	},

	groupResultSet: function (aResultSet, aGroupBy) {
		// group results by tag
		let lMap = _.groupBy(aResultSet.records, aGroupBy);
		// remove all now obsolete tag fields
		lMap = _.forEach(
			lMap,
			function (col) {
				_.forEach(
					col,
					function (field) {
						delete field.tag;
					}
				)
			}
		);
		return lMap;
	},

	mapKeys: function (aGroupedResultSet, aMap) {
		return _.mapKeys(aGroupedResultSet, function (value, key, object) {
			return aMap[key] ? aMap[key] : key;
		});
	}

}

module.exports = EnapsoGraphDBClient