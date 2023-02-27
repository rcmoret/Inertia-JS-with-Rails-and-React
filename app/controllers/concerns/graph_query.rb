# frozen_string_literal: true

module GraphQuery
  private

  def data
    @data ||= graph_data.fetch('data')
  end

  def props
    data.merge(metadata).merge(additional_props)
  end

  def query
    raise NotImplementedError
  end

  def namespace
    raise NotImplementedError
  end

  def graph_data
    @graph_data ||= BudgetAppSchema.execute(query).tap do |query_data|
      raise GraphqlError, query_data.to_h['errors'] if query_data.to_h.fetch('errors', []).any?
    end
  end

  def metadata
    { namespace: namespace }
  end

  def additional_props
    {}
  end

  GraphqlError = Class.new(StandardError)
end
