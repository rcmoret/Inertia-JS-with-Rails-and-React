# frozen_string_literal: true

module Budget
  class ItemsController < ApplicationController
    include AccountsHelper
    include GraphQuery

    def index
      if month.nil? || year.nil?
        current_interval = Budget::Interval.current
        redirect_to budget_path(month: current_interval.month, year: current_interval.year)
      else
        render inertia: 'BudgetItemIndexApp', props: props
      end
    end

    private

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
                isPerDiemEnabled
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
      { includesDeleted: include_deleted?, selectedAccountPath: selected_account_path }
    end

    def set_selected_budget_info
      session[:selected_budget_path] = [slug, 'transactions', month, year].join('/')
    end
  end
end
