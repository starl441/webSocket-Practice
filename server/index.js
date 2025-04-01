const http = require('http')
const {WebSocketServer}=require('ws')
const url=require('url')
const uuidv4=require('uuid').v4


const server=http.createServer()
const wsServer=new WebSocketServer({server})


const port=8000

const connections={}
const users={}


function broadCast(){
Object.keys(connections).forEach(uuid=>{
   let connection=connections[uuid]
    let message=JSON.stringify(users)
    connection.send(message)
})
}

function handleMessage(bytes,uuid){
    let message=JSON.parse(bytes.toString())
    users[uuid].state=message
    broadCast(users)
}

function handleClose(uuid){

delete connections[uuid]
delete users[uuid]
broadCast()

}
wsServer.on('connection',(connection,request)=>{
    let {username}=url.parse(request.url,true).query
    const uuid=uuidv4()

    connections[uuid]=connection
    users[uuid]={
        username,
        state:{}
    }
//console.log(connection)
//when you hit send this happens
    connection.on("message",message=> handleMessage(message,uuid))
    connection.on("close",()=> handleClose(uuid))
})

server.listen(port,()=>{
    console.log('Server connection established:',port)
})