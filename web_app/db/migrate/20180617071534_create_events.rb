class CreateEvents < ActiveRecord::Migration[5.1]
  def change
    create_table :events do |t|
      t.string :event_type
      t.references :item, foreign_key: true
      t.references :user, foreign_key: true
      t.jsonb :data, default: {}

      t.timestamps
    end
  end
end
