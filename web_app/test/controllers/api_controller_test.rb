require 'test_helper'

class ApiControllerTest < ActionDispatch::IntegrationTest
  test "should get tool" do
    get api_tool_url
    assert_response :success
  end

end
