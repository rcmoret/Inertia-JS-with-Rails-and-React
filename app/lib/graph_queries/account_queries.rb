# frozen_string_literal: true

module GraphQueries
  module AccountQueries
    def accounts_for(user)
      <<-GQL
        {
          #{base_accounts_query(user.id)}
        }
      GQL
    end

    def full_accounts_for(user, include_archived:)
      <<-GQL
        {
          accounts(userId: #{user.id} includeArchived: #{include_archived}) {
            id
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

    def account_transactions_query(user_id, slug, month, year)
      <<~GQL
        {
          #{base_accounts_query(user_id)}
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
            id
            balancePriorTo(userId: #{user_id} month: #{month} year: #{year})
            isCashFlow
            name
            slug
            transactions(month: #{month} year: #{year} userId: #{user_id}) {
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

    private

    def base_accounts_query(user_id)
      <<-GQL
          accounts(userId: #{user_id}) {
            id
            name
            balance
            priority
            slug
          }
      GQL
    end
  end
end
