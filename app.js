const express = require('express');
const app = express();
const rotaClientes = require('./rotas/clientes');
const rotaProdutos = require('./rotas/produtos');


app.use('/clientes', rotaClientes);
app.use('/produtos', rotaProdutos);

app.use((req, res, next) =>{
    return res.status(200).send({
        mensagem: 'Funcionou!'
    });
})

module.exports = app;