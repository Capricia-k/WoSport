class AddPostIdToMessages < ActiveRecord::Migration[7.1]
  def change
    add_reference :messages, :post, foreign_key: true, null: true
  end
end
