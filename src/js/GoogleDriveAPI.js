import { gapi } from 'gapi-script';

export const uploadFile = (name,text,mimeType,parentId) => {
    let auth_token = getAccessToken();

    const boundary = '-------314159265358979323846';
    const delimiter = "\r\n--" + boundary + "\r\n";
    const close_delim = "\r\n--" + boundary + "--";

    let metadata = { 
      name,
      mimeType,
    };  

	if (parentId) {
		metadata.parents = [parentId];
	}

    let multipartRequestBody =
    delimiter +  'Content-Type: application/json\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter + 'Content-Type:'+ mimeType+'\r\n\r\n' +
    text +
    close_delim;

    gapi.client.request({ 
        'path': '/upload/drive/v3/files/',
        'method': 'POST',
        'params': {'uploadType': 'multipart'},
        'headers': { 'Content-Type': 'multipart/mixed; boundary="' + boundary + '"', 'Authorization': 'Bearer ' + auth_token, },
        'body': multipartRequestBody
    }).execute(function(file) { 
        console.log("uploaded", file);
		return {
			success: "uploaded"
		};
    }, function(error){
        console.log(error);
		return {
			error: error.message
		};
    }); 
}

const getAccessToken = () => {
	return gapi.client.getToken().access_token;
}

export const getUser = () => {
	try {
		return {
			data: {
				email: gapi.auth2.getAuthInstance().currentUser.get().getBasicProfile().getEmail(),
				fullName: gapi.auth2.getAuthInstance().currentUser.get().getBasicProfile().getName()
			}
		};
	} catch (error) {
		return {
			error: error.message
		}
	}
}

export const getFolderNames = async () => {
  	let pageToken = null;
	let folders = [];
	do {
		let res;
		try {
			res = await gapi.client.drive.files.list({
				  q: "mimeType='application/vnd.google-apps.folder'",
				  fields: "nextPageToken, files(id, name)",
				  spaces: "drive",
				  pageToken: pageToken,
			});
			res = JSON.parse(res.body);
		} catch (error) {
			console.log(error);
			return {
				error: error.message
			};
		}
		for (let i = 0; i < res.files.length; i++) {
			folders.push(res.files[i]);
	    }  
		pageToken = res.nextPageToken;
	} while (pageToken);
	return {
		data: folders
	};
};

const getFilesInFolder = async (folderId) => {
	let pageToken = null;
	let files = [];
	do {
		let res;
		try {
			res = await gapi.client.drive.files.list({
				  q: `parents = '${folderId}'`,
				  fields: "nextPageToken, files(id, name, mimeType)",
				  spaces: "drive",
				  pageToken: pageToken,
			});
			res = JSON.parse(res.body);
		} catch (error) {
			return {
				error: error.message
			};
		}
		for (let i = 0; i < res.files.length; i++) {
			files.push(res.files[i]);
	    }  
		pageToken = res.nextPageToken;
	} while (pageToken);
	return {
		data: files
	};
}

export const recursivelyGetFilesInFolder = async (folderId) => {
	let queue = [folderId];
	let files = [];
	while (queue.length > 0) {
		let currentFolder = queue.shift();
		const {error, data: res } = await getFilesInFolder(currentFolder);
		if (error) {
			return {error};
		}
		if (res[0] && res[0] !== -1) {
			for (let i = 0; i < res.length; i++) {
				if (res[i].mimeType === "application/vnd.google-apps.folder") {
					queue.push(res[i].id);
				} else {
					files.push(res[i])
				}
			}
		}
	} 
	return {
		data: files
	};
}

export const getFileContents = async (file) => {
	try {
		const res = await gapi.client.drive.files.get({
			fileId: file,
			alt: 'media',
	  });
	  
	  if (res.headers["Content-Type"] === "plain/text") {
		  return {
			  data: res.body
		  };
	  } else {
		return {
			error: "currently inconpatible file type"
		};
	  }

	} catch (error) {
		return {
			error: error.message
		};
	}
}

export const getAllFilesContents = async (folder) => {
	const { data:files } = await recursivelyGetFilesInFolder(folder);
	let retFiles = [];
	// let textArr = [];
	for (let i = 0; i < files.length; i++) {
		const { data, error } = await getFileContents(files[i].id);
		if (error && error === "currently inconpatible file type") {
			continue;
		} else if (error) {
			return {
				error: error.message
			}
		} else {
			const tempFile = new File([data], files[i].name);
			retFiles.push(tempFile);
			// textArr.push(data);
		}
	}

	return {
		data: retFiles,
		// textArr
	};
}