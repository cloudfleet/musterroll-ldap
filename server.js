/**
 * Created by doublemalt on 26.10.14.
 */
var user_store_json = require('musterroll-userstore-json');
var musterroll_ldap = require('./index');

var userStore = user_store_json.createUserStore({config_file_location: "./data"});

var ldapServer = musterroll_ldap.createServer(
    {
        userStore: userStore,
        rootDN: "dc=doublemalt,dc=bonniecloud,dc=com"
    }
);

ldapServer.listen(1389, function() {
    console.log('LDAP server listening at ' + ldapServer.url);
});
