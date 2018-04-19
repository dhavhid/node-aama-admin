'use strict';

App.service('Contents', function(){
	var self = this;

	var publicVars = {
		types: [
			{name: 'messaging', title: 'Messaging'},
			{name: 'news', title: 'News'},
			{name: 'static_page', title: 'Static page'},
			{name: 'faq', title: 'FAQ'},
			{name: 'digital_media', title: 'Digital media'},
			{name: 'call_to_action', title: 'Call to action'}
		],
		specificFields: {
			messaging: {
				featuredImage: 'Featured Image',
				link: 'Link',
				tagline: 'Tagline',
				video: 'Youtube or Vimeo URL / embed code'
			},
			news: {
				featuredImage: 'Featured Image',
				seoTitle: 'Seo Title',
				seoDescription: 'Seo Description',
				slug: 'Slug',
				content: 'Content',
				excerpt: 'Excerpt',
				byline: 'Byline',
				categories: 'Categories',
				relatedFiles: {
					title: 'Related Files',
					upload: 'Upload files',
					select: 'Select files from gallery',
					link: 'Image URL, Youtube or Vimeo URL / embed code'
				}
			},
			static_page: {
				featuredImage: 'Featured Image',
				seoTitle: 'Seo Title',
				seoDescription: 'Seo Description',
				slug: 'Slug',
				content: 'Content',
				excerpt: 'Excerpt',
				byline: 'Byline',
				parentPage: 'Parent Page',
				relatedFiles: {
					title: 'Related Files',
					upload: 'Upload files',
					select: 'Select files from gallery',
					link: 'Image URL, Youtube or Vimeo URL / embed code'
				}
			},
			faq: {
				title: 'Question',
				content: 'Answer',
				seoTitle: 'Seo Title',
				seoDescription: 'Seo Description',
				slug: 'Slug',
				categories: 'Categories',
				relatedFiles: {
					title: 'Related Files',
					upload: 'Upload files',
					select: 'Select files from gallery',
					link: 'Image URL, Youtube or Vimeo URL / embed code'
				}
			},
			digital_media: {
				seoTitle: 'Seo Title',
				seoDescription: 'Seo Description',
				galleryType: 'Gallery Type'
			},
			call_to_action: {
				featuredImage: 'Featured Image',
				link: 'Link',
				video: 'Youtube or Vimeo URL / embed code'
			}
		},
		galleryTypes: [
			{name: 'Image', val: 'image'},
			{name: 'Video', val: 'video'}
		],
		fileUploaderFilter: {
			digital_media: 'i'
		}
	};
	var publicFunctions = {

	};
	_.assign(self, publicVars, publicFunctions);


	init();


	function init(){

	};
});
