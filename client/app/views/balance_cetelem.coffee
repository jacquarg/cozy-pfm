BaseView = require '../lib/base_view'
BankTitleView = require './bank_title'
BankTitleCetelemView = require './bank_title_cetelem'
BankSubTitleView = require './bank_subtitle'

module.exports = class BalanceCetelemView extends BaseView

    className: 'bank'

    sum: 0

    subViews: []

    constructor: (@bank) ->
        super()

    addOne: (account) ->
        # add the account
        viewAccount = new BankSubTitleView account, true
        @subViews.push viewAccount
        account.view = viewAccount
        @$el.append viewAccount.render().el

    render: ->

        # generate the title
        @viewTitle = new BankTitleCetelemView
        @$el.html @viewTitle.render().el
        @viewTitle = null
        @sum = 0

        # add accounts
        # for account in @bank.accounts.models
        #     @addOne account
        @addOne new Backbone.Model(title: 'Crédits en cours', cetelemType: "credits")
        @addOne new Backbone.Model(title: 'Epargne et placements', cetelemType: "credits")
        @addOne new Backbone.Model(title: 'Prévoyance et assurance', cetelemType: "credits")
        @addOne new Backbone.Model(title: 'Coffre à mots de passe', cetelemType: "pwd")

        @

    destroy: ->
        @viewTitle?.destroy()
        for view in @subViews
            view.destroy()
        super()