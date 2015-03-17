(function(/*! Brunch !*/) {
  'use strict';

  var globals = typeof window !== 'undefined' ? window : global;
  if (typeof globals.require === 'function') return;

  var modules = {};
  var cache = {};

  var has = function(object, name) {
    return ({}).hasOwnProperty.call(object, name);
  };

  var expand = function(root, name) {
    var results = [], parts, part;
    if (/^\.\.?(\/|$)/.test(name)) {
      parts = [root, name].join('/').split('/');
    } else {
      parts = name.split('/');
    }
    for (var i = 0, length = parts.length; i < length; i++) {
      part = parts[i];
      if (part === '..') {
        results.pop();
      } else if (part !== '.' && part !== '') {
        results.push(part);
      }
    }
    return results.join('/');
  };

  var dirname = function(path) {
    return path.split('/').slice(0, -1).join('/');
  };

  var localRequire = function(path) {
    return function(name) {
      var dir = dirname(path);
      var absolute = expand(dir, name);
      return globals.require(absolute, path);
    };
  };

  var initModule = function(name, definition) {
    var module = {id: name, exports: {}};
    cache[name] = module;
    definition(module.exports, localRequire(name), module);
    return module.exports;
  };

  var require = function(name, loaderPath) {
    var path = expand(name, '.');
    if (loaderPath == null) loaderPath = '/';

    if (has(cache, path)) return cache[path].exports;
    if (has(modules, path)) return initModule(path, modules[path]);

    var dirIndex = expand(path, './index');
    if (has(cache, dirIndex)) return cache[dirIndex].exports;
    if (has(modules, dirIndex)) return initModule(dirIndex, modules[dirIndex]);

    throw new Error('Cannot find module "' + name + '" from '+ '"' + loaderPath + '"');
  };

  var define = function(bundle, fn) {
    if (typeof bundle === 'object') {
      for (var key in bundle) {
        if (has(bundle, key)) {
          modules[key] = bundle[key];
        }
      }
    } else {
      modules[bundle] = fn;
    }
  };

  var list = function() {
    var result = [];
    for (var item in modules) {
      if (has(modules, item)) {
        result.push(item);
      }
    }
    return result;
  };

  globals.require = require;
  globals.require.define = define;
  globals.require.register = define;
  globals.require.list = list;
  globals.require.brunch = true;
})();
require.register("application", function(exports, require, module) {
var AppView, BankOperationsCollection, BanksCollection;

AppView = require('views/app');

BanksCollection = require('collections/banks');

BankOperationsCollection = require('collections/bank_operations');

module.exports = {
  initialize: function() {
    return $.ajax('cozy-locale.json').done((function(_this) {
      return function(data) {
        return _this.locale = data.locale;
      };
    })(this)).fail((function(_this) {
      return function() {
        return _this.locale = 'en';
      };
    })(this)).always((function(_this) {
      return function() {
        return _this.step2();
      };
    })(this));
  },
  step2: function() {
    var Router, e, locales;
    this.polyglot = new Polyglot();
    window.polyglot = this.polyglot;
    try {
      locales = require("locales/" + this.locale);
    } catch (_error) {
      e = _error;
      locales = require('locales/en');
    }
    this.polyglot.extend(locales);
    window.t = this.polyglot.t.bind(this.polyglot);
    window.i18n = function(key) {
      return window.polyglot.t(key);
    };
    window.collections = {};
    window.views = {};
    window.collections.allBanks = new BanksCollection();
    window.collections.banks = new BanksCollection();
    window.collections.operations = new BankOperationsCollection();

    /*
            views
     */
    window.views.appView = new AppView();
    window.views.appView.render();
    window.activeObjects = {};
    _.extend(window.activeObjects, Backbone.Events);
    Router = require('router');
    this.router = new Router();
    if (typeof Object.freeze === 'function') {
      return Object.freeze(this);
    }
  }
};

});

require.register("collections/bank_accesses", function(exports, require, module) {
var BankAccess, BankAccesses,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

BankAccess = require('../models/bank_access');

module.exports = BankAccesses = (function(superClass) {
  extend(BankAccesses, superClass);

  function BankAccesses() {
    return BankAccesses.__super__.constructor.apply(this, arguments);
  }

  BankAccesses.prototype.model = BankAccess;

  BankAccesses.prototype.url = "bankaccesses";

  return BankAccesses;

})(Backbone.Collection);

});

require.register("collections/bank_accounts", function(exports, require, module) {
var BankAccount, BankAccounts,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

BankAccount = require('../models/bank_account');

module.exports = BankAccounts = (function(superClass) {
  extend(BankAccounts, superClass);

  BankAccounts.prototype.model = BankAccount;

  BankAccounts.prototype.url = "bankaccounts";

  function BankAccounts(bank) {
    this.bank = bank;
    this.url = "banks/getAccounts/" + this.bank.get("id");
    BankAccounts.__super__.constructor.call(this);
  }

  BankAccounts.prototype.getSum = function() {
    var account, i, len, ref, sum;
    sum = 0;
    ref = this.models;
    for (i = 0, len = ref.length; i < len; i++) {
      account = ref[i];
      sum += Number(account.get("amount"));
    }
    return sum;
  };

  return BankAccounts;

})(Backbone.Collection);

});

require.register("collections/bank_alerts", function(exports, require, module) {
var BankAlert, BankAlerts,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

BankAlert = require('../models/bank_alert');

module.exports = BankAlerts = (function(superClass) {
  extend(BankAlerts, superClass);

  function BankAlerts() {
    return BankAlerts.__super__.constructor.apply(this, arguments);
  }

  BankAlerts.prototype.model = BankAlert;

  BankAlerts.prototype.url = "bankalerts";

  return BankAlerts;

})(Backbone.Collection);

});

require.register("collections/bank_operations", function(exports, require, module) {
var BankOperation, BankOperations,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

BankOperation = require('../models/bank_operation');

module.exports = BankOperations = (function(superClass) {
  extend(BankOperations, superClass);

  function BankOperations() {
    return BankOperations.__super__.constructor.apply(this, arguments);
  }

  BankOperations.prototype.model = BankOperation;

  BankOperations.prototype.url = "bankoperations";

  BankOperations.prototype.order = "asc";

  BankOperations.prototype.orderBy = "date";

  BankOperations.prototype.setAccount = function(account) {
    this.account = account;
    return this.url = "bankaccounts/getOperations/" + this.account.get("id");
  };

  BankOperations.prototype.setComparator = function(type) {
    if (type === "date") {
      return this.comparator = (function(_this) {
        return function(o1, o2) {
          var d1, d2, sort, t1, t2;
          d1 = new Date(o1.get("date")).getTime();
          d2 = new Date(o2.get("date")).getTime();
          t1 = o1.get("title");
          t2 = o2.get("title");
          sort = _this.order === "asc" ? -1 : 1;
          if (d1 === d2) {
            if (t1 > t2) {
              return sort;
            }
            if (t1 < t2) {
              return -sort;
            }
            return 0;
          } else if (d1 > d2) {
            return sort;
          } else {
            return -sort;
          }
        };
      })(this);
    } else {
      this.orderBy = type;
      return this.comparator = function(o1, o2) {
        var sort, t1, t2;
        t1 = o1.get(this.orderBy);
        t2 = o2.get(this.orderBy);
        sort = this.order === "asc" ? -1 : 1;
        if (t1 === t2) {
          return 0;
        } else if (t1 > t2) {
          return sort;
        } else {
          return -sort;
        }
      };
    }
  };

  BankOperations.prototype.toggleSort = function(order) {
    if (this.orderBy === order) {
      return this.order = this.order === "asc" ? "desc" : "asc";
    } else {
      return this.orderBy = order;
    }
  };

  return BankOperations;

})(Backbone.Collection);

});

require.register("collections/banks", function(exports, require, module) {
var Bank, Banks,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Bank = require('../models/bank');

module.exports = Banks = (function(superClass) {
  extend(Banks, superClass);

  function Banks() {
    return Banks.__super__.constructor.apply(this, arguments);
  }

  Banks.prototype.model = Bank;

  Banks.prototype.url = "banks";

  Banks.prototype.getSum = function() {
    var bank, i, len, ref, sum;
    sum = 0;
    ref = this.models;
    for (i = 0, len = ref.length; i < len; i++) {
      bank = ref[i];
      sum += Number(bank.get("amount"));
    }
    return sum;
  };

  return Banks;

})(Backbone.Collection);

});

require.register("initialize", function(exports, require, module) {
var app;

app = require('application');

$(function() {
  require('lib/app_helpers');

  /*
      global variables
   */
  window.app = app;
  return app.initialize();
});

});

require.register("lib/app_helpers", function(exports, require, module) {
(function() {
  return (function() {
    var console, dummy, method, methods, results;
    console = window.console = window.console || {};
    method = void 0;
    dummy = function() {};
    methods = 'assert,count,debug,dir,dirxml,error,exception, group,groupCollapsed,groupEnd,info,log,markTimeline, profile,profileEnd,time,timeEnd,trace,warn'.split(',');
    results = [];
    while (method = methods.pop()) {
      results.push(console[method] = console[method] || dummy);
    }
    return results;
  })();
})();

Number.prototype.formatMoney = function(decPlaces, thouSeparator, decSeparator) {
  var i, j, n, sign;
  n = this;
  decPlaces = (isNaN(decPlaces = Math.abs(decPlaces)) ? 2 : decPlaces);
  decSeparator = (decSeparator === undefined ? "." : decSeparator);
  thouSeparator = (thouSeparator === undefined ? "," : thouSeparator);
  sign = (n < 0 ? "-" : "");
  i = parseInt(n = Math.abs(+n || 0).toFixed(decPlaces)) + "";
  j = ((j = i.length) > 3 ? j % 3 : 0);
  return sign + (j ? i.substr(0, j) + thouSeparator : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thouSeparator) + (decPlaces ? decSeparator + Math.abs(n - i).toFixed(decPlaces).slice(2) : "");
};

Number.prototype.money = function() {
  return this.formatMoney(2, " ", ",");
};

Date.prototype.dateString = function() {
  var addZeros, myDate;
  addZeros = function(num) {
    if (Number(num) < 10) {
      return "0" + num;
    } else {
      return num;
    }
  };
  myDate = this;
  return addZeros(myDate.getDate() + 1) + "/" + addZeros(myDate.getMonth() + 1) + "/" + myDate.getFullYear();
};

Date.prototype.timeString = function() {
  var addZeros, myDate;
  addZeros = function(num) {
    if (Number(num) < 10) {
      return "0" + num;
    } else {
      return num;
    }
  };
  myDate = this;
  return addZeros(myDate.getHours()) + ":" + addZeros(myDate.getMinutes());
};

});

require.register("lib/base_view", function(exports, require, module) {
var BaseView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

module.exports = BaseView = (function(superClass) {
  extend(BaseView, superClass);

  function BaseView() {
    return BaseView.__super__.constructor.apply(this, arguments);
  }

  BaseView.prototype.template = function() {};

  BaseView.prototype.initialize = function() {};

  BaseView.prototype.getRenderData = function() {
    return {
      model: this.model
    };
  };

  BaseView.prototype.render = function() {
    this.beforeRender();
    this.$el.html(this.template(this.getRenderData()));
    this.afterRender();
    return this;
  };

  BaseView.prototype.beforeRender = function() {};

  BaseView.prototype.afterRender = function() {};

  BaseView.prototype.destroy = function() {
    this.undelegateEvents();
    this.$el.removeData().unbind();
    this.remove();
    return Backbone.View.prototype.remove.call(this);
  };

  return BaseView;

})(Backbone.View);

});

require.register("lib/view_collection", function(exports, require, module) {
var BaseView, ViewCollection,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

BaseView = require('lib/base_view');

module.exports = ViewCollection = (function(superClass) {
  extend(ViewCollection, superClass);

  function ViewCollection() {
    this.removeItem = bind(this.removeItem, this);
    this.addItem = bind(this.addItem, this);
    return ViewCollection.__super__.constructor.apply(this, arguments);
  }

  ViewCollection.prototype.itemview = null;

  ViewCollection.prototype.views = {};

  ViewCollection.prototype.template = function() {
    return '';
  };

  ViewCollection.prototype.itemViewOptions = function() {};

  ViewCollection.prototype.collectionEl = null;

  ViewCollection.prototype.onChange = function() {
    return this.$el.toggleClass('empty', _.size(this.views) === 0);
  };

  ViewCollection.prototype.appendView = function(view) {
    return this.$collectionEl.append(view.el);
  };

  ViewCollection.prototype.initialize = function() {
    var collectionEl;
    ViewCollection.__super__.initialize.apply(this, arguments);
    this.views = {};
    this.listenTo(this.collection, "reset", this.onReset);
    this.listenTo(this.collection, "add", this.addItem);
    this.listenTo(this.collection, "remove", this.removeItem);
    if (this.collectionEl == null) {
      return collectionEl = el;
    }
  };

  ViewCollection.prototype.render = function() {
    var id, ref, view;
    ref = this.views;
    for (id in ref) {
      view = ref[id];
      view.$el.detach();
    }
    return ViewCollection.__super__.render.apply(this, arguments);
  };

  ViewCollection.prototype.afterRender = function() {
    var id, ref, view;
    this.$collectionEl = $(this.collectionEl);
    ref = this.views;
    for (id in ref) {
      view = ref[id];
      this.appendView(view.$el);
    }
    this.onReset(this.collection);
    return this.onChange(this.views);
  };

  ViewCollection.prototype.remove = function() {
    this.onReset([]);
    return ViewCollection.__super__.remove.apply(this, arguments);
  };

  ViewCollection.prototype.onReset = function(newcollection) {
    var id, ref, view;
    ref = this.views;
    for (id in ref) {
      view = ref[id];
      view.remove();
    }
    return newcollection.forEach(this.addItem);
  };

  ViewCollection.prototype.addItem = function(model) {
    var options, view;
    options = _.extend({}, {
      model: model
    }, this.itemViewOptions(model));
    view = new this.itemview(options);
    this.views[model.cid] = view.render();
    this.appendView(view);
    return this.onChange(this.views);
  };

  ViewCollection.prototype.removeItem = function(model) {
    this.views[model.cid].remove();
    delete this.views[model.cid];
    return this.onChange(this.views);
  };

  return ViewCollection;

})(BaseView);

});

