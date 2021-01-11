// Innotrade Enapso GraphDB Client
// (C) Copyright 2019-2020 Innotrade GmbH, Herzogenrath, NRW, Germany
// Author: Alexander Schulze

// For details regarding the GraphDB API please refer to the following links:
// Authentication: http://graphdb.ontotext.com/documentation/standard/authentication.html

const request = require('request-promise');
const SparqlClient = require('sparql-client-2');
const _ = require('lodash');

const EnapsoGraphDBClient = {
    FORMAT_JSON: {
        name: 'JSON',
        type: 'application/rdf+json',
        extension: '.json'
    },
    FORMAT_JSON_LD: {
        name: 'JSON-LD',
        type: 'application/ld+json',
        extension: '.jsonld'
    },
    FORMAT_RDF_XML: {
        name: 'RDF-XML',
        type: 'application/rdf+xml',
        extension: '.rdf'
    },
    FORMAT_N3: {
        name: 'N3',
        type: 'text/rdf+n3',
        extension: '.n3'
    },
    FORMAT_N_TRIPLES: {
        name: 'N-Triples',
        type: 'text/plain',
        extension: '.nt'
    },
    FORMAT_N_QUADS: {
        name: 'N-Quads',
        type: 'text/x-nquads',
        extension: '.nq'
    },
    FORMAT_TURTLE: {
        name: 'Turtle',
        type: 'text/turtle',
        extension: '.ttl'
    },
    FORMAT_TRIX: {
        name: 'TriX',
        type: 'application/trix',
        extension: '.trix'
    },
    FORMAT_TRIG: {
        name: 'TriG',
        type: 'application/x-trig',
        extension: '.trig'
    },
    FORMAT_BINARY_RDF: {
        name: 'Binary RDF',
        type: 'application/x-binary-rdf',
        extension: '.brf'
    },

    // a valuable list of popular prefixes you'll find at
    // http://prefix.cc/popular/all.n3
    // https://gist.github.com/kwijibo/718313/5d539d83cef632e22125b148c4d16d53271c7d60

    PREFIX_OWL: {
        prefix: 'owl',
        iri: 'http://www.w3.org/2002/07/owl#'
    },
    PREFIX_RDF: {
        prefix: 'rdf',
        iri: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#'
    },
    PREFIX_RDFS: {
        prefix: 'rdfs',
        iri: 'http://www.w3.org/2000/01/rdf-schema#'
    },
    PREFIX_SESAME: {
        prefix: 'sesame',
        iri: 'http://www.openrdf.org/schema/sesame#'
    },
    PREFIX_XSD: {
        prefix: 'xsd',
        iri: 'http://www.w3.org/2001/XMLSchema#'
    },
    PREFIX_FN: {
        prefix: 'fn',
        iri: 'http://www.w3.org/2005/xpath-functions#'
    },
    PREFIX_SFN: {
        prefix: 'sfn',
        iri: 'http://www.w3.org/ns/sparql#'
    },
    PREFIX_PROTONS: {
        prefix: 'protons',
        iri: 'http://proton.semanticweb.org/protonsys#'
    },
    PREFIX_ENTEST: {
        prefix: 'entest',
        iri: 'http://ont.enapso.com/test#'
    },
    PREFIX_ONTOFN: {
        prefix: 'ontofn',
        iri: 'http://www.ontotext.com/sparql/functions/#'
    },
    PREFIX_SPIF: {
        prefix: 'spif',
        iri: 'http://spinrdf.org/spif#'
    },
    PREFIX_APROPF: {
        prefix: 'aprof',
        iri: 'http://jena.hpl.hp.com/ARQ/property#'
    },
    PREFIX_ALIST: {
        prefix: 'alist',
        iri: 'http://jena.apache.org/ARQ/list#'
    },

    // this is the GraphDB SPARQL endpoint class
    Endpoint: function (aOptions) {
        aOptions = aOptions || {};
        let queryPath =
            aOptions.queryPath !== undefined
                ? aOptions.queryPath
                : `/repositories/${aOptions.repository}`;
        let updatePath =
            aOptions.updatePath !== undefined
                ? aOptions.updatePath
                : `/repositories/${aOptions.repository}/statements`;
        this.mBaseURL = aOptions.baseURL;
        this.mRepository = aOptions.repository;
        this.mQueryURL = `${aOptions.baseURL}${queryPath}`;
        this.mUpdateURL = `${aOptions.baseURL}${updatePath}`;
        this.mDefaultContext = aOptions.defaultContext;
        this.mPrefixes = aOptions.prefixes;
        this.transform = aOptions.transform ? aOptions.transform : 'default';

        // these are the default headers required for the mClient
        const lRequestDefaults = {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Accept: 'application/sparql-results+json,application/json'
            }
        };

        // set authentication header if user name and password is provided
        if (this.mAuthorization) {
            lRequestDefaults.headers.Authorization = this.mAuthorization;
        } else if (aOptions.username && aOptions.password) {
            lRequestDefaults.headers.Authorization = `Basic ${Buffer.from(
                `${aOptions.username}:${aOptions.password}`
            ).toString('base64')}`;
        }

        const lPrefixes = {};
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
    transformBindingsToResultSet(aBindings, aOptions) {
        aOptions = aOptions || {};
        let lItems = aBindings.results.bindings;
        // default to an empty result set
        let lRes = {
            total: 0,
            success: false,
            records: []
        };
        for (let lIdx = 0; lIdx < lItems.length; lIdx++) {
            let lItem = lItems[lIdx];
            let lResItem = {};
            for (let lKey in lItem) {
                let lValue = lItem[lKey].value;

                let datatype = lItem[lKey].datatype;
                if (datatype) {
                    if (
                        datatype === 'http://www.w3.org/2001/XMLSchema#float' ||
                        datatype ===
                            'http://www.w3.org/2001/XMLSchema#negativeInteger' ||
                        datatype ===
                            'http://www.w3.org/2001/XMLSchema#nonPositiveInteger' ||
                        datatype ===
                            'http://www.w3.org/2001/XMLSchema#double' ||
                        datatype === 'http://www.w3.org/2001/XMLSchema#decimal'
                    ) {
                        try {
                            lValue = parseFloat(lValue);
                        } catch (e) {
                            // todo: implement error handling
                        }
                    } else if (
                        datatype === 'http://www.w3.org/2001/XMLSchema#int' ||
                        datatype ===
                            'http://www.w3.org/2001/XMLSchema#integer' ||
                        datatype ===
                            'http://www.w3.org/2001/XMLSchema#nonNegativeInteger' ||
                        datatype ===
                            'http://www.w3.org/2001/XMLSchema#positiveInteger' ||
                        datatype ===
                            'http://www.w3.org/2001/XMLSchema#unsignedint'
                    ) {
                        try {
                            lValue = parseInt(lValue);
                        } catch (e) {
                            // todo: implement error handling
                        }
                    } else if (
                        datatype ===
                            'http://www.w3.org/2001/XMLSchema#DateTime' ||
                        datatype ===
                            'http://www.w3.org/2001/XMLSchema#dateTimeStamp'
                    ) {
                        try {
                            lValue = new Date(lValue);
                        } catch (e) {
                            // todo: implement error handling
                        }
                    } else if (
                        datatype === 'http://www.w3.org/2001/XMLSchema#boolean'
                    ) {
                        try {
                            lValue = Boolean(lValue);
                        } catch (e) {
                            // todo: implement error handling
                        }
                    } else if (
                        datatype === 'http://www.w3.org/2001/XMLSchema#long' ||
                        datatype === 'http://www.w3.org/2001/XMLSchema#short' ||
                        datatype === 'http://www.w3.org/2001/XMLSchema#byte' ||
                        datatype ===
                            'http://www.w3.org/2001/XMLSchema#unsignedByte' ||
                        datatype ===
                            'http://www.w3.org/2001/XMLSchema#unsignedlong' ||
                        datatype ===
                            'http://www.w3.org/2001/XMLSchema#unsignedshort'
                    ) {
                        try {
                            lValue = Number(lValue);
                        } catch (e) {
                            // todo: implement error handling
                        }
                    }
                }

                if (typeof lValue === 'string' && aOptions.dropPrefixes) {
                    let lPrefixPos = lValue.indexOf('#');
                    if (lPrefixPos >= 0) {
                        lValue = lValue.substr(lPrefixPos + 1);
                    }
                }
                lResItem[lKey] = lValue; // .toString();
            }
            lRes.records.push(lResItem);
        }
        // set the total amount of row an return the result set
        lRes.total = lRes.records.length;
        lRes.success = true;
        return lRes;
    },

    parsePrefixes(sparql) {
        let prefixes = [];
        sparql = sparql.replace('/\r\n/g', '\n');
        let lines = sparql.split('\n');
        for (let line of lines) {
            let tokens = line.split(/\s/);
            if (tokens && tokens.length >= 3) {
                tokens[0] = tokens[0].trim().toLowerCase();
                if (tokens[0] === 'prefix') {
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
    loginStatus: null,

    // query executes a SPARQL update statement against the update URL of GraphDB
    query(aQuery, options) {
        options = options || {};

        let transform = options.transform ? options.transform : this.transform;

        //console.log(transform);

        return new Promise(async (resolve, reject) => {
            try {
                await this.loginStatus;
            } catch (e) {}

            if (
                this.mAuthorization &&
                this.mClient.requestDefaults &&
                this.mClient.requestDefaults.headers
            ) {
                this.mClient.requestDefaults.headers.Authorization = this.mAuthorization;
            }
            this.mClient
                .query(aQuery)
                .execute()
                .then((aBindings) => {
                    aBindings.success = true;

                    if (transform == 'toJSON') {
                        resolve(this.transformBindingsToResultSet(aBindings));
                    } else if (transform == 'toCSV') {
                        resolve(this.transformBindingsToCSV(aBindings));
                    } else if (transform == 'toTSV') {
                        resolve(this.transformBindingsToTSV(aBindings));
                    } else {
                        resolve(aBindings);
                    }
                })
                .catch(function (aError) {
                    let lError = {
                        statusCode: aError.httpStatus,
                        message: aError.message,
                        success: false
                    };
                    reject(lError);
                });
        });
    },

    // query executes a SPARQL update statement against the update URL of GraphDB
    update(aQuery, aParams) {
        return new Promise(async (resolve, reject) => {
            try {
                await this.loginStatus;
            } catch (e) {}
            if (
                this.mAuthorization &&
                this.mClient.requestDefaults &&
                this.mClient.requestDefaults.headers
            ) {
                this.mClient.requestDefaults.headers.Authorization = this.mAuthorization;
            }
            this.mClient
                .query(aQuery)
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
                    reject(lError);
                });
        });
    },

    login(aUsername, aPassword) {
        return (this.loginStatus = new Promise(async (resolve, reject) => {
            let lHeaders = {
                'X-GraphDB-Password': aPassword
            };
            let lOptions = {
                method: 'POST',
                uri: this.mBaseURL + '/rest/login/' + aUsername,
                headers: lHeaders,
                resolveWithFullResponse: true,
                json: true
            };
            var lRes;
            try {
                lRes = await request(lOptions);
                this.mAuthorization = lRes.headers.authorization;
                lRes = {
                    success: true,
                    message: 'Login successful',
                    statusCode: 200
                };
                resolve(lRes);
            } catch (lErr) {
                lRes = {
                    success: false,
                    message: lErr.message,
                    statusCode: lErr.statusCode || 500
                };

                this.mAuthorization = null;
                reject(lRes);
            }
        }));
    },

    logout() {
        this.mAuthorization = null;
    },

    createResultset() {
        return {
            success: false,
            code: 'OK',
            message: 'Resultset is empty',
            total: 0,
            records: []
        };
    },

    getAuthorization() {
        return this.mAuthorization ? this.mAuthorization : null;
    },

    getBaseURL() {
        return this.mBaseURL ? this.mBaseURL : null;
    },

    getRepository() {
        return this.mRepository ? this.mRepository : null;
    },

    getPrefixes() {
        return this.mPrefixes ? this.mPrefixes : null;
    },

    getDefaultContext: function () {
        return this.mDefaultContext ? this.mDefaultContext : null;
    },

    setDefaultContext(aDefaultContext) {
        this.mDefaultContext = aDefaultContext;
    },

    // searches through the list of used prefixes
    // and returns the prefix for a given IRI
    replacePrefix(aIRI) {
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
    transformBindingsToResultSet(aBindings, aOptions) {
        let res = EnapsoGraphDBClient.transformBindingsToResultSet(
            aBindings,
            aOptions
        );
        return res;
    },

    // transforms the SPARQL bindings into a value separated text format
    // optionally the IRI's can be dropped or replaced by their prefixes
    transformBindingsToSeparatedValues(aBindings, aOptions) {
        aOptions = aOptions || {};
        let lHeadVars = aBindings.head.vars;
        let lBindings = aBindings.results.bindings;
        // default to an empty result set
        let lRes = {
            total: 0,
            success: false,
            headers: [],
            records: []
        };

        let lSeparator = aOptions.separator ? aOptions.separator : ',';
        let lSeparatorEscape =
            aOptions.separatorEscape !== undefined
                ? aOptions.separatorEscape
                : '\\,';

        let lDelimiter =
            aOptions.delimiter !== undefined ? aOptions.delimiter : '"';
        let lDelimiterOptional =
            aOptions.delimiterOptional !== undefined
                ? aOptions.delimiterOptional
                : true;
        let lDelimiterEscape =
            aOptions.delimiterEscape !== undefined
                ? aOptions.delimiterEscape
                : '\\"';

        let lRegExpSeparator = new RegExp(lSeparator, 'g');
        let lRegExpDelimiter = new RegExp(lDelimiter, 'g');

        let me = this;

        let adjustValue = function (lValue) {
            if (lValue === undefined) {
                lValue = '';
            } else if (typeof lValue !== 'string') {
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
                if (
                    !lDelimiterOptional ||
                    (lDelimiterOptional && lValue.indexOf(lSeparator) >= 0)
                ) {
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
                let lValue,
                    lField = lItem[lKey];
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

    transformBindingsToCSV(aBindings, aOptions) {
        aOptions = aOptions || {};
        aOptions.separator = aOptions.separator || ',';
        aOptions.separatorEscape =
            aOptions.separatorEscape !== undefined
                ? aOptions.separatorEscape
                : '\\,';
        aOptions.delimiter = aOptions.delimiter || '' /* '"' */;
        aOptions.delimiterOptional =
            aOptions.delimiterOptional !== undefined
                ? aOptions.delimiterOptional
                : true;
        aOptions.delimiterEscape = aOptions.delimiterEscape || '' /* '\\"' */;
        return this.transformBindingsToSeparatedValues(aBindings, aOptions);
    },

    transformBindingsToTSV(aBindings, aOptions) {
        aOptions = aOptions || {};
        aOptions.separator = aOptions.separator || '\t';
        aOptions.separatorEscape = aOptions.separatorEscape || '\\t';
        aOptions.delimiter = aOptions.delimiter || '';
        aOptions.delimiterOptional =
            aOptions.delimiterOptional !== undefined
                ? aOptions.delimiterOptional
                : true;
        aOptions.delimiterEscape = aOptions.delimiterEscape || '';
        return this.transformBindingsToSeparatedValues(aBindings, aOptions);
    },

    groupResultSet(aResultSet, aGroupBy) {
        // group results by tag
        let lMap = _.groupBy(aResultSet.records, aGroupBy);
        // remove all now obsolete tag fields
        lMap = _.forEach(lMap, function (col) {
            _.forEach(col, function (field) {
                delete field.tag;
            });
        });
        return lMap;
    },

    mapKeys(aGroupedResultSet, aMap) {
        return _.mapKeys(aGroupedResultSet, function (value, key, object) {
            return aMap[key] ? aMap[key] : key;
        });
    }
};

module.exports = EnapsoGraphDBClient;

function a() {}
function b() {}
function c() {}
