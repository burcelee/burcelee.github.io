/* 
	POS INPUT SYSTEM
*/

var key_input_f;

var input_handlers = [];

function initialize_input() {
	//window.addEventListener('keydown', is_handle_key_input);
	$(document).keydown(is_handle_key_input);
}

function register_input_handler(f) 
{
	input_handlers.push(f);
	//key_input_f = f;
}

function unregister_input_handler(f)
{
	input_handlers.pop();
}


function is_handle_key_input(e) {
	f = input_handlers[input_handlers.length -1];
	f(e);
}
