const { app, BrowserWindow } = require('electron');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');
require('electron-reload')(__dirname, {
    electron: require('path').join(__dirname, 'node_modules', '.bin', 'electron')
});

function createDatabase() {
    return new Promise((resolve, reject) => {
        const dbFile = 'user.db';

        // Verifica se o arquivo já existe
        if (fs.existsSync(dbFile)) {
            console.log('O banco de dados já existe.'); 
            return resolve(); // Se existir, resolve imediatamente
        }

        const db = new sqlite3.Database(dbFile, (err) => {
            if (err) {
                console.error('Erro ao abrir o banco de dados:', err.message);
                return reject(err);
            } else {
                console.log('Conectado ao banco de dados SQLite.');

                // Cria a tabela
                db.serialize(() => {
                    db.run(`CREATE TABLE IF NOT EXISTS clientes (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        nome TEXT NOT NULL,
                        telefone TEXT,
                        email TEXT,
                        dta_nascimento DATE,
                        dta_cadastro DATE
                    )`, (err) => {
                        if (err) {
                            console.error('Erro ao criar a tabela:', err.message);
                            return reject(err);
                        } else {
                            console.log('Tabela criada com sucesso.');
                            resolve();
                        }
                    });
                });

                // Fecha a conexão
                db.close((err) => {
                    if (err) {
                        console.error('Erro ao fechar o banco de dados:', err.message);
                    }
                });
            }
        });
    });
}

function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        autoHideMenuBar: true,
        icon: path.join(__dirname, 'assets/logo.png'),
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        }
    });

    win.loadFile('index.html');
}

app.whenReady().then(async () => {
    try {
        await createDatabase(); // Chama a função para criar o banco de dados
        createWindow(); // Cria a janela após o banco de dados estar pronto
    } catch (err) {
        console.error('Erro ao criar o banco de dados:', err);
    }
});
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
