# frozen_string_literal: true

module GraphQueries
  module BudgetItems
    def budget_item_index_query(month:, year:, include_deleted:)
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
                  accountName,
                  amount
                  clearanceDate
                  description
                  iconClassName
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
                  iconClassName
                  updatedAt
                }
              }
            }
          }
        }
      GQL
    end
  end
end
