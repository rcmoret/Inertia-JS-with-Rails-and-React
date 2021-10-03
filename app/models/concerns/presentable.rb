module Presentable
  def as_presenter
    presenter_class.new(self)
  end

  protected

  def presenter_class
    raise NotImplementedError
  end
end
