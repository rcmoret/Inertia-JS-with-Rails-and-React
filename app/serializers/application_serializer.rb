# frozen_string_literal: true

class ApplicationSerializer < SimpleDelegator
  class << self
    def class_attributes
      @class_attributes ||= []
    end

    def attributes(*attrs)
      attrs.each do |attr|
        attribute(attr)
      end
    end

    # rubocop:disable Naming/PredicateName
    def has_many(name, options = {})
      method_name = options.fetch(:alias_of, name)
      defaults = { method_name: method_name, conditional: proc { true }, on_render: :render }
      attribute(name, defaults.merge(options))
    end
    # rubocop:enable Naming/PredicateName

    def attribute(name, options = {})
      case options
      in { serializer: serializer, **association_options }
        add_association(name, serializer: serializer, **association_options)
      in { each_serializer: serializer, **relation_options }
        add_relation(name, serializer: serializer, **relation_options)
      else
        add_attribute(name, options)
      end
    end

    def add_association(name, serializer:, **options)
      method_name = options.fetch(:alias_of, name)
      conditional = options.fetch(:conditional) { proc { true } }
      if name == method_name
        define_method(name) { serializer.new(super()) }
      else
        define_method(name) { serializer.new(instance_eval(&method_name)) }
      end
      class_attributes << { name: name, method_name: name, conditional: conditional, on_render: :render }
    end

    def add_relation(name, serializer:, **options)
      method_name = options.fetch(:alias_of, name)
      conditional = options.fetch(:conditional) { proc { true } }
      if name == method_name
        define_method(name) { SerializableCollection.new(serializer: serializer) { super() } }
      else
        define_method(name) { SerializableCollection.new(serializer: serializer) { instance_eval(&method_name) } }
      end

      class_attributes << { name: name, method_name: name, conditional: conditional, on_render: :render }
    end

    def add_attribute(name, options = {})
      method_name = options.fetch(:alias_of, name)
      define_method(name) { send(method_name) } if name != method_name

      class_attributes << {
        name: name,
        method_name: method_name,
        conditional: options.fetch(:conditional) { proc { true } },
        on_render: options.fetch(:on_render, :render_self),
      }
    end
  end

  def render(camelize: false)
    self.class.class_attributes.reduce({}) do |memo, attr|
      name, method_name, on_render, conditional = attr.values_at(:name, :method_name, :on_render, :conditional)

      next memo unless instance_eval(&conditional)

      name = name.to_s.camelize(camelize) if camelize

      memo.merge(name => handle_render(on_render, send(method_name), camelize))
    end
  end

  private

  def handle_render(on_render, value, camelize)
    case on_render
    in :render_self
      value
    in :render
      value.render(camelize: camelize)
    in Symbol
      value.public_send(on_render)
    in Proc
      instance_exec(value, &on_render)
    end
  end
end
