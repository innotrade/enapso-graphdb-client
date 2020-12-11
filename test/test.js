/* eslint-disable prettier/prettier */
/* eslint-disable no-console, func-names, no-undef */
// Innotrade Enapso GraphDB Client - Automated Test Suite
// (C) Copyright 2019-2020 Innotrade GmbH, Herzogenrath, NRW, Germany
// Author: Alexander Schulze and Muhammad Yasir

const chai = require('chai');
const chaiHttp = require('chai-http');
const { expect } = require('chai');

const { EnapsoGraphDBClient } = require('../index');
const testConfig = require('./config');

const GRAPHDB_CONTEXT_TEST = encfg.getConfig(
    'enapsoDefaultGraphDB.contextTest',
    'http://ont.enapso.com/test'
);

chai.use(chaiHttp);

describe('ENAPSO Client GraphDB Automated Test Suite', function () {
    this.timeout(5000);
    this.slow(100);

    const graphDBEndpoint = new EnapsoGraphDBClient.Endpoint({
        baseURL: testConfig.baseURL,
        repository: testConfig.repository,
        prefixes: testConfig.prefixes
    });

    it('Authenticate against GraphDB instance', function (done) {
        this.slow(80);
        graphDBEndpoint
            .login(testConfig.username, testConfig.password)
            .then((result) => {
                // console.log(result.statusCode);
                expect(result).to.have.property('statusCode', 200);
                done();
            })
            .catch((err) => {
                console.log(`Authentication: ${err.message}`);
                done(err);
            });
    });

    // first try to insert a class
    it('Insert a class', (done) => {
        this.slow(80);
        const lQuery = `
insert data {
	graph <${GRAPHDB_CONTEXT_TEST}> {
		entest:TestClass rdf:type owl:Class
	}
}`;
        graphDBEndpoint
            .update(lQuery)
            .then((result) => {
                // console.log("Success: " + result.success);
                expect(result).to.have.property('success', true);
                done();
            })
            .catch((err) => {
                console.log(`Insert class: ${err.message}`);
                done(err);
            });
    });

    // then try to update that inserted class
    it('Update inserted class', function (done) {
        this.slow(80);
        const lQuery = `
with <${GRAPHDB_CONTEXT_TEST}>
delete {
	entest:TestClass rdf:type owl:Class
}
insert {
	entest:TestClassUpdated rdf:type owl:Class
}
where {
    entest:TestClass rdf:type owl:Class
}`;
        graphDBEndpoint
            .update(lQuery)
            .then((result) => {
                // console.log("Success: " + result.success);
                expect(result).to.have.property('success', true);
                done();
            })
            .catch((err) => {
                console.log(`Update class: ${err.message}`);
                done(err);
            });
    });

    // now try to read the updated class
    it('Read inserted and updated class', function (done) {
        this.slow(80);
        const lQuery = `
select ?class 
where  {
	graph <${GRAPHDB_CONTEXT_TEST}> {
		?class a owl:Class
	}
} limit 1`;
        graphDBEndpoint
            .query(lQuery)
            .then((result) => {
                // console.log("Success: " + result.success);
                expect(result.results.bindings).to.have.lengthOf(1);
                done();
            })
            .catch((err) => {
                console.log(`Read class: ${err.message}`);
                done(err);
            });
    });

    // and finally try to delete the new and updated class
    it('Delete inserted and updated class', function (done) {
        this.slow(80);
        const lQuery = `
with <${GRAPHDB_CONTEXT_TEST}>
delete {
	entest:TestClassUpdated rdf:type owl:Class
}
where {
	entest:TestClassUpdated rdf:type owl:Class
}`;
        graphDBEndpoint
            .update(lQuery)
            .then((result) => {
                // console.log("Success: " + result.success);
                expect(result).to.have.property('success', true);
                done();
            })
            .catch((err) => {
                console.log(`Delete class: ${err.message}`);
                done(err);
            });
    });
});
describe('ENAPSO Client Fuseki Database Automated Test Suite', function () {
    this.timeout(5000);
    this.slow(100);

    const graphDBEndpoint = new EnapsoGraphDBClient.Endpoint({
        baseURL: testConfig.fusekiBaseURL,
        repository: testConfig.repository,
        prefixes: testConfig.prefixes,
        queryPath: testConfig.queryPath,
        updatePath: testConfig.updatePath
    });

    // first try to insert a class
    it('Insert a class', (done) => {
        this.slow(80);
        const lQuery = `
insert data {
	graph <${GRAPHDB_CONTEXT_TEST}> {
		entest:TestClass rdf:type owl:Class
	}
}`;
        graphDBEndpoint
            .update(lQuery)
            .then((result) => {
                // console.log("Success: " + result.success);
                expect(result).to.have.property('success', true);
                done();
            })
            .catch((err) => {
                console.log(`Insert class: ${err.message}`);
                done(err);
            });
    });

    // then try to update that inserted class
    it('Update inserted class', function (done) {
        this.slow(80);
        const lQuery = `
with <${GRAPHDB_CONTEXT_TEST}>
delete {
	entest:TestClass rdf:type owl:Class
}
insert {
	entest:TestClassUpdated rdf:type owl:Class
}
where {
    entest:TestClass rdf:type owl:Class
}`;
        graphDBEndpoint
            .update(lQuery)
            .then((result) => {
                // console.log("Success: " + result.success);
                expect(result).to.have.property('success', true);
                done();
            })
            .catch((err) => {
                console.log(`Update class: ${err.message}`);
                done(err);
            });
    });

    // now try to read the updated class
    it('Read inserted and updated class', function (done) {
        this.slow(80);
        const lQuery = `
select ?class 
where  {
	graph <${GRAPHDB_CONTEXT_TEST}> {
		?class a owl:Class
	}
} limit 1`;
        graphDBEndpoint
            .query(lQuery)
            .then((result) => {
                // console.log("Success: " + result.success);
                expect(result.results.bindings).to.have.lengthOf(1);
                done();
            })
            .catch((err) => {
                console.log(`Read class: ${err.message}`);
                done(err);
            });
    });

    // and finally try to delete the new and updated class
    it('Delete inserted and updated class', function (done) {
        this.slow(80);
        const lQuery = `
with <${GRAPHDB_CONTEXT_TEST}>
delete {
	entest:TestClassUpdated rdf:type owl:Class
}
where {
	entest:TestClassUpdated rdf:type owl:Class
}`;
        graphDBEndpoint
            .update(lQuery)
            .then((result) => {
                // console.log("Success: " + result.success);
                expect(result).to.have.property('success', true);
                done();
            })
            .catch((err) => {
                console.log(`Delete class: ${err.message}`);
                done(err);
            });
    });
});
