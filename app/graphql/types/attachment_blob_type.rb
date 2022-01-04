# frozen_string_literal: true

module Types
  class AttachmentBlobType < BaseObject
    field :content_type, String, 'Description of the file content type', null: false
    field :filename, String, 'Name given to the file on upload', null: false
    field :path, String, 'Location where the resource can be found', null: false
  end
end
