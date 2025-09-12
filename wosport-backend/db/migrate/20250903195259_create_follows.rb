class CreateFollows < ActiveRecord::Migration[7.1]
  def change
    create_table :follows, if_not_exists: true do |t|
      t.integer :follower_id
      t.integer :followed_id

      t.timestamps
    end
  end
end
