var _ = require('lodash');

var userAttributeMap = {
    id: "cn",
    firstName: "givenName",
    lastName: "surname",
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
        dn: this.rootDN,
        attributes: {
            objectclass: ['top', 'dcObject', 'organization'],
            hasSubordinates: ['TRUE']
        }
    };

    var groupBase = {
        dn: 'ou=Groups, ' + this.rootDN,
        attributes: {
            objectclass: ['top', 'organizationalUnit'],
            hasSubordinates: ['TRUE']
        }
    };

    var userBase = {
        dn: 'ou=Users, ' + this.rootDN,
        attributes: {
            objectclass: ['top', 'organizationalUnit'],
            hasSubordinates: ['TRUE']
        }
    };

    var createLdapUser = function(user)
    {
        return createLdapObject(user, userAttributeMap, "cn", "inetOrgPerson", userBase.dn);
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
        return createLdapUser(userStore.getUser(cn));
    };

    this.getGroup = function(cn){
        return createLdapGroup(userStore.getGroup(cn));
    };

    this.getUsers = function(){
        return _.map(userStore.getUsers(), createLdapUser());
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