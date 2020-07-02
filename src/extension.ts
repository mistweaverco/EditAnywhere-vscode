import { window, commands, ExtensionContext } from 'vscode';
import { showPicker } from './showPicker';

export function activate(context: ExtensionContext) {
	context.subscriptions.push(commands.registerCommand('EditAnywhere.ListApps', async () => {
		const options: { [key: string]: (context: ExtensionContext) => Promise<void> } = {
			showPicker
		};
		const quickPick = window.createQuickPick();
		quickPick.items = [
			{label: "Browse"}
		];
		quickPick.onDidChangeSelection(selection => {
			if (selection[0]) {
				switch(selection[0].label) {
					case "Browse":
						options["showPicker"](context);
						break;
					default:
						break;
				}
			}
		});
		quickPick.onDidHide(() => quickPick.dispose());
		quickPick.show();
	}));
}
