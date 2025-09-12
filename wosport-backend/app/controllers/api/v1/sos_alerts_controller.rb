class Api::V1::SosAlertsController < ApplicationController
  before_action :authenticate_user!

  def create
    sos_alert = current_user.sos_alerts.create!(
      message: params[:message],
      latitude: params[:latitude],
      longitude: params[:longitude],
      google_maps_url: params[:google_maps_url],
      apple_maps_url: params[:apple_maps_url]
    )

    current_user.contacts.each do |contact|
      NotificationService.send_sms(
        contact.phone_number,
        "#{sos_alert.message}\nGoogle Maps: #{sos_alert.google_maps_url}\nApple Maps: #{sos_alert.apple_maps_url}"
      )
    end

    render json: { success: true, alert_id: sos_alert.id }, status: :created
  end

  private

  def sos_alert_params
    params.require(:sos_alert).permit(
      :message,
      :latitude,
      :longitude,
      :google_maps_url,
      :apple_maps_url
    )
  end
end
