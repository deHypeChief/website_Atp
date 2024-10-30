import {defineField, defineType} from 'sanity'

export const comments = defineType({
  name: 'comments',
  title: 'Comments',
  type: 'document',
  fields: [
    defineField({
      title: 'Name',
      name: 'name',
      type: 'string',
    }),
    defineField({
      title: 'Role or Position',
      name: 'role',
      type: 'string',
    }),
    defineField({
      title: 'Comment',
      name: 'comment',
      type: 'text',
    }),
    defineField({
      title: 'User Image',
      name: 'userImage',
      type: 'image',
      options: {
        hotspot: true
      }
    }),
  ],
})
