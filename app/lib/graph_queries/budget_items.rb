# frozen_string_literal: true

require 'forwardable'

module GraphQueries
  class BudgetItems
    include Singleton

    class << self
      extend Forwardable
      def_delegators :instance, :index_query, :finalize_query, :setup_query
    end

    def index_query(user:, month:, year:, include_deleted:)
      <<~GQL
        {
          budget(userId: #{user.id}) {
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
              daysRemaining
              firstDate
              isClosedOut
              isCurrent
              isSetUp
              totalDays
              lastDate
              discretionary {
                amount
                overUnderBudget
                transactionDetails {
                  id
                  accountName
                  amount
                  clearanceDate
                  description
                  updatedAt
                }
                transactionsTotal
              }
              items(includeDeleted: #{include_deleted}) {
                key
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
                  updatedAt
                }
              }
            }
          }
        }
      GQL
    end

    def finalize_query(current_user_id, **args)
      <<~GQL
        {
          budget(userId: #{current_user_id}) {
            categories {
              id
              name
              iconClassName
              isAccrual
              isExpense
              isMonthly
            }
            baseInterval: interval(month: #{args.fetch(:base_interval_month)}, year: #{args.fetch(:base_interval_year)}) {
              discretionary { amount }
              month
              year
              items(reviewableOnly: true) {
                budgetItemId: key
                budgetCategoryId
                remaining
              }
            }
            targetInterval: interval(month: #{args.fetch(:target_interval_month)}, year: #{args.fetch(:target_interval_year)}) {
              month
              year
              items {
                budgetItemId: key
                budgetCategoryId
                budgeted: amount
              }
            }
          }
        }
      GQL
    end

    def setup_query(current_user_id, **args)
      <<~GQL
        {
          budget(userId: #{current_user_id}) {
            categories(includeArchived: true) {
              id
              defaultAmount
              name
              iconClassName
              isAccrual
              isExpense
              isMonthly
            }
            baseInterval: interval(month: #{args.fetch(:base_interval_month)}, year: #{args.fetch(:base_interval_year)}) {
              month
              year
              items {
                name
                budgetCategoryId
                budgeted: amount
                spent
                isAccrual
                isExpense
                isMonthly
              }
            }
            targetInterval: interval(month: #{args.fetch(:month)}, year: #{args.fetch(:year)}) {
              month
              year
              items {
                key
                name
                budgetCategoryId
                amount
                isAccrual
                isExpense
                isMonthly
              }
            }
          }
        }
      GQL
    end
  end
end
