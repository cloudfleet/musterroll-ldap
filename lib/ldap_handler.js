var _ = require('lodash');
var ldap_object_factory = require('./ldap_object_factory');


var sendFilteredObjects = function(req, res, objects)
{
    _(objects)
        .filter(req.filter.matches, req.filter)
        .forEach(res.send, res);
};

var LdapHandler = function(options)
{
    var lof = options["ldap_object_factory"] || ldap_object_factory.createFactory(options);


    this.handleGroups = function(req, res)
    {
        if('one' == req.scope) {
            sendFilteredObjects(req, res, lof.getGroups());
        } else if(('base' == req.scope)) {
            res.send(lof.getGroupsBase);
        } else {
            res.send(lof.getGroupsBase);
            sendFilteredObjects(req, res, lof.getGroups());
        }
    };

    this.handleUsers = function(req, res) {
        if('one' == req.scope) { // List Call for Accounts
            sendFilteredObjects(req, res, lof.getUsers());
        } else if(('base' == req.scope)) {  // Base Call for Accounts
            res.send(lof.getUsersBase());
        } else {
            res.send(lof.getUsersBase());
            sendFilteredObjects(req, res, lof.getUsers());
       }
    };

    this.handleSingleUser = function(req, res) {
        if('one' == req.scope) {
            // Do nothing
        }
        else
        {
            var cn = req.baseObject.rdns[0].cn;
            var user = lof.getUser(cn);
            if(user)
            {
                res.send(user);
            }
        }
    };

    this.handleSingleGroup = function(req, res) {
        if('one' == req.scope) {
            // Do nothing
        }
        else
        {
            var cn = req.baseObject.rdns[0].cn;
            var group = lof.getGroup(cn);
            if(group)
            {
                res.send(group);
            }
        }
    };

    this.handleBase = function(req, res) {
        if('base' == req.scope) {
            res.send(lof.getRootObj());
        }
        else if('one' == req.scope) {
            res.send(lof.getGroupsBase());
            res.send(lof.getUsersBase());
        }
        else if('sub' == req.scope) {
            res.send(lof.getRootObj());
            res.send(lof.getGroupsBase());
            res.send(lof.getUsersBase());
            sendFilteredObjects(req, res, lof.getGroups());
            sendFilteredObjects(req, res, lof.getUsers());
        }
    };

    this.handleSearch = function(req, res) {
        if (req.baseObject.equals(lof.getGroupsBase().dn)) {
            handleGroups(req, res);
        }
        else if (req.baseObject.equals(lof.getUsersBase())) {
            handleUsers(req, res);
        }
        else if (req.baseObject.equals(lof.getRootObj())) {
            handleBase(req, res);
        }
        else if (req.baseObject.childOf(lof.getUsersBase())) {
            handleSingleUser(req, res);
        }
        else if (req.baseObject.childOf(lof.getGroupsBase().dn)) {
            handleSingleGroup(req, res);
        }
    }

};

module.exports = {
    createHandler: function(options){
        return new LdapHandler(options);
    },
    LdapHandler: LdapHandler
};

