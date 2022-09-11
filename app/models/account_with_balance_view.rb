# frozen_string_literal: true

class AccountWithBalanceView < ApplicationRecord
  include Presentable
  self.table_name = :account_with_balance_view

  self.primary_key = :id

  belongs_to :user

  def read_only?
    true
  end

  private

  def presenter_class
    Presenters::AccountPresenter
  end
end
