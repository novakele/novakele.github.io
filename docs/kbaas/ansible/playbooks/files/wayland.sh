export XDG_RUNTIME_DIR=/var/lib
export WAYLAND_DISPLAY=wayland-1

function ,screenshot() {
    local running_command="${@}"
    local software="${running_command%% *}"
    local outputfile="${software}_$(date +'%Y-%m-%d_%H-%M-%S').png"
    termshot -c -C 120 --no-decoration --no-shadow -s -f "${outputfile}" "${running_command}"
    wl-copy < "${outputfile}"
}

function ,screenshot_logs() {
    local running_command="${@}"
    local software="${running_command%% *}"
    local outputfile="${software}_$(date +'%Y-%m-%d_%H-%M-%S').png"
    termshot -C 120 --no-decoration --no-shadow -s -f "${outputfile}" -- "${running_command}"
    wl-copy < "${outputfile}"
}
