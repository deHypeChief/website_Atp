import {defineField, defineType} from 'sanity'

export const plans = defineType({
  name: 'plans',
  title: 'Plans',
  type: 'document',
  fields: [
    defineField({
      title: 'Plan Title',
      name: 'planTitle',
      type: 'string',
    }),
    defineField({
      title: 'Active Perks',
      name: 'activePerks',
      type: 'array',
      of: [{type: 'string'}],
    }),
    defineField({
      title: 'Inactive Perks',
      name: 'inactivePerks',
      type: 'array',
      of: [{type: 'string'}],
    }),
  ],
})
