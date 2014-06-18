musterroll-ldap
===============

A simple ldap bridge for the musterroll user management framework

## WARNING

This is not production ready code yet. While we tested it for basic functionality, we can't guarantee for anything.

## What is it?

It is a readonly ldap server that allows you to use existing ldap 
authentication mechanism for everything that has a musterroll userStore driver.

There exists a simple [JSON userStore][json-userstore] that is used for https://cloudfleet.io

## How to use it?

As the modules are not submitted to NPM yet you need to include thedependencies via Github

    {
      ...
      "dependencies": {
        "musterroll-ldap": "git://github.com/cloudfleet/musterroll-ldap.git",
        "musterroll-userstore-json": "git://github.com/cloudfleet/musterroll-userstore-json.git",
      }
    }

Then you can use the LDAP server as follows:

    var user_store_json = require('musterroll-userstore-json');
    var musterroll_ldap = require('musterroll-ldap');

    var userStore = user_store_json.createUserStore();

    var ldapServer = musterroll_ldap.createServer(
        {
            userStore: userStore, //
            rootDN: "dc=example, dc=com"
        }
    );

    ldapServer.listen(1389, function() {
        console.log('LDAP server listening at ' + ldapServer.url);
    });


If you want to be able to manage users you should also add the api module:

    var webServer = musterroll_api.createServer({
        userStore: userStore,
        /* This initializer creates an Administrator on the first sign in attempt with the credentials given */
        user_store_initializer: function(username, password, userStore, callback, error_callback) {
            var user = {
                "id":username,
                "isAdmin":true
            };
            userStore.updateUser(user);
            userStore.setPassword(user["id"], password);
            callback(user);
        }
    });
    webServer.listen(3000);



[json-userstore]: https://github.com/cloudfleet/musterroll-userstore-json