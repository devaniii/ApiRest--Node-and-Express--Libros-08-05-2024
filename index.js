import express from 'express';
import fs from 'fs/promises';
import bodyParser from "body-parser";
import { read } from 'fs';

const app = express();

app.use(bodyParser.json());

const readData = async () => {    
    try {
        const data = await fs.readFile("./db.json");    
        return JSON.parse(data);
    } catch (error) {
        console.log(error);
        throw error; // Propagar el error para manejarlo en la ruta
    }   
}

const writeData = async (data) => {
    try {
        await fs.writeFile("./db.json", JSON.stringify(data));
    } catch (error) {
        console.log(error);
        throw error; // Propagar el error para manejarlo en la ruta
    }   
};

app.get("/", (req,res) => {
    res.send("Correct Connection a nodejs server to me");
});

app.get("/books", async (req,res) => {
    try {
        const data  = await readData();
        if (data && data.books) {
            res.json(data.books);  
        } else {
            res.status(404).send("Books not found in database");
        }      
    } catch (error) {
        res.status(500).send("Internal server error");
    } 
});

app.get("/books/:id", async (req, res) => {
    try {
        const data = await readData();
        const id = parseInt(req.params.id);
        const book = data.books.find((book) => book.id === id);
        if (book) {
            res.json(book);
        } else {
            res.status(404).send("Book not found");
        }
    } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).send("Internal server error");
    }
});

app.post("/books", async (req, res) => {
    try {
        const data = await readData(); // Esperar a que se resuelva la promesa
        const body = req.body;
        const newBook = {
            id: data.books.length + 1,
            ...body,
        };
        data.books.push(newBook);
        await writeData(data); // Esperar a que se resuelva la promesa
        res.json(newBook);
    } catch (error) {
        console.error("Error:", error);
        res.status(500).send("Internal server error");
    }
});

app.put("/books/:id", async (req, res) => {
    try {
        const data = await readData(); // Esperar a que se resuelva la promesa
        const body = req.body;
        const id = parseInt(req.params.id);
        const bookIndex = data.books.findIndex((book) => book.id === id);
        if (bookIndex !== -1) {
            data.books[bookIndex] = {
                ...data.books[bookIndex],
                ...body,
            };
            await writeData(data); // Esperar a que se resuelva la promesa
            res.json({ message: "Book updated successfully" });
        } else {
            res.status(404).send("Book not found");
        }
    } catch (error) {
        console.error("Error:", error);
        res.status(500).send("Internal server error");
    }
});

app.delete("/books/:id", async (req, res) => {
    try {
        const data = await readData();
        const id = parseInt(req.params.id);
        const bookIndex = data.books.findIndex((book) => book.id === id);  
        if (bookIndex!== -1) {
            data.books.splice(bookIndex, 1);
            await writeData(data); 
        }
        res.json({ message: "Book deleted successfully" });
    } catch {
        console.error("Error:", error);
        res.status(500).send("Internal server error");
    }
});



app.listen(3000, () => {
    console.log("Server listening on port 3000");
});


