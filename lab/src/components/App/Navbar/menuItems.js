export const getMenuItems = (data) => {
	return {
		header: 'PennAI',
		subheader: 'Your friendly AI assistant',
		items: [{
			type: 'button',
			name: 'datasets',
			path: '/#/',
			icon: 'file text outline'
		},{
			type: 'button',
			name: 'launchpad',
			path: '/#/launchpad',
			icon: 'rocket'
		},{
			type: 'button',
			name: 'status',
			path: '/#/status',
			icon: 'list'
		},{
			type: 'dropdown',
			icon: 'user',
			text: data.user,
			items: [{
				type: 'button',
				name: 'notifications',
				path: '/#/notifications',
				icon: 'bell'
			},{
				type: 'button',
				name: 'settings',
				path: '/#/settings',
				icon: 'setting'
			},{
				type: 'divider'
			},{
				type: 'button',
				name: 'sign out',
				action: {},
				icon: 'sign out'
			}]
		}]
    }
};