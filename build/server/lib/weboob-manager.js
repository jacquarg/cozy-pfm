// Generated by CoffeeScript 1.7.1
var BankAccount, BankOperation, Client, NotificationsHelper, WeboobManager, alertManager, appData, async, moment, util,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

util = require('util');

moment = require('moment');

Client = require('request-json').JsonClient;

async = require('async');

BankOperation = require('../models/bankoperation');

BankAccount = require('../models/bankaccount');

NotificationsHelper = require('cozy-notifications-helper');

appData = require('../../package.json');

alertManager = require('./alert-manager');

WeboobManager = (function() {
  WeboobManager.prototype.newAccounts = [];

  WeboobManager.prototype.newOperations = [];

  function WeboobManager() {
    this._checkOperationsAlerts = __bind(this._checkOperationsAlerts, this);
    this._checkAccountsAlerts = __bind(this._checkAccountsAlerts, this);
    this._notifyNewOperations = __bind(this._notifyNewOperations, this);
    this._initializeAmountForNewAccounts = __bind(this._initializeAmountForNewAccounts, this);
    this.processRetrievedOperation = __bind(this.processRetrievedOperation, this);
    this.client = new Client('http://localhost:9101/');
    this.notificator = new NotificationsHelper(appData.name);
  }

  WeboobManager.prototype.retrieveAccountsByBankAccess = function(access, callback) {
    var url;
    url = "connectors/bank/" + access.bank + "/";
    return this.client.post(url, access.getAuth(), (function(_this) {
      return function(err, res, body) {
        var account, accountWeboob, accounts, accountsWeboob, msg, _i, _len;
        if ((err != null) || (body.error != null)) {
          msg = "Weboob is not available -- " + err;
          console.log(msg);
          return callback(msg);
        } else {
          accountsWeboob = body["" + access.bank];
          accounts = [];
          for (_i = 0, _len = accountsWeboob.length; _i < _len; _i++) {
            accountWeboob = accountsWeboob[_i];
            account = {
              accountNumber: accountWeboob.accountNumber,
              bank: access.bank,
              bankAccess: access.id,
              title: accountWeboob.label,
              amount: accountWeboob.balance,
              initialAmount: accountWeboob.balance,
              lastChecked: new Date()
            };
            accounts.push(account);
          }
          console.log("-> " + accounts.length + " bank account(s) found");
          return _this.processRetrievedAccounts(accounts, callback);
        }
      };
    })(this));
  };

  WeboobManager.prototype.processRetrievedAccounts = function(accounts, callback) {
    var processAccount;
    processAccount = (function(_this) {
      return function(account, callback) {
        return BankAccount.create(account, function(err, account) {
          if (err == null) {
            _this.newAccounts.push(account);
          }
          return callback(err);
        });
      };
    })(this);
    return async.each(accounts, processAccount, function(err) {
      if (err != null) {
        console.log(err);
      }
      return callback(err);
    });
  };

  WeboobManager.prototype.retrieveOperationsByBankAccess = function(access, callback) {
    var url;
    url = "/connectors/bank/" + access.bank + "/history";
    return this.client.post(url, access.getAuth(), (function(_this) {
      return function(err, res, body) {
        var msg, now, operation, operationWeboob, operations, operationsWeboob, relatedAccount, _i, _len;
        if ((err != null) || (body.error != null)) {
          msg = "Weboob is not available -- " + err;
          console.log(msg);
          return callback(msg);
        } else {
          operationsWeboob = body["" + access.bank];
          operations = [];
          now = moment();
          for (_i = 0, _len = operationsWeboob.length; _i < _len; _i++) {
            operationWeboob = operationsWeboob[_i];
            relatedAccount = operationWeboob.account;
            operation = {
              title: operationWeboob.label,
              amount: operationWeboob.amount,
              date: operationWeboob.rdate,
              dateImport: now.format("YYYY-MM-DDTHH:mm:ss.000Z"),
              raw: operationWeboob.raw,
              bankAccount: relatedAccount
            };
            operations.push(operation);
          }
          return _this.processRetrievedOperations(operations, callback);
        }
      };
    })(this));
  };

  WeboobManager.prototype.processRetrievedOperations = function(operations, callback) {
    return async.each(operations, this.processRetrievedOperation, (function(_this) {
      return function(err) {
        if (err != null) {
          console.log(err);
        }
        return _this.afterOperationsRetrieved(callback);
      };
    })(this));
  };

  WeboobManager.prototype.processRetrievedOperation = function(operation, callback) {
    return BankOperation.allLike(operation, (function(_this) {
      return function(err, operations) {
        if (err != null) {
          console.log(err);
        }
        if ((operations != null) && operations.length > 0) {
          return callback();
        } else {
          console.log("New operation found!");
          return BankOperation.create(operation, function(err, operation) {
            if (err == null) {
              _this.newOperations.push(operation);
            }
            return callback(err);
          });
        }
      };
    })(this));
  };

  WeboobManager.prototype.afterOperationsRetrieved = function(callback) {
    var processes;
    processes = [];
    processes.push(this._initializeAmountForNewAccounts);
    processes.push(this._updateLastCheckedBankAccount);
    processes.push(this._notifyNewOperations);
    processes.push(this._checkAccountsAlerts);
    processes.push(this._checkOperationsAlerts);
    return async.series(processes, (function(_this) {
      return function(err) {
        console.log("Post process: done.");
        _this.newAccounts = [];
        _this.newOperations = [];
        return callback(err);
      };
    })(this));
  };

  WeboobManager.prototype._initializeAmountForNewAccounts = function(callback) {
    console.log("Initializing initial amount of the new accounts...");
    if (this.newAccounts.length > 0) {
      console.log("Initialize " + this.newAccounts.length + " accounts...");
      return BankAccount.initializeAmount(this.newAccounts, callback);
    } else {
      return callback();
    }
  };

  WeboobManager.prototype._notifyNewOperations = function(callback) {
    var operationsCount, params;
    console.log("Informing user new operations have been imported...");
    operationsCount = this.newOperations.length;
    if (operationsCount > 0 && this.newAccounts.length === 0) {
      params = {
        text: "PFM: " + operationsCount + " new transaction(s) imported."
      };
      this.notificator.createTemporary(params);
    }
    return callback();
  };

  WeboobManager.prototype._updateLastCheckedBankAccount = function(callback) {
    console.log("Updating 'last checked' date for all accounts...");
    return BankAccount.all(function(err, accounts) {
      var process;
      process = function(account, callback) {
        return account.updateAttributes({
          lastChecked: new Date()
        }, callback);
      };
      return async.each(accounts, process, callback);
    });
  };

  WeboobManager.prototype._checkAccountsAlerts = function(callback) {
    console.log("Checking alerts for accounts balance...");
    if (this.newOperations.length > 0) {
      return alertManager.checkAlertsForAccounts(callback);
    } else {
      return callback();
    }
  };

  WeboobManager.prototype._checkOperationsAlerts = function(callback) {
    console.log("Checking alerts for operations amount");
    return alertManager.checkAlertsForOperations(this.newOperations, callback);
  };

  return WeboobManager;

})();

module.exports = new WeboobManager();