require.register("locales/en", function(exports, require, module) {
module.exports = {
  "menu_accounts": "Accounts",
  "menu_balance": "Balance",
  "menu_search": "Search",
  "menu_add_bank": "Add a new bank access",
  "overall_balance": "overall balance:",
  "add_bank_bank": "Bank",
  "add_bank_credentials": "Credentials",
  "add_bank_login": "Login",
  "add_bank_login_placeholder": "enter login here",
  "add_bank_password": "Password",
  "add_bank_password_placeholder": "enter password here",
  "add_bank_security_notice": "Security notice",
  "add_bank_security_notice_text": "Your login and password are encrypted in the database. As a result, only applications that you gave permission for 'BankAccess' will be able to see it unencrypted. Make sure security is our first concern regarding this application.",
  "add_bank_cancel": "cancel",
  "add_bank_ok": "Verify & Save",
  "balance_please_choose_account": "Please select an account on the left to display its operations",
  "balance_banks_empty": "There are currently no bank accounts saved in your Cozy. Go ahead and create the first one now !",
  "header_date": "Date",
  "header_title": "Title",
  "header_amount": "Amount",
  "balance_last_checked": "Last checked",
  "balance_recheck_now": "Recheck now.",
  "search_date_from": "Date from",
  "search_date_to": "Date to",
  "search_amount_from": "Amount from",
  "search_amount_to": "Amount to",
  "search_text": "Title contains",
  "accounts_delete_bank": "remove this bank from Cozy",
  "accounts_delete_bank_title": "Confirmation required",
  "accounts_delete_bank_prompt": "Are you sure ? This can't be undone, and will erase ALL your data from this bank.",
  "accounts_delete_bank_confirm": "delete permanently",
  "accounts_delete_account": "remove this account from Cozy",
  "accounts_delete_account_title": "Confirmation required",
  "accounts_delete_account_prompt": "Are you sure ? This can't be undone, and will erase ALL your data from this account.",
  "accounts_delete_account_confirm": "delete permanently",
  "accounts_alerts_title": "Reports and notifications",
  "accounts_alerts_title_periodic": "Periodic Reports",
  "accounts_alerts_periodic_add": "include in a periodic report",
  "accounts_alerts_title_balance": "Balance Notifications",
  "accounts_alerts_balance_add": "add a new amount notification",
  "accounts_alerts_title_transaction": "Transaction Notifications",
  "accounts_alerts_transaction_add": "add a new transaction notification",
  "accounts_alerts_report_text_1": "Include in a",
  "accounts_alerts_report_text_2": "email report.",
  "accounts_alerts_balance_text_1": "When balance is",
  "accounts_alerts_balance_text_2": "than",
  "accounts_alerts_transaction_text_1": "When transaction is",
  "accounts_alerts_transaction_text_2": "than",
  "accounts_alerts_daily": "daily",
  "accounts_alerts_monthly": "monthly",
  "accounts_alerts_weekly": "weekly",
  "accounts_alerts_lower": "lower",
  "accounts_alerts_highier": "highier",
  "accounts_alerts_save": "save",
  "accounts_alerts_cancel": "cancel",
  "accounts_alerts_delete": "delete",
  "alert_sure_delete_bank": "Are you sure ? This will remove all of your data from this bank, and can't be undone.",
  "alert_sure_delete_account": "Are you sure ? This will remove all of your data from this account, and can't be undone.",
  "error_loading_accounts": "There was an error loading bank accounts. Please refresh and try again later.",
  "fatal_error": "Something went wrong. Refresh.",
  "error_check_credentials_btn": "Could not log into the server. Click to retry.",
  "error_check_credentials": "We could not log into the bank's server. Please verify your credentials and try again.",
  "access already exists": "You are trying to add an existing bank access.",
  "access already exists button": "This bank access already exists.",
  "loading": "loading...",
  "verifying": "verifying...",
  "cancel": "cancel",
  "removing": "removing...",
  "error": "error...",
  "sent": "sent successfully...",
  "error_refresh": "Sorry, there was an error. Please refresh and try again."
};

});

require.register("locales/fr", function(exports, require, module) {
module.exports = {
  "menu_accounts": "Comptes",
  "menu_balance": "Soldes",
  "menu_search": "Recherche",
  "menu_add_bank": "Ajouter des comptes",
  "overall_balance": "Solde total : ",
  "add_bank_bank": "Banque",
  "add_bank_credentials": "Identifiants",
  "add_bank_login": "Nom d'utilisateur",
  "add_bank_login_placeholder": "Entrez votre nom d'utilisateur ici",
  "add_bank_password": "Mot de passe",
  "add_bank_password_placeholder": "Entrez votre mot de passe ici",
  "add_bank_security_notice": "Information concernant la sécurité",
  "add_bank_security_notice_text": "Votre nom d'utilisateur et votre mot de passe sont chiffrés dans la base de données. En conséquence, seules les applications possédant la permission d'accéder au 'BankAccess' pourront voir ces informations déchiffrées. Soyez sûr que la sécurité est la priorité de cette application.",
  "add_bank_cancel": "cancel",
  "add_bank_ok": "Verify & Save",
  "balance_please_choose_account": "Veuillez sélectionner un compte dans le menu de gauche pour afficher ses opérations.",
  "balance_banks_empty": "Il n'y a pas de comptes bancaires dans votre Cozy pour l'instant. Ajoutez-en un dès maintenant !",
  "header_date": "Date",
  "header_title": "Titre",
  "header_amount": "Montant",
  "balance_last_checked": "Dernière vérification",
  "balance_recheck_now": "Vérifier maintenant.",
  "search_date_from": "Depuis",
  "search_date_to": "Jusqu'à",
  "search_amount_from": "De",
  "search_amount_to": "A",
  "search_text": "Le titre contient",
  "accounts_delete_bank": "supprimer cette banque de Cozy",
  "accounts_delete_bank_title": "Une confirmation est nécessaire",
  "accounts_delete_bank_prompt": "Êtes-vous sûr ? Cette opération est irréverisible et supprimera TOUTES les données relatives à cette banque de votre Cozy.",
  "accounts_delete_bank_confirm": "supprimer définitivement",
  "accounts_delete_account": "supprimer ce compte de Cozy",
  "accounts_delete_account_title": "Une confirmation est nécessaire",
  "accounts_delete_account_prompt": "Êtes-vous sûr ? Cette opération est irréverisible et supprimera TOUTES les données relatives à ce compte de votre Cozy.",
  "accounts_delete_account_confirm": "supprimer définitivement",
  "accounts_alerts_title": "Rapports et alertes",
  "accounts_alerts_title_periodic": "Rapports périodiques",
  "accounts_alerts_periodic_add": "ajouter au rapport périodique",
  "accounts_alerts_title_balance": "Alertes sur le solde",
  "accounts_alerts_balance_add": "ajouter une nouvelle alerte sur le solde du compte",
  "accounts_alerts_title_transaction": "ALertes sur les transactions",
  "accounts_alerts_transaction_add": "ajouter une nouvelle alerte sur les transactions",
  "accounts_alerts_report_text_1": "Ajouter à",
  "accounts_alerts_report_text_2": "rapport par email.",
  "accounts_alerts_balance_text_1": "Lorsque le solde est",
  "accounts_alerts_balance_text_2": "que",
  "accounts_alerts_transaction_text_1": "Lorsque le montant d'une transaction est",
  "accounts_alerts_transaction_text_2": "que",
  "accounts_alerts_daily": "quotidien",
  "accounts_alerts_monthly": "mensuel",
  "accounts_alerts_weekly": "hebdomadaire",
  "accounts_alerts_lower": "plus petit",
  "accounts_alerts_highier": "plus grand",
  "accounts_alerts_save": "enregistrer",
  "accounts_alerts_cancel": "annuler",
  "accounts_alerts_delete": "supprimer",
  "alert_sure_delete_bank": "Vous êtes sur le point de supprimer toutes les données lié à cette banque. Cette opération est irréversible. Êtes-vous sûr ?",
  "alert_sure_delete_account": "Vous êtes sur le point de supprimer toutes les données lié à ce compte. Cette opération est irréversible. Êtes-vous sûr ?",
  "error_loading_accounts": "Une erreur est survenue lors du chargement de vos comptes bancaires. Veuillez rafraîchir la page ou rééessayer plus tard.",
  "fatal_error": "Une erreur inconnue a eu lieu, veuillez rafraîchir la page.",
  "error_check_credentials_btn": "Echec de la connexion au serveur. Cliquez pour réessayer.",
  "error_check_credentials": "Nous n'avons pas vu nous connecter au serveur de votre banque. Veuillez vérifier que vos identifiants sont corrects et réessayer à nouveau.",
  "access already exists": "Vous essayez d'ajouter un accès bancaire déjà existant.",
  "access already exists button": "Cet accès bancaire existe déjà.",
  "loading": "chargement en cours...",
  "verifying": "vérification en cours...",
  "cancel": "annuler",
  "removing": "suppression en cours...",
  "error": "erreur...",
  "sent": "envoyé avec succès...",
  "error_refresh": "Une erreur est survenue, veuillez recharger la page et réessayer."
};

});

require.register("models/bank", function(exports, require, module) {
var Bank, BankAccountsCollection,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

BankAccountsCollection = require('../collections/bank_accounts');

module.exports = Bank = (function(superClass) {
  extend(Bank, superClass);

  function Bank() {
    return Bank.__super__.constructor.apply(this, arguments);
  }

  Bank.prototype.defaults = {
    amount: 0
  };

  Bank.prototype.checked = true;

  Bank.prototype.initialize = function() {
    this.accounts = new BankAccountsCollection(this);
    this.listenTo(this.accounts, "add", this.updateAmount);
    this.listenTo(this.accounts, "remove", this.updateAmount);
    this.listenTo(this.accounts, "destroy", this.updateAmount);
    return this.listenTo(this.accounts, "change", this.updateAmount);
  };

  Bank.prototype.updateAmount = function() {
    this.set("amount", this.accounts.getSum());
    return console.log("updated balance bank " + this.get("name") + " is now " + this.get("amount"));
  };

  return Bank;

})(Backbone.Model);

});

require.register("models/bank_access", function(exports, require, module) {
var BankAccess,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

module.exports = BankAccess = (function(superClass) {
  extend(BankAccess, superClass);

  function BankAccess() {
    return BankAccess.__super__.constructor.apply(this, arguments);
  }

  BankAccess.prototype.url = "bankaccesses";

  return BankAccess;

})(Backbone.Model);

});

require.register("models/bank_account", function(exports, require, module) {
var BankAccount, BankOperationsCollection,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

BankOperationsCollection = require('../collections/bank_operations');

module.exports = BankAccount = (function(superClass) {
  extend(BankAccount, superClass);

  function BankAccount() {
    return BankAccount.__super__.constructor.apply(this, arguments);
  }

  BankAccount.prototype.checked = true;

  return BankAccount;

})(Backbone.Model);

});

require.register("models/bank_alert", function(exports, require, module) {
var BankAlert,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

module.exports = BankAlert = (function(superClass) {
  extend(BankAlert, superClass);

  function BankAlert() {
    return BankAlert.__super__.constructor.apply(this, arguments);
  }

  BankAlert.prototype.url = "bankalerts";

  return BankAlert;

})(Backbone.Model);

});

require.register("models/bank_operation", function(exports, require, module) {
var BankOperation,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

module.exports = BankOperation = (function(superClass) {
  extend(BankOperation, superClass);

  function BankOperation() {
    return BankOperation.__super__.constructor.apply(this, arguments);
  }

  return BankOperation;

})(Backbone.Model);

});

require.register("router", function(exports, require, module) {
var AppView, BalanceView, MockupView, Router,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

MockupView = require('views/mockup');

AppView = require('views/app');

BalanceView = require('views/balance');

module.exports = Router = (function(superClass) {
  extend(Router, superClass);

  function Router() {
    return Router.__super__.constructor.apply(this, arguments);
  }

  Router.prototype.empty = function() {
    var ref, ref1, ref2;
    if ((ref = window.views.balanceView) != null) {
      ref.empty();
    }
    if ((ref1 = window.views.accountsView) != null) {
      ref1.empty();
    }
    return (ref2 = window.views.searchView) != null ? ref2.empty() : void 0;
  };

  Router.prototype.routes = {
    '': 'balance',
    'accounts': 'accounts',
    'search': 'search'
  };

  Router.prototype.balance = function() {
    var ref;
    this.empty();
    if ((ref = window.views.balanceView) != null) {
      ref.render();
    }
    $(".menu-position").removeClass("active");
    return $(".menu-1").addClass("active");
  };

  Router.prototype.search = function() {
    var ref;
    this.empty();
    if ((ref = window.views.searchView) != null) {
      ref.render();
    }
    $(".menu-position").removeClass("active");
    return $(".menu-2").addClass("active");
  };

  Router.prototype.accounts = function() {
    var ref;
    this.empty();
    if ((ref = window.views.accountsView) != null) {
      ref.render();
    }
    $(".menu-position").removeClass("active");
    return $(".menu-3").addClass("active");
  };

  return Router;

})(Backbone.Router);

});

