# frozen_string_literal: true

module Accounts
  class TransactionsController < ApplicationController
    include GraphQuery

    def index
      if month.nil? || year.nil?
        redirect_to account_transactions_path(slug, month: today.month, year: today.year)
      else
        render inertia: 'AccountTransactionsIndexApp', props: props
      end
    end

    private

    def today
      Time.current
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
              totalDays
              month
              year
              items {
                id
                name
                remaining
                isMonthly
                isDeletable
              }
            }
          }
          selectedAccount: account(slug: "#{slug}") {
            id
            slug
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
                categoryName
                iconClassName
              }
            }
          }
        }
      GQL
    end

    def namespace
      'accounts'
    end

    def additional_props
      { month: month, year: year }
    end
  end
end
