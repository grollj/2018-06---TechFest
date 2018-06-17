class CreateTools < ActiveRecord::Migration[5.1]
  def change
    create_table :tools do |t|
      t.string :name
      t.string :bt_id
      t.string :type
      t.decimal :latitude
      t.decimal :longitude

      t.timestamps
    end
  end
end
