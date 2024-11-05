import {defineField, defineType} from 'sanity'

export const imageGala = defineType({
  name: 'imageGala',
  title: 'Images Archive',
  type: 'document',
  fields: [
    defineField({
      title: 'Image Gallary',
      name: 'imageGallary',
      type: 'array',
      of: [
        {
          type: 'image'
        },
      ],
    }),
  ],
})
