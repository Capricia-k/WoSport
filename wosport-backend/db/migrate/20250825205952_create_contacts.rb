class CreateContacts < ActiveRecord::Migration[7.1]
  def change
    create_table :contacts do |t|
      t.references :user, null: false, foreign_key: true
      t.references :contact_user, null: false, foreign_key: { to_table: :users }
      t.string :relation

      t.timestamps
    end
  end
end