require.register("views/accounts", function(exports, require, module) {
var AccountsBankView, AccountsView, BaseView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

BaseView = require('../lib/base_view');

AccountsBankView = require('./accounts_bank');

module.exports = AccountsView = (function(superClass) {
  extend(AccountsView, superClass);

  function AccountsView() {
    return AccountsView.__super__.constructor.apply(this, arguments);
  }

  AccountsView.prototype.template = require('./templates/accounts');

  AccountsView.prototype.el = 'div#content';

  AccountsView.prototype.elBanks = '.content-right-column';

  AccountsView.prototype.subViews = [];

  AccountsView.prototype.render = function() {
    var bank, i, len, ref, view;
    AccountsView.__super__.render.call(this);
    ref = window.collections.banks.models;
    for (i = 0, len = ref.length; i < len; i++) {
      bank = ref[i];
      view = new AccountsBankView(bank);
      this.subViews.push(view);
      this.$(this.elBanks).append(view.render().el);
    }
    return this;
  };

  AccountsView.prototype.empty = function() {
    var i, len, ref, results, view;
    ref = this.subViews;
    results = [];
    for (i = 0, len = ref.length; i < len; i++) {
      view = ref[i];
      results.push(view.destroy());
    }
    return results;
  };

  return AccountsView;

})(BaseView);

});

require.register("views/accounts_alerts", function(exports, require, module) {
var AccountsAlertsAlertView, AccountsAlertsView, BankAlert, BankAlertsCollection, BaseView,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

BaseView = require('../lib/base_view');

BankAlertsCollection = require('../collections/bank_alerts');

AccountsAlertsAlertView = require('./accounts_alerts_alert');

BankAlert = require('../models/bank_alert');

module.exports = AccountsAlertsView = (function(superClass) {
  extend(AccountsAlertsView, superClass);

  AccountsAlertsView.prototype.template = require("./templates/accounts_alerts");

  AccountsAlertsView.prototype.elPeriodic = "#reports-body-periodic";

  AccountsAlertsView.prototype.elAmount = "#reports-body-amount";

  AccountsAlertsView.prototype.elTransaction = "#reports-body-transaction";

  AccountsAlertsView.prototype.alerts = new BankAlertsCollection();

  AccountsAlertsView.prototype.events = {
    "click .reports-add-periodic": "addPeriodic",
    "click .reports-add-amount": "addAmount",
    "click .reports-add-transaction": "addTransaction"
  };

  AccountsAlertsView.prototype.subViews = [];

  function AccountsAlertsView(account) {
    this.account = account;
    this.appendSubView = bind(this.appendSubView, this);
    this.alerts.url = "bankalerts/getForBankAccount/" + this.account.get("id");
    AccountsAlertsView.__super__.constructor.call(this);
  }

  AccountsAlertsView.prototype.initialize = function() {
    return this.data = {
      bankAccount: this.account.get("id")
    };
  };

  AccountsAlertsView.prototype.addPeriodic = function(event) {
    return this.addSubView("report", this.elPeriodic);
  };

  AccountsAlertsView.prototype.addAmount = function(event) {
    return this.addSubView("balance", this.elAmount);
  };

  AccountsAlertsView.prototype.addTransaction = function(event) {
    return this.addSubView("transaction", this.elTransaction);
  };

  AccountsAlertsView.prototype.addSubView = function(type, el) {
    var model, view;
    this.data.type = type;
    model = new BankAlert(this.data);
    view = new AccountsAlertsAlertView(model, this);
    this.subViews.push(view);
    return this.$(el).append(view.render().el);
  };

  AccountsAlertsView.prototype.appendSubView = function(viewAlert) {
    var element, ref, ref1;
    if ((viewAlert != null ? (ref = viewAlert.alert) != null ? ref.get("type") : void 0 : void 0) === "report") {
      element = this.elPeriodic;
    } else if ((viewAlert != null ? (ref1 = viewAlert.alert) != null ? ref1.get("type") : void 0 : void 0) === "balance") {
      element = this.elAmount;
    } else {
      element = this.elTransaction;
    }
    this.subViews.push(viewAlert);
    return this.$(element).append(viewAlert.render().el);
  };

  AccountsAlertsView.prototype.render = function() {
    var view;
    view = this;
    this.$el.html(this.template);
    this.$("#reports-dialog").modal();
    this.$("#reports-dialog").modal("show");
    this.alerts.fetch({
      success: function(alerts) {
        var alert, i, len, ref, results, viewAlert;
        ref = alerts.models;
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          alert = ref[i];
          viewAlert = new AccountsAlertsAlertView(alert, view);
          results.push(view.appendSubView(viewAlert));
        }
        return results;
      },
      error: function(err) {}
    });
    return this;
  };

  AccountsAlertsView.prototype.destroy = function() {
    var i, len, ref, view;
    ref = this.subViews;
    for (i = 0, len = ref.length; i < len; i++) {
      view = ref[i];
      view.destroy();
    }
    return AccountsAlertsView.__super__.destroy.call(this);
  };

  return AccountsAlertsView;

})(BaseView);

});

require.register("views/accounts_alerts_alert", function(exports, require, module) {
var AccountsAlertsAlertView, BankAlert, BaseView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

BaseView = require('../lib/base_view');

BankAlert = require('../models/bank_alert');

module.exports = AccountsAlertsAlertView = (function(superClass) {
  extend(AccountsAlertsAlertView, superClass);

  AccountsAlertsAlertView.prototype.template = require("./templates/accounts_alerts_alert");

  AccountsAlertsAlertView.prototype.events = {
    "click .reports-save": "save",
    "click .reports-cancel": "destroy",
    "click .reports-delete": "removeAlert",
    "click .reports-edit": "edit"
  };

  function AccountsAlertsAlertView(alert, parent) {
    this.alert = alert;
    this.parent = parent;
    AccountsAlertsAlertView.__super__.constructor.call(this);
  }

  AccountsAlertsAlertView.prototype.initialize = function() {};

  AccountsAlertsAlertView.prototype.save = function() {
    var valLimit, view;
    view = this;
    if (this.alert.get("type") === "report") {
      this.alert.set("frequency", this.$(".reports-frequency").val());
    } else {
      this.alert.set("order", this.$(".reports-order").val());
      valLimit = this.$(".reports-limit").val();
      valLimit = valLimit.replace(" ", "").replace(",", ".");
      this.alert.set("limit", Number(valLimit));
    }
    return this.alert.save({}, {
      success: function() {
        console.log("Alert saved to server");
        return view.render();
      },
      error: function() {
        return console.log("error");
      }
    });
  };

  AccountsAlertsAlertView.prototype.removeAlert = function() {
    var view;
    view = this;
    this.alert.url = "bankalerts/" + this.alert.get("id");
    return this.alert.destroy({
      success: function() {
        console.log("Alert deleted from server");
        return view.destroy();
      },
      error: function() {
        return console.log("error");
      }
    });
  };

  AccountsAlertsAlertView.prototype.render = function() {
    this.$el.html(this.template({
      model: this.alert
    }));
    return this;
  };

  return AccountsAlertsAlertView;

})(BaseView);

});

require.register("views/accounts_bank", function(exports, require, module) {
var AccountsBankAccountView, AccountsBankView, BankAccountsCollection, BaseView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

BaseView = require('../lib/base_view');

BankAccountsCollection = require('../collections/bank_accounts');

AccountsBankAccountView = require('./accounts_bank_account');

module.exports = AccountsBankView = (function(superClass) {
  extend(AccountsBankView, superClass);

  AccountsBankView.prototype.template = require('./templates/accounts_bank');

  AccountsBankView.prototype.templateModal = require('./templates/modal_confirm');

  AccountsBankView.prototype.className = 'bank-group';

  AccountsBankView.prototype.inUse = false;

  AccountsBankView.prototype.events = {
    "click a.delete-bank": "confirmDeleteBank"
  };

  AccountsBankView.prototype.subViews = [];

  function AccountsBankView(bank1) {
    this.bank = bank1;
    AccountsBankView.__super__.constructor.call(this);
  }

  AccountsBankView.prototype.initialize = function() {
    return this.listenTo(this.bank.accounts, "add", this.render);
  };

  AccountsBankView.prototype.confirmDeleteBank = function(event) {
    var button, data;
    event.preventDefault();
    button = $(event.target);
    data = {
      title: window.i18n("accounts_delete_bank_title"),
      body: window.i18n("accounts_delete_bank_prompt"),
      confirm: window.i18n("accounts_delete_bank_confirm")
    };
    $("body").prepend(this.templateModal(data));
    $("#confirmation-dialog").modal();
    $("#confirmation-dialog").modal("show");
    return $("a#confirmation-dialog-confirm").bind("click", {
      button: button,
      bank: this.bank,
      view: this
    }, this.deleteBank);
  };

  AccountsBankView.prototype.deleteBank = function(event) {
    var bank, button, oldText, url, view;
    event.preventDefault();
    $("#confirmation-dialog").modal("hide");
    view = event.data.view;
    button = event.data.button;
    bank = event.data.bank;
    oldText = button.html();
    button.addClass("disabled");
    button.html(window.i18n("removing") + " <img src='./loader_inverse.gif' />");
    return $.ajax({
      url: url = "banks/" + bank.get("id"),
      type: "DELETE",
      success: function() {
        bank.accounts.remove(bank.accounts.models);
        return view.$el.html("");
      },
      error: function(err) {
        var inUse;
        console.log("there was an error");
        console.log(err);
        return inUse = false;
      }
    });
  };

  AccountsBankView.prototype.render = function() {
    var bank, view, viewEl;
    view = this;
    viewEl = this.$el;
    bank = this.bank;
    this.bank.accounts.fetch({
      success: function(accounts) {
        var account, accountView, i, len, ref;
        bank.set("amount", bank.accounts.getSum());
        if (accounts.length > 0) {
          view.$el.html(view.template({
            model: view.bank
          }));
          ref = accounts.models;
          for (i = 0, len = ref.length; i < len; i++) {
            account = ref[i];
            accountView = new AccountsBankAccountView(account, view);
            view.subViews.push(accountView);
            view.$("tbody#account-container").append(accountView.render().el);
          }
          $(".content-right-column").niceScroll();
          return $(".content-right-column").getNiceScroll().onResize();
        }
      },
      error: function() {
        return alert(window.i18n("error_loading_accounts"));
      }
    });
    return this;
  };

  AccountsBankView.prototype.destroy = function() {
    var i, len, ref, view;
    ref = this.subViews;
    for (i = 0, len = ref.length; i < len; i++) {
      view = ref[i];
      view.destroy();
    }
    return AccountsBankView.__super__.destroy.call(this);
  };

  return AccountsBankView;

})(BaseView);

});

require.register("views/accounts_bank_account", function(exports, require, module) {
var AccountsAlertsView, AccountsBankAccountView, BaseView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

BaseView = require('../lib/base_view');

AccountsAlertsView = require('./accounts_alerts');

module.exports = AccountsBankAccountView = (function(superClass) {
  extend(AccountsBankAccountView, superClass);

  AccountsBankAccountView.prototype.template = require('./templates/accounts_bank_account');

  AccountsBankAccountView.prototype.templateModal = require('./templates/modal_confirm');

  AccountsBankAccountView.prototype.tagName = "tr";

  AccountsBankAccountView.prototype.events = {
    "click a.delete-account": "confirmDeleteAccount",
    "click a.alert-management": "showAlertManagement"
  };

  function AccountsBankAccountView(model1, parent1) {
    this.model = model1;
    this.parent = parent1;
    AccountsBankAccountView.__super__.constructor.call(this);
  }

  AccountsBankAccountView.prototype.showAlertManagement = function(event) {
    var ref;
    console.log("showAlertManagement");
    if ((ref = this.alertsView) != null) {
      ref.destroy();
    }
    this.alertsView = new AccountsAlertsView(this.model);
    return $("body").prepend(this.alertsView.render().el);
  };

  AccountsBankAccountView.prototype.confirmDeleteAccount = function(event) {
    var button, data, parent, view;
    event.preventDefault();
    view = this;
    parent = this.parent;
    button = $(event.target);
    data = {
      title: window.i18n("accounts_delete_account_title"),
      body: window.i18n("accounts_delete_account_prompt"),
      confirm: window.i18n("accounts_delete_account_confirm")
    };
    $("body").prepend(this.templateModal(data));
    $("#confirmation-dialog").modal();
    return $("a#confirmation-dialog-confirm").bind("click", {
      button: button,
      model: this.model,
      parent: this.parent,
      view: this
    }, this.deleteAccount);
  };

  AccountsBankAccountView.prototype.deleteAccount = function(event) {
    var button, model, oldText, parent, view;
    event.preventDefault();
    $("#confirmation-dialog").modal("hide");
    parent = event.data.parent;
    view = event.data.view;
    button = event.data.button;
    model = event.data.model;
    oldText = button.html();
    button.addClass("disabled");
    button.html(window.i18n("removing") + " <img src='./loader_inverse.gif' />");
    model.url = "bankaccounts/" + model.get("id");
    return model.destroy({
      success: function(model) {
        console.log("destroyed");
        view.destroy();
        if ((parent != null ? parent.bank.accounts.length : void 0) === 0) {
          return parent.destroy();
        }
      },
      error: function(err) {
        console.log("there was an error");
        return console.log(err);
      }
    });
  };

  AccountsBankAccountView.prototype.render = function() {
    this.$el.html(this.template({
      model: this.model
    }));
    return this;
  };

  AccountsBankAccountView.prototype.destroy = function() {
    var ref;
    if ((ref = this.alertsView) != null) {
      ref.destroy();
    }
    return AccountsBankAccountView.__super__.destroy.call(this);
  };

  return AccountsBankAccountView;

})(BaseView);

});

