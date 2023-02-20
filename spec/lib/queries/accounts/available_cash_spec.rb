# frozen_string_literal: true

require 'rails_helper'

# rubocop:disable RSpec/NestedGroups
RSpec.describe Queries::Accounts::AvailableCash do
  describe '#call' do
    context 'when there are no accounts associated with the user' do
      let(:user) { FactoryBot.create(:user) }
      let(:budget_interval) { interval_double(user_group_id: user.user_group_id, current?: true) }

      it 'returns zero' do
        subject = described_class.new(budget_interval: budget_interval)

        expect(subject.call).to be_zero
      end
    end

    context 'when there is a cash-flow account associated with the user' do
      let(:user) { FactoryBot.create(:user) }

      before do
        other_user = FactoryBot.create(:user)
        other_user_account = FactoryBot.create(:account, :cash_flow, user_group: other_user.user_group)
        FactoryBot.create_list(:transaction_entry, 3, account: other_user_account)
      end

      context 'when the budget interval is current' do
        let(:budget_interval) { interval_double(user_group_id: user.user_group_id, current?: true) }

        context 'when there are no transactions associated with that account' do
          let(:user) { FactoryBot.create(:user) }

          it 'returns zero' do
            FactoryBot.create(:account, :cash_flow, user_group: user.user_group)
            subject = described_class.new(budget_interval: budget_interval)

            expect(subject.call).to be_zero
          end
        end

        context 'when there are transactions associated with that account before the budget interval first day' do
          it 'returns the sum of those transactions' do
            account = FactoryBot.create(:account, :cash_flow, user_group: user.user_group)
            transactions = FactoryBot.create_list(:transaction_entry,
                                                  2,
                                                  account: account,
                                                  clearance_date: (budget_interval.first_date - 1.day))
            subject = described_class.new(budget_interval: budget_interval)

            expect(subject.call).to be total_for(transactions)
          end
        end

        context 'when there is a pending transaction associated with the account' do
          it 'returns zero' do
            account = FactoryBot.create(:account, :cash_flow, user_group: user.user_group)
            transactions = FactoryBot.create_list(:transaction_entry, 2, :pending, account: account)
            subject = described_class.new(budget_interval: budget_interval)

            expect(subject.call).to be total_for(transactions)
          end
        end

        context 'when there are transactions associated with that account after the budget interval last day' do
          it 'returns zero' do
            account = FactoryBot.create(:account, :cash_flow, user_group: user.user_group)
            FactoryBot.create_list(:transaction_entry,
                                   2,
                                   account: account,
                                   clearance_date: (budget_interval.last_date + 1.day))
            subject = described_class.new(budget_interval: budget_interval)

            expect(subject.call).to be_zero
          end
        end

        context 'when there are transactions associated with that account before and during the interval first' do
          it 'returns the sum of those transactions' do
            account = FactoryBot.create(:account, :cash_flow, user_group: user.user_group)
            dates = [(budget_interval.first_date - 1.day), budget_interval.as_presenter.date_range.to_a.sample]
            transactions = dates.map do |date|
              FactoryBot.create(:transaction_entry, account: account, clearance_date: date)
            end
            subject = described_class.new(budget_interval: budget_interval)

            expect(subject.call).to be total_for(transactions)
          end
        end

        context 'when there are transactions associated with that account on the last date' do
          it 'returns the sum of those transactions' do
            account = FactoryBot.create(:account, :cash_flow, user_group: user.user_group)
            transaction = FactoryBot.create(:transaction_entry,
                                            account: account,
                                            clearance_date: budget_interval.last_date)
            subject = described_class.new(budget_interval: budget_interval)

            expect(subject.call).to be total_for(transaction)
          end
        end
      end
    end

    context 'when there are multiple accounts associated with the user' do
      let(:user) { FactoryBot.create(:user) }

      before do # set up another user account
        other_user = FactoryBot.create(:user)
        other_user_account = FactoryBot.create(:account, :cash_flow, user_group: other_user.user_group)
        FactoryBot.create_list(:transaction_entry, 3, account: other_user_account)
      end

      context 'when the interval is current' do
        let(:budget_interval) { interval_double(user_group_id: user.user_group_id, current?: true) }

        context 'when there are pending transactions in a non-cash-flow account' do
          it 'includes the sum of all of those transaction details' do
            account = FactoryBot.create(:account, :non_cash_flow, user_group: user.user_group)
            transactions = FactoryBot.create_list(:transaction_entry, 2, :pending, account: account)
            subject = described_class.new(budget_interval: budget_interval)

            expect(subject.call).to be total_for(transactions)
          end
        end

        context 'when there are pending and cleared transactions in a non-cash-flow account' do
          it 'includes the sum of all transaction details' do
            account = FactoryBot.create(:account, :non_cash_flow, user_group: user.user_group)
            transactions = FactoryBot.create_list(:transaction_entry, 2, :pending, account: account)
            transactions << FactoryBot.create(:transaction_entry,
                                              account: account,
                                              clearance_date: budget_interval.last_date)
            subject = described_class.new(budget_interval: budget_interval)

            expect(subject.call).to be total_for(transactions)
          end
        end
      end

      context 'when the interval is not current' do
        let(:budget_interval) { interval_double(user_group_id: user.user_group_id, current?: false) }

        context 'when there are pending transactions in a non-cash-flow account' do
          it 'does not include the pending transactions' do
            account = FactoryBot.create(:account, :non_cash_flow, user_group: user.user_group)
            FactoryBot.create_list(:transaction_entry, 2, :pending, account: account)
            subject = described_class.new(budget_interval: budget_interval)

            expect(subject.call).to be_zero
          end
        end

        context 'when there are pending and cleared transactions in a non-cash-flow account' do
          it 'does not include the pending transactions but includes cleared' do
            account = FactoryBot.create(:account, :non_cash_flow, user_group: user.user_group)
            FactoryBot.create_list(:transaction_entry, 2, :pending, account: account)
            transaction = FactoryBot.create(:transaction_entry,
                                            account: account,
                                            clearance_date: budget_interval.last_date)
            subject = described_class.new(budget_interval: budget_interval)

            expect(subject.call).to be total_for(transaction)
          end
        end
      end
    end
  end

  def interval_double(**args)
    date_range = args.fetch(:date_range) { (1.month.ago.to_date..1.day.ago.to_date) }
    presenter = OpenStruct.new(date_range: date_range, **args)
    instance_double(Budget::Interval,
                    as_presenter: presenter,
                    first_date: date_range.first,
                    last_date: date_range.last,
                    user_group_id: args.fetch(:user_group_id))
  end

  def total_for(transactions)
    Array(transactions).reduce(0) { |sum, txn| sum + txn.details.sum(:amount) }
  end
end
# rubocop:enable RSpec/NestedGroups
