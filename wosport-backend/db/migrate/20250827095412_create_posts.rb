class CreatePosts < ActiveRecord::Migration[7.1]
  def change
    create_table :posts do |t|
      t.references :user, null: false, foreign_key: true
      t.text :content
      t.integer :privacy, default: 0, null: false
      t.integer :comments_count, default: 0, null: false
      t.integer :encouragements_count, default: 0, null: false

      t.timestamps
    end
  end
end