require.register("views/app", function(exports, require, module) {
var AccountsView, AppView, BalanceView, BaseView, NavbarView, NewBankView, SearchView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

BaseView = require('../lib/base_view');

NavbarView = require('views/navbar');

NewBankView = require('views/new_bank');

AccountsView = require('views/accounts');

BalanceView = require('views/balance');

SearchView = require('views/search');

module.exports = AppView = (function(superClass) {
  extend(AppView, superClass);

  function AppView() {
    return AppView.__super__.constructor.apply(this, arguments);
  }

  AppView.prototype.template = require('./templates/app');

  AppView.prototype.el = 'body.application';

  AppView.prototype.afterRender = function() {
    return window.collections.banks.fetch({
      data: {
        withAccountOnly: true
      },
      success: function() {
        return window.collections.allBanks.fetch({
          success: function() {
            if (!this.navbarView) {
              this.navbarView = new NavbarView();
            }
            if (!this.newbankView) {
              this.newbankView = new NewBankView();
            }
            if (!window.views.balanceView) {
              window.views.balanceView = new BalanceView();
            }
            if (!window.views.accountsView) {
              window.views.accountsView = new AccountsView();
            }
            if (!window.views.searchView) {
              window.views.searchView = new SearchView();
            }
            this.navbarView.render();
            this.newbankView.render();
            return Backbone.history.start();
          },
          error: function() {
            console.log("Fatal error: could not get the banks list");
            return alert(window.i18n("fatal_error"));
          }
        });
      }
    });
  };

  return AppView;

})(BaseView);

});

require.register("views/balance", function(exports, require, module) {
var BalanceBankView, BalanceOperationsView, BalanceView, BaseView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

BaseView = require('../lib/base_view');

BalanceBankView = require('./balance_bank');

BalanceOperationsView = require("./balance_operations");

module.exports = BalanceView = (function(superClass) {
  extend(BalanceView, superClass);

  function BalanceView() {
    return BalanceView.__super__.constructor.apply(this, arguments);
  }

  BalanceView.prototype.template = require('./templates/layout-2col');

  BalanceView.prototype.el = 'div#content';

  BalanceView.prototype.elAccounts = '#layout-2col-column-left';

  BalanceView.prototype.elOperations = '#layout-2col-column-right';

  BalanceView.prototype.accounts = 0;

  BalanceView.prototype.subViews = [];

  BalanceView.prototype.initialize = function() {
    return this.listenTo(window.activeObjects, "new_access_added_successfully", this.noMoreEmpty);
  };

  BalanceView.prototype.noMoreEmpty = function() {
    var ref, ref1;
    if ((ref = this.$(".arrow")) != null) {
      ref.hide();
    }
    if ((ref1 = this.$(".loading")) != null) {
      ref1.hide();
    }
    return window.collections.banks.fetch({
      success: (function(_this) {
        return function() {
          return _this.render();
        };
      })(this)
    });
  };

  BalanceView.prototype.render = function() {
    var treatment, view;
    BalanceView.__super__.render.call(this);
    this.operationsView = new BalanceOperationsView(this.$(this.elOperations));
    this.operationsView.render();
    view = this;
    treatment = function(bank, callback) {
      var viewBank;
      viewBank = new BalanceBankView(bank);
      view.subViews.push(viewBank);
      $(view.elAccounts).append(viewBank.el);
      return bank.accounts.fetch({
        success: function(col) {
          callback(null, col.length);
          if (col.length > 0) {
            return viewBank.render();
          }
        },
        error: function(col, err, opts) {
          callback(null, col.length);
          return viewBank.$el.html("");
        }
      });
    };
    async.concat(window.collections.banks.models, treatment, function(err, results) {
      if (err) {
        console.log(err);
        alert(window.i18n("error_loading_accounts"));
      }
      this.accounts = results.length;
      $("#layout-2col-column-left").niceScroll();
      $("#layout-2col-column-left").getNiceScroll().onResize();
      if (this.accounts === 0) {
        return $(view.elAccounts).prepend(require("./templates/balance_banks_empty"));
      }
    });
    return this;
  };

  BalanceView.prototype.empty = function() {
    var i, len, ref, ref1, results1, view;
    if ((ref = this.operationsView) != null) {
      ref.destroy();
    }
    ref1 = this.subViews;
    results1 = [];
    for (i = 0, len = ref1.length; i < len; i++) {
      view = ref1[i];
      results1.push(view.destroy());
    }
    return results1;
  };

  return BalanceView;

})(BaseView);

});

require.register("views/balance_bank", function(exports, require, module) {
var BalanceBankView, BankSubTitleView, BankTitleView, BaseView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

BaseView = require('../lib/base_view');

BankTitleView = require('./bank_title');

BankSubTitleView = require('./bank_subtitle');

module.exports = BalanceBankView = (function(superClass) {
  extend(BalanceBankView, superClass);

  BalanceBankView.prototype.className = 'bank';

  BalanceBankView.prototype.sum = 0;

  BalanceBankView.prototype.subViews = [];

  function BalanceBankView(bank) {
    this.bank = bank;
    BalanceBankView.__super__.constructor.call(this);
  }

  BalanceBankView.prototype.initialize = function() {
    this.listenTo(this.bank.accounts, "add", this.addOne);
    return this.listenTo(this.bank.accounts, "destroy", this.render);
  };

  BalanceBankView.prototype.addOne = function(account) {
    var viewAccount;
    viewAccount = new BankSubTitleView(account);
    this.subViews.push(viewAccount);
    account.view = viewAccount;
    return this.$el.append(viewAccount.render().el);
  };

  BalanceBankView.prototype.render = function() {
    var account, i, len, ref;
    this.viewTitle = new BankTitleView(this.bank);
    this.$el.html(this.viewTitle.render().el);
    this.viewTitle = null;
    this.sum = 0;
    ref = this.bank.accounts.models;
    for (i = 0, len = ref.length; i < len; i++) {
      account = ref[i];
      this.addOne(account);
    }
    return this;
  };

  BalanceBankView.prototype.destroy = function() {
    var i, len, ref, ref1, view;
    if ((ref = this.viewTitle) != null) {
      ref.destroy();
    }
    ref1 = this.subViews;
    for (i = 0, len = ref1.length; i < len; i++) {
      view = ref1[i];
      view.destroy();
    }
    return BalanceBankView.__super__.destroy.call(this);
  };

  return BalanceBankView;

})(BaseView);

});

require.register("views/balance_operation", function(exports, require, module) {
var BalanceOperationView, BaseView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

BaseView = require('../lib/base_view');

module.exports = BalanceOperationView = (function(superClass) {
  extend(BalanceOperationView, superClass);

  BalanceOperationView.prototype.template = require('./templates/balance_operations_element');

  BalanceOperationView.prototype.tagName = 'tr';

  function BalanceOperationView(model, account, showAccountNum) {
    this.model = model;
    this.account = account;
    this.showAccountNum = showAccountNum != null ? showAccountNum : false;
    BalanceOperationView.__super__.constructor.call(this);
  }

  BalanceOperationView.prototype.fakeFeatureLink = function() {
    if (this.model.get('title') === "AT&T") {
      return 'pdf/Att Bill May 2012.pdf';
    } else if (this.model.get('title') === "American Electric Power") {
      return 'pdf/2014-11-AmericanElectricPower-Bill.pdf';
    } else if (this.model.get('title') === "Salary") {
      return 'pdf/paystub.pdf';
    } else if (this.model.get('title') === "American Airlines - Los Angeles <-> Paris") {
      return 'pdf/british-airways-boarding-pass.pdf';
    } else if (this.model.get('title') === "SNCF") {
      return 'pdf/factureSNCF.pdf';
    } else if (this.model.get('title') === "SFR Facture") {
      return 'pdf/factureSFR.pdf';
    } else if (this.model.get('title') === "EDF Facture") {
      return '/#apps/edf/4-facture';
    } else {
      return null;
    }
  };

  BalanceOperationView.prototype.render = function() {
    var a, formattedAmount, hint;
    this.model.account = this.account;
    this.model.formattedDate = moment(this.model.get('date')).format("DD/MM/YYYY");
    formattedAmount = this.fakeFeatureLink();
    if (formattedAmount !== null) {
      this.model.formattedAmount = formattedAmount;
    }
    if (this.showAccountNum) {
      hint = ((this.model.account.get('title')) + ", ") + ("n°" + (this.model.account.get('accountNumber')));
      this.model.hint = ((this.model.account.get('title')) + ", ") + ("n°" + (this.model.account.get('accountNumber')));
    } else {
      this.model.hint = "" + (this.model.get('raw'));
    }
    BalanceOperationView.__super__.render.call(this);
    if (formattedAmount !== null) {
      a = this.$el.find("a");
      a.click((function(_this) {
        return function() {
          var intent;
          if (_this.model.get('title') === "EDF Facture") {
            intent = {
              action: 'goto',
              params: "edf/4-facture"
            };
            window.parent.postMessage(intent, window.location.origin);
            return false;
          }
          return true;
        };
      })(this));
    }
    return this;
  };

  return BalanceOperationView;

})(BaseView);

});

require.register("views/balance_operations", function(exports, require, module) {
var BalanceOperationView, BalanceOperationsView, BankOperationsCollection, BaseView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

BaseView = require('../lib/base_view');

BankOperationsCollection = require("../collections/bank_operations");

BalanceOperationView = require("./balance_operation");

module.exports = BalanceOperationsView = (function(superClass) {
  extend(BalanceOperationsView, superClass);

  BalanceOperationsView.prototype.templateHeader = require('./templates/balance_operations_header');

  BalanceOperationsView.prototype.events = {
    'click a.recheck-button': "checkAccount",
    'click th.sort-date': "sortByDate",
    'click th.sort-title': "sortByTitle",
    'click th.sort-amount': "sortByAmount"
  };

  BalanceOperationsView.prototype.inUse = false;

  BalanceOperationsView.prototype.subViews = [];

  function BalanceOperationsView(el) {
    this.el = el;
    BalanceOperationsView.__super__.constructor.call(this);
  }

  BalanceOperationsView.prototype.setIntervalWithContext = function(code, delay, context) {
    return setInterval(function() {
      return code.call(context);
    }, delay);
  };

  BalanceOperationsView.prototype.initialize = function() {
    this.listenTo(window.activeObjects, 'changeActiveAccount', this.reload);
    this.listenTo(window.collections.operations, 'sort', this.addAll);
    this.setIntervalWithContext(this.updateTimer, 1000, this);
    return window.collections.operations.setComparator("date");
  };

  BalanceOperationsView.prototype.sortByDate = function(event) {
    return this.sortBy("date");
  };

  BalanceOperationsView.prototype.sortByTitle = function(event) {
    return this.sortBy("title");
  };

  BalanceOperationsView.prototype.sortByAmount = function(event) {
    return this.sortBy("amount");
  };

  BalanceOperationsView.prototype.sortBy = function(order) {
    var operations;
    operations = window.collections.operations;
    operations.toggleSort(order);
    this.$("th.sorting_asc").removeClass("sorting_asc");
    this.$("th.sorting_desc").removeClass("sorting_desc");
    this.$("th.sort-" + order).addClass("sorting_" + operations.order);
    operations.setComparator(order);
    return operations.sort();
  };

  BalanceOperationsView.prototype.checkAccount = function(event) {
    var button, url, view;
    event.preventDefault();
    button = $(event.target);
    view = this;
    if (!this.inUse) {
      console.log("Checking account ...");
      view.inUse = true;
      button.html("checking...");
      return $.ajax({
        url: url = "bankaccounts/retrieveOperations/" + this.model.get("id"),
        type: "GET",
        success: function() {
          var ref, ref1, ref2;
          if ((ref = view.model) != null) {
            ref.url = "bankaccounts/" + ((ref1 = view.model) != null ? ref1.get("id") : void 0);
          }
          return (ref2 = view.model) != null ? ref2.fetch({
            success: function() {
              console.log("... checked");
              button.html("checked");
              view.inUse = false;
              return view.reload(view.model);
            },
            error: function() {
              console.log("... there was an error fetching");
              button.html("error...");
              return view.inUse = false;
            }
          }) : void 0;
        },
        error: function(err) {
          console.log("... there was an error checking");
          console.log(err);
          button.html("error...");
          return view.inUse = false;
        }
      });
    }
  };

  BalanceOperationsView.prototype.updateTimer = function() {
    var model;
    if (this.model != null) {
      model = this.model;
      return this.$("span.last-checked").html((window.i18n("balance_last_checked")) + " " + (moment(moment(model.get("lastChecked"))).fromNow()) + ". ");
    }
  };

  BalanceOperationsView.prototype.render = function() {
    this.$el.html(require("./templates/balance_operations_empty"));
    $("#layout-2col-column-right").niceScroll();
    $("#layout-2col-column-right").getNiceScroll().onResize();
    return this;
  };

  BalanceOperationsView.prototype.reload = function(account) {
    var view;
    view = this;
    this.model = account;
    this.$el.html(this.templateHeader({
      model: account
    }));
    window.collections.operations.reset();
    window.collections.operations.setAccount(account);
    window.collections.operations.fetch({
      success: function(operations) {
        return view.addAll();
      },
      error: function() {
        return console.log("error fetching operations");
      }
    });
    return this;
  };

  BalanceOperationsView.prototype.addAll = function() {
    var i, j, len, len1, operation, ref, ref1, subView, view;
    this.$("#table-operations").html("");
    this.$(".loading").remove();
    ref = this.subViews;
    for (i = 0, len = ref.length; i < len; i++) {
      view = ref[i];
      view.destroy();
    }
    this.subViews = [];
    ref1 = window.collections.operations.models;
    for (j = 0, len1 = ref1.length; j < len1; j++) {
      operation = ref1[j];
      subView = new BalanceOperationView(operation, this.model);
      this.$("#table-operations").append(subView.render().el);
      this.subViews.push(subView);
    }
    $("#layout-2col-column-right").niceScroll();
    return $("#layout-2col-column-right").getNiceScroll().onResize();
  };

  BalanceOperationsView.prototype.destroy = function() {
    var i, len, ref, ref1, view;
    if ((ref = this.viewTitle) != null) {
      ref.destroy();
    }
    ref1 = this.subViews;
    for (i = 0, len = ref1.length; i < len; i++) {
      view = ref1[i];
      view.destroy();
    }
    return BalanceOperationsView.__super__.destroy.call(this);
  };

  return BalanceOperationsView;

})(BaseView);

});

