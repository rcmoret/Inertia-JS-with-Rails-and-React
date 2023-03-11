# frozen_string_literal: true

class SerializableCollection < Array
  def initialize(serializer:)
    super()
    yield.map { |item| self << serializer.new(item) }
  end

  def render(camelize: false)
    map { |item| item.render(camelize: camelize) }
  end
end
