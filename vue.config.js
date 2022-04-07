module.exports = {
	configureWebpack: {
		devtool: 'source-map'
	},
	pages: {
		index: {
			template: 'public/index.html',
			entry: './src/main.js',
			title: 'Alibaba Auto Messenger'
		}
	},
	pluginOptions: {
		browserExtension: {
			componentOptions: {
				background: {
					entry: 'src/background.js',
				},
				contentScripts: {
					entries: {
						'content-script': [
							'src/content-scripts/content-script.js',
						],
					},
				},
			},
		},
	},
};
