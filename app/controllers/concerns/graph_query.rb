module GraphQuery
  private

  def query
    raise NotImplementedError
  end

  def graph_data
    @graph_data ||= BudgetAppSchema.execute(query).tap do |query_data|
      raise GraphqlError, query_data.to_h['errors'] if query_data.to_h.fetch('errors', []).any?
      byebug
    end.fetch('data')
  end

  GraphqlError = Class.new(StandardError)
end
