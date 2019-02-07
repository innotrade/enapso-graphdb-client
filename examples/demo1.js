const EnapsoGraphDBClient = require("../enapso-graphdb-client");

let lQuery = `
    select * 
    where {?s ?p ?o}
    limit 2
    `;

var lQueryURL = 'http://localhost:7200/repositories/Test';
var lUpdateURL = 'http://localhost:7200/repositories/Test/statements';
var lUsername = 'Test';
var lPassword = 'Test';

let lPrefixes = [
    EnapsoGraphDBClient.PREFIX_OWL,
    EnapsoGraphDBClient.PREFIX_RDF,
    EnapsoGraphDBClient.PREFIX_RDFS
];

var mEndPoint = new EnapsoGraphDBClient.Endpoint({
    queryURL: lQueryURL,
    updateURL: lUpdateURL,
    username: lUsername,
    password: lPassword,
    prefixes: lPrefixes
});

(async () => {
    let lRes, lBinding = await mEndPoint.query(lQuery);

    if (lBinding.success) {
        // transform the bindings into a more convenient result format
        lRes = EnapsoGraphDBClient.transformBindingsToResultSet(lBinding, {
            dropPrefixes: true
        });
    }
    console.log("\nBinding:\n" + JSON.stringify(lBinding, null, 2));
    console.log("\nResultset:\n" + JSON.stringify(lRes, null, 2));
})();
