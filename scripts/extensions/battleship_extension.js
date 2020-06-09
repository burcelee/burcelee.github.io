class Ship
{
	x = 0;
	y = 0;
	r = "h"; //rotation h = horizontal, v = vertical.
	type_name = "carrier";
	hits = [];
	length = 0;
	glyph = null;
	constructor(type_name, name, glyph, length)
	{
		this.type_name = type_name;
		this.name = name;
		this.length = length;
		this.glyph = glyph;
		for (var i = 0; i < this.length; i++)
		{
			this.hits.push(false);
		}
	}
	shoot(x, y)
	{
		var local_x = x - this.x;
		var local_y = y - this.y;
		if (this.r == "w")
		{
			if (local_x >= 0 && local_x < this.hits.length && local_y==0)
			{
				this.hits[local_x] = true;
				return true;
			}
			return false;
		}
		else
		{
			if (local_y >= 0 && local_y < this.hits.length && local_x==0)
			{
				this.hits[local_y] = true;
				return true;
			}
		}	
	}
	add_to_board(board)
	{
		for (var i = 0; i < this.length; i++)
		{
			var glyph = "<span style='color:orange;'>" + this.glyph  + "</span>";
			if (this.hits[i])
			{
				glyph = "<span style='color:red;'>" + this.glyph  + "</span>";
			}
			if (this.r == "w")
			{
				board[this.x+i][this.y] = glyph;
			}
			else if (this.r == "h")
			{
				board[this.x][this.y+i] = glyph;
			}
		}
	}
}

