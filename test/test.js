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
const GRAPHDB_CONTEXT_TEST = "http://ont.enapso.com/test";
const graphDBEndpoint = new EnapsoGraphDBClient.Endpoint({
  baseURL: testConfig.baseURL,
  repository: testConfig.repository,
  username: testConfig.username,
  password: testConfig.password,
  prefixes: testConfig.prefixes
});

describe("Query test", () => {
  before(function(done) {
    setTimeout(function() {
      done();
    }, 500);
  });

  it("It should return a result", done => {
    let lQuery = "select * where { ?s ?p ?o } limit 1";
    graphDBEndpoint.query(lQuery).then(result => {
      console.log("Success: " + result.success);
      expect(result).to.have.a.property("success");
      done();
    });
  });

  it("It expect to  return a status code 400 while performing upation", done => {
    let lQuery = `
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
    graphDBEndpoint.update(lQuery).then(result => {
      console.log("Success: " + result.statusCode);
      expect(result.statusCode).to.equal(400);
      done();
    });
  });

  it("It expect to return only one result", done => {
    let lQuery = `
select * where { ?s ?p ?o } limit 1`;
    graphDBEndpoint.query(lQuery).then(result => {
      // console.log("Success: " + result.success);
      console.log("Success: " + JSON.stringify(result));
      expect(result.results.bindings).to.have.lengthOf(1);
      done();
    });
  });

  it("Check server is working", done => {
    // <= Pass in done callback
    chai
      .request("http://localhost:7200")
      .get("/")
      .end(function() {
        let lQuery = "select * where { ?s ?p ?o } limit 1";
        graphDBEndpoint.query(lQuery).then(result => {
          console.log("Success: " + result.success);
          expect(result).to.have.a.property("success");
          done();
        });
      });
  });
  it("It should return a status code of 500 while insertion", done => {
    let lQuery = `
        insert data {
            graph <${GRAPHDB_CONTEXT_TEST}> {
                entest:TestClass rdf:type owl:Class
            }
        }`;
    graphDBEndpoint.query(lQuery).then(result => {
      console.log("Success: " + result.statusCode);
      expect(result.statusCode).to.equal(500);
      done();
    });
  });
  it("It should return a status code of 400 while deleting ", done => {
    let lQuery = `
        with <${GRAPHDB_CONTEXT_TEST}>
		delete {
			entest:TestClassUpdated rdf:type owl:Class
		}
		where {
			entest:TestClassUpdated rdf:type owl:Class
		}`;
    graphDBEndpoint.query(lQuery).then(result => {
      console.log("Success: " + result.statusCode);
      expect(result.statusCode).to.equal(400);
      done();
    });
  });
});
