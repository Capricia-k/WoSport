class ApplicationController < ActionController::API
  include ActionController::Cookies
  before_action :authenticate_user!, :parse_json_request

  def parse_json_request
    return unless request.content_type == 'application/json'

    begin
      raw_body = request.body.read
      # Force l'encodage UTF-8 pour éviter les problèmes d'emoji
      raw_body.force_encoding('UTF-8') if raw_body.encoding != Encoding::UTF_8
      
      data = JSON.parse(raw_body)
      params.merge!(data) if data.is_a?(Hash)
      request.body.rewind
    rescue JSON::ParserError => e
      Rails.logger.error "JSON parse error: #{e.message}"
    rescue Encoding::CompatibilityError => e
      Rails.logger.error "Encoding error: #{e.message}"
      # Réessayer avec un encodage forcé
      retry_parse_with_forced_encoding
    end
  end

  private

  def retry_parse_with_forced_encoding
    request.body.rewind
    raw_body = request.body.read
    clean_body = raw_body.force_encoding('UTF-8').scrub
    data = JSON.parse(clean_body)
    params.merge!(data) if data.is_a?(Hash)
    request.body.rewind
  rescue => e
    Rails.logger.error "Failed to parse even with forced encoding: #{e.message}"
  end
end

