import {defineField, defineType} from 'sanity'

export const reviews = defineType({
  name: 'reviews',
  title: 'Reviews',
  type: 'document',
  fields: [
    defineField({
      title: 'Name',
      name: 'name',
      type: 'string',
    }),
    defineField({
      title: 'Role',
      name: 'role',
      type: 'string',
    }),
    defineField({
      title: 'Review Content',
      name: 'reviewContent',
      type: 'text',
    }),
    defineField({
      title: 'profile',
      name: 'image',
      type: 'image',
      options: {
        hotspot: true
      }
    }),
  ],
})
