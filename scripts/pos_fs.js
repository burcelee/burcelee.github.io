/* 
	POS FILE SYSTEM
	The file system is hierarchical. Files are stored in folders, which
	are also files, but which contain only the names of other files and
	folders. The parent folder of any folder is the first item in the
	folder. 
	Files are stored by their whole path (localStorage limitation),
	which allows for constant time access within the filesystem.
	Folder paths are folders seperated by a '/'. Folders have no
	file extension in userland
	File paths are folder paths which are terminated in "/" + file
*/

var base_folder = "";
var current_folder = base_folder;

function get_full_path(path) {
	if (path == null)
		return null;
	else if (path[0] == "/") { //absolute path
		return path;
	}
	else { //relative path
		return current_folder + path;
	}
}

function gdir(path) {
	var fpath = get_full_path(path);
	
	//if is a folder
	if (fpath[fpath.length -1] == "/") {
		return fpath.substring(0,fpath.lastIndexOf("/") + 1).substring(0,fpath.lastIndexOf("/") + 1);
	}
	return fpath.substring(0,fpath.lastIndexOf("/") + 1);
}

function gfile(path) {
	var fpath = get_full_path(path);

	//if is a folder
	if (fpath.substr(fpath.length -1,fpath.length) == "/") {
		fpath = fpath.slice(0,-1);
		return fpath.substring(fpath.lastIndexOf("/") + 1, fpath.length) + "/";
	}

	/////CHECK LASTINDEXOF
	return fpath.substring(fpath.lastIndexOf("/") + 1, fpath.length);
}

function read(path) {
	var fpath = get_full_path(path);
	return localStorage.getItem(fpath);
}

function pos_file_exists(path)
{
	return read(path) != null;
}

function write(path, str, overwrite = false) {
	var fpath = get_full_path(path);

	var file_contents = localStorage.getItem(fpath);

	if (file_contents == null) {
		return;
	}

	if (overwrite) {
		file_contents = str;
	}
	else {
		file_contents += str;
	}

	localStorage.setItem(fpath,file_contents);

	if (path == f0) {
		if (overwrite) {
			document.getElementById('terminal').innerHTML = str;
		}
		else {
			document.getElementById('terminal').innerHTML += str;
		}
		
	}
}
function new_dir(path, overwrite)
{
	var fpath = get_full_path(path);
	var directory = gdir(fpath);
	fpath += "/";
	if (localStorage.getItem(fpath) == null)
	{	
		localStorage.setItem(fpath,directory);
		write(directory,"<br>" + fpath);
	}
	else if (overwrite) {//it exists, and destuctive
		clear(fpath);
	}
}

// Path is / seperated
function new_file(path, overwrite, is_dir = false) {

	var fpath = get_full_path(path);
	if (localStorage.getItem(fpath) == null ||
		(is_dir && localStorage.getItem(fpath+"/") == null )) {
		var directory = gdir(fpath);
		var file = gfile(fpath);

		if (is_dir) {
			fpath += "/";
			localStorage.setItem(fpath,directory);
		}
		else {
			localStorage.setItem(fpath,"");
		}
		write(directory,"<br>" + fpath);
	}
	else if (overwrite) {//it exists, and destuctive
		clear(fpath);
	}
}

function delete_file(path) {

	//Get absolute path
	var fpath = get_full_path(path);
	
	//Remove item
	localStorage.removeItem(name);
	
	//Now update the directory, first find it
	var directory = gdir(fpath);
	var file = gfile(fpath);
	
	//get dir contents
	var folder_contents = read(directory);
	
	//check if it ever existed at all
	if (folder_contents == null)
		return;

	var folder_files = folder_contents.split("<br>");
	folder_files.splice(folder_files.indexOf(file),1);
	write(directory,folder_files.join("<br>"),true);

}

function move_file(old_path, new_path) {

}

function change_directory(path) {
	var fpath = get_full_path(path);
	if (pos_file_exists(fpath))
	{
		current_folder = fpath;
		return true;
	}
	return false;
}

function clear(file) {
	var contents = localStorage.getItem(file);

	if (contents != null)
		localStorage.setItem(file,"");

	if (file == f0) {
		document.getElementById('terminal').innerHTML = "";
	}
}

function get_file_list() {
	var folder_contents = read(current_folder);
	var file_list = folder_contents.split("<br>");
	file_list.splice(0,1);
	return file_list;
}

function wipe_filesystem() {
	localStorage.clear();
}

function fs_init() {
	if (localStorage.getItem(base_folder) == null) {
		localStorage.setItem(base_folder,"");
	}
}
