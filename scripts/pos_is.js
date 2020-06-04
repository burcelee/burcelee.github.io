/* 
	POS INPUT SYSTEM
*/

var key_input_f;

function is_init() {
	//window.addEventListener('keydown', is_handle_key_input);
	$(document).keydown(is_handle_key_input);
}

function is_bind_key_input(f) {
	key_input_f = f;
}

function is_handle_key_input(e) {
	key_input_f(e);
}
