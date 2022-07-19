# frozen_string_literal: true

module BudgetCategories
  PERMITTED_PARAMS = %i[
    archived_at
    default_amount
    accrual
    expense
    icon_id
    is_per_diem_enabled
    monthly
    name
    slug
  ].freeze
end
