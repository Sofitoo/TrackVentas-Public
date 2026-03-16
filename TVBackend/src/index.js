import app from "./app.js"

//import './db/conecction.js' <- solo era prueba

app.listen(app.get('port'))

console.log('server on port', app.get('port'))