require.register("views/bank_subtitle", function(exports, require, module) {
var BankSubTitleView, BaseView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

BaseView = require('../lib/base_view');

module.exports = BankSubTitleView = (function(superClass) {
  extend(BankSubTitleView, superClass);

  BankSubTitleView.prototype.template = require('./templates/balance_bank_subtitle');

  function BankSubTitleView(model) {
    this.model = model;
    BankSubTitleView.__super__.constructor.call(this);
  }

  BankSubTitleView.prototype.events = {
    "click .row": "chooseAccount"
  };

  BankSubTitleView.prototype.initialize = function() {
    this.listenTo(this.model, 'change', this.render);
    return this.listenTo(window.activeObjects, 'changeActiveAccount', this.checkActive);
  };

  BankSubTitleView.prototype.chooseAccount = function(event) {
    console.log("Account chosen: " + this.model.get("title"));
    return window.activeObjects.trigger("changeActiveAccount", this.model);
  };

  BankSubTitleView.prototype.checkActive = function(account) {
    this.$(".row").removeClass("active");
    if (account === this.model) {
      return this.$(".row").addClass("active");
    }
  };

  return BankSubTitleView;

})(BaseView);

});

require.register("views/bank_title", function(exports, require, module) {
var BankTitleView, BaseView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

BaseView = require('../lib/base_view');

module.exports = BankTitleView = (function(superClass) {
  extend(BankTitleView, superClass);

  BankTitleView.prototype.template = require('./templates/balance_bank_title');

  function BankTitleView(model) {
    this.model = model;
    BankTitleView.__super__.constructor.call(this);
  }

  BankTitleView.prototype.initialize = function() {
    this.listenTo(this.model, 'change', this.update);
    this.listenTo(this.model.accounts, "add", this.update);
    this.listenTo(this.model.accounts, "destroy", this.update);
    this.listenTo(this.model.accounts, "request", this.displayLoading);
    return this.listenTo(this.model.accounts, "change", this.hideLoading);
  };

  BankTitleView.prototype.displayLoading = function() {
    return this.$(".bank-title-loading").show();
  };

  BankTitleView.prototype.hideLoading = function() {
    return this.$(".bank-title-loading").hide();
  };

  BankTitleView.prototype.update = function() {
    this.model.set("amount", this.model.accounts.getSum());
    this.$(".bank-amount").html(Number(this.model.get('amount')).money());
    if (this.model.accounts.length === 0) {
      this.$(".bank-title").hide();
      this.$(".bank-balance").hide();
    } else {
      this.$(".bank-title").show();
      this.$(".bank-balance").show();
    }
    return this.$(".bank-title-loading").hide();
  };

  BankTitleView.prototype.render = function() {
    BankTitleView.__super__.render.call(this);
    this.update();
    return this;
  };

  return BankTitleView;

})(BaseView);

});

require.register("views/mockup", function(exports, require, module) {
var AppView, BaseView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

BaseView = require('../lib/base_view');

module.exports = AppView = (function(superClass) {
  extend(AppView, superClass);

  function AppView() {
    return AppView.__super__.constructor.apply(this, arguments);
  }

  AppView.prototype.template = require('./templates/mockup_balance');

  AppView.prototype.el = 'body.application';

  AppView.prototype.afterRender = function() {
    return $('.content-right-column').niceScroll();
  };

  return AppView;

})(BaseView);

});

require.register("views/navbar", function(exports, require, module) {
var BaseView, NavbarView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

BaseView = require('../lib/base_view');

module.exports = NavbarView = (function(superClass) {
  extend(NavbarView, superClass);

  function NavbarView() {
    return NavbarView.__super__.constructor.apply(this, arguments);
  }

  NavbarView.prototype.template = require('./templates/navbar');

  NavbarView.prototype.el = 'div#navbar';

  NavbarView.prototype.initialize = function() {
    this.listenTo(window.collections.banks, "change", this.refreshOverallBalance);
    this.listenTo(window.collections.banks, 'destroy', this.refreshOverallBalance);
    this.listenTo(window.collections.banks, 'update', this.refreshOverallBalance);
    return this.listenTo(window.collections.banks, 'reset', this.refreshOverallBalance);
  };

  NavbarView.prototype.refreshOverallBalance = function() {
    var sum;
    sum = window.collections.banks.getSum();
    console.log("recalculating the overall balance: " + sum);
    return $("span#total-amount").html(sum.money());
  };

  return NavbarView;

})(BaseView);

});

require.register("views/new_bank", function(exports, require, module) {
var BankAccessModel, BaseView, NewBankView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

BaseView = require('../lib/base_view');

BankAccessModel = require('../models/bank_access');

module.exports = NewBankView = (function(superClass) {
  extend(NewBankView, superClass);

  function NewBankView() {
    return NewBankView.__super__.constructor.apply(this, arguments);
  }

  NewBankView.prototype.template = require('./templates/new_bank');

  NewBankView.prototype.el = 'div#add-bank-window';

  NewBankView.prototype.events = {
    'click #btn-add-bank-save': "saveBank"
  };

  NewBankView.prototype.initialize = function() {
    return this.$el.on('hidden.bs.modal', (function(_this) {
      return function() {
        return _this.render();
      };
    })(this));
  };

  NewBankView.prototype.saveBank = function(event) {
    var bankAccess, button, data, oldText, view;
    event.preventDefault();
    view = this;
    button = $(event.target);
    oldText = button.html();
    button.addClass("disabled");
    button.html(window.i18n("verifying") + "<img src='./loader_green.gif' />");
    button.removeClass('btn-warning');
    button.addClass('btn-success');
    this.$(".message-modal").html("");
    data = {
      login: $("#inputLogin").val(),
      password: $("#inputPass").val(),
      bank: $("#inputBank").val()
    };
    bankAccess = new BankAccessModel(data);
    return bankAccess.save(data, {
      success: function(model, response, options) {
        var bank;
        button.html(window.i18n("sent") + " <img src='./loader_green.gif' />");
        bank = window.collections.allBanks.get(data.bank);
        if (bank != null) {
          console.log("Fetching for new accounts in bank" + bank.get("name"));
          bank.accounts.trigger("loading");
          bank.accounts.fetch();
        }
        $("#add-bank-window").modal("hide");
        button.removeClass("disabled");
        button.html(oldText);
        window.activeObjects.trigger("new_access_added_successfully", model);
        return setTimeout(function() {
          var router;
          $("#add-bank-window").modal("hide");
          router = window.app.router;
          return router.navigate('/', {
            trigger: true,
            replace: true
          });
        }, 500);
      },
      error: function(model, xhr, options) {
        button.removeClass('btn-success');
        button.removeClass('disabled');
        button.addClass('btn-warning');
        if (((xhr != null ? xhr.status : void 0) != null) && xhr.status === 409) {
          this.$(".message-modal").html("<div class='alert alert-danger'>" + window.i18n("access already exists") + "</div>");
          return button.html(window.i18n("access already exists button"));
        } else {
          this.$(".message-modal").html("<div class='alert alert-danger'>" + window.i18n("error_check_credentials") + "</div>");
          return button.html(window.i18n("error_check_credentials_btn"));
        }
      }
    });
  };

  NewBankView.prototype.getRenderData = function() {
    return {
      banks: window.collections.allBanks.models
    };
  };

  return NewBankView;

})(BaseView);

});

require.register("views/search", function(exports, require, module) {
var BaseView, SearchBankView, SearchOperationsView, SearchView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

BaseView = require('../lib/base_view');

SearchBankView = require('./search_bank');

SearchOperationsView = require("./search_operations");

module.exports = SearchView = (function(superClass) {
  extend(SearchView, superClass);

  function SearchView() {
    return SearchView.__super__.constructor.apply(this, arguments);
  }

  SearchView.prototype.template = require('./templates/layout-2col');

  SearchView.prototype.el = 'div#content';

  SearchView.prototype.elAccounts = '#layout-2col-column-left';

  SearchView.prototype.elOperations = '#layout-2col-column-right';

  SearchView.prototype.accounts = 0;

  SearchView.prototype.viewsBank = [];

  SearchView.prototype.initialize = function() {
    return this.listenTo(window.activeObjects, "new_access_added_successfully", this.noMoreEmpty);
  };

  SearchView.prototype.noMoreEmpty = function() {
    var ref, ref1;
    console.log("no more empty");
    if ((ref = this.$(".arrow")) != null) {
      ref.hide();
    }
    return (ref1 = this.$(".loading")) != null ? ref1.hide() : void 0;
  };

  SearchView.prototype.render = function() {
    var treatment, view;
    SearchView.__super__.render.call(this);
    this.operations = new SearchOperationsView(this.$(this.elOperations));
    this.operations.render();
    view = this;
    treatment = function(bank, callback) {
      var viewBank;
      viewBank = new SearchBankView(bank);
      view.viewsBank.push(viewBank);
      $(view.elAccounts).append(viewBank.el);
      return bank.accounts.fetch({
        success: function(col) {
          callback(null, col.length);
          return viewBank.render();
        },
        error: function(col, err, opts) {
          callback(null, col.length);
          return viewBank.$el.html("");
        }
      });
    };
    async.concat(window.collections.banks.models, treatment, function(err, results) {
      if (err) {
        console.log(err);
        alert(window.i18n("error_loading_accounts"));
      }
      this.accounts = results.length;
      $("#layout-2col-column-left").niceScroll();
      $("#layout-2col-column-left").getNiceScroll().onResize();
      if (this.accounts === 0) {
        return $(view.elAccounts).prepend(require("./templates/balance_banks_empty"));
      }
    });
    return this;
  };

  SearchView.prototype.empty = function() {
    var i, len, ref, ref1, results1, viewBank;
    if ((ref = this.operations) != null) {
      ref.destroy();
    }
    ref1 = this.viewsBank;
    results1 = [];
    for (i = 0, len = ref1.length; i < len; i++) {
      viewBank = ref1[i];
      results1.push(viewBank.destroy());
    }
    return results1;
  };

  return SearchView;

})(BaseView);

});

require.register("views/search_bank", function(exports, require, module) {
var BaseView, SearchBankSubTitleView, SearchBankTitleView, SearchBankView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

BaseView = require('../lib/base_view');

SearchBankTitleView = require('./search_bank_title');

SearchBankSubTitleView = require('./search_bank_subtitle');

module.exports = SearchBankView = (function(superClass) {
  extend(SearchBankView, superClass);

  SearchBankView.prototype.className = 'bank';

  SearchBankView.prototype.events = {
    "change .choice-bank": "bankChange"
  };

  SearchBankView.prototype.viewsAccount = [];

  function SearchBankView(bank) {
    this.bank = bank;
    SearchBankView.__super__.constructor.call(this);
  }

  SearchBankView.prototype.initialize = function() {
    this.listenTo(this.bank.accounts, "add", this.addOne);
    return this.listenTo(this.bank.accounts, "destroy", this.render);
  };

  SearchBankView.prototype.bankChange = function(event) {
    var account, enabled, i, len, ref;
    enabled = this.$(event.target).prop("checked");
    console.log("[Search] " + this.bank.get("name") + ": " + enabled);
    $.each(this.$("input[type=checkbox].choice-account"), function(index, element) {
      return $(element).prop("checked", enabled);
    });
    ref = this.bank.accounts.models;
    for (i = 0, len = ref.length; i < len; i++) {
      account = ref[i];
      account.checked = enabled;
    }
    this.bank.checked = enabled;
    return window.collections.banks.trigger("search-update-accounts");
  };

  SearchBankView.prototype.addOne = function(account) {
    var viewAccount;
    viewAccount = new SearchBankSubTitleView(account);
    this.viewsAccount.push(viewAccount);
    account.view = viewAccount;
    return this.$el.append(viewAccount.render().el);
  };

  SearchBankView.prototype.render = function() {
    var account, i, len, ref;
    this.viewTitle = new SearchBankTitleView(this.bank);
    this.$el.html(this.viewTitle.render().el);
    this.viewTitle = null;
    this.sum = 0;
    ref = this.bank.accounts.models;
    for (i = 0, len = ref.length; i < len; i++) {
      account = ref[i];
      this.addOne(account);
    }
    return this;
  };

  SearchBankView.prototype.destroy = function() {
    var i, len, ref, ref1, viewAccount;
    if ((ref = this.viewTitle) != null) {
      ref.destroy();
    }
    ref1 = this.viewsAccount;
    for (i = 0, len = ref1.length; i < len; i++) {
      viewAccount = ref1[i];
      viewAccount.destroy();
    }
    return SearchBankView.__super__.destroy.call(this);
  };

  return SearchBankView;

})(BaseView);

});

require.register("views/search_bank_subtitle", function(exports, require, module) {
var BaseView, SearchBankSubTitleView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

BaseView = require('../lib/base_view');

module.exports = SearchBankSubTitleView = (function(superClass) {
  extend(SearchBankSubTitleView, superClass);

  SearchBankSubTitleView.prototype.template = require('./templates/search_bank_subtitle');

  function SearchBankSubTitleView(model) {
    this.model = model;
    SearchBankSubTitleView.__super__.constructor.call(this);
  }

  SearchBankSubTitleView.prototype.events = {
    "change .choice-account": "accountChange"
  };

  SearchBankSubTitleView.prototype.accountChange = function(event) {
    var enabled;
    enabled = this.$(event.target).prop("checked");
    console.log("[Search] " + this.model.get("title") + ": " + enabled);
    this.model.checked = enabled;
    return window.collections.banks.trigger("search-update-accounts");
  };

  SearchBankSubTitleView.prototype.initialize = function() {
    return this.listenTo(this.model, 'change', this.render);
  };

  return SearchBankSubTitleView;

})(BaseView);

});

