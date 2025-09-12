class AddFieldsToStories < ActiveRecord::Migration[7.1]
  def change
    add_reference :stories, :user, null: false, foreign_key: true
    add_column :stories, :expires_at, :datetime
  end
end
