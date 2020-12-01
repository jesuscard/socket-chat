const { io } = require('../server');
const { Usuarios } = require('../classes/usuarios')
const { craerMensajes } = require('../utils/utils')

const usuarios = new Usuarios();

io.on('connection', (client) => {

    client.on('entrarChat', (data, callback) => {

        if (!data.nombre || !data.sala ) {
            return callback({
                error: true,
                mensaje: 'El nombre/sala es necesar˙io'
            });
        }

        client.join(data.sala);

        usuarios.agregarPersona(client.id, data.nombre, data.sala);

        client.broadcast.to(data.sala).emit('listaPersonas', usuarios.getPersonasPorSala(data.sala) );

        callback(usuarios.getPersonasPorSala(data.sala));

    });
    

    client.broadcast.on('crearMensaje',(data) =>{
        let persona = usuarios.getPersona( client.id ) 
        let mensaje = craerMensajes(persona.nombre , data.mensaje)

        client.broadcast.emit('crearMensaje', mensaje)
    });


    client.on('disconnect',()=>{
        let personaBorrado = usuarios.borrarPersona( client.id )
        
        client.broadcast.to(personaBorrado.sala).emit('crearMensaje',
                             craerMensajes('Administrador',`${personaBorrado.nombre} salió` ))
        client.broadcast.to(personaBorrado.sala).emit('listaPersonas', usuarios.getPersonasPorSala(personaBorrado.sala) );
    })

    // Mensajes privados
    client.on('mensajePrivado', data => {

        let persona = usuarios.getPersona(client.id);
        client.broadcast.to(data.para).emit('mensajePrivado', craerMensajes(persona.nombre, data.mensaje));

    });

});