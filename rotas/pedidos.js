const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const pdf = require('html-pdf');
const mysql = require('../mysql').pool;

var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();

const user = "lucas@agenciaorganizze.com";
const pass = "Vip@2021";

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
                if (error){return res.status(500).send({error: error}); }
                res.status(201).send({
                    mensagem: 'Pedido Inserido com sucesso',
                    id_pedido: resultado.insertId
                })
                conn.query(
                    'INSERT INTO itens_pedido (id_pedido, id_produto, qtd_produto) VALUES (?, ?, ?)',
                    [resultado.insertId, req.body.id_produto, req.body.qtd_produto],
                    (error, resultado2, fields) => {
                        conn.release();
                        if (error){return res.status(500).send({error: error}); }
                        res.status(201).send({
                            mensagem: 'Produto Pedido Inserido com sucesso',
                            id_itens_pedido: resultado2.insertId
                        });
                    }
                )
                
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
            [req.body.id_pedido],
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

router.get('/:id_pedido/report', jsonParser, (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error){return res.status(500).send({error: error}) }
        conn.query(
                    `select p.id_pedido,
                    p.data_pedido,
                    p.obs,
                    p.forma_pagamento,
                    p.id_cliente,
                    ip.id_produto,
                    ip.qtd_produto,
                    c.nome as nome_cliente,
                    c.cpf,
                    c.email,
                    c.sexo,
                    pdt.nome,
                    pdt.cor,
                    pdt.tamanho,
                    pdt.valor
            from pedidos p
            INNER JOIN itens_pedido ip on ip.id_pedido = p.id_pedido
            INNER JOIN clientes c on c.id_cliente = p.id_cliente
            INNER JOIN produtos pdt on ip.id_produto = pdt.id_produto
            WHERE p.id_pedido = ? `,
            [req.params.id_pedido],
            (error, resultado, fields) => {
                if (error){return res.status(500).send({error: error}); }
                res.status(201).send({
                    mensagem: 'Estes são os registros',
                    response: resultado
                }) 
                let valorTotal = resultado[0].valor * resultado[0].qtd_produto; 

                var conteudoPdf = `
                <div style="padding: 20px;">
                <h2 style="text-align:center;">Inpressão Pedido Nº: ${resultado[0].id_pedido}</h2>

                <table border="0" cellpadding="7" cellspacing="3" style="width:100%">
                    <tr>
                        <th colspan="3" style="background-color:#e5e5e5; padding: 10px;">Dados do Cliente</th>
                    </tr>
                    <tr style="background-color:#e5e5e5;">
                        <th>Nome</th>
                        <th>CPF</th>
                        <th>Sexo</th>
                    </tr>
                    <tr style="background: #fff;">
                        <td style="text-align: center;">${resultado[0].nome_cliente}</td>
                        <td style="text-align: center;">${resultado[0].cpf}</td>
                        <td style="text-align: center;">${resultado[0].sexo}</td>
                    </tr>
                </table>

                <table border="0" cellpadding="7" cellspacing="3" style="width:100%">
                    <tr>
                        <th colspan="5" style="background-color:#e5e5e5; padding: 10px;">Produtos</th>
                    </tr>
                    <tr style="background-color:#e5e5e5;">
                        <th>Nome</th>
                        <th>Cor</th>
                        <th>Quantidade</th>
                        <th>Tamanho</th>
                        <th>Valor</th>
                    </tr>
                    <tr style="background: #fff;">
                        <td style="text-align: center;">${resultado[0].nome}</td>
                        <td style="text-align: center;">${resultado[0].cor}</td>
                        <td style="text-align: center;">${resultado[0].qtd_produto}</td>
                        <td style="text-align: center;">${resultado[0].tamanho}</td>
                        <td style="text-align: center;">R$${resultado[0].valor}</td>
                    </tr>
                </table>

                <table border="0" cellpadding="7" cellspacing="3" style="width:100%">
                    <tr>
                        <th colspan="3" style="background-color:#e5e5e5; padding: 10px;">Pagamento e Obs</th>
                    </tr>
                    <tr style="background-color:#e5e5e5;">
                        <th>Observação</th>
                        <th>Forma de Pgto</th>
                        <th>Valor Total</th>
                    </tr>
                    <tr style="background: #fff;">
                        <td style="text-align: center;">${resultado[0].obs}</td>
                        <td style="text-align: center;">${resultado[0].forma_pagamento}</td>
                        <td style="text-align: center;">R$${valorTotal}</td>
                    </tr>
                </table>
                </div>`
                
                pdf.create(conteudoPdf, {}).toFile("./reportPedido.pdf", (err, res) => {
                    if(err){
                        console.log("Erro ao gerar pdf");
                    } else {
                        console.log(res);
                    }
                })
            }
            
        )
    })
});

