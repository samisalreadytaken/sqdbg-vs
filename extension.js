
const vscode = require("vscode");

class DebugAdapterServerDescriptorFactory
{
	createDebugAdapterDescriptor( session, executable )
	{
		if ( "address" in session.configuration )
			return new vscode.DebugAdapterServer( session.configuration.port, session.configuration.address );
		return new vscode.DebugAdapterServer( session.configuration.port );
	}
}

class ConfigurationProvider
{
	resolveDebugConfiguration( folder, config, token )
	{
		if ( !config.type && !config.request && !config.name )
		{
			const editor = vscode.window.activeTextEditor;
			if ( editor && editor.document.languageId === "squirrel" )
			{
				config.type = "squirrel";
				config.name = "Attach";
				config.request = "attach";
				config.port = "${command:GetPort}";
				config.address = "${command:GetAddress}";
			}
		}

		return config;
	}
}

function activate( context )
{
	context.subscriptions.push( vscode.commands.registerCommand( "extension.sqdbg-vs.GetPort", function( config )
	{
		return vscode.window.showInputBox( { placeHolder: "Enter debug server port" } );
	} ) );

	context.subscriptions.push( vscode.commands.registerCommand( "extension.sqdbg-vs.GetAddress", function( config )
	{
		return vscode.window.showInputBox( { placeHolder: "Enter debug server address", value: "127.0.0.1" } );
	} ) );

	context.subscriptions.push(
		vscode.debug.registerDebugConfigurationProvider( "squirrel",
			new ConfigurationProvider()
		)
	);

	const factory = new DebugAdapterServerDescriptorFactory();

	context.subscriptions.push(
		vscode.debug.registerDebugAdapterDescriptorFactory( "squirrel", factory )
	);

	if ( "dispose" in factory )
		context.subscriptions.push( factory );
}

exports.activate = activate;
exports.deactivate = function() {}
