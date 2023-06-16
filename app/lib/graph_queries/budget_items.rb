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
              defaultAmount
              name
              slug
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
                  key
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
                budgetCategorySlug
                name
                amount
                difference
                remaining
                spent
                iconClassName
                isAccrual
                isDeletable
                isDeleted
                isExpense
                isMonthly
                isPerDiemEnabled
                maturityMonth
                maturityYear
                events {
                  id
                  key
                  amount
                  createdAt
                  data
                  typeDescription
                }
                transactionDetailCount
                transactionDetails {
                  key
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
              name
              slug
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
                key
                budgetCategorySlug
                remaining
              }
            }
            targetInterval: interval(month: #{args.fetch(:target_interval_month)}, year: #{args.fetch(:target_interval_year)}) {
              month
              year
              items {
                key
                budgetCategorySlug
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
              defaultAmount
              name
              slug
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
                budgetCategorySlug
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
                budgetCategorySlug
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
