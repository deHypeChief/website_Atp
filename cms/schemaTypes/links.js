import {defineField, defineType} from 'sanity'

export const links = defineType({
  name: 'footerLinks',
  title: 'Footer Links',
  type: 'document',
  fields: [
    defineField({
      title: 'Facebook Link',
      name: 'facebookLink',
      type: 'string',
    }),
    defineField({
      title: 'Instagram Link',
      name: 'instagramLink',
      type: 'string',
    }),
    defineField({
      title: 'Linkedin Link',
      name: 'linkedinLink',
      type: 'string',
    }),
    defineField({
      title: 'X Link',
      name: 'xLink',
      type: 'string',
    }),
    defineField({
      title: 'YouTube Link',
      name: 'youtubeLink',
      type: 'string',
    }),
    defineField({
      title: 'Privacy Policy Link',
      name: 'privacyLink',
      type: 'string',
    }),
    defineField({
      title: 'Terms Of Service Link',
      name: 'termsLink',
      type: 'string',
    }),
    defineField({
      title: 'Cookie Link',
      name: 'cookieLink',
      type: 'string',
    }),
  ],
})