require.register("views/search_bank_title", function(exports, require, module) {
var BaseView, SearchBankTitleView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

BaseView = require('../lib/base_view');

module.exports = SearchBankTitleView = (function(superClass) {
  extend(SearchBankTitleView, superClass);

  SearchBankTitleView.prototype.template = require('./templates/search_bank_title');

  function SearchBankTitleView(model) {
    this.model = model;
    SearchBankTitleView.__super__.constructor.call(this);
  }

  SearchBankTitleView.prototype.initialize = function() {
    this.listenTo(this.model.accounts, "add", this.update);
    this.listenTo(this.model.accounts, "destroy", this.update);
    this.listenTo(this.model.accounts, "request", this.displayLoading);
    return this.listenTo(this.model.accounts, "change", this.hideLoading);
  };

  SearchBankTitleView.prototype.displayLoading = function() {
    return this.$(".bank-title-loading").show();
  };

  SearchBankTitleView.prototype.hideLoading = function() {
    return this.$(".bank-title-loading").hide();
  };

  SearchBankTitleView.prototype.update = function() {
    if (this.model.accounts.length === 0) {
      this.$(".bank-title").hide();
      this.$(".bank-title-checkbox").hide();
    } else {
      this.$(".bank-title").show();
      this.$(".bank-title-checkbox").show();
    }
    return this.$(".bank-title-loading").hide();
  };

  SearchBankTitleView.prototype.render = function() {
    SearchBankTitleView.__super__.render.call(this);
    this.update();
    return this;
  };

  return SearchBankTitleView;

})(BaseView);

});

require.register("views/search_operations", function(exports, require, module) {
var BankOperationsCollection, BaseView, SearchOperationsTableView, SearchOperationsView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

BaseView = require('../lib/base_view');

BankOperationsCollection = require("../collections/bank_operations");

SearchOperationsTableView = require("./search_operations_table");

module.exports = SearchOperationsView = (function(superClass) {
  extend(SearchOperationsView, superClass);

  SearchOperationsView.prototype.data = {};

  SearchOperationsView.prototype.send = true;

  SearchOperationsView.prototype.events = {
    "change input": "handleUpdateFilters",
    "keyup input": "handleUpdateFilters"
  };

  function SearchOperationsView(el) {
    this.el = el;
    SearchOperationsView.__super__.constructor.call(this);
  }

  SearchOperationsView.prototype.initialize = function() {
    return this.listenTo(window.collections.banks, "search-update-accounts", this.handleUpdateAccounts);
  };

  SearchOperationsView.prototype.updateFilters = function(event) {
    var amountFrom, amountFromVal, amountTo, amountToVal, caller, dateFrom, dateFromVal, dateTo, dateToVal, searchText, searchTextVal;
    caller = this.$(event.target);
    dateFrom = this.$("input#search-date-from");
    dateTo = this.$("input#search-date-to");
    amountFrom = this.$("input#search-amount-from");
    amountTo = this.$("input#search-amount-to");
    searchText = this.$("input#search-text");
    if (!(dateFrom.val() || dateTo.val() || amountFrom.val() || amountTo.val() || searchText.val() !== "")) {
      console.log("Empty query");
      this.send = false;
      window.collections.operations.reset();
      return;
    } else {
      this.send = true;
    }
    dateFromVal = new Date(dateFrom.val() || null);
    dateToVal = new Date(dateTo.val() || new Date());
    amountFromVal = Number(amountFrom.val() || Number.NEGATIVE_INFINITY);
    amountToVal = Number(amountTo.val() || Number.POSITIVE_INFINITY);
    searchTextVal = searchText.val();
    if (amountFromVal > amountToVal) {
      if (caller[0] === amountTo[0]) {
        amountFromVal = amountToVal;
        amountFrom.val(amountToVal);
      } else {
        amountToVal = amountFromVal;
        amountTo.val(amountFromVal);
      }
    }
    if (dateFromVal.getTime() > dateToVal.getTime()) {
      if (caller[0] === dateTo[0]) {
        dateFromVal = dateToVal;
        dateFrom.val(moment(dateToVal).format("YYYY-MM-DD"));
      } else {
        dateToVal = dateFromVal;
        dateTo.val(moment(dateFromVal).format("YYYY-MM-DD"));
      }
    }
    return this.data = {
      dateFrom: dateFromVal,
      dateTo: dateToVal,
      amountFrom: amountFromVal,
      amountTo: amountToVal,
      searchText: searchTextVal,
      accounts: this.data.accounts
    };
  };

  SearchOperationsView.prototype.updateAccounts = function() {
    var account, accounts, bank, i, j, len, len1, ref, ref1;
    accounts = [];
    ref = window.collections.banks.models;
    for (i = 0, len = ref.length; i < len; i++) {
      bank = ref[i];
      ref1 = bank.accounts.models;
      for (j = 0, len1 = ref1.length; j < len1; j++) {
        account = ref1[j];
        if (bank.checked && account.checked) {
          accounts.push(account.get("accountNumber"));
        }
      }
    }
    return this.data.accounts = accounts;
  };

  SearchOperationsView.prototype.getResults = function() {
    if (this.send) {
      return $.ajax({
        type: "POST",
        url: "bankoperations/query",
        data: this.data,
        success: function(objects) {
          console.log("sent successfully!");
          console.log(objects);
          if (objects) {
            return window.collections.operations.reset(objects);
          } else {
            return window.collections.operations.reset();
          }
        },
        error: function(err) {
          return console.log("there was an error");
        }
      });
    }
  };

  SearchOperationsView.prototype.handleUpdateAccounts = function() {
    console.log("handleUpdateAccounts");
    this.updateAccounts();
    return this.getResults();
  };

  SearchOperationsView.prototype.handleUpdateFilters = function(event) {
    console.log("handleUpdateFilters");
    this.updateFilters(event);
    this.updateAccounts();
    return this.getResults();
  };

  SearchOperationsView.prototype.render = function() {
    this.$el.html(require("./templates/search_operations"));
    this.operationsTableView = new SearchOperationsTableView(this.$("#search-operations-table"));
    this.operationsTableView.render();
    return this;
  };

  SearchOperationsView.prototype.destroy = function() {
    var ref;
    if ((ref = this.operationsTableView) != null) {
      ref.destroy();
    }
    return SearchOperationsView.__super__.destroy.call(this);
  };

  return SearchOperationsView;

})(BaseView);

});

require.register("views/search_operations_table", function(exports, require, module) {
var BalanceOperationView, BankOperationsCollection, BaseView, SearchOperationsTableView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

BaseView = require('../lib/base_view');

BankOperationsCollection = require("../collections/bank_operations");

BalanceOperationView = require("./balance_operation");

module.exports = SearchOperationsTableView = (function(superClass) {
  extend(SearchOperationsTableView, superClass);

  SearchOperationsTableView.prototype.templateHeader = require('./templates/search_operations_table_header');

  SearchOperationsTableView.prototype.templateElement = require('./templates/balance_operations_element');

  SearchOperationsTableView.prototype.subViews = [];

  SearchOperationsTableView.prototype.events = {
    'click th.sort-date': "sortByDate",
    'click th.sort-title': "sortByTitle",
    'click th.sort-amount': "sortByAmount"
  };

  function SearchOperationsTableView(el) {
    this.el = el;
    SearchOperationsTableView.__super__.constructor.call(this);
  }

  SearchOperationsTableView.prototype.initialize = function() {
    this.listenTo(window.collections.operations, 'reset', this.reload);
    return this.listenTo(window.collections.operations, 'sort', this.reload);
  };

  SearchOperationsTableView.prototype.sortByDate = function(event) {
    return this.sortBy("date");
  };

  SearchOperationsTableView.prototype.sortByTitle = function(event) {
    return this.sortBy("title");
  };

  SearchOperationsTableView.prototype.sortByAmount = function(event) {
    return this.sortBy("amount");
  };

  SearchOperationsTableView.prototype.sortBy = function(order) {
    var operations;
    operations = window.collections.operations;
    operations.toggleSort(order);
    this.$("th.sorting_asc").removeClass("sorting_asc");
    this.$("th.sorting_desc").removeClass("sorting_desc");
    this.$("th.sort-" + order).addClass("sorting_" + operations.order);
    operations.setComparator(order);
    return operations.sort();
  };

  SearchOperationsTableView.prototype.render = function() {
    this.$el.html(this.templateHeader());
    return this;
  };

  SearchOperationsTableView.prototype.reload = function() {
    var account, accountNum, accounts, bank, i, j, k, len, len1, len2, operation, ref, ref1, ref2, subView, view;
    view = this;
    view.$("#search-operations-table-body").html("");
    accounts = [];
    ref = window.collections.banks.models;
    for (i = 0, len = ref.length; i < len; i++) {
      bank = ref[i];
      ref1 = bank.accounts.models;
      for (j = 0, len1 = ref1.length; j < len1; j++) {
        account = ref1[j];
        accounts[account.get("accountNumber")] = account;
      }
    }
    ref2 = window.collections.operations.models;
    for (k = 0, len2 = ref2.length; k < len2; k++) {
      operation = ref2[k];
      accountNum = operation.get("bankAccount");
      subView = new BalanceOperationView(operation, accounts[accountNum], true);
      view.$("#search-operations-table-body").append(subView.render().el);
      this.subViews.push(subView);
    }
    $("#layout-2col-column-right").niceScroll();
    $("#layout-2col-column-right").getNiceScroll().onResize();
    return this;
  };

  SearchOperationsTableView.prototype.destroy = function() {
    var i, len, ref, ref1, view;
    if ((ref = this.viewTitle) != null) {
      ref.destroy();
    }
    ref1 = this.subViews;
    for (i = 0, len = ref1.length; i < len; i++) {
      view = ref1[i];
      view.destroy();
    }
    return SearchOperationsTableView.__super__.destroy.call(this);
  };

  return SearchOperationsTableView;

})(BaseView);

});

require.register("views/templates/accounts", function(exports, require, module) {
module.exports = function anonymous(locals, attrs, escape, rethrow, merge) {
attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
var buf = [];
with (locals || {}) {
var interp;
buf.push('<div class="row content-background"><div class="content-right-column"></div></div>');
}
return buf.join("");
};
});

require.register("views/templates/accounts_alerts", function(exports, require, module) {
module.exports = function anonymous(locals, attrs, escape, rethrow, merge) {
attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
var buf = [];
with (locals || {}) {
var interp;
buf.push('<div id="reports-dialog" class="modal fade"><div class="modal-dialog"><div class="modal-content"><div class="modal-header"><button type="button" data-dismiss="modal" aria-hidden="true" class="close">x</button><h4 class="modal-title">' + escape((interp = window.i18n("accounts_alerts_title")) == null ? '' : interp) + '</h4></div><div class="modal-body"><h3>' + escape((interp = window.i18n("accounts_alerts_title_periodic")) == null ? '' : interp) + '</h3><div id="reports-body-periodic"></div><p><a class="btn btn-small btn-cozy reports-add-periodic">' + escape((interp = window.i18n("accounts_alerts_periodic_add")) == null ? '' : interp) + '</a></p><h3>' + escape((interp = window.i18n("accounts_alerts_title_balance")) == null ? '' : interp) + '</h3><div id="reports-body-amount"></div><p><a class="btn btn-small btn-cozy reports-add-amount">' + escape((interp = window.i18n("accounts_alerts_balance_add")) == null ? '' : interp) + '</a></p><h3>' + escape((interp = window.i18n("accounts_alerts_title_transaction")) == null ? '' : interp) + '</h3><div id="reports-body-transaction"></div><p><a class="btn btn-small btn-cozy reports-add-transaction">' + escape((interp = window.i18n("accounts_alerts_transaction_add")) == null ? '' : interp) + '</a></p></div></div></div></div>');
}
return buf.join("");
};
});

