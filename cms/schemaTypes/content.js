import {defineField, defineType} from 'sanity'

export const content = defineType({
  name: 'atpContent',
  title: 'Atp Content',
  type: 'document',
  fields: [
    defineField({
      title: 'Home Page Title',
      name: 'homePageTitle',
      type: 'string',
    }),
    defineField({
      title: 'Home Page About Title',
      name: 'homePageAboutTitle',
      type: 'string',
    }),
    defineField({
      title: 'Home Page About Text',
      name: 'homePageAboutText',
      type: 'text',
    }),
    defineField({
      title: 'Home Page About Image',
      name: 'homePageAboutImg',
      type: 'image',
      options: {
        hotspot: true
      }
    }),
    defineField({
      title: 'Home Page Coach Title',
      name: 'homePageCoachTitle',
      type: 'string',
    }),
    defineField({
      title: 'Home Page Coach Text',
      name: 'homePageCoachText',
      type: 'text',
    }),
    defineField({
      title: 'Home Page Coach Image',
      name: 'homePageCoachImg',
      type: 'image',
      options: {
        hotspot: true
      }
    }),
    defineField({
      title: 'About Story Header',
      name: 'aboutStoryHeader',
      type: 'text',
    }),
    defineField({
      title: 'About Story Text',
      name: 'aboutStoryText',
      type: 'text',
    }),
    defineField({
      title: 'About Vision Header',
      name: 'aboutVisionHeader',
      type: 'text',
    }),
    defineField({
      title: 'About Vision Text',
      name: 'aboutVisionText',
      type: 'text',
    }),
    defineField({
      title: 'About Mission Header',
      name: 'aboutMissionHeader',
      type: 'text',
    }),
    defineField({
      title: 'About Mission Text',
      name: 'aboutMissionText',
      type: 'text',
    }),
    defineField({
      title: 'Team Text',
      name: 'teamText',
      type: 'text',
    }),
    defineField({
      title: 'About Page Image',
      name: 'aboutPageImg',
      type: 'image',
      options: {
        hotspot: true
      }
    }),
    defineField({
      title: 'Footer Image 1',
      name: 'footerImg1',
      type: 'image',
      options: {
        hotspot: true
      }
    }),
    defineField({
      title: 'Footer Image 2',
      name: 'footerImg2',
      type: 'image',
      options: {
        hotspot: true
      }
    }),defineField({
      title: 'Footer Image 3',
      name: 'footerImg3',
      type: 'image',
      options: {
        hotspot: true
      }
    }),defineField({
      title: 'Footer Image 4',
      name: 'footerImg4',
      type: 'image',
      options: {
        hotspot: true
      }
    }),
    defineField({
      title: 'Footer Image 5',
      name: 'footerImg5',
      type: 'image',
      options: {
        hotspot: true
      }
    }),
    defineField({
      title: 'Footer Image 6',
      name: 'footerImg6',
      type: 'image',
      options: {
        hotspot: true
      }
    }),
  ],
})
