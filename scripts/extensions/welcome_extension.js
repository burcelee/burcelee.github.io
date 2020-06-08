

var line_width = 94;
var border_width = 1;
var border_symbol="$";
var welcome_message =
"$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$<br>"+
"$............................................................................................$<br>"+
"$..######...........................######...............##..................................$<br>"+
"$..##..##...##..........##...##.....##..##...............##..................................$<br>"+
"$..##..##...##..........##..##......##..##...............##..................................$<br>"+
"$..######.......######..####........######...######..######..######..######..######..######..$<br>"+
"$..##.##....##..##......##..##......##.##....##..##..##..##..##..##..######..##......##......$<br>"+
"$..##..##...##..##......##...##.....##..##...##..##..##..##..##..##..##......##........##....$<br>"+
"$..##...##..##..######..##....##....##...##..######..######..######..######..##......######..$<br>"+
"$................................................................##..........................$<br>"+
"$................................................................##..........................$<br>"+
"$............................................................######..........................$<br>"+
".............................................................................................$<br>";

 // Move all these functions somewhere inside POS.
function print_seperator()
{
	var sep = "$";
	write(f0, sep.repeat(line_width)+"<br>");
}

function print_blank_line()
{
	write(f0, border_symbol.repeat(border_width) + ".".repeat(line_width-border_width*2) + border_symbol.repeat(border_width) +"<br>");
}

function print_line(line_text)
{
	var width_minus_border = line_width - 2*border_width;
	var prefix_dots = (line_width - line_text.length - 2*border_width) / 2;
	var prefix = "$" + ".".repeat(prefix_dots) + line_text + ".".repeat(prefix_dots);
	if (prefix.length < line_width - border_width)
		prefix += ".";
	prefix += border_symbol.repeat(border_width)+"<br>";	
	write(f0, prefix);
}

class WelcomeExtension
{
	load()
	{
		//overwrite terminal with startup message
		write(f0,welcome_message,true);
		print_seperator();
		print_blank_line();
		print_line("welcome to my strange website");
		print_line("compatible(ish) with: google chrome, firefox, edge. God help you on mobile");
		print_line("use the help command for more options");
		print_blank_line();
		print_seperator();
	}
}

add_extension(new WelcomeExtension());