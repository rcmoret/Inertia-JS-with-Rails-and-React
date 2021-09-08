class ArtistsController < ApplicationController
  before_action :set_to_do, only: %i[show edit update destroy]

  def index
    render inertia: "ArtistsApp", props: { artists: artists, newArtist: empty_artist, errors: {}, clearNew: true  }
  end

  def create
    artist = new_artist(artist_params)
    if artist.save
      redirect_to artists_path, notice: 'Artist was successfully created.'
    else
      render inertia: "ArtistsApp",
             props: {
              artists: artists,
              errors: artist.errors,
              newArtist: artist.attributes.slice('name', 'slug'),
            }
    end
  end

  def show
  end
  # def update
  #   if @to_do.update(to_do_params)
  #     redirect_to to_dos_path, notice: "To do was successfully updated."
  #   else
  #     render inertia: "ToDoApp", props: { toDoItems: ToDo.all, errors: @to_do.errors }
  #   end
  # end

  # def destroy
  #   @to_do.destroy
  #   head :no_content
  # end

  private

  def artists
    @artists ||= Artist.all.order(name: :asc)
  end

  def new_artist(params = {})
    @new_artist ||= Artist.new(params)
  end

  def artist_params
    @artist_params ||= params.require(:artist).permit(:name, :slug)
  end

  def empty_artist
    { name: '', slug: '' }
  end
end
