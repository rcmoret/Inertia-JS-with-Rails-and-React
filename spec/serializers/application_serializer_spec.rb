# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ApplicationSerializer do
  describe 'adding a list attributes' do
    subject { serializer.new(account) }

    let(:name) { 'Account Name' }
    let(:slug) { 'account-slug' }
    let(:account) { FactoryBot.build(:account, name: name, slug: slug) }

    let(:serializer) do
      Class.new(described_class) do
        attributes :slug, :name
      end
    end

    describe 'delegation of methods' do
      it 'delegates those attributes to the underlying object' do
        expect(subject.name).to eq name
        expect(subject.slug).to eq slug
      end
    end

    describe '#render' do
      it 'includes those attributes in a hash' do
        expect(subject.render).to eq({ name: name, slug: slug })
      end
    end
  end

  describe 'adding single attributes' do
    subject { serializer.new(account) }

    let(:name) { 'Account Name' }
    let(:slug) { 'account-slug' }
    let(:account) { FactoryBot.build(:account, name: name, slug: slug) }

    context 'when added by name only' do
      let(:serializer) do
        Class.new(described_class) do
          attribute :name
          attribute :slug
        end
      end

      it 'delegates those methods' do
        expect(subject.name).to eq name
        expect(subject.slug).to eq slug
      end

      it 'includes those attributes in a hash' do
        expect(subject.render).to eq({ name: name, slug: slug })
      end
    end

    context 'when added by name with a "alias_of" defined' do
      let(:serializer) do
        Class.new(described_class) do
          attribute :account_name, alias_of: :name
          attribute :account_slug, alias_of: :slug
        end
      end

      it 'delegates those methods to their aliased methods' do
        expect(subject.account_name).to eq name
        expect(subject.account_slug).to eq slug
      end

      it 'includes those attributes in a hash' do
        expect(subject.render).to eq({ account_name: name, account_slug: slug })
      end

      it 'camelcases the keys when camelize: :lower is passed to render' do
        expect(subject.render(camelize: :lower)).to eq({ 'accountName' => name, 'accountSlug' => slug })
      end
    end

    context 'when added by name with a conditional given' do
      let(:serializer) do
        Class.new(described_class) do
          attribute :name, conditional: proc { false }
          attribute :slug, conditional: :truthy_method?

          def truthy_method?
            true
          end
        end
      end

      it 'still delegates the original methods' do
        expect(subject.name).to eq name
        expect(subject.slug).to eq slug
      end

      it 'includes attributes based on the conditional' do
        expect(subject.render).to eq({ slug: slug })
      end
    end

    context 'when added by name with a "alias_of" defined and a conditional given' do
      let(:serializer) do
        Class.new(described_class) do
          attribute :account_name, alias_of: :name, conditional: :truthy_method?
          attribute :account_slug, alias_of: :slug, conditional: proc { 2 == 1 }

          def truthy_method?
            true
          end
        end
      end

      it 'still delegates the original methods' do
        expect(subject.name).to eq name
        expect(subject.slug).to eq slug
      end

      it 'includes aliased attributes based on the conditional' do
        expect(subject.render).to eq({ account_name: name })
      end
    end
  end

  describe 'when adding an association with a serializer' do
    subject { transaction_serializer.new(transaction) }

    let(:name) { 'Account Name' }
    let(:account) { FactoryBot.create(:account, name: name) }
    let(:transaction) { FactoryBot.create(:transaction_entry, :pending, account: account) }

    let(:transaction_serializer) do
      account_serializer = Class.new(described_class) do
        attribute :account_name, alias_of: :name
      end
      Class.new(described_class) do
        attribute :key
        attribute :clearance_date
        attribute :account, serializer: account_serializer
      end
    end

    it 'delegates the association to the underlying object' do
      expect(subject.account).to eq account
    end

    it 'serializes the association on render' do
      expect(subject.render).to eq(
        key: transaction.key,
        clearance_date: nil,
        account: { account_name: name }
      )
    end

    it 'deep camelizes the keys on render' do
      expect(subject.render(camelize: :upper)).to eq(
        'Key' => transaction.key,
        'ClearanceDate' => nil,
        'Account' => { 'AccountName' => name }
      )
    end
  end

  describe 'when adding a has many relationship' do
    context 'when declaring a relationship without any options' do
      subject { serializer.new(account) }

      let(:account) { FactoryBot.build(:account) }
      let(:serializer) do
        transaction_serializer = Class.new(described_class) do
          attribute :key
        end

        Class.new(described_class) do
          has_many :transactions, each_serializer: transaction_serializer
        end
      end

      before do
        FactoryBot.create_list(:transaction_entry, 2, account: account)
      end

      it 'delegates the relationship to the underlying object' do
        expect(subject.transactions.size).to eq account.transactions.size
      end

      it 'serializes the related records' do
        expect(subject.render).to eq(
          transactions: account.transactions.pluck(:key).map { |key| { key: key } }
        )
      end
    end

    context 'when declaring a relationship with an alias' do
      subject { serializer.new(account) }

      let(:account) { FactoryBot.build(:account) }
      let(:serializer) do
        transaction_serializer = Class.new(described_class) do
          attribute :key
        end

        Class.new(described_class) do
          has_many :entries, each_serializer: transaction_serializer, alias_of: :transactions
        end
      end

      before do
        FactoryBot.create_list(:transaction_entry, 2, account: account)
      end

      it 'serializes the related records' do
        expect(subject.render).to eq(
          entries: account.transactions.pluck(:key).map { |key| { key: key } }
        )
      end
    end

    context 'when declaring a relationship with a conditional' do
      subject { serializer.new(account) }

      let(:account) { FactoryBot.build(:account) }
      let(:serializer) do
        transaction_serializer = Class.new(described_class) do
          attribute :key
        end

        Class.new(described_class) do
          has_many :entries, each_serializer: transaction_serializer, conditional: proc { false }
        end
      end

      before do
        FactoryBot.create_list(:transaction_entry, 2, account: account)
      end

      it 'does not serialize the relation if false-y' do
        expect(subject.render).to be_empty
      end
    end
  end
end
