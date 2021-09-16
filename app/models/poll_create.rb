class PollCreate

  def initialize(params)
    @poll_params = params.fetch(:poll)
    @options = params.fetch(:options)
  end

  def save
    ApplicationRecord.transaction do
      create_poll
      options.each { |option| create_poll_option(option) }
    end
  end

  private

  attr_reader :poll_params, :options

  def create_poll
    @poll = Poll.new(poll_params)

    return if @poll.save

    errors.deep_merge(poll: @poll.errors)
    raise ApplicationRecord::Rollback
  end

  def create_poll_option(option)
    option = PollOption.new(option.merge(poll: @poll))

    return if option.save
    puts option.errors.full_messages

    raise ApplicationRecord::Rollback
  end


  def errors
    @errors ||= {}
  end
end
