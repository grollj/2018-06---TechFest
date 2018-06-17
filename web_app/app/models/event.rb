class Event < ApplicationRecord
  belongs_to :item, optional: true
  belongs_to :user, optional: true
end
