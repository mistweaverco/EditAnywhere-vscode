import { window, workspace, Uri } from 'vscode';
import fetch from 'node-fetch';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as mime from 'mime-types';


const EDITANYWHERE_SERVER_BASE_URI = 'http://127.0.0.1:6789/';

export async function showPicker() {
	const pickedAppID = await fetch(EDITANYWHERE_SERVER_BASE_URI)
	.then(response => response.json())
	.catch((ex) => {
		window.showErrorMessage('EditAnywhere Server is not running.');
	})
	.then((data) => {
			return window.showQuickPick(data, {
				placeHolder: 'Select a ressource',
				onDidSelectItem: (item) => {
					//window.showInformationMessage(`Focus: ${item}`);
				}
			});
	});
	const pickedRessourceID = await fetch(EDITANYWHERE_SERVER_BASE_URI + pickedAppID)
	.then(response => response.json())
	.catch((ex) => {
		window.showErrorMessage('EditAnywhere Server is not running.');
	})
	.then((data) => {
			return window.showQuickPick(data, {
				placeHolder: 'Select a ressource',
				onDidSelectItem: (item) => {
					//window.showInformationMessage(`Focus: ${item}`);
				}
			});
	});
	const ressource = await fetch(EDITANYWHERE_SERVER_BASE_URI + pickedAppID + '/' + pickedRessourceID)
	.then(response => response.json())
	.catch((ex) => {
		window.showErrorMessage('EditAnywhere Server is not running.');
	})
	.then((data) => {
		return data;
	});
	console.log(ressource);

	const content = ressource.content;
	
	const tempDir = `${os.tmpdir()}${path.sep}EditAnywhere${path.sep}${pickedAppID}`;
	if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, {recursive: true});
	const fileExtension = mime.extension(ressource.mimetype);
	const filePath = path.join(tempDir, pickedRessourceID + '.' + fileExtension);

	fs.writeFileSync(filePath, content, 'utf8');

	const openPath = Uri.file(filePath);
	workspace.openTextDocument(openPath).then(doc => {
		window.showTextDocument(doc);
	});
	window.showInformationMessage(`Got: ${pickedRessourceID}`);


}

