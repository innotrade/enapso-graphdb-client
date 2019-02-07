// Innotrade Enapso GraphDB Client
// (C) Copyright 2019 Innotrade GmbH, Herzogenrath, NRW, Germany

const SparqlClient = require('sparql-client-2');
const SPARQL = SparqlClient.SPARQL;
const _ = require("underscore");

const EnapsoGraphDBClient = {

    PREFIX_OWL: {
        "prefix": 'owl',
        "iri": 'http://www.w3.org/2002/07/owl#'
    },
    PREFIX_RDF: {
        "prefix": 'rdf',
        "iri": 'http://www.w3.org/1999/02/22-rdf-syntax-ns#'
    },
    PREFIX_RDFS: {
        "prefix": 'rdfs',
        "iri": 'http://www.w3.org/2000/01/rdf-schema#'
    },
    PREFIX_XSD: {
        "prefix": 'xsd',
        "iri": 'http://www.w3.org/2001/XMLSchema#'
    },
    PREFIX_FN: {
        "prefix": 'fn',
        "iri": 'http://www.w3.org/2005/xpath-functions#'
    },
    PREFIX_SFN: {
        "prefix": 'sfn',
        "iri": 'http://www.w3.org/ns/sparql#'
    },

    // this is class
    Endpoint: function (aOptions) {
        aOptions = aOptions || {};

        // these are the default headers required for the client
        let lRequestDefaults = {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/sparql-results+json,application/json',
            }
        };
        // set authentication header if user name and password is provided
        if (aOptions.username && aOptions.password) {
            lRequestDefaults.headers.Authorization =
                'Basic ' + Buffer.from(aOptions.username + ':' + aOptions.password).toString('base64');
        }

        let lPrefixes = {};
        if (aOptions.prefixes) {
            _.each(aOptions.prefixes, function (item) {
                lPrefixes[item.prefix] = item.iri;
            });
        }

        this.client = new SparqlClient(aOptions.queryURL, {
            updateEndpoint: aOptions.updateURL,
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

    query: async function (aQuery) {
        let me = this;
        return new Promise(function (resolve) {
            me.client.query(aQuery)
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

    update: async function (aQuery) {
        let me = this;
        return new Promise(function (resolve) {
            me.client.query(aQuery)
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

    // clears the entire repository, be careful with this function, the operation cannot be undone!
    clearRepository: async function () {
        return this.update(`
            CLEAR ALL
        `);
    }

}

module.exports = EnapsoGraphDBClient;