class BattleshipBoard
{
	ships = []
	shots = [];
	current_selection = [0,0];
	side_length = 10;
	last_shot = null
	constructor()
	{
	}
	move_selection_up()
	{
		var x = this.current_selection[1]-1;
		this.current_selection[1] = Math.min(Math.max(0, x),this.side_length-1);
	}
	move_selection_down()
	{
		var x = this.current_selection[1]+1;
		this.current_selection[1] = Math.min(Math.max(0, x),this.side_length-1);
	}
	move_selection_right()
	{
		var x = this.current_selection[0]+1;
		this.current_selection[0] = Math.min(Math.max(0, x),this.side_length-1);
	}
	move_selection_left()
	{
		var x = this.current_selection[0]-1;
		this.current_selection[0] = Math.min(Math.max(0, x),this.side_length-1);
	}
	place_ship(ship)
	{
		this.ships.push(ship);
	}
	shoot(x, y)
	{
		var shot = [x,y];
		this.shots.push(shot);
		this.last_shot = shot;
		for (var i = 0; i < this.ships.length; i++)
		{
			if (this.ships[i].shoot(x,y))
			{
				break;
			}
		}
	}
	print_board()
	{
		var board_data = [];
		for (var y = 0; y < this.side_length; y++)
		{
			var row = []
			for (var x = 0; x < this.side_length; x++)
			{
				row.push("<span style='color:blue;'>-</span>");
			}
			board_data.push(row);
		}

		for (var i = 0; i < this.shots.length; i++)
		{
			var shot_spot = this.shots[i];
			board_data[shot_spot[0]][shot_spot[1]] = "<span style='color:blue;'>O</span>";
		}

		if (this.last_shot != null)
		{
			board_data[this.last_shot[0]][this.last_shot[1]] = "<b><strong><span style='color:blue;background-color: lightgrey;'>O</span></strong></b>"
		}
		for (var s = 0; s < this.ships.length; s++)
		{
			this.ships[s].add_to_board(board_data);
		}

		var s = "<br><br>"
		for (var y = 0; y < this.side_length*3; y++)
		{
			for (var x = 0; x < this.side_length*3; x++)
			{
				var y_n = Math.floor(y/3);
				var x_n = Math.floor(x/3);
				var glyph = board_data[x_n][y_n];
				if (this.last_shot && x_n == this.last_shot[0] && y_n == this.last_shot[1])
				{
					glyph = "<span style='background-color: lightgrey;'>" + glyph + "</span>";
				}
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

class USNBattleshipBoard extends BattleshipBoard
{
	constructor()
	{
		super();
		this.placeable_ships = 
		[
			new Ship("FLEET CARRIER", "USS ENTERPRISE", "C", 5),
			new Ship("BATTLESHIP", "USS IOWA", "B", 4),
			new Ship("GUIDED MISSILE CRUISER", "USS TICONDEROGA", "D", 3),
			new Ship("ATTACK SUBMARINE", "USS TICONDEROGA", "S", 3),
			new Ship("ESCORT FRIGATE", "USS TAYLOR", "F", 2),
		];
	}
}

class VMFBattleshipBoard extends BattleshipBoard
{
		constructor()
	{
		super();
		this.placeable_ships = 
		[
			new Ship("FLEET CARRIER", "USSRS ADMIRAL KUZNETSOV", "C", 5),
			new Ship("BATTLESHIP", "USSRS KIROV", "B", 4),
			new Ship("GUIDED MISSILE CRUISER", "USSRS VLADIVLASTOK", "D", 3),
			new Ship("ATTACK SUBMARINE", "USSRS AKULA I", "S", 3),
			new Ship("ESCORT FRIGATE", "USSRS DRUZHNYY", "F", 2),
		];
	}
}


class GameState
{
	game = null;
	constructor(game)
	{
		this.game = game;
	}
	on_enter()
	{

	}
	draw()
	{
		clear(f0);
		// Print header
		print_seperator();
		print_blank_line();
		print_line("BATTLESHIP: BALTIC WARFARE");
		print_line("RICK RODGERS 2020");
		print_blank_line();
		print_seperator();
	}
}

class SideSelectionState extends GameState
{
	handle_input(e, game)
	{
		if (game.side != "NO SELECTION" && e.key == "Enter")
		{
			game.change_state("ship_placement");
		}
		else if (e.key == "0")
		{
			game.select_side("USN");
		}
		else if (e.key == "1")
		{
			game.select_side("VMF");
		}
		game.draw();
	}
	draw(game)
	{
		GameState.prototype.draw.call(this);
		write(f0, 	"<br>SELECT A FLEET:<BR>"+
					"0: ENTERPRISE STRIKE GROUP, USN 2ND FLEET<BR>"+
					"1: ADMIRAL KUZNETSOV, VMF BALTIYSKIY FLOT<BR>"+
					"SELECTION: " + game.side + "<br>"
				);
		if (game.side != "NO SELECTION")
		{
			write(f0,"PRESS ENTER TO DEPLOY");
		}
	}
}

class ShipPlacementState extends GameState
{
	placement_index = -1;
	current_ship = null;
	constructor(game)
	{
		super(game);
	}
	computer_place_ships()
	{
		for (var i = 0; i < this.game.computer_board.placeable_ships.length; i++)
		{
			var ship = this.game.computer_board.placeable_ships[i];
			ship.r = "h";
			ship.x = i;
			ship.y = 0;
			this.game.computer_board.place_ship(ship);
		}
	}
	next_ship()
	{
		this.placement_index++;
		var ship = this.game.player_board.placeable_ships[this.placement_index];
		this.current_ship = ship;
		this.game.player_board.place_ship(ship);
	}
	on_enter()
	{
		GameState.prototype.on_enter.call(this);
		this.next_ship();
	}
	handle_input(e, game)
	{
		if (e.key == "Enter")
		{
			if (this.placement_index < this.game.player_board.placeable_ships.length - 1)
			{
				this.next_ship();
			}
			else
			{
				this.computer_place_ships();
				this.game.change_state("fight");
			}
		}
		else if (e.key == "ArrowUp")
		{
			this.current_ship.y -= 1;
		}
		else if (e.key == "ArrowDown")
		{
			this.current_ship.y += 1;
		}
		else if (e.key == "ArrowLeft")
		{
			this.current_ship.x -= 1;
		}
		else if (e.key == "ArrowRight")
		{
			this.current_ship.x += 1;
		}
		else if (e.key == "r")
		{
			if (this.current_ship.r == "h")
			{
				this.current_ship.r = "w";
			}
			else
			{
				this.current_ship.r = "h";
			}
		}
		game.draw();
	}
	draw(game)
	{
		GameState.prototype.draw.call(this);
		write(f0, 	"<span style='color:red;'><BR> ALARM. ALARM.</span>"+
					"<span style='color:orange;'><br>THIS IS NOT A DRILL! THIS IS NOT A DRILL! GENERAL QUARTERS! GENERAL QUARTERS!"+
					"<br>ALL HANDS MAN YOUR BATTLESTATIONS.</span>"+
					"<span style='color:red;'><BR> ADMIRAL, WE MUST GET THE FLEET INTO POSITION:</span>"
				);
		write(f0,"<span style='color:yellow;'><BR><BR> PLACEMENT CONTROLS:</span>");
		write(f0,"<BR> RE-POSITION: ARROW KEYS");
		write(f0,"<BR> ROTATE: R");
		write(f0,"<BR> PLACE: ENTER");
		write(f0,"<span style='color:yellow;'><BR><BR>CURRENT PLACEMENT:</span>");
		write(f0,"<BR>SHIP: " + this.current_ship.name);
		write(f0,"<BR>TYPE: " + this.current_ship.type_name);
		game.player_board.print_board();
	}
}

class FightState extends GameState
{
	current_board = null;
	on_enter()
	{
		GameState.prototype.on_enter.call(this);
		this.current_board = this.game.computer_board;
	}
	handle_input(e, game)
	{
		if (e.key == " ")
		{
			if (this.current_board == this.game.player_board)
			{
				this.current_board = this.game.computer_board;
			}
			else
			{
				this.current_board = this.game.player_board;
			}
		}
		else if (e.key == "Enter")
		{
			if (this.current_board == this.game.computer_board)
			{
				this.game.computer_board.shoot(	this.game.computer_board.current_selection[0],
												this.game.computer_board.current_selection[1]);
			}
		}
		else if (e.key == "ArrowUp")
		{
			this.current_board.move_selection_up();
		}
		else if (e.key == "ArrowDown")
		{
			this.current_board.move_selection_down();
		}
		else if (e.key == "ArrowLeft")
		{
			this.current_board.move_selection_left();
		}
		else if (e.key == "ArrowRight")
		{
			this.current_board.move_selection_right();
		}
		game.draw();
	}
	draw(game)
	{
		GameState.prototype.draw.call(this);
		write(f0,"<span style='color:yellow;'><BR><BR> WARFARE CONTROLS:</span>");
		write(f0,"<BR> MOVE AIM: ARROW KEYS");
		write(f0,"<BR> FIRE: ENTER");
		write(f0,"<BR> SWITCH BOARDS: SPACE<BR>");
		if (this.current_board == this.game.player_board)
		{
			write(f0,"<BR> CURRENT VIEWPORT: FRIENDLY FORCES");
		}
		else
		{
			write(f0,"<BR> CURRENT VIEWPORT: <span style='color:red;'>HOSTILE FORCES</span>");
		}
		this.current_board.print_board();
	}
}

class BattleshipExtension 
{
	old_terminal_buffer = null;
	side = "NO SELECTION";
	player_board = null;
	computer_board = null;
	current_state = "side_selection";
	s_game_instance = null;
	states = null;
	constructor()
	{
		this.states =
		{
		"side_selection" : new SideSelectionState(this),
		"ship_placement" : new ShipPlacementState(this),
		"fight" : new FightState(this),
		};
		// Cache and clear the terminal
		this.old_terminal_buffer = read(f0);
		//BattleshipExtension.player_board.place_ship("c", 2, 2);
		//var ship = new Ship();
		//ship.init();
		//var ship2 = new Ship();
		//ship2.init();
		//ship2.x = 3;
		//ship2.y = 4;
		//this.player_board.place_ship(ship);
		//this.player_board.place_ship(ship2);
		//this.player_board.print_board();
		this.draw();
	}
	change_state(new_state_key)
	{
		this.current_state = new_state_key;
		this.states[this.current_state].on_enter();
	}
	select_side(side)
	{
		this.side = side;
		if (side == "USN")
		{
			this.player_board = new USNBattleshipBoard();
			this.computer_board = new VMFBattleshipBoard();
		}
		else if (side == "VMF")
		{
			this.player_board = new VMFBattleshipBoard();
			this.computer_board = new USNBattleshipBoard();
		}
		else
		{
			this.player_board = null;
			this.computer_board = null;
			side = "NO SELECTION";
		}
	}
	static s_handle_input(e)
	{
		BattleshipExtension.s_game_instance.handle_input(e);
	}
	handle_input(e)
	{
		this.states[this.current_state].handle_input(e, this)
		if (false)
		{
			if (e.key == "Escape")
			{
				unregister_input_handler();
				write(f0, this.old_terminal_buffer, true);
				pos_end_app();
				return;
			}
			else if (e.key == "ArrowUp")
			{
				this.player_board.move_selection_up();
				this.draw();
			}
			else if (e.key == "ArrowDown")
			{
				this.player_board.move_selection_down();
				this.draw();
			}
			else if (e.key == "ArrowLeft")
			{
				this.player_board.move_selection_left();
				this.draw();
			}
			else if (e.key == "ArrowRight")
			{
				this.player_board.move_selection_right();
				this.draw();
			}
		}
	}
	draw()
	{
		this.states[this.current_state].draw(this)
	}
	static battleship(args)
	{
		pos_start_app(null);
		
		BattleshipExtension.s_game_instance = new BattleshipExtension();
		register_input_handler(BattleshipExtension.s_handle_input);
	}
	load()
	{
		add_function_file("/bin/battleship", BattleshipExtension.battleship);
	}
}
add_extension(new BattleshipExtension());
