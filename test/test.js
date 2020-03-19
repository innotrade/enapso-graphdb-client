// Innotrade Enapso GraphDB Client - Automated Test Suite
// (C) Copyright 2019-2020 Innotrade GmbH, Herzogenrath, NRW, Germany
// Author: Alexander Schulze

const chai = require("chai"),
  chaiHttp = require("chai-http");
const should = require("chai").should;
const expect = require("chai").expect;
chai.use(chaiHttp);
const { EnapsoGraphDBClient } = require("../index");

const testConfig = require("./config");
const GRAPHDB_CONTEXT_TEST = 'http://ont.enapso.com/test';
describe("Query test", () => {
  before(function(done) {
    setTimeout(function() {
      done();
    }, 500);
  });

  let graphDBEndpoint = new EnapsoGraphDBClient.Endpoint({
		baseURL: testConfig.baseURL,
		repository: testConfig.repository,
		prefixes: testConfig.prefixes
	});

	it('Authenticate against GraphDB instance', (done) => {
		graphDBEndpoint.login(
			testConfig.username,
			testConfig.password
		).then(result => {
			// console.log(result.statusCode);
			expect(result).to.have.property('statusCode', 200);
			done();
		})
	});


  it("It expect to  return a success while performing upation", done => {
    let lQuery = `
    prefix et: <http://ont.enapso.com/test#>
    with <${GRAPHDB_CONTEXT_TEST}>
    delete {
        et:TestClass rdf:type owl:Class
    }
    insert {
        et:TestClassUpdated rdf:type owl:Class
    }
    where {
        et:TestClass rdf:type owl:Class
    }`;
   graphDBEndpoint.update(lQuery).then(result => {
      console.log("Success: " + result.success);
      expect(result).to.have.property('success', true);
      done();
    });
  });

  it("It expect to return only one result", done => {
    let lQuery = `
select * where { ?s ?p ?o } limit 1`;
    graphDBEndpoint.query(lQuery).then(result => {
      // console.log("Success: " + result.success);
      console.log("Success: " + result.success);
      expect(result.results.bindings).to.have.lengthOf(1);
      done();
    });
  });
  it("It should return a success as a true while insertion", done => {
    let lQuery = `
    prefix et: <http://ont.enapso.com/test#>
    insert data {
        graph <${GRAPHDB_CONTEXT_TEST}> {
            et:TestClass rdf:type owl:Class
        }
    }
    `;
    graphDBEndpoint.update(lQuery).then(result => {
      console.log("Success: " + result.success);
      expect(result).to.have.property('success', true);
      done();
    });
  });
  it("It should return a success as a true while deleting ", done => {
    let lQuery = `
    prefix et: <http://ont.enapso.com/test#>
    with <http://ont.enapso.com/test>
    delete {
        et:TestClassUpdated rdf:type owl:Class
    }
    where {
        et:TestClassUpdated rdf:type owl:Class
    }`;
    graphDBEndpoint.update(lQuery).then(result => {
      console.log("Success: " + result.success);
      expect(result).to.have.property('success', true);
      done();
    });
  });
});
