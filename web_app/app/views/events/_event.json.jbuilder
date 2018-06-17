json.extract! event, :id, :event_type, :item_id, :user_id, :data, :created_at, :updated_at
json.url event_url(event, format: :json)
