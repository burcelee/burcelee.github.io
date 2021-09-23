dev_mode = false;

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
	get_occupied_positions()
	{
		var positions = []
		for (var i =0; i < this.length; i++)
		{
			if (this.r == "w")
			{	
				positions.push([this.x+i, this.y]);
			}
			else
			{
				positions.push([this.x, this.y+i]);
			}
		}
		return positions;
	}
	shoot(x, y) // update to use get_occupied_positions
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
	is_dead(x,y)
	{
		for (var i = 0; i < this.hits.length; i++)
		{
			if (!this.hits[i])
			{
				return false;
			}
		}
		return true;
	}
	add_to_board(board, board_data, is_player)
	{
		for (var i = 0; i < this.length; i++)
		{
			if (!this.hits[i] && !is_player)
			{
				// In Dev mode, no fog of war.
				if (!dev_mode)
				{
					continue;
				}
			}
			var raw_glyph = is_player ? this.glyph : "X";
			var glyph = "<span style='color:lightgray;'>" + raw_glyph  + "</span>";
			if (this.hits[i])
			{
				glyph = "<span style='color:red;'>" + raw_glyph  + "</span>";
			}
			if (this.r == "w")
			{
				var x = this.x + i;
				if (x < board.side_length)
				{
					board_data[x][this.y] = glyph;
				}
			}
			else if (this.r == "h")
			{
				var y = this.y + i;
				if (y < board.side_length)
				{
					board_data[this.x][this.y+i] = glyph;
				}
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
	status = "ALL CLEAR";
	is_player = false;
	num_missile = 0;
	num_ships_destroyed = 0;
	constructor(is_player)
	{
		this.is_player = is_player;
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
	check_valid()
	{
		var occupied_places = new Set();
		for (var i = 0; i < this.ships.length; i++)
		{
			var ship_places = this.ships[i].get_occupied_positions();
			for (var j = 0; j < ship_places.length; j++)
			{
				var pos = ship_places[j];
				if (pos[0] >= this.side_length || pos[1] >= this.side_length)
				{
					return false;
				}
				var hash = pos[1]*this.side_length + pos[0];
				if (occupied_places.has(hash))
				{
					return false;
				}
				occupied_places.add(hash);
			}
		}
		return true;
	}
	place_ship(ship)
	{
		this.ships.push(ship);
	}
	shoot(x, y)
	{
		for (var i = 0; i < this.shots.length; i++)
		{
			var shot = this.shots[i];
			if (shot[0] == x && shot[1] == y)
			{
				// SHOT IS A REPEAT
				return false;
			}
		}
		this.num_missile++;
		var shot = [x,y];
		this.shots.push(shot);
		this.last_shot = shot;
		for (var i = 0; i < this.ships.length; i++)
		{
			if (this.ships[i].shoot(x,y))
			{
				var is_destroyed = this.ships[i].is_dead();
				if (!is_destroyed)
				{
					if (this.is_player)
					{
						this.status =  "<span style='color:red;'>INCOMING........." + this.ships[i].name + " HAS BEEN HIT!</span>";
					}
					else
					{
						this.status = "<span style='color:red;'>FOXTROT-" + this.num_missile + " AWAY.........HIT!</span>";
					}
				}
				else
				{
					this.num_ships_destroyed++;
					if (this.is_player)
					{
						this.status =  "<span style='color:red;'>INCOMING........." + this.ships[i].name + " HAS BEEN COMPLETELY DESTROYED!</span>";
					}
					else
					{
						this.status = "<span style='color:red;'>FOXTROT-" + this.num_missile + " AWAY.........ENEMY SHIP DESTROYED!</span>";
					}
				}
				return true;
			}
		}
		if (this.is_player)
		{
			this.status = "<span style='color:yellow;'>INCOMING......... MISS!</span>"
		}
		else
		{
			this.status = "<span style='color:yellow;'>FOXTROT-" + this.num_missile + " AWAY.........NEGATIVE IMPACT!</span>";
		}
		return false;
	}
	has_lost()
	{
		return this.num_ships_destroyed == this.ships.length;
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
			this.ships[s].add_to_board(this, board_data, this.is_player);
		}

		var s = "<BR>"
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
	constructor(is_player)
	{
		super(is_player);
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
		constructor(is_player)
	{
		super(is_player);
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
	failed_placement = false;
	constructor(game)
	{
		super(game);
	}
	computer_place_ships()
	{
		for (var shipIdx = 0; shipIdx < this.game.computer_board.placeable_ships.length; shipIdx++)
		{
			var placed = false;
			var ship = this.game.computer_board.placeable_ships[shipIdx];
			this.game.computer_board.place_ship(ship);
			const orientations = ["w","h"];
			var possible_locations = [];
			var sideLength = this.game.player_board.side_length;
			for (var i = 0; i < sideLength*sideLength; i++)
			{
				possible_locations.push(i);
			}
			while (placed == false)
			{
				var idx = possible_locations[Math.floor(Math.random() * possible_locations.length)];
				var x = idx % sideLength;
				var y = Math.floor(idx / sideLength);
				ship.r = orientations[Math.floor(Math.random() *orientations.length)];
				ship.x = x;
				ship.y = y;
				if (this.game.computer_board.check_valid())
				{
					placed = true;
				}
				else
				{
					possible_locations.splice(idx, 1);
				}
			}
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
				if(this.game.player_board.check_valid())
				{
					this.next_ship();
					this.failed_placement = false;
				}
				else
				{
					this.failed_placement = true;
				}
			}
			else
			{
				this.computer_place_ships();
				this.game.change_state("fight");
			}
		}
		else if (e.key == "ArrowUp")
		{	
			this.current_ship.y = 
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
		this.current_ship.x = Math.min(Math.max(0, this.current_ship.x),this.game.player_board.side_length-1);
		this.current_ship.y = Math.min(Math.max(0, this.current_ship.y),this.game.player_board.side_length-1);
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
		if (this.failed_placement)
		{
			write(f0,"<BR><BR><span style='color:red;'>INVALID PLACEMENT</span>");
		}
		else
		{
			write(f0,"<BR><BR>");
		}
		game.player_board.print_board();
	}
}

class FightState extends GameState
{
	current_board = null;
	game_end_status = null;
	// Expected values for a shot at each point.
	computer_moves = null;
	on_enter()
	{
		GameState.prototype.on_enter.call(this);
		this.current_board = this.game.computer_board;
		var sideLength = this.game.player_board.side_length;
		this.computer_moves = [];
		for (var i = 0; i < sideLength*sideLength; i++)
		{
			// All positions have zero weighting initially. 
			this.computer_moves.push(0);
		}
	}

	/*
		Note On AI

		There are currently two components to the game AI: place and shoot.

		Placement:
		Placement is done entirely randomly and judged entirely based on 
		validity and not strategy.

		Future work could include cycling between a few placement strategies.
		These strategies might include:
		
		- Placing smaller ships in rows such that they appear to be single 
		larger ships.

		- Grouping ships in clumps. Possibly clump and one or two distant ships

		- Maximizing distance between ships.

		The problem is that each of these strategies gives the opponent a lot of
		solid information once they identify which strategy is being used. For
		that reason, random placment and a better shooting AI seems like the
		best way forward.

		Shooting:
		Shooting is currently done by keeping track of the expected value of 
		a shot at each point on the board. All values are initially 0. Points
		that have already been tried have an arbitrarily low value of -100.
		Points that are adjacent to a miss are lessened in value, and points
		that are adjacent to a hit are increased in value. This means the AI
		will choose to always fire adjacent to previous hits until it has 
		exhausted itself of adjacent points and it will prefer multi-adjacents
		over points that are only adjacent to a single hit.

		This strategy looks relatively good, but has some drawbacks:

		- Overkill: The AI doesn't have any way of decrementing the value of 
		adjacent squares once the nearby hits have resulted in a sinking. This
		means the AI will tend to keep shooting near an already destroyed ship
		while it exhausts all the remaining adjacent squares. A possible 
		solution would be to return whether a ship was destroyed from shoot, and
		then use that information to try to predict what squares the destroyed
		ship inhabited (this wouldn't be 100% accurate) and try to decrement the
		squares adjacent to them accordingly. Another solution would do the same
		but also somehow link each increase in weighting to the hit that 
		produced it. That way, we could very accurately remove the weightings 
		for destroyed ships.

		- Ship Shape Context: It doesn't consider the shape of ships. If two 
		hits are found adjacent to eachother, squares along the connecting axis
		of those two hits are way above average value and points along the 
		other axis are probably actually below the value of random points. 
		Currently, we only look at direct adjacency and have no sense of this.
		
		Other considerations:

		- Non-uniform initial scores. For instance, points on edges are lower
		value than interior points. Attempting to build some kind of ruleset for
		this *could* cause the AI to be more exploitable, however.
	*/
	computer_shoot()
	{
		var best_score = 0;
		var best_moves = [];
		for (var i = 0; i < this.computer_moves.length; i++)
		{
			if (this.computer_moves[i] > best_score)
			{
				// New best, throwout old best moves.
				best_moves = [];
				best_moves.push(i);
				best_score = this.computer_moves[i];
			}
			else if (this.computer_moves[i] == best_score)
			{
				best_moves.push(i);
			}
		}
		if (best_moves.length == 0)
			// Something went wrong. Can't shoot.
			return;

		// Select at random from best moves
		var move = best_moves[Math.floor(Math.random() * best_moves.length)];
		this.computer_moves[move] = -100; // arbitrarily low.
		var sideLength = this.game.player_board.side_length;

		var x = move % sideLength;
		var y = Math.floor(move / sideLength);
		var hit = this.game.player_board.shoot(x, y);
		var adjacentDelta = -1;
		if (hit)
		{
			// Mark adjacent moves as more desirable
			adjacentDelta = 1;
		}
		//var adjacents = [move-1, move+1,move-sideLength,move+sideLength];
		var adjacents = [[x+1,y],[x,y+1],[x-1,y],[x,y-1]];
		for (var i = 0; i < adjacents.length; i++)
		{
			var adjX = adjacents[i][0];
			var adjY = adjacents[i][1];
			var adjIdx = (adjY * sideLength) + adjX;
			// Make sure this is in-bounds
			if (adjX >= 0 && adjX < sideLength && adjY >= 0 && adjY < sideLength)
			{
				this.computer_moves[adjIdx] = this.computer_moves[adjIdx] + adjacentDelta;
			}
		}
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
				this.computer_shoot();
				
				// UX: Switch back to player board so they can see computer shot.
				if (!dev_mode)
				{
					this.current_board = this.game.player_board;
				}

				if (this.game.computer_board.has_lost())
				{
					if (this.game.player_board.has_lost())
					{
						this.game_end_status = "DRAW";
					}
					else
					{
						this.game_end_status = "PLAYER VICTORIOUS.";
					}
				}
				else if (this.game.player_board.has_lost())
				{
					this.game_end_status = "COMPUTER VICTORIOUS";
				}
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
		if (this.game_end_status != null)
		{
			write(f0,"<BR>THE BATTLE HAS ENDED: " + this.game_end_status);
			write(f0,"<BR>PRESS ESCAPE TO EXIT");
		}
		else
		{
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
			write(f0,"<BR>STATUS: " + this.current_board.status);
		}
		if (dev_mode)
		{
			this.game.player_board.print_board();
			this.game.computer_board.print_board();
		}
		else
		{
			this.current_board.print_board();
		}
	}
}

class BattleshipGame 
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
		this.draw();
	}
	change_state(new_state_key)
	{
		this.current_state = new_state_key;
		this.states[this.current_state].on_enter();	
		this.draw();
	}

	select_side(side)
	{
		this.side = side;
		if (side == "USN")
		{
			this.player_board = new USNBattleshipBoard(true);
			this.computer_board = new VMFBattleshipBoard(false);
		}
		else if (side == "VMF")
		{
			this.player_board = new VMFBattleshipBoard(true);
			this.computer_board = new USNBattleshipBoard(false);
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
		BattleshipGame.s_game_instance.handle_input(e);
	}
	handle_input(e)
	{
		if (e.key == "Escape")
		{
			unregister_input_handler();
			write(f0, this.old_terminal_buffer, true);
			pos_end_app();
			return;
		}
		else if (e.key == "g")
		{
			dev_mode = !dev_mode;
		}
		this.states[this.current_state].handle_input(e, this)
	}
	draw()
	{
		this.states[this.current_state].draw(this)
	}
	static start(args)
	{
		pos_start_app(null);
		
		BattleshipGame.s_game_instance = new BattleshipGame();
		register_input_handler(BattleshipGame.s_handle_input);
	}

}

class BattleshipExtension
{
	load()
	{
		add_function_file("/bin/battleship", BattleshipGame.start);
	}
}

add_extension(new BattleshipExtension());
