// Innotrade Enapso GraphDB Client - Automated Test Suite
// (C) Copyright 2019 Innotrade GmbH, Herzogenrath, NRW, Germany
// Author: Alexander Schulze

const chai = require('chai');
const should = require('chai').should;
const expect = require('chai').expect;
const { EnapsoGraphDBClient } = require("../index");
const testConfig = require("./config");

const graphDBEndpoint = new EnapsoGraphDBClient.Endpoint({
    baseURL: testConfig.baseURL,
    repository: testConfig.repository,
    username: testConfig.username,
    password: testConfig.password,
    prefixes: testConfig.prefixes
});

describe("Query test", () => {

    before(function (done) { setTimeout(function () { done(); }, 500); });

    it('It should return a result', (done) => {
        let lQuery = "select * where { ?s ?p ?o } limit 1";
        graphDBEndpoint.query(lQuery).then(result => {
            console.log("Success: " + result.success);
            expect(result).to.have.a.property("success");
            done();
        })
    });

});
