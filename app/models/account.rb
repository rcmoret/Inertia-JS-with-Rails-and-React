# frozen_string_literal: true

class Account < ApplicationRecord
  include BelongsToUser
  include Slugable

  has_many :transactions, class_name: 'Transaction::Entry', dependent: :restrict_with_exception
  has_many :details,
           class_name: 'Transaction::Detail',
           through: :transactions
  scope :active, -> { where(archived_at: nil) }
  scope :by_priority, -> { order('priority asc') }
  scope :cash_flow, -> { where(cash_flow: true) }
  scope :non_cash_flow, -> { where(cash_flow: false) }
  scope :details_prior_to, lambda { |date, include_pending:|
    details = Transaction::Detail.all

    if include_pending
      joins(:details)
        .merge(details.prior_to(date).or(details.pending))
    else
      joins(:details).merge(details.prior_to(date))
    end
  }
  validates :name, :priority, :slug, if: :active?, uniqueness: { scope: :user_id }
  validates :name, :priority, :slug, presence: true

  delegate :to_json, to: :to_hash

  def to_hash
    attributes
      .symbolize_keys
      .merge(balance: balance)
  end

  def balance_prior_to(date, include_pending:)
    self
      .class
      .where(id: id)
      .details_prior_to(date, include_pending: include_pending)
      .sum(:amount)
  end

  def deleted?
    archived_at.present?
  end

  # rubocop:disable Rails/ActiveRecordOverride
  def destroy
    transactions.any? ? archive! : super
  end
  # rubocop:enable Rails/ActiveRecordOverride

  def to_s
    name
  end

  def balance
    details.total
  end

  private

  def active?
    archived_at.nil?
  end

  def archive!
    update(archived_at: Time.current)
  end
end
