# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Queries::SQLFunctions do
  describe '.sql_to_json' do
    specify do
      nodes = [Arel::Nodes::Quoted.new('hello, world'), Arel::Nodes::Quoted.new('farewell, world')]
      expect(Arel::Nodes::NamedFunction).to receive(:new).with('to_json', nodes)

      described_class.sql_to_json(*nodes)
    end
  end

  describe '.array_agg' do
    specify do
      nodes = [Arel::Nodes::Quoted.new('hello, world'), Arel::Nodes::Quoted.new('farewell, world')]
      expect(Arel::Nodes::NamedFunction).to receive(:new).with('array_agg', nodes)

      described_class.array_agg(*nodes)
    end
  end

  describe '.json_build_object' do
    specify do
      nodes = [Arel::Nodes::Quoted.new('hello, world'), Arel::Nodes::Quoted.new('farewell, world')]
      expect(Arel::Nodes::NamedFunction).to receive(:new).with('json_build_object', nodes)

      described_class.json_build_object(*nodes)
    end
  end

  describe '.coalesce' do
    specify do
      nodes = [Arel::Nodes::Quoted.new('hello, world'), Arel::Nodes::Quoted.new('farewell, world')]
      expect(Arel::Nodes::NamedFunction).to receive(:new).with('coalesce', nodes)

      described_class.coalesce(*nodes)
    end
  end

  describe '.concat' do
    specify do
      nodes = [Arel::Nodes::Quoted.new('hello, world'), Arel::Nodes::Quoted.new('farewell, world')]
      expect(Arel::Nodes::NamedFunction).to receive(:new).with('concat', nodes)

      described_class.concat(*nodes)
    end
  end

  describe '.minmum' do
    specify do
      node = Arel::Nodes::Quoted.new('hello, world')
      expect(Arel::Nodes::NamedFunction).to receive(:new).with('min', [node])

      described_class.minimum(node)
    end
  end

  describe '.cast' do
    specify do
      node = Arel::Nodes::Quoted.new('hello, world')
      as = 'varchar'
      expect(Arel::Nodes::NamedFunction).to receive(:new).with('cast', [node.as(as)])

      described_class.cast(node, as: as)
    end
  end

  describe '.lpad' do
    specify do
      node = Arel::Nodes::Quoted.new('hello, world')
      length = 4
      padder = 0
      expect(Arel::Nodes::NamedFunction)
        .to receive(:new)
        .with('lpad', [node, length, Arel::Nodes::Quoted.new(padder.to_s)])

      described_class.lpad(node, length, padder)
    end
  end

  describe '.sql_to_date' do
    specify do
      node = Arel::Nodes::Quoted.new('hello, world')
      format = 'mmyyyy'
      expect(Arel::Nodes::NamedFunction)
        .to receive(:new)
        .with('to_date', [node, Arel::Nodes::Quoted.new(format)])

      described_class.sql_to_date(node, format)
    end
  end
end
