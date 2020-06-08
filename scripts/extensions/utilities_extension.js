class UtilitiesExtension 
{
	static clear(args)
	{
		clear(f0);
	}
	static help(args)
	{
		var help_message = "Commands:"+
			"<br>clear: clears screen"+
			"<br>help: <i>guess</i>"+
			"<br>file [name] [content]:create a new file named [name] containing [content]"+
			"<br>rm [name...]: delete some files"+
			"<br>ls: list files in the current directory"+
			"<br>reset: reset filesystem and reload"+
			"<br>info: print out the current made-up version"+
			"<br>cd [name]: change directory. relative or absolute path"+
			"<br>cat: print the contents of a file"+
			"<br>mkdir [name]: create a new directory"+
			"<br>exec: execute a file that is not in /bin"+
			"<br>pwd: where u at"+
			"<br> enjoy...<br>"
		write(f0,help_message);
	}
	static file(args)
	{
		if (args.length == 0) {
				write(f0,"why no file name?<br>")
				return;
			}
			new_file(args[0],true);
			if (args.length > 1) {
				write(args[0],args[1]);
				for (var i=2;i < args.length; i++) {
					write(args[0]," " + args[i]);
				}
			}
	}
	static rm(args)
	{
		if (args.length == 0) {
			write(f0,"why no file name?<br>");
			return;
		}
		for (var i=0;i<args.length;i++) {
			delete_file(args[i]);
		}
	}
	static ls(args)
	{
		// todo: args like filepath
		var files = get_file_list();
		for (var i = 0; i < files.length; i++) {
			files[i] = gfile(files[i]);
		}
		write(f0,files.join("<br>"));
		if (files.length > 0)
			write(f0,"<br>");
	}
	static reset(args)
	{
		wipe_filesystem();
		window.location.reload(true);
	}
	static info(args)
	{
		write(f0,"POS Rev. " + POS_revision+ "<br>");
	}
	static cd(args)
	{
		if (args.length == 0) {
			write(f0,"why no directory name?<br>")
			return;
		}
		var newPath = args[0];
		//Todo: make this not this
		if (args[0] == "..")
		{
			// Basically a hack. Removes the trailing /
			// of the current directory and lets gdir think
			// it's a file, then get that "file"'s dir.
			newPath = gdir(current_folder.substring(0, current_folder.length-1));
		}
		else if (args[0].charAt(args[0].length -1) != "/") {
			newPath += "/";
		}
		if (change_directory(newPath))
			return;
		write(f0,"Hmmm...No<br>");
	}
	static cat(args)
	{
		if (args.length == 0) {
				write(f0,"print what?<br>");
				return;
			}
			var data = read(args[0]);
			if (data == null) {
				write(f0,"no such file, my man<br>");
				return;
			}
			write(f0, data + "<br>");
	}
	static mkdir(args)
	{
		if (args.length == 0) {
			write(f0,"why no directory name?<br>")
			return;
		}
		new_file(args[0],true,true);
	}
	static exec(args)
	{
		pos_exec(args[0],args.slice(1));
	}
	static pwd(args)
	{
		write(f0, current_folder + "<br>");
	}
	static handle(e)
	{
		if (e.key == "Escape")
		{
			unregister_input_handler();
			pos_end_app();
		}
		write(f0, "__" + e.key);
	}
	static weirdo(args)
	{
		pos_start_app(null);
		register_input_handler(UtilitiesExtension.handle);
	}
	load()
	{
		add_function_file("/bin/clear", UtilitiesExtension.clear);
		add_function_file("/bin/help", UtilitiesExtension.help);
		add_function_file("/bin/file", UtilitiesExtension.file);
		add_function_file("/bin/rm", UtilitiesExtension.rm);
		add_function_file("/bin/ls", UtilitiesExtension.ls);
		add_function_file("/bin/reset", UtilitiesExtension.reset);
		add_function_file("/bin/info", UtilitiesExtension.info);
		add_function_file("/bin/cd", UtilitiesExtension.cd);
		add_function_file("/bin/cat", UtilitiesExtension.cat);
		add_function_file("/bin/mkdir", UtilitiesExtension.mkdir);
		add_function_file("/bin/exec", UtilitiesExtension.exec);
		add_function_file("/bin/pwd", UtilitiesExtension.pwd);
		add_function_file("/bin/weirdo", UtilitiesExtension.weirdo);
	}
}
add_extension(new UtilitiesExtension());
