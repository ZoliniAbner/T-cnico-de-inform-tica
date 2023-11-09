const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');

const app = express();
const port = 3003;

const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'Senha1234!',
    database: 'loginfinal',
});

db.getConnection(err =>{
    if(err) {
        console.error('Erro ao conectar ao banco de dados :' + err.message);
    } else{
        console.log('conectando ao banco de dados Mysql')
    }
});

app.use(express.static('public'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.get('/registro', (req, res) =>{
    res.sendFile(__dirname + '/view/registro.html');
});



app.post('/registro', async (req, res) =>{
    const {nome, usuario, password} = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const sql =" INSERT INTO users (nome, usuario, senha) VALUES(?, ?, ?)";
    db.query(sql, [nome, usuario, hashedPassword], (err, result) =>{
        if(err){
            console.error('Erro ao refistrar usuário: ' + err.message);
            res.status(500).send('Erro ao registrar usuário.');
        }else{
            console.log('Usuário registrando com sucesso');
            res.redirect('/login');
        }
    })
})


app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/view/login.html');
  });
  
  app.post('/login', (req, res) => {
    const { usuario, senha } = req.body;

    const sql = 'SELECT * FROM users WHERE usuario = ?';
    db.query(sql, [usuario], async (err, result) => {
      if (err) {
        console.error('Erro ao buscar usuário: ' + err.message);
        res.status(500).send('Erro ao buscar usuário.');
      } else {
        if (result.length === 0) {
          res.status(401).send('Usuário não encontrado.');
        } else {
          const match = await bcrypt.compare(senha, result[0].senha);
          if (match) {
            res.sendFile(__dirname + '/view/page.html');
          } else {
            res.status(401).send('Senha incorreta.');
          }
        }
      }
    });
  });
  
  
  //Sair da pagina principal:
  app.get('/page', (req, res) => {
    res.sendFile(__dirname + '/view/page.html');
  });
  
  app.post('/page', (req, res) => {
    res.redirect('/login')
  });
  
  
  //Iniciar Server:
  app.listen(port, () => {
    console.log(`Servidor em execução na porta ${port}`);
  });