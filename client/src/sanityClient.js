// src/sanityClient.js
import { createClient } from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'

const client = createClient({
  projectId: 'jaqodarg', // Find this in sanity.json or manage.sanity.io
  dataset: 'production', // e.g., 'production'
  useCdn: true, // `false` if you want to ensure fresh data
  apiVersion: '2023-08-27' // use a UTC date string
});

const builder = imageUrlBuilder(client)

function urlFor(source) {
  return builder.image(source)
}
export  {client, urlFor}