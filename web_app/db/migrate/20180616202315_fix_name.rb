class FixName < ActiveRecord::Migration[5.1]
  def change
    rename_column :items, :type, :item_type
  end
end
