Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',

    config : {
        defaultSettings : {
        	startHour : 17,
        	endHour : 9
        }
    },

    getSettingsFields: function() {
        var values = [
            {
                name: 'startHour',
                xtype: 'rallytextfield',
                label: 'Hour yesterday to query created defects from eg. 17'
            },
            {
                name: 'endHour',
                xtype: 'rallytextfield',
                label: 'Hour today to query created defects to eg. 9'
            }
		];
		return values;
	},


	launch: function() {

		this._workspaceConfig = this.getContext().getWorkspace().WorkspaceConfiguration;
		console.log(this._workspaceConfig.TimeZone);
		this._setupDates();

		var panel = this.add({
			xtype : 'panel',
			width : 600,
			layout: {
	        	type: 'hbox',       // Arrange child items vertically
	        	align: 'stretch',    // Each takes up full width
	        	padding: 5
	        }
		});

	    panel.add({
	        xtype: 'rallyfieldvaluecombobox',
	        itemId: 'stateComboBox',
	        fieldLabel: 'Filter by State:',
	        model: 'Defect',
	        field: 'State',
	        useNullForNoEntryValue : true,
	        listeners: {
	            select: this._onSelect,
	            ready: this._onLoad,
	            scope: this
	        }
	    });

	    panel.add({
	    	xtype: 'label',
	    	text : this.isoDate1,
	    	padding : 5
	    });
	    panel.add({
	    	xtype: 'label',
	    	text : this.isoDate2,
	    	padding : 5
	    });

	},

	_setupDates : function() {
		var m1 = new moment().subtract(1,'days').hour(parseInt(this.getSetting("startHour"))).minutes(0).seconds(0);
		var m2 = new moment().hour(parseInt(this.getSetting("endHour"))).minutes(0).seconds(0);

		this.isoDate1 = Rally.util.DateTime.toIsoString(m1.toDate(), true);
		this.isoDate2 = Rally.util.DateTime.toIsoString(m2.toDate(), true);
		console.log(this.isoDate1,this.isoDate2);
	},

	_createDateFilter : function() {

		var filter = Ext.create('Rally.data.wsapi.Filter', {
     		property: 'CreationDate',
     		operator: '>=',
     		value: this.isoDate1
     	});
     	filter = filter.and({
     		property: 'CreationDate',
     		operator: '<=',
     		value: this.isoDate2
     	});

     	return filter;

	},

	_onLoad: function() {
	    this.add({
	        xtype: 'rallygrid',
	        columnCfgs: [
	            'FormattedID',
	            'CreationDate',
	            'Name',
	            'Owner',
	            'SubmittedBy',
	            'State',
	            'Priority',
	            'Severity',
	            'Environment',
	            'FoundInBuild',
	            'TargetDate',
	            'Discussion'
	        ],
	        context: this.getContext(),
	        storeConfig: {
	            model: 'defect',
	            filters: [this._getStateFilter()]
	        }
	    });
	},

	_getStateFilter: function() {
		return this._createDateFilter().and(
	    {
	        property: 'State',
	        operator: '=',
	        value: this.down('#stateComboBox').getValue()
	    });
	},

	_onSelect: function() {
	    var grid = this.down('rallygrid'),
	        store = grid.getStore();

	    store.clearFilter(true);
	    store.filter(this._getStateFilter());
	}
            

});
