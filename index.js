var ldap = require('ldapjs');
var bunyan = require('bunyan');
var ldap_handler = require('./lib/ldap_handler');

var SimpleLdapServer = function(options)
{
    var rootDN = options["rootDN"] || 'dc=users, dc=example, dc=com';
    var userStore = options["userStore"];

    var ldapHandler = options["ldap_handler"] || ldap_handler.createFactory(
        {
            userStore: userStore,
            rootDN: rootDN
        }
    );

    var log = bunyan.createLogger({name: "musterroll-ldap"});
    var server = ldap.createServer();
    server.log = log;


    server.bind('ou=Users,'+rootDN, function(req, res, next) {
        var password = req.credentials;
        var username = req.dn.rdns[0].cn;

        if (!userStore.authorize(username, password))
        {
            return next(new ldap.InvalidCredentialsError());
        }
        res.end();
        return next();
    });


    server.search(rootDN, function(req, res, next) {
        console.log("scope "+req.scope+", filter "+req.filter+", baseObject "+req.baseObject);
        ldapHandler.handleSearch();
        res.end();
        return next();
    });

    /*
     * Configuration searches (TODO: Check if we really need this?)
     */

    server.search('', function(req, res, next) {

        var baseObject = {
            dn: '',
            structuralObjectClass: 'OpenLDAProotDSE',
            configContext: 'cn=config',
            attributes: {
                objectclass: ['top', 'OpenLDAProotDSE'],
                namingContexts: [rootDN],
                supportedLDAPVersion: ['3'],
                subschemaSubentry:['cn=Subschema']
            }
        };
        if('base' == req.scope
            && '(objectclass=*)' == req.filter.toString()
            && req.baseObject == ''){
            res.send(baseObject);
        }
        res.end();
        return next();
    });

    server.search('cn=Subschema', function(req, res, next) {
        var schema = {
            dn: 'cn=Subschema',
            attributes: {
                objectclass: ['top', 'subentry', 'subschema', 'extensibleObject'],
                cn: ['Subschema']
            }
        };
        res.send(schema);
        res.end();
        return next();
    });


    this.ldapjsServer = server;

};

module.exports = {
    createServer: function(options){
        var server = new SimpleLdapServer(options);
        return server.ldapjsServer;
    }
};