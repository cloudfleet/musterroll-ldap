var _ = require('lodash');

var userAttributeMap = {
    id: "cn",
    firstName: "givenName",
    lastName: "sn",
    password: "userPassword"
};

var mapObject = function(object, attributeMap)
{
    var mapped_object = {};

    Object.keys(object).forEach(function(key)
    {
        if(attributeMap[key])
        {
            mapped_object[attributeMap[key]] = object[key];
        }
        else
        {
            mapped_object[key] = object[key];
        }
    });

    return mapped_object;
};

var createLdapObject = function(object, attributeMap, dnAttribute, objectClass, baseDN)
{
    var mapped_object = mapObject(object, attributeMap);

    var ldapObject = {
        dn: dnAttribute + "=" + mapped_object[dnAttribute] + ", " + baseDN,
        attributes: mapped_object
    };
    ldapObject.attributes['objectclass'] = objectClass;
    ldapObject.attributes['hasSubordinates'] = 'FALSE';
    return ldapObject;
};




var LdapObjectFactory = function(options){

    var rootDN = options["rootDN"];
    var userStore = options["userStore"];

    var rootObject = {
        dn: rootDN,
        attributes: {
            objectclass: ['top', 'dcObject', 'organization'],
            hasSubordinates: ['TRUE']
        }
    };

    var groupBase = {
        dn: 'ou=groups, ' + rootDN,
        attributes: {
            objectclass: ['top', 'organizationalUnit'],
            hasSubordinates: ['TRUE']
        }
    };

    var userBase = {
        dn: 'ou=users, ' + rootDN,
        attributes: {
            objectclass: ['top', 'organizationalUnit'],
            hasSubordinates: ['TRUE']
        }
    };

    var createLdapUser = function(user)
    {
        var ldap_user = createLdapObject(user, userAttributeMap, "cn", "inetOrgPerson", userBase.dn);
        var email = user.email || (user.id + "@" + options["domain"]);
        ldap_user.attributes['mail'] = email;
        ldap_user.attributes['email'] = email;
        return ldap_user;
    };

    var createLdapGroup = function(group)
    {
        return createLdapObject(group, {}, "cn", "groupOfNames", groupBase.dn);
    };


    this.getRootObj = function(){

        return  rootObject;

    };

    this.getUsersBase = function(){

        return  userBase;
    };

    this.getGroupsBase = function(){

        return  groupBase;
    };

    this.getUser = function(cn){
        return createLdapUser(userStore.getUsers()[cn]);
    };

    this.getGroup = function(cn){
        return createLdapGroup(userStore.getGroup(cn));
    };

    this.getUsers = function(){
        var users = userStore.getUsers();
        console.log(users);
        if(Object.keys(users).length > 0)
        {
            return _.map(users, createLdapUser);
        }
        else
        {
            return [];
        }

    };

    this.getGroups = function(){
        return _.map(userStore.getGroups(), createLdapGroup());
    }


};

module.exports = {
  createFactory: function(options)
  {
    return new LdapObjectFactory(options);
  }
};
