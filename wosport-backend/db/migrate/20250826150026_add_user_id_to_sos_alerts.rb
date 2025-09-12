class AddUserIdToSosAlerts < ActiveRecord::Migration[7.1]
  def change
    add_reference :sos_alerts, :user, null: false, foreign_key: true
  end
end
