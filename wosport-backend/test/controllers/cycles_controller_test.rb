require "test_helper"

class CyclesControllerTest < ActionDispatch::IntegrationTest
  test "should get index" do
    get cycles_index_url
    assert_response :success
  end

  test "should get show" do
    get cycles_show_url
    assert_response :success
  end

  test "should get create" do
    get cycles_create_url
    assert_response :success
  end
end
