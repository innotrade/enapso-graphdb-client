// Innotrade Enapso GraphDB Client Example
// (C) Copyright 2019 Innotrade GmbH, Herzogenrath, NRW, Germany
// Author: Alexander Schulze
const fs = require("fs");
const { EnapsoLogger} = require('@innotrade/enapso-logger');
global.enlogger = new EnapsoLogger();
// require the Enapso GraphDB Client package
const { EnapsoGraphDBClient } = require("../index");

const
  GRAPHDB_BASE_URL = 'http://localhost:7200',
  GRAPHDB_REPOSITORY = 'Test'
  ;const
  NS_DNP = "http://ont.enapso.com/dotnetpro#",
PREFIX_DNP = "dnp"
;

const DEFAULT_PREFIXES = [
  EnapsoGraphDBClient.PREFIX_OWL,
  EnapsoGraphDBClient.PREFIX_RDF,
  EnapsoGraphDBClient.PREFIX_RDFS,
  EnapsoGraphDBClient.PREFIX_XSD,
  EnapsoGraphDBClient.PREFIX_PROTONS,
  EnapsoGraphDBClient.PREFIX_ENTEST,
  {
		"prefix": PREFIX_DNP,
		"iri": NS_DNP
	}
];
const EnapsoGraphDBClientDemo = {
    graphDBEndpoint: null,
    authentication: null,
    demoQuery: async function () {
   
    let binding = await this.graphDBEndpoint.query(`
    select ?dnp ?name
		where { 
			?dnp a dnp:Company .
        ?dnp dnp:companyName ?name
}`
  );
  if (binding.success) {
    let resp = await this.graphDBEndpoint.transformBindingsToResultSet(binding);
    enlogger.log("Query succeeded:\n" + JSON.stringify(resp, null, 2));
  } else {
    enlogger.log("Query failed:\n" + JSON.stringify(binding, null, 2));
  }
},

demo: async function () {
    this.graphDBEndpoint = new EnapsoGraphDBClient.Endpoint({
        baseURL: GRAPHDB_BASE_URL,
        repository: GRAPHDB_REPOSITORY,
        prefixes: DEFAULT_PREFIXES
    });
   res=await this.demoQuery();
    }
}

enlogger.log("Enapso GraphDB Client Demo");

(async () => {
    await EnapsoGraphDBClientDemo.demo();
})();