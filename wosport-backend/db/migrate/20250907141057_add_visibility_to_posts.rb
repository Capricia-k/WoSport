class AddVisibilityToPosts < ActiveRecord::Migration[7.1]
  def change
    add_column :posts, :visibility, :string, default: "public", null: false
  end
end
