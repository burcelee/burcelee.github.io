var POS_revision = "0.15.0";

var system_folder = "/system42";
var bin_folder = "/bin";
var temp_folder = "/temp";

//terminal buffer file path
// hardcoded into pos_fs write
var f0 = system_folder + "/terminal_buffer.POS";
var extensions = [];

function add_extension(e) {
	extensions.push(e)
}

window.onload = function() {
    //init filesystem
	fs_init();
	new_dir(base_folder, false);
	new_dir(bin_folder, false);
	new_dir(system_folder,false);
	new_dir(temp_folder, false);
	
	// Little bit of a hack to get to a more intersting folder.
	change_directory("/");
	//create terminal files
	new_file(f0,false);

	//setup input system
	is_init();
	
	//load extensions
	for (var i=0; i < extensions.length; ++i)
	{
		extensions[i].load();
	}
};
