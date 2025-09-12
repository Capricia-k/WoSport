class AddFollowerAndFollowedToFollows < ActiveRecord::Migration[7.1]
  def change
    add_reference :follows, :follower, null: false, foreign_key: { to_table: :users }
    add_reference :follows, :followed, null: false, foreign_key: { to_table: :users }

    add_index :follows, [:follower_id, :followed_id], unique: true
  end
end
