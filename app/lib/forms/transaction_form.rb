# frozen_string_literal: true

module Forms
  class TransactionForm
    PERMITTED_PARAMS = [
      :accountId,
      :budgetExclusion,
      :checkNumber,
      :clearanceDate,
      :description,
      :key,
      :notes,
      :receipt,
      { detailsAttributes: %i[key amount budgetItemKey _destroy].freeze }.freeze,
    ].freeze

    def initialize(transaction_entry, raw_params)
      @transaction_entry = transaction_entry
      @initial_parameters = handle_input(raw_params)
    end

    delegate :account, :errors, to: :transaction_entry

    def save
      transaction_entry.update(parameters)
    end

    private

    def parameters
      details_attributes = initial_parameters.delete(:details_attributes).values.map do |detail_attrs|
        detail_id = transaction_entry.details.find_by(key: detail_attrs.fetch(:key))&.id
        budget_item_id = Budget::Item.for(detail_attrs.delete(:budget_item_key))&.id
        detail_attrs.merge(budget_item_id: budget_item_id, id: detail_id)
      end

      initial_parameters.merge(details_attributes: details_attributes)
    end

    def handle_input(raw_params)
      raw_params
        .require(:transaction)
        .permit(*PERMITTED_PARAMS)
        .to_h
        .deep_transform_keys(&:underscore)
        .deep_symbolize_keys
    end

    attr_reader :initial_parameters, :transaction_entry
  end
end
