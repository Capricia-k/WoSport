class AddColumnsToReactions < ActiveRecord::Migration[7.1]
  def change
    add_reference :reactions, :story, null: false, foreign_key: true
    add_reference :reactions, :user, null: false, foreign_key: true
    add_column :reactions, :reaction_type, :integer, null: false

    add_index :reactions, [:story_id, :user_id], unique: true
  end
end
