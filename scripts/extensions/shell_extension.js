
//shell app
var cbuf = "/temp/command_buffer.POS";
var current_line = "";
var line_offset = 0;

class ShellExtension
{
	app_id = -1;
	static return_callback()
	{
		current_line = "";
		write(f0,">");
		line_offset = 0;
	}
	static handle_shell_command(command_string) 
	{
		var parts = command_string.split(" ");
		var exec_string = "/bin/" + parts[0];
		if (pos_file_exists(exec_string))
		{
			pos_exec("/bin/"+parts[0],parts.slice(1));
		}
		else
		{
			write(f0,"hmm... that doesn't seem quite right<br>");
		}
		// Manually call return callback if executed program did not
		// register itself as an app. If it is an app, return callback
		// will be called when it exits.
		if (ShellExtension.app_id == pos_current_app_id())
		{
			ShellExtension.return_callback();
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
		{
			new_file(cbuf,false);
			ShellExtension.app_id = pos_start_app(ShellExtension.return_callback); // currently, no way to end this app.
			register_input_handler(ShellExtension.terminal_input_handler);
			write(f0,">");
		}
	}
}

add_extension(new ShellExtension());
