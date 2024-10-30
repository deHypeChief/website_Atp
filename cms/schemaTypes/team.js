import {defineField, defineType} from 'sanity'

export const team = defineType({
  name: 'team',
  title: 'Team',
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
      title: 'Team Image',
      name: 'teamImg',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),
  ],
})
