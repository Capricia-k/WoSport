class CreateSosAlerts < ActiveRecord::Migration[7.1]
  def change
    create_table :sos_alerts do |t|
      t.string :message
      t.float :latitude
      t.float :longitude
      t.string :google_maps_url
      t.string :apple_maps_url

      t.timestamps
    end
  end
end
