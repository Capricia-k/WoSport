class ApplicationController < ActionController::API
  include ActionController::Cookies
  before_action :authenticate_user!, :parse_json_request

  private

  def parse_json_request
    return unless request.content_type == 'application/json'

    begin
      data = JSON.parse(request.body.read)
      params.merge!(data)
      request.body.rewind
    rescue JSON::ParserError => e
    end
  end
end
