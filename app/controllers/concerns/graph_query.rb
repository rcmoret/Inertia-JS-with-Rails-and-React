module GraphQuery
  private

  def props
    graph_data.fetch('data').merge(metadata)
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

  GraphqlError = Class.new(StandardError)
end
