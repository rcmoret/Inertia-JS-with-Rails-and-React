# frozen_string_literal: true

module Budget
  class ItemsController < ApplicationController
    include GraphQuery
    skip_before_action :authenticate_user!

    def index
      render inertia: 'BudgetItemIndexApp', props: props
    end

    private

    def today
      Time.current
    end

    def interval_month
      params.fetch(:month, today.month).to_i
    end

    def interval_year
      params.fetch(:year, today.year).to_i
    end

    def query
      <<~GQL
        {
          budget {
            categories {
              id
              defaultAmount
              name
              isAccrual
              isExpense
              isMonthly
            }
            interval(month: #{interval_month}, year: #{interval_year}) {
              month
              year
              discretionary {
                amount
                overUnderBudget
                transactionDetails {
                  id
                  accountName,
                  amount
                  clearanceDate
                  description
                  iconClassName
                  updatedAt
                }
                transactionsTotal
              }
              isCurrent
              totalDays
              firstDate
              lastDate
              daysRemaining
              items {
                id
                budgetCategoryId
                name
                amount
                difference
                remaining
                spent
                iconClassName
                isAccrual
                isDeletable
                isExpense
                isMonthly
                maturityMonth
                maturityYear
                events {
                  id
                  amount
                  createdAt
                  data
                  typeDescription
                }
                transactionDetailCount
                transactionDetails {
                  id
                  accountName
                  amount
                  clearanceDate
                  description
                  iconClassName
                  updatedAt
                }
              }
            }
          }
        }
      GQL
    end

    def namespace
      'budget'
    end
  end
end
