// Generated by CoffeeScript 1.9.0
var client, fixtures, helpers, path, should;

should = require('should');

path = require('path');

fixtures = require('cozy-fixtures');

fixtures.setDefaultValues({
  dirPath: path.resolve(__dirname, '../fixtures/'),
  silent: true,
  removeBeforeLoad: false
});

helpers = require('../helpers');

client = helpers.getClient();

describe("Bank Alerts Controller", function() {
  before(helpers.cleanDBWithRequests);
  before(helpers.startApp);
  after(helpers.stopApp);
  after(helpers.cleanDBWithRequests);
  describe("When I add bank alerts", function() {
    describe("When I retrieve them", function() {
      it("The response should be a success");
      return it("There should be x bank alerts");
    });
    describe("When I retrieve one of them", function() {
      it("The response should be a success");
      return it("The alert should have the correct values");
    });
    describe("When I update one of them", function() {
      it("The response should be a success");
      return it("The alert in the database should be updated");
    });
    describe("When I destroy one of them", function() {
      it("The response should be a success");
      return it("The alert shouldn't be in the database anymore");
    });
    return describe("When I retrieve the alerts for a given bank account", function() {
      it("The response should be a success");
      return it("There should be x bank alerts");
    });
  });
  return describe("When I create a bank alert", function() {
    it("The response should be a success");
    return it("It should be in the database");
  });
});
