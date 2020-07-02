import { window, workspace, Uri, TextDocument } from 'vscode';
import fetch from 'node-fetch';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as request from 'request';


const EDITANYWHERE_SERVER_BASE_URI = 'http://127.0.0.1:6789/';
const TEMP_FILE_BASE_DIR = os.tmpdir() + path.sep + "EditAnywhere" + path.sep;

workspace.onDidSaveTextDocument((doc: TextDocument) => {
	if (doc.uri.scheme !== "file") return;
	if (doc.fileName.startsWith(TEMP_FILE_BASE_DIR) === false) return;

	const splits = doc.fileName.split(path.sep);
	const splitsLen = splits.length;
	const appID = splits[splitsLen-2];
	const pathParsed = path.parse(splits[splitsLen-1]);
	const ressourceID = pathParsed.name;
	const fileExtension = pathParsed.ext;
	console.log(appID, ressourceID);
	console.log(doc);

	request.post(EDITANYWHERE_SERVER_BASE_URI + appID + "/" + ressourceID).form({
		file_extension: fileExtension,
		content: doc.getText()
	});
});

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

	if (pickedAppID === undefined) return;

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

	if (pickedRessourceID === undefined) return;

	const ressource = await fetch(EDITANYWHERE_SERVER_BASE_URI + pickedAppID + '/' + pickedRessourceID)
	.then(response => response.json())
	.catch((ex) => {
		window.showErrorMessage('EditAnywhere Server is not running.');
	})
	.then((data) => {
		return data;
	});

	if (ressource === undefined) return;

	const content = ressource.content;

	const tempDir = `${TEMP_FILE_BASE_DIR}${pickedAppID}`;
	if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, {recursive: true});
	const fileExtension = ressource.file_extension;
	const filePath = path.join(tempDir, pickedRessourceID + fileExtension);

	fs.writeFileSync(filePath, content, 'utf8');

	const openPath = Uri.file(filePath);
	workspace.openTextDocument(openPath).then(doc => {
		window.showTextDocument(doc);
	});

	window.showInformationMessage(`EditAnywhere: ${pickedAppID}/${pickedRessourceID}`);


}

