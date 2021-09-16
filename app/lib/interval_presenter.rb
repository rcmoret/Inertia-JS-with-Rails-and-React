class IntervalPresenter < SimpleDelegator
  def set_up?
    super
  end
  alias_method :is_set_up, :set_up?

  def closed_out?
    super
  end
  alias_method :is_closed_out, :closed_out?

  def accrual_items
    with_presenters { item_views.accruals }
  end

  def items
    item_views.map do |item|
      Budget::ItemPresenter.new(item)
    end
  end

  # def transaction_entries(account_id:)
  #   Account.
  # end
end
