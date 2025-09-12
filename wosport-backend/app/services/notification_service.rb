require 'exponent-server-sdk'

class NotificationService
  def self.send_sms(phone_number, message)
    Rails.logger.info "SMS envoyé à #{phone_number}: #{message}"
  end

  def self.send_push(token:, title:, body:, data: {})
    return if token.blank?

    client = Exponent::Push::Client.new
    messages = [{
      to: token,
      sound: "default",
      title: title,
      body: body,
      data: data
    }]

    handler = proc do |error, _|
      Rails.logger.error("Expo push error: #{error.inspect}")
    end

    client.publish(messages, &handler)
  end
end
