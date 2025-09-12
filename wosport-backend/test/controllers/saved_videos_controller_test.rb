require "test_helper"

class SavedVideosControllerTest < ActionDispatch::IntegrationTest
  test "should get index" do
    get saved_videos_index_url
    assert_response :success
  end
end
