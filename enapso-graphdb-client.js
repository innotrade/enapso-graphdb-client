// Innotrade Enapso GraphDB Client
// (C) Copyright 2019 Innotrade GmbH, Herzogenrath, NRW, Germany

// For details regarding the GraphDB API please refer to the following links:
// Authentication: http://graphdb.ontotext.com/documentation/standard/authentication.html

const request = require('request-promise');
const SparqlClient = require('sparql-client-2');
const SPARQL = SparqlClient.SPARQL;
const _ = require('underscore');

const EnapsoGraphDBClient = {

    "FORMAT_JSON": {
        "name": "JSON",
        "type": "application/rdf+json",
        "extension": ".json"
    },
    "FORMAT_JSON_LD" : {
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

    // this is the GraphDB SPARQL endpoint class
    Endpoint: function (aOptions) {
        aOptions = aOptions || {};

        this.mBaseURL = aOptions.baseURL;
        this.mQueryURL = aOptions.baseURL + '/repositories/' + aOptions.repository;
        this.mUpdateURL = aOptions.baseURL + '/repositories/' + aOptions.repository + '/statements';

        // these are the default headers required for the mClient
        let lRequestDefaults = {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Accept": "application/sparql-results+json,application/json",
            }
        };

        // set authentication header if user name and password is provided
        if (this.mAuthenticationHeader) {
            lRequestDefaults.headers.Authorization = this.mAuthenticationHeader;
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
                } else if (aOptions.replacePrefixes) {
                    let lPrefixPos = lValue.indexOf('#');
                    if (lPrefixPos >= 0) {
                        lPrefix = lValue.substr(0, lPrefixPos);
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
};

EnapsoGraphDBClient.Endpoint.prototype = {

    // query executes a SPARQL update statement against the update URL of GraphDB
    query: async function (aQuery) {
        let me = this;
        return new Promise(function (resolve) {
            if(me.mAuthenticationHeader && me.mClient.requestDefaults && me.mClient.requestDefaults.headers) {
                me.mClient.requestDefaults.headers.Authorization =  me.mAuthenticationHeader;
            }
            me.mClient.query(aQuery)
                .execute()
                .then(function (aBindings) {
                    aBindings.success = true;
                    resolve(aBindings);
                })
                .catch(function (aError) {
                    aError.success = false;
                    resolve(aError);
                });
        });
    },

    // query executes a SPARQL update statement against the update URL of GraphDB
    update: async function (aQuery) {
        let me = this;
        return new Promise(function (resolve) {
            if(me.mAuthenticationHeader && me.mClient.requestDefaults && me.mClient.requestDefaults.headers) {
                me.mClient.requestDefaults.headers.Authorization =  me.mAuthenticationHeader;
            }
            me.mClient.query(aQuery)
                .execute()
                .then(function (aResponse) {
                    if (null === aResponse) {
                        aResponse = {
                            success: true
                        };
                    }
                    resolve(aResponse);
                })
                .catch(function (aError) {
                    resolve(aError);
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
            this.mAuthenticationHeader = lRes.headers.authorization;
            lRes.success = true;
            lRes.message = "Login successful",
            lRes.code = "OK"
        } catch(lErr) {
            lRes = {
                success: false,
                code: lErr.error.code,
                message: lErr.message
            }
            this.mAuthenticationHeader = null;
        }
        return lRes;
    },

    logout: async function () {

    },

    createResultset: function() {
        return {
            success: false,
            code: "OK",
            message: "Resultset is empty",
            total: 0,
            records: []
        };
    },

    getAuthenticationHeader: function() {
        return (this.mAuthenticationHeader ? this.mAuthenticationHeader : null);
    },

    getBaseURL: function() {
        return (this.mBaseURL ? this.mBaseURL : null);
    },

    // clears the entire repository, be careful with this function, this operation cannot be undone!
    clearRepository: async function () {
        return this.update(`
            CLEAR ALL
        `);
    }

}

module.exports = EnapsoGraphDBClient;