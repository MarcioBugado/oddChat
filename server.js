const express = require('express')
const path = require('path')

const app = express()
const server = require('http').createServer(app)
const io = require('socket.io')(server)

app.use(express.static(path.join(__dirname, 'public')))
app.set('views', path.join(__dirname,'public'))
app.engine('html', require('ejs').renderFile)
app.set('view engine', 'html')

app.use('/', (req, res) =>{
    res.render('index.html')
})

let messages = [];
let users = [];

io.on('connection', socket =>{
    console.log(`Socket conectado: ${socket.id}`)
    
    let logged = io.engine.clientsCount;
    
    socket.broadcast.emit('updateUsers',logged )
    
    socket.emit('previousMessages', messages, logged)
    

    socket.on('sendMessage', data =>{
        
        console.log(data)
        messages.push(data)
        socket.broadcast.emit('receivedMessage', data)
        console.log(io.engine.clientsCount)
    })

    socket.on('register', user =>{
        if(users.indexOf(user) == -1){
            let logged = io.engine.clientsCount;
            users.push(user)
            console.log(user + ' Logado' )
            console.log(users)
            socket.broadcast.emit('newUser', user, logged)
            socket.emit('validUser', user)
            console.log(logged)
        }else{
            socket.emit('invalidUser')
            console.log(user + 'já logado' )
        }
    })

    socket.on('disconnect', desconectado =>{
        let logged = io.engine.clientsCount;
        socket.broadcast.emit('updateUsers',logged)
        socket.broadcast.emit('disconnected')
        console.log('Disconectado!')
    })

})




server.listen(process.env.PORT || 3000, ()=> console.log('Running'))