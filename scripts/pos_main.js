var POS_revision = "0.16.0";

var system_folder = "/system42";
var bin_folder = "/bin";
var temp_folder = "/temp";

//terminal buffer file path
// hardcoded into pos_fs write
var f0 = system_folder + "/terminal_buffer.POS";

var extensions = [];
var function_map = new Object();
var program_id = 0;
function add_extension(e) {
	extensions.push(e)
}

function call_function_by_key(key, args)
{
	var f = function_map[key];
	f(args);
}

function add_function_file(filepath, f)
{
	var key = filepath;
	function_map[key] = f;
	new_file(filepath, true);
	write(filepath, "function __main(args){call_function_by_key(\""+key+"\", args);}");
}

var app_return_callbacks = [];
function pos_start_app(callback)
{
	app_return_callbacks.push(callback);
	// Return length as app_id
	return app_return_callbacks.length;
}

function pos_end_app()
{
	// Pop the current return callback, as it is no
	// longer needed
	app_return_callbacks.pop();
	// Now call the parent return callback.
	callback = app_return_callbacks[app_return_callbacks.length - 1];
	if (callback != null)
	{
		callback();
	}
}

function pos_current_app_id()
{
	return app_return_callbacks.length;
}

function pos_exec(program, args)
{
	var argsString = "var args = [";
	for (var i = 0; i < args.length; i++)
	{
		argsString+="\"" + args[i] + "\",";
	}
	argsString += "];"
	var app_content = read(program);
	var app = document.createElement('script');
	app.id = program_id.toString();

	app.textContent = app_content;
	//insert the return code into the app
	app.textContent += 	"var OS_app = document.getElementById('"+
						app.id + "');"+
						argsString +
						"__main(args);"+
						"OS_app = document.getElementById('"+
						app.id + "');"+
						"document.getElementById('execution').removeChild(OS_app);";
	program_id += 1;
	document.getElementById('execution').appendChild(app);
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
	initialize_input();
	
	//load extensions
	for (var i=0; i < extensions.length; ++i)
	{
		extensions[i].load();
	}
};
