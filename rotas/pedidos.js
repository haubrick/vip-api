const express = require('express');
const router = express.Router();
const mysql = require('../mysql').pool;

var bodyParser = require('body-parser');
var jsonParser = bodyParser.json()

router.get('/', (req, res, next) => {
    
    mysql.getConnection((error, conn) => {
        if (error){return res.status(500).send({error: error}) }
        conn.query(
            'SELECT * FROM pedidos;',
            (error, resultado, fields) => {
                if (error){return res.status(500).send({error: error}) }
                return res.status(200).send({response: resultado})
            }
        )
    })
});

router.get('/:id_pedido', (req, res, next) => {
    
    mysql.getConnection((error, conn) => {
        if (error){return res.status(500).send({error: error}) }
        conn.query(
            'SELECT * FROM pedidos WHERE id_pedido = ?',
            [req.params.id_pedido],
            (error, resultado, fields) => {
                if (error){return res.status(500).send({error: error}) }
                return res.status(200).send({response: resultado})
            }
        )
    })
});


router.post('/', jsonParser, (req, res, next) => {
    console.log(req.body);
    mysql.getConnection((error, conn) => {
        if (error){return res.status(500).send({error: error}) }
        conn.query(
            'INSERT INTO pedidos (data_pedido, obs, forma_pagamento, id_cliente) VALUES (?, ?, ?, ?)',
            [req.body.data_pedido, req.body.obs, req.body.forma_pagamento, req.body.id_cliente],
            (error, resultado, fields) => {
                conn.release();
                if (error){return res.status(500).send({error: error}); }
                res.status(201).send({
                    mensagem: 'Pedido Inserido com sucesso',
                    id_pedido: resultado.insertId
                });
            }
        )
    })
});

router.put('/', jsonParser, (req, res, next) => {
    console.log(req.body);
    mysql.getConnection((error, conn) => {
        if (error){return res.status(500).send({error: error}) }
        conn.query(
            `UPDATE pedidos
                SET nome = ?,
                    cor = ?,
                    tamanho = ?,
                    valor = ?
                WHERE id_produto = ?    `,
            [req.body.nome, 
             req.body.cor, 
             req.body.tamanho, 
             req.body.valor, 
             req.body.id_produto],
            (error, resultado, fields) => {
                conn.release();
                if (error){return res.status(500).send({error: error}); }
                res.status(202).send({
                    mensagem: 'Pedido Atualizado com sucesso',
                });
            }
        )
    })
});

router.delete('/', jsonParser, (req, res, next) => {
    console.log(req.body);
    mysql.getConnection((error, conn) => {
        if (error){return res.status(500).send({error: error}) }
        conn.query(
            'DELETE FROM pedidos WHERE id_pedido = ?',
            [req.body.id_cliente],
            (error, resultado, fields) => {
                conn.release();
                if (error){return res.status(500).send({error: error}); }
                res.status(202).send({
                    mensagem: 'Pedido Removido com sucesso',
                });
            }
        )
    })
});

module.exports = router;