require.register("views/templates/accounts_alerts_alert", function(exports, require, module) {
module.exports = function anonymous(locals, attrs, escape, rethrow, merge) {
attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
var buf = [];
with (locals || {}) {
var interp;
if ( model.isNew() || model.edit == true)
{
if ( model.get("type") == "report")
{
buf.push('<!-- NEW/EDIT REPORT--><form class="form-inline well">' + escape((interp = window.i18n("accounts_alerts_report_text_1")) == null ? '' : interp) + '<select class="reports-frequency"><option value="daily">' + escape((interp = window.i18n("accounts_alerts_daily")) == null ? '' : interp) + '</option><option value="weekly">' + escape((interp = window.i18n("accounts_alerts_weekly")) == null ? '' : interp) + '</option><option value="monthly">' + escape((interp = window.i18n("accounts_alerts_monthly")) == null ? '' : interp) + '</option></select>  ' + escape((interp = window.i18n("accounts_alerts_report_text_2")) == null ? '' : interp) + '<div class="pull-right"><a class="btn btn-small btn-cozy reports-save">' + escape((interp = window.i18n("accounts_alerts_save")) == null ? '' : interp) + '</a><a class="btn btn-small btn-link reports-cancel">' + escape((interp = window.i18n("accounts_alerts_cancel")) == null ? '' : interp) + '</a></div></form><!-- NEW/EDIT AMOUNT-->');
}
else if ( model.get("type") == "balance")
{
buf.push('<form class="form-inline well">' + escape((interp = window.i18n("accounts_alerts_balance_text_1")) == null ? '' : interp) + '<select class="reports-order"><option value="lt">' + escape((interp = window.i18n("accounts_alerts_lower")) == null ? '' : interp) + '</option><option value="gt">' + escape((interp = window.i18n("accounts_alerts_highier")) == null ? '' : interp) + '</option></select> ' + escape((interp = window.i18n("accounts_alerts_balance_text_2")) == null ? '' : interp) + '<input type="number" value="0" class="reports-limit"/><div class="pull-right"><a class="btn btn-small btn-cozy reports-save">' + escape((interp = window.i18n("accounts_alerts_save")) == null ? '' : interp) + '</a><a class="btn btn-small btn-link reports-cancel">' + escape((interp = window.i18n("accounts_alerts_cancel")) == null ? '' : interp) + '</a></div></form><!-- NEW/EDIT TRANSACTION-->');
}
else
{
buf.push('<form class="form-inline well">' + escape((interp = window.i18n("accounts_alerts_transaction_text_1")) == null ? '' : interp) + '<select class="reports-order"><option value="gt">' + escape((interp = window.i18n("accounts_alerts_highier")) == null ? '' : interp) + '</option><option value="lt">' + escape((interp = window.i18n("accounts_alerts_lower")) == null ? '' : interp) + '</option></select> ' + escape((interp = window.i18n("accounts_alerts_transaction_text_2")) == null ? '' : interp) + '<input type="number" value="0" class="reports-limit"/><div class="pull-right"><a class="btn btn-small btn-cozy reports-save">' + escape((interp = window.i18n("accounts_alerts_save")) == null ? '' : interp) + '</a><a class="btn btn-small btn-link reports-cancel">' + escape((interp = window.i18n("accounts_alerts_cancel")) == null ? '' : interp) + '</a></div></form>');
}
}
else
{
if ( model.get("type") == "report")
{
buf.push('<!-- REPORT--><p class="well well-small">' + escape((interp = window.i18n("accounts_alerts_report_text_1")) == null ? '' : interp) + '\n' + escape((interp = model.get('frequency')) == null ? '' : interp) + '\n ' + escape((interp = window.i18n("accounts_alerts_report_text_2")) == null ? '' : interp) + '<a class="btn btn-small btn-link reports-delete">' + escape((interp = window.i18n("accounts_alerts_delete")) == null ? '' : interp) + '</a></p><!-- AMOUNT-->');
}
else if ( model.get("type") == "balance")
{
buf.push('<!-- REPORT--><p class="well well-small">' + escape((interp = window.i18n("accounts_alerts_balance_text_1")) == null ? '' : interp) + '');
if ( model.get('order') == "lt")
{
buf.push('' + escape((interp = window.i18n("accounts_alerts_lower")) == null ? '' : interp) + '');
}
else
{
buf.push('' + escape((interp = window.i18n("accounts_alerts_highier")) == null ? '' : interp) + '');
}
buf.push(' ' + escape((interp = window.i18n("accounts_alerts_balance_text_2")) == null ? '' : interp) + '\n' + escape((interp = model.get('limit')) == null ? '' : interp) + '.<a class="btn btn-small btn-link reports-delete">' + escape((interp = window.i18n("accounts_alerts_delete")) == null ? '' : interp) + '</a></p><!-- TRANSACTION-->');
}
else
{
buf.push('<p class="well well-small">' + escape((interp = window.i18n("accounts_alerts_transaction_text_1")) == null ? '' : interp) + '');
if ( model.get('order') == "lt")
{
buf.push('' + escape((interp = window.i18n("accounts_alerts_lower")) == null ? '' : interp) + '');
}
else
{
buf.push('' + escape((interp = window.i18n("accounts_alerts_highier")) == null ? '' : interp) + '');
}
buf.push(' ' + escape((interp = window.i18n("accounts_alerts_transaction_text_2")) == null ? '' : interp) + '\n' + escape((interp = model.get('limit')) == null ? '' : interp) + '.<a class="btn btn-small btn-link reports-delete">' + escape((interp = window.i18n("accounts_alerts_delete")) == null ? '' : interp) + '</a></p>');
}
}
}
return buf.join("");
};
});

require.register("views/templates/accounts_bank", function(exports, require, module) {
module.exports = function anonymous(locals, attrs, escape, rethrow, merge) {
attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
var buf = [];
with (locals || {}) {
var interp;
buf.push('<h2>' + escape((interp = model.get("name")) == null ? '' : interp) + '<a class="btn btn-cozy pull-right delete-bank">' + escape((interp = window.i18n("accounts_delete_bank")) == null ? '' : interp) + '</a></h2><table class="table-accounts table table-striped table-hover table-bordered"><tbody id="account-container"></tbody></table>');
}
return buf.join("");
};
});

require.register("views/templates/accounts_bank_account", function(exports, require, module) {
module.exports = function anonymous(locals, attrs, escape, rethrow, merge) {
attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
var buf = [];
with (locals || {}) {
var interp;
buf.push('<td class="account-title">' + escape((interp = model.get("title")) == null ? '' : interp) + '</td><td class="account-title"><span class="account-details">n°' + escape((interp = model.get("accountNumber")) == null ? '' : interp) + '</span></td><td><span class="text-right"></span><a class="btn btn-small btn-cozy pull-right alert-management">manage reports and notifications</a></td><td><span class="text-right"></span><a class="btn btn-small btn-cozy pull-right delete-account">' + escape((interp = window.i18n("accounts_delete_account")) == null ? '' : interp) + '</a></td>');
}
return buf.join("");
};
});

require.register("views/templates/app", function(exports, require, module) {
module.exports = function anonymous(locals, attrs, escape, rethrow, merge) {
attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
var buf = [];
with (locals || {}) {
var interp;
buf.push('<!-- navigation bar--><div id="navbar" class="navbar navbar-fixed-top navbar-inverse"></div><!-- modal window to add a new bank--><div id="add-bank-window" class="modal fade"></div><!-- content--><div id="content" class="container"></div>');
}
return buf.join("");
};
});

require.register("views/templates/balance_bank_subtitle", function(exports, require, module) {
module.exports = function anonymous(locals, attrs, escape, rethrow, merge) {
attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
var buf = [];
with (locals || {}) {
var interp;
buf.push('<div class="row accounts-sub"><div class="pull-left"><p class="pull-left">' + escape((interp = model.get('title')) == null ? '' : interp) + '</p><br/><span class="account-details">n°' + escape((interp = model.get("accountNumber")) == null ? '' : interp) + '</span></div><div class="pull-right"><p class="pull-right">' + escape((interp = Number(model.get('amount')).money()) == null ? '' : interp) + '<span class="euro-sign">&#36;</span></p></div></div>');
}
return buf.join("");
};
});

require.register("views/templates/balance_bank_title", function(exports, require, module) {
module.exports = function anonymous(locals, attrs, escape, rethrow, merge) {
attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
var buf = [];
with (locals || {}) {
var interp;
buf.push('<div class="row accounts-top"><div class="col-lg-7"><p class="pull-left"><span class="bank-title-loading"><img src="./loader.gif"/></span><span class="bank-title">' + escape((interp = model.get('name')) == null ? '' : interp) + '</span></p></div><div class="col-lg-5"><p class="pull-right bank-balance"><span class="bank-amount">' + escape((interp = Number(model.get('amount')).money()) == null ? '' : interp) + '</span><span class="euro-sign"> &#36;</span></p></div></div>');
}
return buf.join("");
};
});

require.register("views/templates/balance_banks_empty", function(exports, require, module) {
module.exports = function anonymous(locals, attrs, escape, rethrow, merge) {
attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
var buf = [];
with (locals || {}) {
var interp;
buf.push('<p class="arrow text-right"><img src="images/arrow_vertical.png"/></p><p class="loading">' + escape((interp = window.i18n("balance_banks_empty")) == null ? '' : interp) + '</p>');
}
return buf.join("");
};
});

require.register("views/templates/balance_operations_element", function(exports, require, module) {
module.exports = function anonymous(locals, attrs, escape, rethrow, merge) {
attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
var buf = [];
with (locals || {}) {
var interp;
buf.push('<td class="operation-date">' + escape((interp = model.formattedDate) == null ? '' : interp) + '</td><td class="operation-title"><div');
buf.push(attrs({ 'data-hint':("" + (model.hint) + ""), "class": ('hint--top') }, {"data-hint":true}));
buf.push('><span class="infobulle glyphicon glyphicon-info-sign"></span></div> ' + escape((interp = model.get('title')) == null ? '' : interp) + '</td><td class="operation-amount text-right">');
 if(model.formattedAmount == null)
{
buf.push('' + escape((interp = Number(model.get('amount')).money()) == null ? '' : interp) + '');
}
 else
{
buf.push('<a');
buf.push(attrs({ 'href':("" + (model.formattedAmount) + ""), 'target':("_blank") }, {"href":true,"target":true}));
buf.push('>' + escape((interp = Number(model.get('amount')).money()) == null ? '' : interp) + '</a>');
}
buf.push('</td>');
}
return buf.join("");
};
});

require.register("views/templates/balance_operations_empty", function(exports, require, module) {
module.exports = function anonymous(locals, attrs, escape, rethrow, merge) {
attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
var buf = [];
with (locals || {}) {
var interp;
buf.push('<br/><br/><p class="loading">' + escape((interp = window.i18n("balance_please_choose_account")) == null ? '' : interp) + '</p>');
}
return buf.join("");
};
});

require.register("views/templates/balance_operations_header", function(exports, require, module) {
module.exports = function anonymous(locals, attrs, escape, rethrow, merge) {
attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
var buf = [];
with (locals || {}) {
var interp;
buf.push('<h2>' + escape((interp = model.get("title")) == null ? '' : interp) + '</h2><p><span class="last-checked">' + escape((interp = window.i18n("balance_last_checked")) == null ? '' : interp) + ' ' + escape((interp = moment(moment(model.get("lastChecked"))).fromNow()) == null ? '' : interp) + '.</span><a class="recheck-button btn-link">' + escape((interp = window.i18n("balance_recheck_now")) == null ? '' : interp) + '</a></p><div class="text-center loading loader-operations"><img src="./loader_big_blue.gif"/></div><table class="table tablesorter table-hover"><thead><tr><th class="sort-date text-left">' + escape((interp = window.i18n("header_date")) == null ? '' : interp) + '</th><th class="sort-title text-center">' + escape((interp = window.i18n("header_title")) == null ? '' : interp) + '</th><th class="sort-amount text-right">' + escape((interp = window.i18n("header_amount")) == null ? '' : interp) + '</th></tr></thead><tbody id="table-operations"></tbody></table>');
}
return buf.join("");
};
});

require.register("views/templates/layout-2col", function(exports, require, module) {
module.exports = function anonymous(locals, attrs, escape, rethrow, merge) {
attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
var buf = [];
with (locals || {}) {
var interp;
buf.push('<div class="content-background"><div id="layout-2col-column-left" class="content-left-column"></div><div id="layout-2col-column-right" class="content-right-column"></div></div>');
}
return buf.join("");
};
});

