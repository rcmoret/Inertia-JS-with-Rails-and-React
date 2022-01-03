# frozen_string_literal: true

module Budget
  class ItemsController < ApplicationController
    include GraphQuery

    def index
      if month.nil? || year.nil?
        redirect_to budget_path(month: today.month, year: today.year)
      else
        render inertia: 'BudgetItemIndexApp', props: props
      end
    end

    private

    def today
      Time.current
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
          budget {
            categories {
              id
              defaultAmount
              name
              isAccrual
              isExpense
              isMonthly
            }
            interval(month: #{month.to_i}, year: #{year.to_i}) {
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
              isSetUp
              totalDays
              firstDate
              lastDate
              daysRemaining
              items(includeDeleted: #{include_deleted?}) {
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

    def include_deleted?
      params.fetch(:include_deleted, false) == 'true'
    end

    def namespace
      'budget'
    end

    def additional_props
      { includesDeleted: include_deleted? }
    end
  end
end
