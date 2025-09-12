class AddPhoneNumberToContacts < ActiveRecord::Migration[7.1]
  def change
    add_column :contacts, :phone_number, :string
  end
end
