
class Ship
{
	x = 0;
	y = 0;
	r = "h"; //rotation h = horizontal, v = vertical.
	type = "carrier";
	hits = [];
	init()
	{
		for (var i = 0; i < 3; i++)
		{
			this.hits.push(false);
		}
	}
	shoot(x, y)
	{
		var local_x = x - this.x;
		var local_y = y - this.y;
		if (this.r == "h")
		{
			if (local_x >= 0 && local_x < this.hits.length)
			{
				this.hits[local_x] = true;
				return true;
			}
			return false;
		}
		
	}
	add_to_board(board)
	{
		for (var i = 0; i < +3; i++)
		{
			if (this.hits[i])
			{
				board[this.x+i][this.y] = "<span style='color:red;'>C</span>";
			}
			else
			{
				board[this.x+i][this.y] = "<span style='color:orange;'>C</span>";
			}
			
		}
	}
}

class BattleshipBoard
{
	board_data = [];
	ships = []
	current_selection = [0,0];
	init()
	{
		for (var y = 0; y < 8; y++)
		{
			var row = []
			for (var x = 0; x < 8; x++)
			{
				row.push("<span style='color:blue;'>-</span>");
			}
			this.board_data.push(row);
		}
	}
	move_selection_up()
	{
		var x = this.current_selection[1]-1;
		this.current_selection[1] = Math.min(Math.max(0, x),7);
	}
	move_selection_down()
	{
		var x = this.current_selection[1]+1;
		this.current_selection[1] = Math.min(Math.max(0, x),7);
	}
	move_selection_right()
	{
		var x = this.current_selection[0]+1;
		this.current_selection[0] = Math.min(Math.max(0, x),7);
	}
	move_selection_left()
	{
		var x = this.current_selection[0]-1;
		this.current_selection[0] = Math.min(Math.max(0, x),7);
	}
	place_ship(ship)
	{
		this.ships.push(ship);
	}

	print_board()
	{
		var board_data = [];
		for (var y = 0; y < 8; y++)
		{
			var row = []
			for (var x = 0; x < 8; x++)
			{
				row.push("-");
			}
			this.board_data.push(row);
		}

		for (var s = 0; s < this.ships.length; s++)
		{
			this.ships[s].add_to_board(this.board_data);
		}

		var s = "<br><br>"
		for (var y = 0; y < 8*3; y++)
		{
			for (var x = 0; x < 8*3; x++)
			{
				var y_n = Math.floor(y/3);
				var x_n = Math.floor(x/3);
				var glyph = this.board_data[x_n][y_n];
				if (x_n == this.current_selection[0] &&
					y_n == this.current_selection[1])
				{
					glyph = "<i><u>" + glyph + "</u></i>";
				}
				s += glyph + " ";
			}
			s += "<br>";
		}
		write(f0, s);
	}
}

class BattleshipExtension 
{
	old_terminal_buffer = null;
	player_board = null;
	computer_board = null;
	current_instruction = "Welcome to battleship, press any key to begin";
	static battleship_input_handler(e)
	{
		if (e.key == "Escape")
		{
			unregister_input_handler();
			write(f0, BattleshipExtension.old_terminal_buffer, true);
			pos_end_app();
			return;
		}
		else if (e.key == "ArrowUp")
		{
			BattleshipExtension.player_board.move_selection_up();
			BattleshipExtension.redraw();
		}
		else if (e.key == "ArrowDown")
		{
			BattleshipExtension.player_board.move_selection_down();
			BattleshipExtension.redraw();
		}
		else if (e.key == "ArrowLeft")
		{
			BattleshipExtension.player_board.move_selection_left();
			BattleshipExtension.redraw();
		}
		else if (e.key == "ArrowRight")
		{
			BattleshipExtension.player_board.move_selection_right();
			BattleshipExtension.redraw();
		}
		write(f0, "__" + e.key);
	}
	static redraw()
	{
		clear(f0);
		// Print header
		print_seperator();
		print_blank_line();
		print_line("Battleship");
		print_line("Rick Rodgers 2020");
		print_blank_line();
		print_seperator();
		BattleshipExtension.player_board.print_board();
	}
	static battleship(args)
	{
		pos_start_app(null);
		// Cache and clear the terminal
		BattleshipExtension.old_terminal_buffer = read(f0);
		BattleshipExtension.player_board = new BattleshipBoard();
		BattleshipExtension.computer_board = new BattleshipBoard();
		BattleshipExtension.player_board.init();
		BattleshipExtension.computer_board.init();
		//BattleshipExtension.player_board.place_ship("c", 2, 2);
		var ship = new Ship();
		ship.init();
		var ship2 = new Ship();
		ship2.init();
		ship2.x = 3;
		ship2.y = 4;
		BattleshipExtension.player_board.place_ship(ship);
		BattleshipExtension.player_board.place_ship(ship2);
		BattleshipExtension.player_board.print_board();
		BattleshipExtension.redraw();
		register_input_handler(BattleshipExtension.battleship_input_handler);
	}
	load()
	{
		add_function_file("/bin/battleship", BattleshipExtension.battleship);
	}
}
add_extension(new BattleshipExtension());
