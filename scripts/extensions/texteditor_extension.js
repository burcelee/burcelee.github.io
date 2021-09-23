

class TextEditorExtension
{
	app_id = -1;

	static s_handle_input(e)
	{
		BattleshipGame.s_game_instance.handle_input(e);
	}

	static start()
	{
		TextEditorExtension.app_id = pos_start_app(null);
		register_input_handler(TextEditorExtension.terminal_input_handler);
	}

	load()
	{
		add_function_file("/bin/textedit", TextEditorExtension.start);
	}
}

add_extension(new TextEditorExtension());
