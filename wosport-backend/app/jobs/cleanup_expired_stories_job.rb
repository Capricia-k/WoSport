class CleanupExpiredStoriesJob < ApplicationJob
  queue_as :default

  # if story_id passed -> check & destroy that story; otherwise destroy all expired
  def perform(story_id = nil)
    if story_id
      story = Story.find_by(id: story_id)
      story.destroy if story && story.expires_at <= Time.current
    else
      Story.where('expires_at <= ?', Time.current).find_each(&:destroy)
    end
  end
end
