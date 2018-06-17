class ApiController < ApplicationController
  
  def index
    puts params['api']
    if params['api'] && params['api']['status'] && params['api']['status'] != 'inactive' && params['api']['status'] != 'Unknown Action'
      e = Event.new
      e.data = params['api']
      e.save
      # if ['position_lat']
      render json: {status: 'ok'}.to_json
    else
      render json: {status: 'no'}.to_json
    end
  end

  def tool
    unless params[:id]
      render json: {error: 'ID missing'}.to_json
    end
    render json: {status: 'ok'}.to_json
  end

  def events
    events = []
    Event.where("created_at > ?", Time.now - 2.minute).each do |e|
      events << e.data.merge({created_at: e.created_at})
    end
    render json: events.to_json
  end

  def trees
    render json: {status: 'ok'}.to_json
  end
end
