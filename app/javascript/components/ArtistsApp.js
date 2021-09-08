import React, { useState } from "react";
import AddButton from "./AddButton";
import Hero from "./Hero";
import TextInput from "./TextInput";
import { Inertia } from "@inertiajs/inertia";

const ArtistsApp = (props) => {
  const { artists, newArtist, errors } = props
  const [state, setState] = useState({ ...newArtist })

  const addArtist = (event) => {
    event.preventDefault();
    Inertia.post("/artists", { artist: state });
  }

  const onNameChange = event => (
    setState({ ...state, name: event.target.value })
  )

  const onSlugChange = event => (
    setState({ ...state, slug: event.target.value })
  )

  return (
    <div>
      <Hero />
      <h2 className='text-xl'>Artists</h2>
      <div className='mb-8'>
        {artists.map((artist, index) => (
          <Artist key={artist.id} index={index} {...artist} />
        ))}
      </div>
      <form onSubmit={addArtist}>
        <TextInput
          errors={errors.name || []}
          name='name'
          label="New Artist"
          onChange={onNameChange}
          value={state.name || ''}
        />
        <TextInput
          errors={errors.slug || []}
          name='slug'
          label="Slug"
          onChange={onSlugChange}
          value={state.slug || ''}
        />
        <AddButton
          onClick={addArtist}
          label='Add Artist'
          className='rounded bg-blue-100 p-2 text-lg m-2'
        />
      </form>
    </div>
  );
};

const Artist = props => {
  const plainRowClass = 'border-top border-gray-200 border-2'
  const darkRowClass = 'bg-gray-200'
  const baseRowClass = 'p-2'
  const rowClass = props.index % 2 === 0 ? plainRowClass : darkRowClass
  const className = `${rowClass} ${baseRowClass}`

  return (
    <div className={className}>
      <div>
        <a href={`/artists/${props.slug}`}>
          {props.name}
        </a>
      </div>
    </div>
  )
}
export default ArtistsApp;
