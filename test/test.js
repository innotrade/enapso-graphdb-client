const chai = require('chai'); 
const should = require('chai').should; 
const expect = require('chai').expect; 
const EnapsoGraphDBClient = require("../enapso-graphdb-client");
const testConfig = require("./config");


const mEndPoint = new EnapsoGraphDBClient.Endpoint({
    queryURL: testConfig.queryURL,
    updateURL: testConfig.updateURL,
    username: testConfig.username,
    password: testConfig.password,
    prefixes: testConfig.prefixes
});

describe("Query test", () => {

    before(function (done) { setTimeout(function () { done(); }, 500); });

    it('It should return a result', (done) => {

        let lQuery = "select * where { ?s ?p ?o } limit 1";
        mEndPoint.query(lQuery).then(result=>{
            expect(result).to.have.a.property("success");
            done();
        })
    });

});
