# frozen_string_literal: true

class AccountWithBalanceView < ApplicationRecord
  self.table_name = :account_with_balance_view

  self.primary_key = :id

  def read_only?
    true
  end
end
