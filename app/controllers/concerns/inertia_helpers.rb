# frozen_string_literal: true

module InertiaHelpers
  def inertia_response(component:, data:, status: :ok)
    {
      inertia: component.to_s.camelize(:upper),
      props: data.deep_transform_keys { |key| key.to_s.camelize(:lower) },
      status: status,
    }
  end
end
