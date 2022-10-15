# frozen_string_literal: true

module Queries
  class SQLFunctions
    class << self
      def sql_to_json(*nodes)
        Arel::Nodes::NamedFunction.new('to_json', nodes)
      end

      def array_agg(*nodes)
        Arel::Nodes::NamedFunction.new('array_agg', nodes)
      end

      def json_build_object(*nodes)
        Arel::Nodes::NamedFunction.new('json_build_object', nodes)
      end

      def coalesce(*nodes)
        Arel::Nodes::NamedFunction.new('coalesce', nodes)
      end

      def cast(node, as:) # rubocop:disable Naming/MethodParameterName
        Arel::Nodes::NamedFunction.new('cast', [node.as(as)])
      end

      def lpad(node, length, padder)
        Arel::Nodes::NamedFunction.new('lpad', [node, length.to_i, Arel::Nodes::Quoted.new(padder.to_s)])
      end

      def concat(*nodes)
        Arel::Nodes::NamedFunction.new('concat', nodes)
      end

      def sql_to_date(node, format)
        Arel::Nodes::NamedFunction.new('to_date', [node, Arel::Nodes::Quoted.new(format)])
      end

      def minimum(node)
        Arel::Nodes::NamedFunction.new('min', [node])
      end
    end
  end
end
