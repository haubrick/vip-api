const express = require('express');
const router = express.Router();
const mysql = require('../mysql').pool;

var bodyParser = require('body-parser');
var jsonParser = bodyParser.json()

router.get('/', (req, res, next) => {
    
    mysql.getConnection((error, conn) => {
        if (error){return res.status(500).send({error: error}) }
        conn.query(
            'SELECT * FROM produtos;',
            (error, resultado, fields) => {
                if (error){return res.status(500).send({error: error}) }
                return res.status(200).send({response: resultado})
            }
        )
    })
});

router.get('/:id_produto', (req, res, next) => {
    
    mysql.getConnection((error, conn) => {
        if (error){return res.status(500).send({error: error}) }
        conn.query(
            'SELECT * FROM produtos WHERE id_produto = ?',
            [req.params.id_produto],
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
            'INSERT INTO produtos (nome, cor, tamanho, valor) VALUES (?, ?, ?, ?)',
            [req.body.nome, req.body.cor, req.body.tamanho, req.body.valor],
            (error, resultado, fields) => {
                conn.release();
                if (error){return res.status(500).send({error: error}); }
                res.status(201).send({
                    mensagem: 'Produto Inserido com sucesso',
                    id_produto: resultado.insertId
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
            `UPDATE produtos
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
                    mensagem: 'Produto Atualizado com sucesso',
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
            'DELETE FROM produtos WHERE id_produto = ?',
            [req.body.id_cliente],
            (error, resultado, fields) => {
                conn.release();
                if (error){return res.status(500).send({error: error}); }
                res.status(202).send({
                    mensagem: 'Produto Removido com sucesso',
                });
            }
        )
    })
});

module.exports = router;
