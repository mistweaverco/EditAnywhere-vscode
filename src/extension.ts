import { window, commands, ExtensionContext } from 'vscode';
import { showPicker } from './showPicker';

export function activate(context: ExtensionContext) {
	context.subscriptions.push(commands.registerCommand('EditAnywhere.ListApps', async () => {
		const options: { [key: string]: (context: ExtensionContext) => Promise<void> } = {
			showPicker
		};
		const quickPick = window.createQuickPick();
		quickPick.items = Object.keys(options).map(label => ({ label }));
		quickPick.onDidChangeSelection(selection => {
			if (selection[0]) {
				options[selection[0].label](context)
					.catch(console.error);
			}
		});
		quickPick.onDidHide(() => quickPick.dispose());
		quickPick.show();
	}));
}
