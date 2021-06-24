const express = require('express');
const router = express.Router();

router.get('/', (req, res, next) => {
    res.status(200).send({
        mensagem: 'Usando get na rota de clientes'
    })
});

router.post('/', (req, res, next) => {
    res.status(201).send({
        mensagem: 'Usando post na rota de clientes'
    })
});

router.put('/', (req, res, next) => {
    res.status(201).send({
        mensagem: 'Usando put na rota de clientes'
    })
});

router.delete('/', (req, res, next) => {
    res.status(201).send({
        mensagem: 'Usando delete na rota de clientes'
    })
});

module.exports = router;
