# frozen_string_literal: true

require 'forwardable'

module GraphQueries
  class BudgetCategories
    include Singleton

    class << self
      extend Forwardable
      def_delegators :instance, :index_query
    end

    def index_query(current_user_id, include_archived:)
      <<~GQL
        {
          budget(userId: #{current_user_id}) {
            categories(includeArchived: #{include_archived}) {
              archivedAt
              defaultAmount
              isAccrual
              isArchived
              isExpense
              isMonthly
              isPerDiemEnabled
              name
              slug
              icon { id className name }
              maturityIntervals { month year }
            }
            icons { id className name }
          }
        }
      GQL
    end
  end
end
