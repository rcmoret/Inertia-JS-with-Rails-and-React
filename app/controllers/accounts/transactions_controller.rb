# frozen_string_literal: true

module Accounts
  class TransactionsController < ApplicationController
    before_action :set_selected_account_info

    include GraphQuery

    # rubocop:disable Metrics/AbcSize
    def index
      if slug != identifier
        redirect_to account_transactions_path(slug, month: month, year: year)
      elsif month.nil? || year.nil?
        redirect_to account_transactions_path(slug, month: current_interval.month, year: current_interval.year)
      else
        render inertia: 'AccountTransactionsIndexApp', props: props
      end
    end
    # rubocop:enable Metrics/AbcSize

    private

    def current_interval
      Budget::Interval.current
    end

    def identifier
      params[:identifier].then do |identifier_param|
        if identifier_param.match(/\A\d+\z/)
          identifier_param.to_i
        else
          identifier_param
        end
      end
    end

    def slug
      identifier.is_a?(Integer) ? Account.find(identifier).slug : identifier
    end

    def month
      params[:month]
    end

    def year
      params[:year]
    end

    def query
      <<~GQL
        {
          accounts {
            id
            name
            balance
            priority
            slug
          }
          budget {
            interval(month: #{month}, year: #{year}) {
              firstDate
              lastDate
              daysRemaining
              isCurrent
              totalDays
              month
              year
              items {
                id
                name
                remaining
                isAccrual
                isMonthly
                isDeletable
                maturityMonth
                maturityYear
              }
            }
          }
          selectedAccount: account(slug: "#{slug}") {
            id
            balancePriorTo(month: #{month}, year: #{year})
            isCashFlow
            name
            slug
            transactions(month: #{month}, year: #{year}) {
              id
              amount
              budgetExclusion
              checkNumber
              clearanceDate
              description
              notes
              transferId
              updatedAt
              details {
                id
                amount
                budgetItemId
                budgetCategoryId
                budgetCategoryName
                iconClassName
              }
              receiptBlob { filename contentType path }
            }
          }
        }
      GQL
    end

    def namespace
      'accounts'
    end

    def set_selected_account_info
      session[:selected_account_path] = [identifier, 'transactions', month, year].join('/')
    end
  end
end
