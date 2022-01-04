# frozen_string_literal: true

module Presenters
  class AttachmentBlobPresenter < SimpleDelegator
    def path
      Rails.application.routes.url_helpers.rails_blob_path(self, only_path: true)
    end
  end
end
