const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware to parse form data
app.use(bodyParser.urlencoded({ extended: true }));

// Serve the HTML form
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Path to the JSON file
const DATA_FILE = 'data.json';

// Function to load data from the JSON file
function loadData() {
    if (fs.existsSync(DATA_FILE)) {
        const rawData = fs.readFileSync(DATA_FILE, 'utf-8');
        if (rawData.trim().length === 0) {
            // If the file is empty, return an empty array
            return [];
        } else {
            try {
                return JSON.parse(rawData);
            } catch (err) {
                console.error('Error parsing JSON:', err);
                return [];
            }
        }
    } else {
        return [];
    }
}

// Function to save data to the JSON file
function saveData(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 4));
}

// Handle form submission
app.post('/submit_data', (req, res) => {
    const person_name = req.body.person_name;
    const aid = req.body.aid;
    const cubicle_number = req.body.cubicle_number;
    const evm_name = req.body.evm_name;
    const evm_serial_number = req.body.evm_serial_number;
    let update_index = -1;


    // Load existing data
    let data = loadData();

    for (let i = 0; i < data.length; i++)
    {
        if (data[i].evm_serial_number == evm_serial_number)
        {
            update_index = i;
        }
    }

    if (update_index == -1)
    {
        // Add new entry
        data.push({
            person_name: person_name,
            aid: aid,
            cubicle_number: cubicle_number,
            evm_name: evm_name,
            evm_serial_number: evm_serial_number
        });
    }
    else
    {
        data[update_index].person_name = person_name;
        data[update_index].aid = aid;
        data[update_index].cubicle_number = cubicle_number;
        data[update_index].evm_name = evm_name;
    }

    // Save updated data
    saveData(data);

    res.send('Data submitted successfully!');
});

// Retrieve stored data
app.get('/get_data', (req, res) => {
    const data = loadData();
    res.json(data);
});

app.post('/find_data', (req, res) => {
    const evm_name = req.body.evm_name;
    res.write('Hello, Thanks for visiting the page \n');

    let data = loadData();
    let evm_indexes = [];

    for (let i = 0; i < data.length; i++)
    {
        if (data[i].evm_name == evm_name)
        {
            evm_indexes.push(i);
        }
    }

    if (evm_indexes.length == 0)
    {
        res.write("Sorry, No one has " + `${evm_name}`);
    }
    else
    {
        res.write('EVM that you are looking for is with the following people : \n');
        for (let i = 0; i < evm_indexes.length; i++)
        {
            res.write(" Name :" + `${data[evm_indexes[i]].person_name}` 
                        + "  Cubicle No : " + `${data[evm_indexes[i]].cubicle_number}` 
                        + "  EVM Serial No : " + `${data[evm_indexes[i]].evm_serial_number}` + " \n");
        }
    }

    // console.log(evm_indexes);
    // res.send("The End !!");
    res.end();

});

app.get('/find_evm_data', (req, res) => {
    res.sendFile(path.join(__dirname, 'find_evm_data.html'));

})

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
