class CreateMessages < ActiveRecord::Migration[7.1]
  def change
    create_table :messages do |t|
      t.bigint :sender_id, null: false
      t.bigint :receiver_id, null: false
      t.text :content, null: false
      t.boolean :read, default: false
      t.timestamps
    end

    add_foreign_key :messages, :users, column: :sender_id
    add_foreign_key :messages, :users, column: :receiver_id
    add_index :messages, [:sender_id, :receiver_id]
  end
end
