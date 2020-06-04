var help_message = "Commands:"+
			"<br>clear: clears screen"+
			"<br>help:guess"+
			"<br>file [name] [content]:create a new file named [name] containing [content]"+
			"<br>delete [name]...:delete files named"+
			"<br>list:list all files"+
			"<br>reset: reset whole filesystem"+
			"<br>print: print the contents of a file"+
			"<br>run [file]: run javascript in file"+
			"<br>info: list OS information<br>";
//shell app
var cbuf = "/temp/command_buffer.POS";
var current_line = "";
var line_offset = 0;

class ShellExtension
{

	static handle_shell_command(command_string) 
	{
		var parts = command_string.split(" ");
		if (parts.length == 0)
			return;
		if (parts[0] == "clear") {
			clear(f0);
		}
		else if (parts[0] == "help") {
			write(f0,help_message);
		}
		else if (parts[0] == "file") {
			if (parts.length == 1) {
				write(f0,"why no file name?<br>")
				return;
			}
			new_file(parts[1],true);
			if (parts.length > 2) {
				write(parts[1],parts[2]);
				for (var i=3;i < parts.length; i++) {
					write(parts[1]," " + parts[i]);
				}
			}
		}
		else if (parts[0] == "delete") {
			if (parts.length == 1) {
				write(f0,"why no file name?<br>");
				return;
			}
			for (var i=1;i<parts.length;i++) {
				delete_file(parts[i]);
			}
		}
		else if (parts[0] == "list") {
			var files = get_file_list();
			for (var i = 0; i < files.length; i++) {
				files[i] = gfile(files[i]);
			}
			write(f0,files.join("<br>"));
			if (files.length > 0)
				write(f0,"<br>");
		}
		else if (parts[0] == "reset") {
			wipe_filesystem();
			clear(f0);
		}
		else if (parts[0] == "info") {
			write(f0,"POS Rev. " + POS_revision+ "<br>");
		}
		else if (parts[0] == "cd") {
			if (parts.length == 1) {
				write(f0,"why no directory name?<br>")
				return;
			}
			if (parts[1].charAt(parts[1].length -1) != "/") {
				parts[1] += "/";
			}
			change_directory(parts[1]);
		}
		else if (parts[0] == "run") {
			if (parts.length == 1) {
				write(f0,"why no app name?<br>")
				return;
			}
			var app_content = read(parts[1]);
			var contents = read(f0);
			var app = document.createElement('script');
			app.id = parts[1];
			app.textContent = app_content;
			//insert the return code into the app
			app.textContent += 	"var OS_app = document.getElementById('"+
								parts[1]+ "');"+
								"document.getElementById('terminal').removeChild(OS_app);";
			document.getElementById('terminal').appendChild(app);
		}
		else if (parts[0] == "print") {
			if (parts.length == 1) {
				write(f0,"print what?<br>");
				return;
			}
			var data = read(parts[1]);
			if (data == null) {
				write(f0,"no such file, my man<br>");
				return;
			}
			write(f0, data + "<br>");
		}
		else if (parts[0] == "dir") {
			if (parts.length == 1) {
				write(f0,"why no directory name?<br>")
				return;
			}
			new_file(parts[1],true,true);
		}
		else {
			write(f0,"?? Either you're crazy or I'm broken ??<br>");
		}
	}

	static terminal_input_handler(e) 
	{
		if (e.key == "Enter") {
			if (current_line == "") {
				write(f0,"<br>>");
				return;
			}
			var command_buffer = read(cbuf);
			if (command_buffer != null && command_buffer.length != 0) {
				write(cbuf, "<br>");
			}
			write(cbuf, current_line);
			write(f0,"<br>");
			ShellExtension.handle_shell_command(current_line);
			current_line = "";
			write(f0,">");
			line_offset = 0;
		}
		else if (e.key == "Delete" || e.key == "Backspace" || e.key == "Del") {
			if (current_line != "") {
				current_line = current_line.slice(0,-1);
				var contents = read(f0).slice(0,-1);
				write(f0,contents,true);
			}
		}
		else if (e.key == "Shift") {
		}
		else if (e.key == "ArrowUp") {
			var commands = read(cbuf).split("<br>");
			if (line_offset < commands.length) {
				line_offset++;
				//remove current line
				var contents = read(f0);
				contents = contents.substring(0,contents.length - current_line.length);
				clear(f0);
				write(f0,contents);
				write(f0,commands[commands.length - line_offset]);
				current_line = commands[commands.length - line_offset];
			}
		}
		else if (e.key == "ArrowDown") {
			var commands = read(cbuf).split("<br>");
			if (line_offset > 1) {
				line_offset--;
				var contents = read(f0);
				contents = contents.substring(0,contents.length - current_line.length);
				clear(f0);
				write(f0,contents);
				write(f0,commands[commands.length - line_offset]);
				current_line = commands[commands.length - line_offset];
			}
			else if (line_offset == 1) {
				var contents = read(f0);
				contents = contents.substring(0,contents.length - current_line.length);
				clear(f0);
				write(f0,contents);
				current_line = "";
			}
		}
		else {
			write(f0,e.key);
			current_line += e.key;
		}
	}

	load()
	{
		//Clear command. Currently duplicating hardcoded clear.
		{
			var filepath = "/bin/clear";
			new_file(filepath, true);
			write(filepath, " clear(f0);");
		}

		{
			new_file(cbuf,false);
			is_bind_key_input(ShellExtension.terminal_input_handler);
			write(f0,">");
		}
	}
}

add_extension(new ShellExtension());

//setup prompt
