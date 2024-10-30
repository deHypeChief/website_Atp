import {defineField, defineType} from 'sanity'

export const sponsorship = defineType({
  name: 'sponsorship',
  title: 'Sponsorship',
  type: 'document',
  fields: [
    defineField({
      title: 'Logo',
      name: 'logo',
      type: 'array',
      of: [
        {
          type: 'image'
        },
      ],
    }),
  ],
})
