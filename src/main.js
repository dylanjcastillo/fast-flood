import {
    grids
} from "./grids.js";

var use_random_grids = false;
var is_debug = false;
var is_active = false;
var is_game_finished = false;
var tries = 0;
var max_tries = 3;
var grid_width = 10;
var grid_height = 10;
var initial_floods = 2;
var countdown_time = 3;
var moves = 0;
var time = 0;
var best_score = {
    moves: -1,
    time: -1,
    msg_moves: "",
    msg_time: "",
    msg_color: "",
    msg_tries: "",
}
var scores = [null, null, null];

var colors_orig = ["🟥", "🟧", "🟨", "🟩", "🟦", "🟪"];
var colors_cb = ["🍎", "🎃", "🌼", "🍀", "🦋", "🍇"];

var colors = colors_orig;

var grid_element = $('#grid');
var buttons_element = $('#buttons');

const today = new Date();
const date_key = String(today.getFullYear()) + String(today.getMonth() + 1) + String(today.getDate());

var tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);
tomorrow.setHours(0, 0, 0, 0);

Math.seedrandom(date_key);
var max_moves = grids[date_key]["solution_moves"] + 1;
var max_time = 60;

function get_cookie(cname) {
    let name = cname + "=";
    let ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

if (document.cookie.split(';').some((item) => item.trim().includes(`tries=`))) {
    tries = parseInt(get_cookie("tries"), 10);
    if (tries >= max_tries && !is_debug) {
        $("#start-btn").prop("disabled", true);
        $("#start-btn").text("Come back tomorrow");
    }
}

if (is_debug) {
    function getKey(e) {
        if (e.keyCode == 38) {
            game_finished(true, 0);
        }

        if (e.keyCode == 40) {
            game_finished(false, 0);
        }
    }

    document.onkeyup = getKey;
}

$(".tab-button").on("click", function () {

    var i = parseInt($(this).attr("id").split("-")[1], 10) - 1;
    if (scores[i] !== null) {
        var text_to_copy = `Fast Flood No.${grids[date_key]["grid_num"]}\r\n🏁 → ${scores[i].msg_color}\r\n⌛ → ${scores[i].msg_time}\r\n▶️ → ${scores[i].msg_moves}\r\n🕹 → ${scores[i].msg_tries}\r\n`;
        $('#share-btn').attr("data-clipboard-text", text_to_copy);
    }
});

function make_array(d1, d2) {
    var arr = new Array(d1),
        i, l;
    for (i = 0, l = d2; i < l; i++) {
        arr[i] = new Array(d1);
    }
    return arr;
}

function game_finished(has_won = false, color_number = 0) {
    is_active = false;
    is_game_finished = true;

    $('#game-finished-modal').toggleClass('modal-visible');

    if (has_won) {
        var medal_time = ""
        var medal_moves = ""

        if (moves < grids[date_key]["solution_moves"]) {
            medal_moves = " 🥇";
        } else if (moves === grids[date_key]["solution_moves"]) {
            medal_moves = " 🥈";
        } else if (moves === grids[date_key]["solution_moves"] + 1) {
            medal_moves = " 🥉";
        }

        if (time <= grids[date_key]["solution_moves"] * 0.8) {
            medal_time = " 🥇";
        } else if (time <= grids[date_key]["solution_moves"] * 1.2) {
            medal_time = " 🥈";
        } else if (time <= grids[date_key]["solution_moves"] * 1.5) {
            medal_time = " 🥉";
        }

        var msg_color = colors_orig[color_number];
        var msg_time = String(time) + " seconds" + medal_time;
        var msg_moves = String(moves) + " moves" + medal_moves;

        if (tries < 2) {
            var msg_tries = String(tries) + " try";
        } else {
            var msg_tries = String(tries) + " tries";
        }

        if (best_score.moves === -1 || moves < best_score.moves) {
            best_score.moves = moves;
            best_score.time = time;
            best_score.msg_color = msg_color;
            best_score.msg_moves = msg_moves;
            best_score.msg_time = msg_time;
        } else if (best_score.moves === moves && time < best_score.time) {
            best_score.time = time;
            best_score.msg_color = msg_color;
            best_score.msg_moves = msg_moves;
            best_score.msg_time = msg_time;
        }

        scores[tries - 1] = {
            moves: moves,
            time: time,
            msg_moves: msg_moves,
            msg_time: msg_time,
            msg_color: msg_color,
            msg_tries: msg_tries,
        }
        $('#results-summary').show()
        $('#share-btn').show()

        $('#message-part-1').text("You won!")
        $('#message-part-2').html("Well done. These are your stats:");

    } else {

        var msg_score_lost = "";
        $('#results-summary').hide()
        $('#share-btn').hide()
        $('#message-part-1').text("You lost! 😢")

        if (best_score.moves != -1) {
            msg_score_lost = "<br><br>These are your stats:";
            $('#results-summary').show()
            $('#share-btn').show()
        }

        if (tries < max_tries) {
            var msg_tries = max_tries - tries === 1 ? "1 more try." : `${max_tries - tries} more tries.`;
            $('#message-part-2').html("But you still have " + msg_tries + "<br><br>Would you like to try again?" + msg_score_lost);
        } else {
            $('#message-part-2').html("Argh! You almost had it.<br><br>Come back tomorrow for more fun." + msg_score_lost);
        }
    }

    for (var i = 0; i < max_tries; i++) {
        if (scores[i] !== null) {
            for (var j = 0; j < i; j++) {
                $('#button-' + (j + 1)).removeClass('selected');
                $('#results-' + (j + 1)).css("display", "none");
            }
            $('#button-' + (i + 1)).prop("disabled", false);
            $('#button-' + (i + 1)).addClass(' selected');
            $('#results-' + (i + 1)).css("display", "block");
            $(`#final-color-${i + 1}`).text(scores[i].msg_color);
            $(`#final-time-${i + 1}`).text(scores[i].msg_time);
            $(`#final-moves-${i + 1}`).text(scores[i].msg_moves);
            $(`#final-tries-${i + 1}`).text(scores[i].msg_tries);

            var text_to_copy = `Fast Flood No.${grids[date_key]["grid_num"]}\r\n🏁 → ${scores[i].msg_color}\r\n⌛ → ${scores[i].msg_time}\r\n▶️ → ${scores[i].msg_moves}\r\n🕹 → ${scores[i].msg_tries}\r\n`;
            $('#share-btn').attr("data-clipboard-text", text_to_copy);
        } else {
            $('#button-' + (i + 1)).prop("disabled", true);
        }
    }


    if (tries >= max_tries) {
        $('#restart-btn').hide();
    }

}

class Flood {
    constructor(width, height) {
        this.grid = make_array(width, height);
        this.original_grid = make_array(width, height);
        this.width = width;
        this.height = height;
        this.matched = [];
        this.current_color = 0;
    }

    help_flood() {
        for (var i = 0; i < initial_floods; i++) {
            var x = Math.floor(Math.random() * this.width);
            var y = Math.floor(Math.random() * this.height);

            var old_color = this.grid[x][y].old_color;
            var new_color = old_color + 1;

            if (new_color === 6) {
                new_color = 0;
            }

            this.flood_fill(old_color, new_color, x, y, true);
        }
    }

    flood_fill(old_color, new_color, x, y, helper = false) {
        if (old_color === new_color || this.grid[x][y].color !== old_color) {
            return;
        }

        this.grid[x][y].old_color = old_color;
        this.grid[x][y].color = new_color;

        if (helper) {
            this.original_grid[x][y].old_color = old_color;
            this.original_grid[x][y].color = new_color;
        }

        if (this.matched.indexOf(this.grid[x][y]) === -1) {
            this.matched.push(this.grid[x][y]);
        }

        if (x > 0) {
            this.flood_fill(old_color, new_color, x - 1, y);
        }

        if (x < this.width - 1) {
            this.flood_fill(old_color, new_color, x + 1, y);
        }

        if (y > 0) {
            this.flood_fill(old_color, new_color, x, y - 1);
        }

        if (y < this.height - 1) {
            this.flood_fill(old_color, new_color, x, y + 1);
        }
    }

    start_flow() {

        this.matched.sort(function (a, b) {
            var a_distance = Math.sqrt(a.x + b.y);
            var b_distance = Math.sqrt(b.x + b.y);
            return a_distance - b_distance;
        });

        for (var i = 0; i < this.matched.length; i++) {
            var block = this.matched[i];

            var cell = $("#cell_" + String(block.x) + String(block.y));
            var color = colors[this.matched[i].color];

            cell.text(color);
        }

    }

    click_color(button) {
        var new_color = parseInt(button.attr("id").replace("button_", ""));

        if (new_color === this.current_color || !is_active) {
            return;
        }

        moves++;
        $('#moves-value').text(String(moves) + " / " + String(max_moves));

        var old_color = this.grid[0][0].color;

        if (old_color !== new_color) {
            this.current_color = new_color;
            this.matched = [];

            this.flood_fill(old_color, new_color, 0, 0);

            if (this.matched.length > 0) {
                this.start_flow();
            }
        }

        var colors_in_grid = new Set();
        for (var x = 0; x < grid_width; x++) {
            for (var y = 0; y < grid_height; y++) {
                colors_in_grid.add(this.grid[x][y].color);
            }
        }

        if (colors_in_grid.size === 1) {
            is_active = false
            is_game_finished = true

            setTimeout(function () {
                game_finished(true, colors_in_grid.values().next().value);
            }, 500);
            return;
        }

        if (moves === max_moves) {
            game_finished(false);
        }
    }

}

class Cell {
    constructor(x, y, old_color, color) {
        this.x = x;
        this.y = y;
        this.old_color = old_color;
        this.color = color;
    }
}


$("#open-modal-btn").trigger("click");
$("#start-btn").on("click", function () {
    var is_cb_checked = $('#cb').prop("checked");

    if (is_cb_checked) {
        colors = colors_cb;
    }

    $(this).prop("disabled", true);
    var update_counter;

    tries++;
    document.cookie = "tries=" + tries + ";expires=" + tomorrow.toUTCString() + ";Secure;path=/";
    window.scrollTo(0, document.body.scrollHeight);

    $('#time-value').text(String(time) + " / " + String(max_time));
    $('#moves-value').text(String(moves) + " / " + String(max_moves));

    $('#countdown').append('<svg> <circle r="60" cx="160" cy="160"></circle></svg>')
    $('.modal-window').addClass('modal-hidden');
    play_game(true);

    update_counter = setInterval(function () {
        var value = parseInt($('#countdown-value').text(), 10);
        if (value > 1) {
            value--;
            $('#countdown-value').text(String(value));
        } else {
            $('#countdown-value').text("Go!");
            $('#countdown-value').addClass("hidden");
            setTimeout(function () {
                $('#countdown').hide();
                $('#countdown-background').hide();
                is_active = true;
                $('#start-btn').prop("disabled", false);
            }, 500);
            clearInterval(update_counter);
        }
    }, 1000);
});

$("#restart-btn").on("click", function () {
    $(this).prop("disabled", true);
    var update_counter;

    tries++;
    document.cookie = "tries=" + tries + ";expires=" + tomorrow.toUTCString() + ";Secure;path=/";
    is_active = false;
    is_game_finished = false;
    window.scrollTo(0, document.body.scrollHeight);

    $('#game-finished-modal').toggleClass('modal-visible');
    $('#countdown-background').show();

    moves = 0;
    time = 0;
    $('#time-value').text(String(time) + " / " + String(max_time));
    $('#moves-value').text(String(moves) + " / " + String(max_moves));

    play_game(false);

    $('#countdown').show();
    $('#countdown-value').removeClass("hidden");
    $('#countdown-value').text(String(countdown_time));

    update_counter = setInterval(function () {
        var value = parseInt($('#countdown-value').text(), 10);
        if (value > 1) {
            value--;
            $('#countdown-value').text(String(value));
        } else {
            $('#countdown-value').text("Go!");
            $('#countdown-value').addClass("hidden");
            setTimeout(function () {
                $('#restart-btn').prop("disabled", false);
                $('#countdown').hide();
                $('#countdown-background').hide();
                is_active = true;
            }, 500);
            clearInterval(update_counter);
        }
    }, 1000);
});

$('#share-btn').on("click", function () {
    $('#copied-feedback').addClass('visible');

    navigator.clipboard.writeText($(this).attr("data-clipboard-text"));

    setTimeout(function () {
        $('#copied-feedback').removeClass('visible');
    }, 300);
});

var flood = new Flood(grid_width, grid_height);

function generate_grid(new_grid) {
    if (new_grid) {
        for (var x = 0; x < grid_width; x++) {
            for (var y = 0; y < grid_height; y++) {
                if (use_random_grids) {
                    var color_number = Math.floor(Math.random() * colors.length);

                } else {
                    var color_number = grids[date_key]["grid"][x][y];
                }
                var color = colors[color_number];
                var cell = new Cell(x, y, color_number, color_number)
                var cell_original = new Cell(x, y, color_number, color_number)
                flood.grid[x][y] = cell;
                flood.original_grid[x][y] = cell_original;
                grid_element.append("beforeend", "<div class='cell' id='cell_" + String(x) + String(y) + "'>" + color + "</div>");
            }
        }
    } else {
        for (var x = 0; x < grid_width; x++) {
            for (var y = 0; y < grid_height; y++) {
                var color = colors[flood.original_grid[x][y].color];
                var cell = new Cell(x, y, flood.original_grid[x][y].old_color, flood.original_grid[x][y].color)
                flood.grid[x][y] = cell;
                $("#cell_" + String(x) + String(y)).text(color);
            }
        }
    }
}

function create_buttons() {

    colors.forEach((element, index) => {
        var color = index;
        buttons_element.append("beforeend", "<button class='color-button' id='button_" + String(color) + "'>" + element + "</button>");

        var button = $('#button_' + String(color));
        button.on("click", function () {
            flood.click_color($(this), flood);
        });
    });
}

function help_flood() {
    flood.help_flood()

    for (var i = 0; i < flood.matched.length; i++) {
        var block = flood.matched[i];
        var cell = $("#cell_" + String(block.x) + String(block.y));
        var color = colors[flood.matched[i].color];
        cell.text(color);
    }

}

function play_game(new_game) {
    if (new_game) {
        generate_grid(true);
        create_buttons();
        help_flood();
        flood.current_color = flood.grid[0][0].color;

        setTimeout(function () {
            var run_timer;
            run_timer = setInterval(function () {

                if (is_game_finished) {
                    clearInterval(run_timer);
                    return;
                }

                time++;
                $('#time-value').text(String(time) + " / " + String(max_time));

                if (time === max_time) {
                    game_finished()
                    clearInterval(run_timer)
                }

            }, 1000);
        }, 4000);
    } else {
        generate_grid(false);
        flood.current_color = flood.grid[0][0].color;

        setTimeout(function () {
            var run_timer;
            run_timer = setInterval(function () {

                if (is_game_finished) {
                    clearInterval(run_timer);
                    return;
                }

                time++;
                $('#time-value').text(String(time) + " / " + String(max_time));

                if (time === max_time) {
                    game_finished()
                    clearInterval(run_timer)
                }

            }, 1000);
        }, 4000);
    }
}
