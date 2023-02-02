# frozen_string_literal: true

require 'forwardable'

module GraphQueries
  class AccountQueries
    include Singleton

    class << self
      extend Forwardable
      def_delegators :instance, :accounts_belonging_to, :full_accounts_belonging_to, :transactions_query
    end

    def accounts_belonging_to(user)
      <<-GQL
        {
          #{base_query(user.id)}
        }
      GQL
    end

    def full_accounts_belonging_to(user, include_archived:)
      <<-GQL
        {
          accounts(userId: #{user.id} includeArchived: #{include_archived}) {
            name
            archivedAt
            isArchived
            isCashFlow
            priority
            slug
          }
        }
      GQL
    end

    def transactions_query(user_id, slug, month, year)
      <<~GQL
        {
          #{base_query(user_id)}
          budget(userId: #{user_id}) {
            interval(month: #{month}, year: #{year}) {
              firstDate
              lastDate
              daysRemaining
              isCurrent
              totalDays
              month
              year
              items {
                key
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
          selectedAccount: account(slug: "#{slug}" userId: #{user_id}) {
            balancePriorTo(month: #{month} year: #{year})
            isCashFlow
            name
            slug
            transactions(month: #{month} year: #{year}) {
              key
              amount
              budgetExclusion
              checkNumber
              clearanceDate
              description
              notes
              transferId
              updatedAt
              details {
                key
                amount
                budgetItemKey
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

    private

    def base_query(user_id)
      <<-GQL
          accounts(userId: #{user_id}) {
            name
            balance
            priority
            slug
          }
      GQL
    end
  end
end
