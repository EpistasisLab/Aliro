export const getMenuItems = (data) => {
	return {
		header: 'PennAI',
		subheader: 'Your friendly AI assistant',
		items: [{
			type: 'button',
			name: 'Datasets',
			path: 'datasets',
			icon: 'file text outline'
		},{
			type: 'button',
			name: 'Launchpad',
			path: 'launchpad',
			icon: 'rocket'
		},{
			type: 'button',
			name: 'Status',
			path: 'status',
			icon: 'list'
		},{
			type: 'dropdown',
			icon: 'user',
			text: data.user,
			items: [{
				type: 'button',
				name: 'Notifications',
				path: '/#/notifications',
				icon: 'bell'
			},{
				type: 'button',
				name: 'Settings',
				path: '/#/settings',
				icon: 'setting'
			},{
				type: 'divider'
			},{
				type: 'button',
				name: 'Sign Out',
				action: {},
				icon: 'sign out'
			}]
		}]
    }
};