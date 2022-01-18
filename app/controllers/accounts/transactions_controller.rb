# frozen_string_literal: true

module Accounts
  class TransactionsController < ApplicationController
    include GraphQuery

    def index
      if month.nil? || year.nil?
        redirect_to account_transactions_path(slug, month: current_interval.month, year: current_interval.year)
      else
        render inertia: 'AccountTransactionsIndexApp', props: props
      end
    end

    private

    def current_interval
      Budget::Interval.current
    end

    def slug
      params[:slug]
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
            slug
            isCashFlow
            balancePriorTo(month: #{month}, year: #{year})
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
  end
end