require.register("views/templates/mockup_balance", function(exports, require, module) {
module.exports = function anonymous(locals, attrs, escape, rethrow, merge) {
attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
var buf = [];
with (locals || {}) {
var interp;
buf.push('<div class="navbar navbar-fixed-top navbar-inverse"><div class="container"><button type="button" data-toggle="collapse" data-target=".nav-collapse" class="navbar-toggle"><span class="icon-bar"></span><span class="icon-bar"></span><span class="icon-bar"></span></button><span class="navbar-brand">Cozy PFM</span><div class="nav-collapse collapse"><ul class="nav navbar-nav"><li class="active"><a id="menu-pos-balance" href="#">Balance</a></li><li><a id="menu-pos-accounts" href="#accounts">Accounts</a></li><li><a id="menu-pos-new-bank" data-toggle="modal" href="#add-bank-window">Add a new bank</a></li></ul><ul class="nav navbar-nav pull-right"><p class="navbar-text">overall balance <span id="total-amount">+12967.72</span></p></ul></div></div></div><div id="content" class="container"><div class="row content-background"><div class="col-lg-4 content-left-column"><div class="row accounts-top"><div class="col-lg-8"><p class="pull-left">Le Crédit Lyonnais</p></div><div class="col-lg-4"><p class="pull-right">+12942.23 <span class="euro-sign">&euro;</span></p></div></div><div class="row accounts-sub"><div class="col-lg-8"><p class="pull-left">Compte bancaire</p></div><div class="col-lg-4"><p class="pull-right">+12942.23 <span class="euro-sign">&euro;</span></p></div></div><div class="row accounts-top active"><div class="col-lg-8"><p class="pull-left">Société Générale</p></div><div class="col-lg-4"><p class="pull-right">+25.49 <span class="euro-sign">&euro;</span></p></div></div><div class="row accounts-sub"><div class="col-lg-8"><p class="pull-left">Compte bancaire 1</p></div><div class="col-lg-4"><p class="pull-right">+26.49 <span class="euro-sign">&euro;</span></p></div></div><div class="row accounts-sub"><div class="col-lg-8"><p class="pull-left">Compte bancaire 2</p></div><div class="col-lg-4"><p class="pull-right">-1.00 <span class="euro-sign">&euro;</span></p></div></div></div><div class="col-lg-8 content-right-column"><h2>Société Générale</h2><table id="table-operations" class="table table-striped table-hover"><tbody><tr><td class="operation-date">17/07/2013</td><td class="operation-title">Ferrari Paris</td><td class="operation-amount"><span class="pull-right">-490550.00</span></td></tr><tr class="success"><td class="operation-date">17/07/2013</td><td class="operation-title">CB Tesco</td><td class="operation-amount"><span class="pull-right positive-balance">+123.30</span></td></tr><tr><td class="operation-date">17/07/2013</td><td class="operation-title">CB Intermarché</td><td class="operation-amount"><span class="pull-right">-12.90</span></td></tr><tr><td class="operation-date">17/07/2013</td><td class="operation-title">Ferrari Paris</td><td class="operation-amount"><span class="pull-right">-490550.00</span></td></tr><tr><td class="operation-date">17/07/2013</td><td class="operation-title">CB Apple</td><td class="operation-amount"><span class="pull-right">- 1899.00</span></td></tr><tr><td class="operation-date">17/07/2013</td><td class="operation-title">CB Intermarché</td><td class="operation-amount"><span class="pull-right">-1.23</span></td></tr><tr><td class="operation-date">17/07/2013</td><td class="operation-title">CB Intermarché</td><td class="operation-amount"><span class="pull-right">-25.39</span></td></tr><tr><td class="operation-date">17/07/2013</td><td class="operation-title">CB Intermarché</td><td class="operation-amount"><span class="pull-right">-0.12</span></td></tr><tr><td class="operation-date">17/07/2013</td><td class="operation-title">Ferrari Paris</td><td class="operation-amount"><span class="pull-right">-490550.00</span></td></tr><tr><td class="operation-date">17/07/2013</td><td class="operation-title">CB Apple</td><td class="operation-amount"><span class="pull-right">- 1899.00</span></td></tr><tr><td class="operation-date">17/07/2013</td><td class="operation-title">CB Intermarché</td><td class="operation-amount"><span class="pull-right">-1.23</span></td></tr><tr><td class="operation-date">17/07/2013</td><td class="operation-title">CB Intermarché</td><td class="operation-amount"><span class="pull-right">-25.39</span></td></tr><tr><td class="operation-date">17/07/2013</td><td class="operation-title">CB Intermarché</td><td class="operation-amount"><span class="pull-right">-0.12</span></td></tr><tr><td class="operation-date">17/07/2013</td><td class="operation-title">CB Apple</td><td class="operation-amount"><span class="pull-right">- 1899.00</span></td></tr><tr><td class="operation-date">17/07/2013</td><td class="operation-title">CB Intermarché</td><td class="operation-amount"><span class="pull-right">-1.23</span></td></tr><tr><td class="operation-date">17/07/2013</td><td class="operation-title">CB Intermarché</td><td class="operation-amount"><span class="pull-right">-25.39</span></td></tr><tr><td class="operation-date">17/07/2013</td><td class="operation-title">CB Intermarché</td><td class="operation-amount"><span class="pull-right">-0.12</span></td></tr><tr><td class="operation-date">17/07/2013</td><td class="operation-title">Ferrari Paris</td><td class="operation-amount"><span class="pull-right">-490550.00</span></td></tr><tr><td class="operation-date">17/07/2013</td><td class="operation-title">CB Apple</td><td class="operation-amount"><span class="pull-right">- 1899.00</span></td></tr><tr><td class="operation-date">17/07/2013</td><td class="operation-title">CB Intermarché</td><td class="operation-amount"><span class="pull-right">-1.23</span></td></tr><tr><td class="operation-date">17/07/2013</td><td class="operation-title">CB Intermarché</td><td class="operation-amount"><span class="pull-right">-25.39</span></td></tr><tr><td class="operation-date">17/07/2013</td><td class="operation-title">CB Intermarché</td><td class="operation-amount"><span class="pull-right">-0.12</span></td></tr></tbody></table></div></div><div id="add-bank-window" class="modal"><div class="modal-dialog"><div class="modal-content"><div class="modal-header"><button type="button" data-dismiss="modal" aria-hidden="true" class="close">x</button><h4 class="modal-title">Add a new bank</h4></div><div class="modal-body"><form><fieldset><legend>Bank</legend><div class="form-group"><select class="form-control"><option>Le Crédit Lyonnais</option><option>Société Générale</option></select></div></fieldset><fieldset><legend>Credentials</legend><div class="form-group"><label for="inputLogin">Login</label><input id="inputLogin" type="text" placeholder="enter login" class="form-control"/></div><div class="form-group"><label for="inputPass">Password</label><input id="inputPass" type="password" placeholder="enter password" class="form-control"/></div></fieldset></form><h3 class="important-notice">Security notice</h3><p>In order to protect our customers, we implemented the best solutions.</p><p>We are great, because ...</p></div><div class="modal-footer"><a data-dismiss="modal" href="#" class="btn btn-link">cancel</a><a href="#" class="btn btn-success">Verify & Save</a></div></div></div></div><!--.row#foot<div class="col-lg-12"><p class="text-muted">Click here to read about <a href="#">our highest security standards</a></p><p class="text-muted pull-right"><a href="http://cozycloud.cc">CozyCloud.cc </a>- the cloud you own.</p></div>--></div>');
}
return buf.join("");
};
});

require.register("views/templates/modal_confirm", function(exports, require, module) {
module.exports = function anonymous(locals, attrs, escape, rethrow, merge) {
attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
var buf = [];
with (locals || {}) {
var interp;
buf.push('<div id="confirmation-dialog" class="modal fade"><div class="modal-dialog"><div class="modal-content"><div class="modal-header"><button type="button" data-dismiss="modal" aria-hidden="true" class="close">x</button><h4 class="modal-title">' + escape((interp = title) == null ? '' : interp) + '</h4></div><div class="modal-body"><p>' + escape((interp = body) == null ? '' : interp) + '</p></div><div class="modal-footer"><a data-dismiss="modal" href="#" class="btn btn-link">' + escape((interp = window.i18n("cancel")) == null ? '' : interp) + '</a><a id="confirmation-dialog-confirm" href="#" class="btn btn-cozy">' + escape((interp = confirm) == null ? '' : interp) + '</a></div></div></div></div>');
}
return buf.join("");
};
});

require.register("views/templates/navbar", function(exports, require, module) {
module.exports = function anonymous(locals, attrs, escape, rethrow, merge) {
attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
var buf = [];
with (locals || {}) {
var interp;
buf.push('<nav role="navigation" class="navbar navbar-inverse navbar-fixed-top"><div class="container"><!-- Brand and toggle get grouped for better mobile display--><div class="navbar-header"><button type="button" data-toggle="collapse" data-target=".navbar-collapse" class="navbar-toggle"><span class="sr-only">Toggle navigation</span><span class="icon-bar"></span><span class="icon-bar"></span><span class="icon-bar"></span></button></div><!-- Collect the nav links, forms, and other content for toggling--><div class="collapse navbar-collapse"><ul class="nav navbar-nav"><li class="menu-position menu-1"><a id="menu-pos-balance" href="#">' + escape((interp = window.i18n("menu_balance")) == null ? '' : interp) + '</a></li><li class="menu-position menu-2"><a id="menu-pos-accounts" href="#search">' + escape((interp = window.i18n("menu_search")) == null ? '' : interp) + '</a></li><li class="menu-position menu-3"><a id="menu-pos-accounts" href="#accounts">' + escape((interp = window.i18n("menu_accounts")) == null ? '' : interp) + '</a></li><li><a id="menu-pos-new-bank" data-toggle="modal" href="#add-bank-window">' + escape((interp = window.i18n("menu_add_bank")) == null ? '' : interp) + '</a></li></ul><ul class="nav navbar-nav navbar-right"><p class="navbar-text">' + escape((interp = window.i18n("overall_balance")) == null ? '' : interp) + '<span id="total-amount">0,00</span></p></ul></div></div></nav>');
}
return buf.join("");
};
});

require.register("views/templates/new_bank", function(exports, require, module) {
module.exports = function anonymous(locals, attrs, escape, rethrow, merge) {
attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
var buf = [];
with (locals || {}) {
var interp;
buf.push('<div class="modal-dialog"><div class="modal-content"><div class="modal-header"><button type="button" data-dismiss="modal" aria-hidden="true" class="close">x</button><h4 class="modal-title">' + escape((interp = window.i18n("menu_add_bank")) == null ? '' : interp) + '</h4></div><div class="modal-body"><div class="message-modal"></div><form><fieldset><legend>' + escape((interp = window.i18n("add_bank_bank")) == null ? '' : interp) + '</legend><div class="form-group"><select id="inputBank" class="form-control">');
// iterate banks
;(function(){
  if ('number' == typeof banks.length) {

    for (var $index = 0, $$l = banks.length; $index < $$l; $index++) {
      var bank = banks[$index];

buf.push('<option');
buf.push(attrs({ 'value':(bank.get("uuid")) }, {"value":true}));
buf.push('>');
var __val__ = bank.get("name")
buf.push(escape(null == __val__ ? "" : __val__));
buf.push('</option>');
    }

  } else {
    var $$l = 0;
    for (var $index in banks) {
      $$l++;      var bank = banks[$index];

buf.push('<option');
buf.push(attrs({ 'value':(bank.get("uuid")) }, {"value":true}));
buf.push('>');
var __val__ = bank.get("name")
buf.push(escape(null == __val__ ? "" : __val__));
buf.push('</option>');
    }

  }
}).call(this);

buf.push('</select></div></fieldset><fieldset><legend>' + escape((interp = window.i18n("add_bank_credentials")) == null ? '' : interp) + '</legend><div class="form-group"><label for="inputLogin">' + escape((interp = window.i18n("add_bank_login")) == null ? '' : interp) + '</label><input');
buf.push(attrs({ 'id':('inputLogin'), 'type':('text'), 'placeholder':(window.i18n("add_bank_login_placeholder")), "class": ('form-control') }, {"type":true,"placeholder":true}));
buf.push('/></div><div class="form-group"><label for="inputPass">' + escape((interp = window.i18n("add_bank_password")) == null ? '' : interp) + '</label><input');
buf.push(attrs({ 'id':('inputPass'), 'type':('password'), 'placeholder':(window.i18n("add_bank_password_placeholder")), "class": ('form-control') }, {"type":true,"placeholder":true}));
buf.push('/></div></fieldset></form><h3 class="important-notice">' + escape((interp = window.i18n("add_bank_security_notice")) == null ? '' : interp) + '</h3><p>' + escape((interp = window.i18n("add_bank_security_notice_text")) == null ? '' : interp) + '</p></div><div class="modal-footer"><a data-dismiss="modal" href="#" class="btn btn-link">' + escape((interp = window.i18n("add_bank_cancel")) == null ? '' : interp) + '</a><a id="btn-add-bank-save" href="#" class="btn btn-success">' + escape((interp = window.i18n("add_bank_ok")) == null ? '' : interp) + '</a></div></div></div>');
}
return buf.join("");
};
});

require.register("views/templates/search_bank_subtitle", function(exports, require, module) {
module.exports = function anonymous(locals, attrs, escape, rethrow, merge) {
attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
var buf = [];
with (locals || {}) {
var interp;
buf.push('<div class="row accounts-sub"><div class="col-lg-7"><p class="pull-left">' + escape((interp = model.get('title')) == null ? '' : interp) + '</p></div><div class="col-lg-5"><p class="pull-right">');
if ( model.checked)
{
buf.push('<input type="checkbox" checked="checked" class="choice-account"/>');
}
else
{
buf.push('<input type="checkbox" class="choice-account"/>');
}
buf.push('</p></div></div>');
}
return buf.join("");
};
});

require.register("views/templates/search_bank_title", function(exports, require, module) {
module.exports = function anonymous(locals, attrs, escape, rethrow, merge) {
attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
var buf = [];
with (locals || {}) {
var interp;
buf.push('<div class="row accounts-top"><div class="col-lg-7"><p class="pull-left"> <span class="bank-title-loading"><img src="./loader.gif"/></span><span class="bank-title"> ' + escape((interp = model.get('name')) == null ? '' : interp) + '</span></p></div><div class="col-lg-5"><p class="pull-right bank-title-checkbox">');
if ( model.checked)
{
buf.push('<input type="checkbox" checked="checked" class="choice-bank"/>');
}
else
{
buf.push('<input type="checkbox" class="choice-bank"/>');
}
buf.push('</p></div></div>');
}
return buf.join("");
};
});

require.register("views/templates/search_operations", function(exports, require, module) {
module.exports = function anonymous(locals, attrs, escape, rethrow, merge) {
attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
var buf = [];
with (locals || {}) {
var interp;
buf.push('<form class="form-search"></form><div class="row"><div class="col-lg-6"><div class="form-group"><label for="search-date-from">' + escape((interp = window.i18n("search_date_from")) == null ? '' : interp) + '</label><input id="search-date-from" type="date" class="form-control"/></div></div><div class="col-lg-6"><div class="form-group"><label for="search-date-to">' + escape((interp = window.i18n("search_date_to")) == null ? '' : interp) + '</label><input id="search-date-to" type="date" class="form-control"/></div></div></div><div class="row"><div class="col-lg-6"><div class="form-group"><label for="search-amount-from">' + escape((interp = window.i18n("search_amount_from")) == null ? '' : interp) + '</label><input id="search-amount-from" type="number" class="form-control"/></div></div><div class="col-lg-6"><div class="form-group"><label for="search-amount-to">' + escape((interp = window.i18n("search_amount_to")) == null ? '' : interp) + '</label><input id="search-amount-to" type="number" class="form-control"/></div></div></div><div class="row"><div class="col-lg-12"><label for="search-text">' + escape((interp = window.i18n("search_text")) == null ? '' : interp) + '</label><input id="search-text" type="text" class="form-control"/></div></div><div class="row"><div id="search-operations-table" class="col-lg-12"></div></div>');
}
return buf.join("");
};
});

require.register("views/templates/search_operations_table_header", function(exports, require, module) {
module.exports = function anonymous(locals, attrs, escape, rethrow, merge) {
attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
var buf = [];
with (locals || {}) {
var interp;
buf.push('<br/><table id="search-table" class="table tablesorter table-striped table-hover"><thead><tr><th class="sort-date text-left">' + escape((interp = window.i18n("header_date")) == null ? '' : interp) + '</th><th class="sort-title text-center">' + escape((interp = window.i18n("header_title")) == null ? '' : interp) + '</th><th class="sort-amount text-right">' + escape((interp = window.i18n("header_amount")) == null ? '' : interp) + '</th></tr></thead><tbody id="search-operations-table-body"></tbody></table>');
}
return buf.join("");
};
});


//# sourceMappingURL=app.js.map