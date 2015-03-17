// Generated by CoffeeScript 1.9.0
var BankAccount, BankAlert, BankOperation, americano, async;

americano = require('americano');

async = require('async');

BankOperation = require('./bankoperation');

BankAlert = require('./bankalert');

module.exports = BankAccount = americano.getModel('bankaccount', {
  bank: String,
  bankAccess: String,
  title: String,
  accountNumber: String,
  initialAmount: Number,
  lastChecked: Date
});

BankAccount.all = function(callback) {
  return BankAccount.request("all", function(err, accounts) {
    return BankAccount.calculateBalance(accounts, callback);
  });
};

BankAccount.allFromBank = function(bank, callback) {
  var params;
  params = {
    key: bank.uuid
  };
  return BankAccount.request("allByBank", params, function(err, accounts) {
    return BankAccount.calculateBalance(accounts, callback);
  });
};

BankAccount.findMany = function(accountIDs, callback) {
  var accountID, ids, params, _i, _len;
  ids = [];
  for (_i = 0, _len = accountIDs.length; _i < _len; _i++) {
    accountID = accountIDs[_i];
    ids.push(accountID);
  }
  params = {
    key: ids
  };
  return BankAccount.request("all", function(err, accounts) {
    return BankAccount.calculateBalance(accounts, callback);
  });
};

BankAccount.allFromBankAccess = function(bankAccess, callback) {
  var params;
  params = {
    key: bankAccess.id
  };
  return BankAccount.request("allByBankAccess", params, callback);
};

BankAccount.prototype.destroyWithOperations = function(callback) {
  var BankAccess, requests;
  BankAccess = require('./bankaccess');
  console.log("Removing account " + this.title + " from database...");
  requests = [];
  requests.push((function(_this) {
    return function(callback) {
      console.log("\t-> Destroying operations for account " + _this.title);
      return BankOperation.destroyByAccount(_this.accountNumber, function(err) {
        if (err != null) {
          return callback("Could not remove operations: " + err, null);
        } else {
          return callback(null, true);
        }
      });
    };
  })(this));
  requests.push((function(_this) {
    return function(callback) {
      console.log("\t-> Destroy alerts for account " + _this.title);
      return BankAlert.destroyByAccount(_this.id, function(err) {
        if (err != null) {
          return callback("Could not remove alerts -- " + err, null);
        } else {
          return callback(null, true);
        }
      });
    };
  })(this));
  requests.push((function(_this) {
    return function(callback) {
      return _this.destroy(function(err) {
        if (err != null) {
          return callback("Could not delete account -- " + err, null);
        } else {
          return callback(null, true);
        }
      });
    };
  })(this));
  requests.push((function(_this) {
    return function(callback) {
      console.log("\t-> Destroying access if no accounts are bound");
      return BankAccess.removeIfNoAccountBound({
        id: _this.bankAccess
      }, function(err) {
        if (err != null) {
          return callback(err, null);
        } else {
          return callback(null, true);
        }
      });
    };
  })(this));
  return async.series(requests, function(err, results) {
    return callback(err);
  });
};

BankAccount.initializeAmount = function(relatedAccounts, callback) {
  return BankAccount.all(function(err, accounts) {
    var account, accountsToProcess, process, relatedAccount, _i, _j, _len, _len1;
    accountsToProcess = [];
    for (_i = 0, _len = accounts.length; _i < _len; _i++) {
      account = accounts[_i];
      for (_j = 0, _len1 = relatedAccounts.length; _j < _len1; _j++) {
        relatedAccount = relatedAccounts[_j];
        if (account.accountNumber === relatedAccount.accountNumber) {
          accountsToProcess.push(account);
        }
      }
    }
    process = function(account, callback) {
      var attr, newAmount;
      newAmount = account.initialAmount - account.__data.operationSum;
      attr = {
        initialAmount: newAmount.toFixed(2)
      };
      return account.updateAttributes(attr, function(err) {
        return callback(err);
      });
    };
    return async.each(accountsToProcess, process, function(err) {
      return callback(err);
    });
  });
};

BankAccount.calculateBalance = function(accounts, callback) {
  var calculatedAccounts;
  calculatedAccounts = [];
  return BankOperation.rawRequest("getBalance", {
    group: true
  }, function(err, balances) {
    var account, accountNumber, amount, balance, i, initialAmount, _i, _j, _len, _len1;
    for (i = _i = 0, _len = accounts.length; _i < _len; i = ++_i) {
      account = accounts[i];
      calculatedAccounts.push(account.toJSON());
      accountNumber = account.accountNumber;
      initialAmount = account.initialAmount;
      for (_j = 0, _len1 = balances.length; _j < _len1; _j++) {
        balance = balances[_j];
        if (balance.key === accountNumber) {
          amount = (initialAmount + balance.value).toFixed(2);
          accounts[i].setBalance(parseFloat(amount));
          accounts[i].__data.operationSum = balance.value.toFixed(2);
        }
      }
    }
    return callback(err, accounts);
  });
};

BankAccount.prototype.getBalance = function() {
  return this.__data.amount;
};

BankAccount.prototype.setBalance = function(balance) {
  return this.__data.amount = balance;
};

BankAccount.prototype.toJSON = function() {
  var json;
  json = this.toObject(true);
  json.amount = this.getBalance();
  return json;
};
