const express = require('express');
const app = express();
const rotaClientes = require('./rotas/clientes');
const rotaProdutos = require('./rotas/produtos');
const rotaPedidos = require('./rotas/pedidos');


app.use('/clientes', rotaClientes);
app.use('/produtos', rotaProdutos);
app.use('/pedidos', rotaPedidos);

app.use((req, res, next) =>{
    return res.status(200).send({
        mensagem: 'Funcionou!'
    });
})

module.exports = app;