let coordinates = {}

$(document).ready(function () {
    get_coordinates();
    //1.- Agregar a la función que servirá para mostrar las flechas
    render_elements();
})

function get_coordinates() {
    let searchParams = new URLSearchParams(window.location.search)
    if (searchParams.has('source') && searchParams.has('destination')) {
        let source = searchParams.get('source')
        let destination = searchParams.get('destination')
        coordinates.source_lat = source.split(";")[0]
        coordinates.source_lon = source.split(";")[1]
        coordinates.destination_lat = destination.split(";")[0]
        coordinates.destination_lon = destination.split(";")[1]
    } else {
        alert("¡Coordenadas no seleccionadas!")
        window.history.back();
    }
}

//2.-Crear la función para mostrar flechas
function render_elements() {
    //3.-Crear el ajax para la solicitud a la API de mapbox directions concatenando los parametros y el token de acceso
    $.ajax({
        url: `https://api.mapbox.com/directions/v5/mapbox/driving/${coordinates.source_lon}%2C${coordinates.source_lat}%3B${coordinates.destination_lon}%2C${coordinates.destination_lat}?alternatives=true&geometries=polyline&steps=true&access_token=pk.eyJ1IjoiYXBvb3J2ZWxvdXMiLCJhIjoiY2ttZnlyMDgzMzlwNTJ4a240cmEzcG0xNyJ9.-nSyL0Gy2nifDibXJg4fTA`,
        type: "get",
        //Recordar que el response vendrá en formato JSON como venía en la diapositiva
        success: function (response) {
            //Guardar las imagenes
            let images = {
                "turn_right": "ar_right.png",
                "turn_left": "ar_left.png",
                "slight_right": "ar_slight_right.png",
                "slight_left": "ar_slight_left.png",
                "straight": "ar_straight.png"
            }
            //Guardar los pasos
            let steps = response.routes[0].legs[0].steps
            //Recorrer la matriz de pasos
            for (let i = 0; i < steps.length; i++) {
                //Variables para la imagen, la distancia y la instrucción
                let image;
                let distance = steps[i].distance
                let instruction = steps[i].maneuver.instruction
                //Si la instrucción incluye un giro a la derecha
                if (instruction.includes("Turn right")) {
                    //A la variable de imagen asignarle la flecha derecha
                    image = "turn_right"
                } else if (instruction.includes("Turn left")) {
                    image = "turn_left"
                }
                //Si i mayor que 0, osea si el ciclo ya no esta en su primer pasada
                if (i > 0) {
                    //Agregamos a la escena....
                    $("#scene_container").append(
                        //Una entidad con la imagen de la flecha que le toca dentro
                           //Y un texto que muestre la instrucción y la distancia
                        `
                            <a-entity gps-entity-place="latitude: ${steps[i].maneuver.location[1]}; longitude: ${steps[i].maneuver.location[0]};">
                                <a-image 
                                    name="${instruction}"
                                    src="./assets/${images[image]}"
                                    look-at="#step_${i - 1}"
                                    scale="5 5 5"
                                    id="step_${i}"
                                    position="0 0 0"
                                >
                                </a-image>
                                <a-entity>
                                    <a-text height="50" value="${instruction} (${distance}m)"></a-text>
                                </a-entity>
                            </a-entity>
                        `
                    )
                    //De lo contrario si es su primer pasada del ciclo, mostramos la imagen de comienzo
                } else {
                    $("#scene_container").append(
                        `
                            <a-entity gps-entity-place="latitude: ${steps[i].maneuver.location[1]}; longitude: ${steps[i].maneuver.location[0]};">
                                <a-image 
                                    name="${instruction}"
                                    src="./assets/ar_start.png"
                                    look-at="#step_${i + 1}"
                                    scale="5 5 5"
                                    id="step_${i}"
                                    position="0 0 0"
                                >
                                </a-image>
                                <a-entity>
                                    <a-text height="50" value="${instruction} (${distance}m)"></a-text>
                                </a-entity>
                            </a-entity>
                        `
                    )
                }
            }
        }
    })
}