router.get('/:id_pedido/sendmail', jsonParser, (req, res, next) => {
    const transport = nodemailer.createTransport({
        host: 'email-ssl.com.br',
        port: 465,
        auth: {user, pass}
    })
    
    mysql.getConnection((error, conn) => {
        if (error){return res.status(500).send({error: error}) }
        conn.query(
                    `select p.id_pedido,
                    p.data_pedido,
                    p.obs,
                    p.forma_pagamento,
                    p.id_cliente,
                    ip.id_produto,
                    ip.qtd_produto,
                    c.nome as nome_cliente,
                    c.cpf,
                    c.email,
                    c.sexo,
                    pdt.nome,
                    pdt.cor,
                    pdt.tamanho,
                    pdt.valor
            from pedidos p
            INNER JOIN itens_pedido ip on ip.id_pedido = p.id_pedido
            INNER JOIN clientes c on c.id_cliente = p.id_cliente
            INNER JOIN produtos pdt on ip.id_produto = pdt.id_produto
            WHERE p.id_pedido = ? `,
            [req.params.id_pedido],
            (error, resultado, fields) => {
                if (error){return res.status(500).send({error: error}); }
                res.status(201).send({
                    mensagem: 'Estes são os registros',
                    response: resultado
                }) 
                let valorTotal = resultado[0].valor * resultado[0].qtd_produto; 
                let env = transport.sendMail({
                    from: user,
                    to: resultado[0].email,
                    replyTo: resultado[0].email,
                    subject: 'Detalhes do seu Pedido' + ' ' + resultado[0].id_pedido ,
                    html: `
                    <div style="padding: 20px;">
                    <h2 style="text-align:center;">Inpressão Pedido Nº: ${resultado[0].id_pedido}</h2>
    
                    <table border="0" cellpadding="7" cellspacing="3" style="width:100%">
                        <tr>
                            <th colspan="3" style="background-color:#e5e5e5; padding: 10px;">Dados do Cliente</th>
                        </tr>
                        <tr style="background-color:#e5e5e5;">
                            <th>Nome</th>
                            <th>CPF</th>
                            <th>Sexo</th>
                        </tr>
                        <tr style="background: #fff;">
                            <td style="text-align: center;">${resultado[0].nome_cliente}</td>
                            <td style="text-align: center;">${resultado[0].cpf}</td>
                            <td style="text-align: center;">${resultado[0].sexo}</td>
                        </tr>
                    </table>
    
                    <table border="0" cellpadding="7" cellspacing="3" style="width:100%">
                        <tr>
                            <th colspan="5" style="background-color:#e5e5e5; padding: 10px;">Produtos</th>
                        </tr>
                        <tr style="background-color:#e5e5e5;">
                            <th>Nome</th>
                            <th>Cor</th>
                            <th>Quantidade</th>
                            <th>Tamanho</th>
                            <th>Valor</th>
                        </tr>
                        <tr style="background: #fff;">
                            <td style="text-align: center;">${resultado[0].nome}</td>
                            <td style="text-align: center;">${resultado[0].cor}</td>
                            <td style="text-align: center;">${resultado[0].qtd_produto}</td>
                            <td style="text-align: center;">${resultado[0].tamanho}</td>
                            <td style="text-align: center;">R$${resultado[0].valor}</td>
                        </tr>
                    </table>
    
                    <table border="0" cellpadding="7" cellspacing="3" style="width:100%">
                        <tr>
                            <th colspan="3" style="background-color:#e5e5e5; padding: 10px;">Pagamento e Obs</th>
                        </tr>
                        <tr style="background-color:#e5e5e5;">
                            <th>Observação</th>
                            <th>Forma de Pgto</th>
                            <th>Valor Total</th>
                        </tr>
                        <tr style="background: #fff;">
                            <td style="text-align: center;">${resultado[0].obs}</td>
                            <td style="text-align: center;">${resultado[0].forma_pagamento}</td>
                            <td style="text-align: center;">R$${valorTotal}</td>
                        </tr>
                    </table>
                    </div>`
                    
                },(err, info) => {
                    console.log(info.envelope);
                    console.log(info.messageId);
                });             
            }
            
        )
    })

   
});



module.exports = router;
